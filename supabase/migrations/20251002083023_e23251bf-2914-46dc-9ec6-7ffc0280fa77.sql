-- Function to authenticate seller with username and password
CREATE OR REPLACE FUNCTION public.authenticate_seller_with_password(p_username TEXT, p_password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user RECORD;
  v_session_token TEXT;
  v_session_id UUID;
  v_computed_hash TEXT;
BEGIN
  -- Get user with matching username
  SELECT * INTO v_user
  FROM public.portal_users
  WHERE username = p_username 
    AND is_active = true
    AND password_hash IS NOT NULL;
  
  IF v_user IS NULL THEN
    -- Increment failed attempts for security
    UPDATE public.portal_users
    SET login_attempts = login_attempts + 1,
        locked_until = CASE WHEN login_attempts >= 4 THEN NOW() + INTERVAL '15 minutes' ELSE NULL END
    WHERE username = p_username;
    
    RETURN jsonb_build_object('success', false, 'message', 'Invalid credentials');
  END IF;
  
  -- Check if account is locked
  IF v_user.locked_until IS NOT NULL AND v_user.locked_until > NOW() THEN
    RETURN jsonb_build_object('success', false, 'message', 'Account temporarily locked');
  END IF;
  
  -- Verify password
  v_computed_hash := encode(digest(v_user.password_salt || p_password, 'sha256'), 'hex');
  
  IF v_computed_hash != v_user.password_hash THEN
    -- Increment failed attempts
    UPDATE public.portal_users
    SET login_attempts = login_attempts + 1,
        locked_until = CASE WHEN login_attempts >= 4 THEN NOW() + INTERVAL '15 minutes' ELSE NULL END
    WHERE id = v_user.id;
    
    RETURN jsonb_build_object('success', false, 'message', 'Invalid credentials');
  END IF;
  
  -- Generate session token
  v_session_token := encode(gen_random_bytes(32), 'hex');
  
  -- Create session
  INSERT INTO public.portal_sessions (portal_user_id, session_token, expires_at)
  VALUES (v_user.id, v_session_token, NOW() + INTERVAL '8 hours')
  RETURNING id INTO v_session_id;
  
  -- Update user login info
  UPDATE public.portal_users
  SET 
    last_login_at = NOW(),
    login_attempts = 0,
    locked_until = NULL
  WHERE id = v_user.id;
  
  -- Log successful access
  INSERT INTO public.portal_access_logs (portal_user_id, action, success)
  VALUES (v_user.id, 'password_login', true);
  
  RETURN jsonb_build_object(
    'success', true,
    'session_token', v_session_token,
    'user_id', v_user.id,
    'username', v_user.username,
    'access_level', v_user.access_level,
    'organization', v_user.organization
  );
END;
$$;