-- Create function to register new portal users
CREATE OR REPLACE FUNCTION public.register_portal_user(
  p_email text,
  p_username text,
  p_organization text DEFAULT 'Default Organization',
  p_access_level text DEFAULT 'member'
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_credential_code text;
BEGIN
  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM public.portal_users WHERE email = p_email) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Email already registered');
  END IF;
  
  -- Check if username already exists
  IF EXISTS (SELECT 1 FROM public.portal_users WHERE username = p_username) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Username already taken');
  END IF;
  
  -- Generate credential code
  v_credential_code := 'PTC-' || UPPER(substring(md5(random()::text) from 1 for 8));
  
  -- Insert new portal user
  INSERT INTO public.portal_users (
    email, username, access_level, organization, is_active
  ) VALUES (
    p_email, p_username, p_access_level::text, p_organization, true
  ) RETURNING id INTO v_user_id;
  
  -- Create credential for the user
  INSERT INTO public.portal_credentials (
    credential_code, access_level, max_uses, expires_at, is_active
  ) VALUES (
    v_credential_code, p_access_level::text, 1000, now() + INTERVAL '1 year', true
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'User registered successfully',
    'user_id', v_user_id,
    'username', p_username,
    'email', p_email,
    'credential_code', v_credential_code,
    'access_level', p_access_level
  );
END;
$$;