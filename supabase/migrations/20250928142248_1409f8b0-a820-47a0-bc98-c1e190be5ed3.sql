-- Add email column to portal_users table for easier authentication
ALTER TABLE public.portal_users 
ADD COLUMN email TEXT;

-- Create unique index on email (optional, but good for performance)
CREATE UNIQUE INDEX idx_portal_users_email ON public.portal_users(email);

-- Update existing function to authenticate by email instead of username
CREATE OR REPLACE FUNCTION public.authenticate_portal_user_by_email(
  p_email TEXT,
  p_credential_code TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_portal_user RECORD;
  v_credential RECORD;
  v_session_token TEXT;
  v_session_id UUID;
BEGIN
  -- Check if user exists and is active (lookup by email)
  SELECT pu.*, au.email INTO v_portal_user
  FROM public.portal_users pu
  JOIN auth.users au ON pu.user_id = au.id
  WHERE (pu.email = p_email OR au.email = p_email) AND pu.is_active = true;
  
  IF v_portal_user IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid credentials');
  END IF;
  
  -- Check if account is locked
  IF v_portal_user.locked_until IS NOT NULL AND v_portal_user.locked_until > now() THEN
    RETURN jsonb_build_object('success', false, 'message', 'Account temporarily locked');
  END IF;
  
  -- Verify credential code
  SELECT * INTO v_credential
  FROM public.portal_credentials
  WHERE credential_code = p_credential_code 
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND current_uses < max_uses;
  
  IF v_credential IS NULL THEN
    -- Increment failed attempts
    UPDATE public.portal_users
    SET login_attempts = login_attempts + 1,
        locked_until = CASE WHEN login_attempts >= 4 THEN now() + INTERVAL '15 minutes' ELSE NULL END
    WHERE id = v_portal_user.id;
    
    RETURN jsonb_build_object('success', false, 'message', 'Invalid credentials');
  END IF;
  
  -- Check access level compatibility
  IF v_credential.access_level != v_portal_user.access_level AND v_credential.access_level != 'member' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Access level mismatch');
  END IF;
  
  -- Generate session token
  v_session_token := encode(gen_random_bytes(32), 'hex');
  
  -- Create session
  INSERT INTO public.portal_sessions (
    portal_user_id, session_token, expires_at
  ) VALUES (
    v_portal_user.id, v_session_token, now() + INTERVAL '8 hours'
  ) RETURNING id INTO v_session_id;
  
  -- Update user login info
  UPDATE public.portal_users
  SET last_login_at = now(),
      login_attempts = 0,
      locked_until = NULL
  WHERE id = v_portal_user.id;
  
  -- Update credential usage
  UPDATE public.portal_credentials
  SET current_uses = current_uses + 1
  WHERE id = v_credential.id;
  
  -- Log successful access
  INSERT INTO public.portal_access_logs (
    portal_user_id, action, success
  ) VALUES (
    v_portal_user.id, 'login', true
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'session_token', v_session_token,
    'user_id', v_portal_user.id,
    'username', v_portal_user.username,
    'email', COALESCE(v_portal_user.email, v_portal_user.email),
    'access_level', v_portal_user.access_level,
    'organization', v_portal_user.organization
  );
END;
$$;

-- Insert sample portal user with email for testing
INSERT INTO public.portal_users (
  user_id, 
  username, 
  email, 
  access_level, 
  organization, 
  is_active
) 
SELECT 
  id,
  'admin',
  email,
  'super_admin',
  'ChamaWallet Admin',
  true
FROM auth.users 
WHERE email = 'admin@chamawallet.com'
ON CONFLICT (username) DO UPDATE SET
  email = EXCLUDED.email,
  access_level = EXCLUDED.access_level;

-- Insert demo credential for easy access
INSERT INTO public.portal_credentials (
  credential_code,
  access_level,
  max_uses,
  expires_at,
  is_active
) VALUES (
  'PTC-ADMIN2024',
  'super_admin',
  1000,
  now() + INTERVAL '30 days',
  true
) ON CONFLICT (credential_code) DO UPDATE SET
  max_uses = EXCLUDED.max_uses,
  expires_at = EXCLUDED.expires_at,
  is_active = EXCLUDED.is_active;