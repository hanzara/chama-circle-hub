-- Drop existing function
DROP FUNCTION IF EXISTS public.revoke_chama_invitation(uuid);

-- Create member_invitations table if not exists
CREATE TABLE IF NOT EXISTS public.member_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chama_id UUID NOT NULL REFERENCES public.chamas(id) ON DELETE CASCADE,
  email TEXT,
  phone_number TEXT,
  role VARCHAR DEFAULT 'member',
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT check_contact_method CHECK (email IS NOT NULL OR phone_number IS NOT NULL)
);

-- Enable RLS
ALTER TABLE public.member_invitations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage invitations for their chama" ON public.member_invitations;
DROP POLICY IF EXISTS "Users can view their own invitations" ON public.member_invitations;

-- RLS Policies for member_invitations
CREATE POLICY "Admins can manage invitations for their chama"
ON public.member_invitations
FOR ALL
USING (
  chama_id IN (
    SELECT chama_id FROM public.chama_members
    WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
  )
);

CREATE POLICY "Users can view their own invitations"
ON public.member_invitations
FOR SELECT
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = email
  OR (SELECT raw_user_meta_data->>'phone' FROM auth.users WHERE id = auth.uid()) = phone_number
);

-- Function to create chama invitation
CREATE OR REPLACE FUNCTION public.create_chama_invitation(
  p_chama_id UUID,
  p_email TEXT DEFAULT NULL,
  p_phone_number TEXT DEFAULT NULL,
  p_role VARCHAR DEFAULT 'member'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invitation_id UUID;
BEGIN
  -- Check if user is admin
  IF NOT public.is_chama_admin(p_chama_id) THEN
    RAISE EXCEPTION 'Only admins can create invitations';
  END IF;

  -- Check if already a member
  IF EXISTS (
    SELECT 1 FROM public.chama_members cm
    JOIN auth.users au ON cm.user_id = au.id
    WHERE cm.chama_id = p_chama_id 
    AND (au.email = p_email OR au.raw_user_meta_data->>'phone' = p_phone_number)
  ) THEN
    RAISE EXCEPTION 'User is already a member of this chama';
  END IF;

  -- Create invitation
  INSERT INTO public.member_invitations (
    chama_id, email, phone_number, role, created_by
  ) VALUES (
    p_chama_id, p_email, p_phone_number, p_role, auth.uid()
  ) RETURNING id INTO v_invitation_id;

  -- Log activity
  INSERT INTO public.chama_activities (chama_id, activity_type, description)
  VALUES (
    p_chama_id,
    'invitation_sent',
    FORMAT('Invitation sent to %s', COALESCE(p_email, p_phone_number))
  );

  RETURN v_invitation_id;
END;
$$;

-- Function to accept chama invitation
CREATE OR REPLACE FUNCTION public.accept_chama_invitation(
  invitation_token UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invitation RECORD;
  v_chama RECORD;
  v_member_id UUID;
  v_user_email TEXT;
  v_user_phone TEXT;
BEGIN
  -- Get current user info
  SELECT email INTO v_user_email FROM auth.users WHERE id = auth.uid();
  SELECT raw_user_meta_data->>'phone' INTO v_user_phone FROM auth.users WHERE id = auth.uid();

  -- Get invitation
  SELECT * INTO v_invitation
  FROM public.member_invitations
  WHERE id = invitation_token
  AND status = 'pending'
  AND (email = v_user_email OR phone_number = v_user_phone)
  AND (expires_at IS NULL OR expires_at > now());

  IF v_invitation IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid or expired invitation');
  END IF;

  -- Get chama info
  SELECT * INTO v_chama FROM public.chamas WHERE id = v_invitation.chama_id;

  -- Check if chama is full
  IF v_chama.current_members >= v_chama.max_members THEN
    RETURN jsonb_build_object('success', false, 'message', 'Chama is full');
  END IF;

  -- Check if already a member
  IF EXISTS (
    SELECT 1 FROM public.chama_members
    WHERE chama_id = v_invitation.chama_id AND user_id = auth.uid()
  ) THEN
    -- Update invitation status
    UPDATE public.member_invitations
    SET status = 'accepted', accepted_at = now()
    WHERE id = invitation_token;
    
    RETURN jsonb_build_object('success', true, 'message', 'You are already a member of this chama');
  END IF;

  -- Add member
  INSERT INTO public.chama_members (
    chama_id, user_id, role, is_active
  ) VALUES (
    v_invitation.chama_id, auth.uid(), v_invitation.role, true
  ) RETURNING id INTO v_member_id;

  -- Update chama member count
  UPDATE public.chamas
  SET current_members = current_members + 1
  WHERE id = v_invitation.chama_id;

  -- Update invitation status
  UPDATE public.member_invitations
  SET status = 'accepted', accepted_at = now()
  WHERE id = invitation_token;

  -- Log activity
  INSERT INTO public.chama_activities (chama_id, member_id, activity_type, description)
  VALUES (
    v_invitation.chama_id,
    v_member_id,
    'member_joined',
    FORMAT('%s joined the chama', COALESCE(v_user_email, v_user_phone, 'A member'))
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', FORMAT('Successfully joined %s', v_chama.name),
    'chama_id', v_invitation.chama_id
  );
END;
$$;

-- Function to revoke chama invitation
CREATE OR REPLACE FUNCTION public.revoke_chama_invitation(
  p_invitation_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_chama_id UUID;
BEGIN
  -- Get chama_id from invitation
  SELECT chama_id INTO v_chama_id
  FROM public.member_invitations
  WHERE id = p_invitation_id;

  -- Check if user is admin
  IF NOT public.is_chama_admin(v_chama_id) THEN
    RAISE EXCEPTION 'Only admins can revoke invitations';
  END IF;

  -- Update invitation status
  UPDATE public.member_invitations
  SET status = 'expired'
  WHERE id = p_invitation_id;

  RETURN true;
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_member_invitations_chama_id ON public.member_invitations(chama_id);
CREATE INDEX IF NOT EXISTS idx_member_invitations_email ON public.member_invitations(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_member_invitations_phone ON public.member_invitations(phone_number) WHERE phone_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_member_invitations_status ON public.member_invitations(status);