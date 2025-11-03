-- Drop any existing accept_chama_invitation functions
DROP FUNCTION IF EXISTS public.accept_chama_invitation(text);
DROP FUNCTION IF EXISTS public.accept_chama_invitation(uuid);

-- Create the correct version that accepts invitation token as text
CREATE OR REPLACE FUNCTION public.accept_chama_invitation(invitation_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invitation RECORD;
  v_member_id UUID;
BEGIN
  -- Get invitation details
  SELECT * INTO v_invitation
  FROM public.member_invitations
  WHERE member_invitations.invitation_token = accept_chama_invitation.invitation_token
    AND status = 'pending'
    AND (expires_at IS NULL OR expires_at > now());
  
  IF v_invitation IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid or expired invitation');
  END IF;
  
  -- Check if user is already a member
  IF EXISTS (
    SELECT 1 FROM public.chama_members
    WHERE user_id = auth.uid() AND chama_id = v_invitation.chama_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'You are already a member of this chama');
  END IF;
  
  -- Add user as member
  INSERT INTO public.chama_members (chama_id, user_id, role, is_active)
  VALUES (v_invitation.chama_id, auth.uid(), COALESCE(v_invitation.role, 'member'), true)
  RETURNING id INTO v_member_id;
  
  -- Update chama member count
  UPDATE public.chamas
  SET current_members = current_members + 1
  WHERE id = v_invitation.chama_id;
  
  -- Mark invitation as accepted
  UPDATE public.member_invitations
  SET status = 'accepted'
  WHERE id = v_invitation.id;
  
  -- Log activity
  INSERT INTO public.chama_activities (chama_id, member_id, activity_type, description)
  VALUES (
    v_invitation.chama_id,
    v_member_id,
    'member_joined',
    'New member joined via invitation'
  );
  
  RETURN jsonb_build_object('success', true, 'message', 'Successfully joined the chama');
END;
$$;