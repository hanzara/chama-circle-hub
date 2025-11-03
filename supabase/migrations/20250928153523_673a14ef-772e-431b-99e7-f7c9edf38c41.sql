BEGIN;

-- Add password columns to portal_users if not exists
ALTER TABLE public.portal_users
  ADD COLUMN IF NOT EXISTS password_hash text,
  ADD COLUMN IF NOT EXISTS password_salt text,
  ADD COLUMN IF NOT EXISTS password_set_at timestamptz DEFAULT now();

-- Ensure unique index on email for portal_users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' AND indexname = 'idx_portal_users_email_unique'
  ) THEN
    EXECUTE 'CREATE UNIQUE INDEX idx_portal_users_email_unique ON public.portal_users (email)';
  END IF;
END $$;

-- Registration with password
CREATE OR REPLACE FUNCTION public.register_portal_user_with_password(
  p_email text,
  p_username text,
  p_password text,
  p_organization text DEFAULT 'Default Organization',
  p_access_level text DEFAULT 'member'
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_salt text;
  v_hash text;
BEGIN
  -- Check if email/username already exists
  IF EXISTS (SELECT 1 FROM public.portal_users WHERE email = p_email) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Email already registered');
  END IF;
  IF EXISTS (SELECT 1 FROM public.portal_users WHERE username = p_username) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Username already taken');
  END IF;

  -- Hash password
  v_salt := encode(gen_random_bytes(32), 'hex');
  v_hash := encode(digest(v_salt || p_password, 'sha256'), 'hex');

  -- Insert user
  INSERT INTO public.portal_users (
    email, username, access_level, organization, is_active, password_hash, password_salt, password_set_at
  ) VALUES (
    p_email, p_username, p_access_level::text, p_organization, true, v_hash, v_salt, now()
  ) RETURNING id INTO v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'User registered successfully',
    'user_id', v_user_id,
    'username', p_username,
    'email', p_email,
    'access_level', p_access_level
  );
END;
$$;

-- Password authentication
CREATE OR REPLACE FUNCTION public.authenticate_portal_user_password(
  p_email text,
  p_password text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_portal_user RECORD;
  v_computed_hash text;
  v_session_token text;
  v_session_id uuid;
BEGIN
  -- Find user
  SELECT * INTO v_portal_user
  FROM public.portal_users
  WHERE email = p_email AND is_active = true;

  IF v_portal_user IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid credentials');
  END IF;

  -- Account lock check
  IF v_portal_user.locked_until IS NOT NULL AND v_portal_user.locked_until > now() THEN
    RETURN jsonb_build_object('success', false, 'message', 'Account temporarily locked');
  END IF;

  -- Ensure password set
  IF v_portal_user.password_hash IS NULL OR v_portal_user.password_salt IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Password not set');
  END IF;

  -- Verify password
  v_computed_hash := encode(digest(v_portal_user.password_salt || p_password, 'sha256'), 'hex');
  IF v_computed_hash <> v_portal_user.password_hash THEN
    UPDATE public.portal_users
    SET login_attempts = login_attempts + 1,
        locked_until = CASE WHEN login_attempts >= 4 THEN now() + INTERVAL '15 minutes' ELSE NULL END
    WHERE id = v_portal_user.id;

    INSERT INTO public.portal_access_logs (portal_user_id, action, success)
    VALUES (v_portal_user.id, 'login', false);

    RETURN jsonb_build_object('success', false, 'message', 'Invalid credentials');
  END IF;

  -- Create session
  v_session_token := encode(gen_random_bytes(32), 'hex');
  INSERT INTO public.portal_sessions (portal_user_id, session_token, expires_at)
  VALUES (v_portal_user.id, v_session_token, now() + INTERVAL '8 hours')
  RETURNING id INTO v_session_id;

  -- Reset attempts and log
  UPDATE public.portal_users
  SET last_login_at = now(), login_attempts = 0, locked_until = NULL
  WHERE id = v_portal_user.id;

  INSERT INTO public.portal_access_logs (portal_user_id, action, success)
  VALUES (v_portal_user.id, 'login', true);

  RETURN jsonb_build_object(
    'success', true,
    'session_token', v_session_token,
    'user_id', v_portal_user.id,
    'username', v_portal_user.username,
    'access_level', v_portal_user.access_level,
    'organization', v_portal_user.organization
  );
END;
$$;

COMMIT;