-- Create member_invitations table if not exists
CREATE TABLE IF NOT EXISTS public.member_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chama_id UUID NOT NULL REFERENCES public.chamas(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone_number TEXT,
  invitation_token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'treasurer', 'secretary')),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT email_or_phone CHECK (email IS NOT NULL OR phone_number IS NOT NULL)
);

-- Enable RLS
ALTER TABLE public.member_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Chama members can view invitations for their chama"
ON public.member_invitations FOR SELECT
TO authenticated
USING (is_chama_member(chama_id));

CREATE POLICY "Chama admins can create invitations"
ON public.member_invitations FOR INSERT
TO authenticated
WITH CHECK (
  is_chama_admin(chama_id) AND 
  invited_by = auth.uid()
);

CREATE POLICY "Chama admins can update invitations"
ON public.member_invitations FOR UPDATE
TO authenticated
USING (is_chama_admin(chama_id));

CREATE POLICY "Chama admins can delete invitations"
ON public.member_invitations FOR DELETE
TO authenticated
USING (is_chama_admin(chama_id));

-- Function to create invitation
CREATE OR REPLACE FUNCTION public.create_chama_invitation(
  p_chama_id UUID,
  p_email TEXT DEFAULT NULL,
  p_phone_number TEXT DEFAULT NULL,
  p_role TEXT DEFAULT 'member'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invitation_id UUID;
  v_invitation_token UUID;
BEGIN
  -- Check if user is admin
  IF NOT public.is_chama_admin(p_chama_id) THEN
    RAISE EXCEPTION 'Only admins can create invitations';
  END IF;

  -- Check if email or phone provided
  IF p_email IS NULL AND p_phone_number IS NULL THEN
    RAISE EXCEPTION 'Email or phone number required';
  END IF;

  -- Check if already a member
  IF p_email IS NOT NULL AND EXISTS (
    SELECT 1 FROM chama_members cm
    JOIN auth.users u ON cm.user_id = u.id
    WHERE cm.chama_id = p_chama_id AND u.email = p_email
  ) THEN
    RAISE EXCEPTION 'User already a member';
  END IF;

  -- Create invitation
  INSERT INTO public.member_invitations (
    chama_id, invited_by, email, phone_number, role
  ) VALUES (
    p_chama_id, auth.uid(), p_email, p_phone_number, p_role
  )
  RETURNING id, invitation_token INTO v_invitation_id, v_invitation_token;

  RETURN jsonb_build_object(
    'success', true,
    'invitation_id', v_invitation_id,
    'invitation_token', v_invitation_token,
    'message', 'Invitation created successfully'
  );
END;
$$;

-- Function to revoke invitation
CREATE OR REPLACE FUNCTION public.revoke_chama_invitation(
  p_invitation_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_chama_id UUID;
BEGIN
  -- Get chama_id
  SELECT chama_id INTO v_chama_id
  FROM public.member_invitations
  WHERE id = p_invitation_id;

  -- Check if user is admin
  IF NOT public.is_chama_admin(v_chama_id) THEN
    RAISE EXCEPTION 'Only admins can revoke invitations';
  END IF;

  -- Update status
  UPDATE public.member_invitations
  SET status = 'expired', updated_at = NOW()
  WHERE id = p_invitation_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Invitation revoked successfully'
  );
END;
$$;

-- Trigger to update updated_at
CREATE OR REPLACE TRIGGER update_member_invitations_updated_at
BEFORE UPDATE ON public.member_invitations
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_member_invitations_chama_id ON public.member_invitations(chama_id);
CREATE INDEX IF NOT EXISTS idx_member_invitations_token ON public.member_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_member_invitations_status ON public.member_invitations(status);