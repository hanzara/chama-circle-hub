-- Update create_chama_invitation to include invited_by
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

  -- Create invitation with invited_by field
  INSERT INTO public.member_invitations (
    chama_id, invited_by, email, phone_number, invitation_token, expires_at, status, role
  ) VALUES (
    p_chama_id, auth.uid(), p_email, p_phone_number, v_invitation_token, v_expires_at, 'pending', p_role
  );

  RETURN jsonb_build_object(
    'success', true,
    'invitation_token', v_invitation_token,
    'message', 'Invitation created successfully'
  );
END;
$$;