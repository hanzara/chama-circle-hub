-- Fix revoke_chama_invitation function to remove updated_at reference
DROP FUNCTION IF EXISTS public.revoke_chama_invitation(uuid);

CREATE OR REPLACE FUNCTION public.revoke_chama_invitation(p_invitation_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_chama_id UUID;
BEGIN
  -- Get the chama_id for the invitation
  SELECT chama_id INTO v_chama_id
  FROM public.member_invitations
  WHERE id = p_invitation_id;

  IF v_chama_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invitation not found');
  END IF;

  -- Check if user is admin
  IF NOT public.is_chama_admin(v_chama_id) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Only admins can revoke invitations');
  END IF;

  -- Update invitation status to expired (removed updated_at since column doesn't exist)
  UPDATE public.member_invitations
  SET status = 'expired'
  WHERE id = p_invitation_id;

  RETURN jsonb_build_object('success', true, 'message', 'Invitation revoked successfully');
END;
$$;