-- Add role column to member_invitations table
ALTER TABLE public.member_invitations 
ADD COLUMN IF NOT EXISTS role character varying DEFAULT 'member';

-- Update create_chama_invitation function to handle role
CREATE OR REPLACE FUNCTION public.create_chama_invitation(
  p_chama_id uuid,
  p_email text DEFAULT NULL,
  p_phone_number text DEFAULT NULL,
  p_role text DEFAULT 'member'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invitation_token uuid;
  v_expires_at timestamp with time zone;
BEGIN
  -- Check if user is admin
  IF NOT public.is_chama_admin(p_chama_id) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Only admins can create invitations');
  END IF;

  -- Generate invitation token and set expiry (7 days)
  v_invitation_token := gen_random_uuid();
  v_expires_at := now() + interval '7 days';

  -- Create invitation
  INSERT INTO public.member_invitations (
    chama_id, email, phone_number, invitation_token, expires_at, status, role
  ) VALUES (
    p_chama_id, p_email, p_phone_number, v_invitation_token, v_expires_at, 'pending', p_role
  );

  RETURN jsonb_build_object(
    'success', true,
    'invitation_token', v_invitation_token,
    'message', 'Invitation created successfully'
  );
END;
$$;

-- Update accept_chama_invitation to assign the invited role
CREATE OR REPLACE FUNCTION public.accept_chama_invitation(invitation_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_record RECORD;
  new_member_id UUID;
  result JSONB;
BEGIN
  -- Get invitation details including role
  SELECT * INTO invitation_record
  FROM public.member_invitations
  WHERE invitation_token = accept_chama_invitation.invitation_token
  AND status = 'pending'
  AND expires_at > NOW();
  
  IF invitation_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid or expired invitation');
  END IF;
  
  -- Check if user is already a member
  IF EXISTS (
    SELECT 1 FROM public.chama_members 
    WHERE chama_id = invitation_record.chama_id 
    AND user_id = auth.uid()
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'You are already a member of this chama');
  END IF;
  
  -- Add user to chama with the invited role (or default to 'member')
  INSERT INTO public.chama_members (chama_id, user_id, role, is_active)
  VALUES (
    invitation_record.chama_id, 
    auth.uid(), 
    COALESCE(invitation_record.role, 'member'), 
    true
  )
  RETURNING id INTO new_member_id;
  
  -- Update invitation status
  UPDATE public.member_invitations
  SET status = 'accepted', accepted_at = NOW()
  WHERE id = invitation_record.id;
  
  -- Update chama member count
  UPDATE public.chamas
  SET current_members = current_members + 1
  WHERE id = invitation_record.chama_id;
  
  -- Log activity
  INSERT INTO public.chama_activities (chama_id, member_id, activity_type, description)
  VALUES (
    invitation_record.chama_id,
    new_member_id,
    'member_joined',
    FORMAT('New member joined via invitation with role: %s', COALESCE(invitation_record.role, 'member'))
  );
  
  RETURN jsonb_build_object('success', true, 'message', 'Successfully joined the chama');
END;
$$;

-- Update revoke_chama_invitation function
CREATE OR REPLACE FUNCTION public.revoke_chama_invitation(p_invitation_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_chama_id uuid;
BEGIN
  -- Get chama_id from invitation
  SELECT chama_id INTO v_chama_id
  FROM public.member_invitations
  WHERE id = p_invitation_id;

  -- Check if user is admin
  IF NOT public.is_chama_admin(v_chama_id) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Only admins can revoke invitations');
  END IF;

  -- Update invitation status
  UPDATE public.member_invitations
  SET status = 'revoked'
  WHERE id = p_invitation_id;

  RETURN jsonb_build_object('success', true, 'message', 'Invitation revoked successfully');
END;
$$;