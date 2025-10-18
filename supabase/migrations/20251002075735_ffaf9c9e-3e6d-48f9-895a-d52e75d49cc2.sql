-- Add columns to portal_users for seller authentication flow
ALTER TABLE public.portal_users
ADD COLUMN IF NOT EXISTS login_code VARCHAR(8),
ADD COLUMN IF NOT EXISTS code_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS requires_password_setup BOOLEAN DEFAULT false;

-- Function to generate a unique login code for a seller
CREATE OR REPLACE FUNCTION public.generate_seller_login_code(p_username TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user RECORD;
  v_code TEXT;
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Check if user exists
  SELECT * INTO v_user
  FROM public.portal_users
  WHERE username = p_username AND is_active = true;
  
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Username not found');
  END IF;
  
  -- Generate 8-character alphanumeric code
  v_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 8));
  
  -- Code expires in 1 hour
  v_expires_at := NOW() + INTERVAL '1 hour';
  
  -- Update user with login code
  UPDATE public.portal_users
  SET 
    login_code = v_code,
    code_expires_at = v_expires_at,
    requires_password_setup = (password_hash IS NULL)
  WHERE id = v_user.id;
  
  RETURN jsonb_build_object(
    'success', true,
    'code', v_code,
    'expires_at', v_expires_at,
    'requires_password_setup', (v_user.password_hash IS NULL),
    'message', 'Login code generated successfully'
  );
END;
$$;

-- Function to authenticate seller with username and login code
CREATE OR REPLACE FUNCTION public.authenticate_seller_with_code(p_username TEXT, p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user RECORD;
  v_session_token TEXT;
  v_session_id UUID;
BEGIN
  -- Get user with matching username and code
  SELECT * INTO v_user
  FROM public.portal_users
  WHERE username = p_username 
    AND login_code = p_code
    AND code_expires_at > NOW()
    AND is_active = true;
  
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid or expired code');
  END IF;
  
  -- Check if account is locked
  IF v_user.locked_until IS NOT NULL AND v_user.locked_until > NOW() THEN
    RETURN jsonb_build_object('success', false, 'message', 'Account temporarily locked');
  END IF;
  
  -- Generate session token
  v_session_token := encode(gen_random_bytes(32), 'hex');
  
  -- Create session
  INSERT INTO public.portal_sessions (portal_user_id, session_token, expires_at)
  VALUES (v_user.id, v_session_token, NOW() + INTERVAL '8 hours')
  RETURNING id INTO v_session_id;
  
  -- Update user login info and clear the used code
  UPDATE public.portal_users
  SET 
    last_login_at = NOW(),
    login_attempts = 0,
    locked_until = NULL,
    login_code = NULL,
    code_expires_at = NULL
  WHERE id = v_user.id;
  
  -- Log successful access
  INSERT INTO public.portal_access_logs (portal_user_id, action, success)
  VALUES (v_user.id, 'code_login', true);
  
  RETURN jsonb_build_object(
    'success', true,
    'session_token', v_session_token,
    'user_id', v_user.id,
    'username', v_user.username,
    'access_level', v_user.access_level,
    'organization', v_user.organization,
    'requires_password_setup', v_user.requires_password_setup
  );
END;
$$;

-- Function to set password after code login
CREATE OR REPLACE FUNCTION public.set_seller_password(p_username TEXT, p_session_token TEXT, p_new_password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_salt TEXT;
  v_hash TEXT;
BEGIN
  -- Verify session and get user
  SELECT pu.id INTO v_user_id
  FROM public.portal_sessions ps
  JOIN public.portal_users pu ON ps.portal_user_id = pu.id
  WHERE ps.session_token = p_session_token
    AND ps.expires_at > NOW()
    AND pu.username = p_username
    AND pu.is_active = true;
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid session');
  END IF;
  
  -- Validate password strength (at least 6 characters)
  IF LENGTH(p_new_password) < 6 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Password must be at least 6 characters');
  END IF;
  
  -- Generate salt and hash password
  v_salt := encode(gen_random_bytes(16), 'hex');
  v_hash := encode(digest(v_salt || p_new_password, 'sha256'), 'hex');
  
  -- Update user password
  UPDATE public.portal_users
  SET 
    password_hash = v_hash,
    password_salt = v_salt,
    requires_password_setup = false,
    updated_at = NOW()
  WHERE id = v_user_id;
  
  -- Log the action
  INSERT INTO public.portal_access_logs (portal_user_id, action, success)
  VALUES (v_user_id, 'password_setup', true);
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Password set successfully. You can now use it to login.'
  );
END;
$$;

-- Add password_salt column if it doesn't exist
ALTER TABLE public.portal_users
ADD COLUMN IF NOT EXISTS password_salt VARCHAR(255);

-- Create index for faster code lookups
CREATE INDEX IF NOT EXISTS idx_portal_users_login_code ON public.portal_users(login_code) WHERE login_code IS NOT NULL;