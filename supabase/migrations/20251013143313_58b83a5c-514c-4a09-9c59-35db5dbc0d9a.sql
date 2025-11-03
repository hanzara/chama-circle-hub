-- Fix invitation_token column type to match the generated token format
ALTER TABLE public.member_invitations 
ALTER COLUMN invitation_token TYPE TEXT;

-- Update the accept_chama_invitation function to accept text token
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
  WHERE invitation_token = accept_chama_invitation.invitation_token
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
  VALUES (v_invitation.chama_id, auth.uid(), v_invitation.role, true)
  RETURNING id INTO v_member_id;
  
  -- Update invitation status
  UPDATE public.member_invitations
  SET status = 'accepted', updated_at = now()
  WHERE id = v_invitation.id;
  
  -- Increment member count
  UPDATE public.chamas
  SET current_members = current_members + 1
  WHERE id = v_invitation.chama_id;
  
  RETURN jsonb_build_object('success', true, 'message', 'Successfully joined the chama');
END;
$$;