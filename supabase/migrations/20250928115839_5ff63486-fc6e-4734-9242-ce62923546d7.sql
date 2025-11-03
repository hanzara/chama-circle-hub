-- Create portal users table for secure access
CREATE TABLE public.portal_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) NOT NULL UNIQUE,
  access_level TEXT NOT NULL DEFAULT 'member' CHECK (access_level IN ('admin', 'member', 'super_admin')),
  organization TEXT,
  phone_number VARCHAR(20),
  department TEXT,
  last_login_at TIMESTAMP WITH TIME ZONE,
  login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portal_users ENABLE ROW LEVEL SECURITY;

-- Create portal sessions table for tracking secure access
CREATE TABLE public.portal_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portal_user_id UUID NOT NULL REFERENCES public.portal_users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portal_sessions ENABLE ROW LEVEL SECURITY;

-- Create portal access logs for audit trail
CREATE TABLE public.portal_access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portal_user_id UUID REFERENCES public.portal_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portal_access_logs ENABLE ROW LEVEL SECURITY;

-- Create portal credentials table for secure authentication codes
CREATE TABLE public.portal_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  credential_code VARCHAR(50) NOT NULL UNIQUE,
  access_level TEXT NOT NULL CHECK (access_level IN ('admin', 'member', 'super_admin')),
  organization TEXT,
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.portal_users(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portal_credentials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for portal_users
CREATE POLICY "Users can view their own portal profile" 
ON public.portal_users 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own portal profile" 
ON public.portal_users 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all portal users" 
ON public.portal_users 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.portal_users pu 
    WHERE pu.user_id = auth.uid() 
    AND pu.access_level IN ('admin', 'super_admin')
    AND pu.is_active = true
  )
);

-- RLS Policies for portal_sessions
CREATE POLICY "Users can view their own portal sessions" 
ON public.portal_sessions 
FOR SELECT 
USING (
  portal_user_id IN (
    SELECT id FROM public.portal_users 
    WHERE user_id = auth.uid()
  )
);

-- RLS Policies for portal_access_logs  
CREATE POLICY "Users can view their own access logs" 
ON public.portal_access_logs 
FOR SELECT 
USING (
  portal_user_id IN (
    SELECT id FROM public.portal_users 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all access logs" 
ON public.portal_access_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.portal_users pu 
    WHERE pu.user_id = auth.uid() 
    AND pu.access_level IN ('admin', 'super_admin')
    AND pu.is_active = true
  )
);

-- RLS Policies for portal_credentials
CREATE POLICY "Admins can manage portal credentials" 
ON public.portal_credentials 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.portal_users pu 
    WHERE pu.user_id = auth.uid() 
    AND pu.access_level IN ('admin', 'super_admin')
    AND pu.is_active = true
  )
);

-- Functions for portal authentication
CREATE OR REPLACE FUNCTION public.authenticate_portal_user(
  p_username TEXT,
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
  -- Check if user exists and is active
  SELECT * INTO v_portal_user
  FROM public.portal_users
  WHERE username = p_username AND is_active = true;
  
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
    'access_level', v_portal_user.access_level,
    'organization', v_portal_user.organization
  );
END;
$$;

-- Function to verify session token
CREATE OR REPLACE FUNCTION public.verify_portal_session(p_session_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session RECORD;
  v_portal_user RECORD;
BEGIN
  -- Get session info
  SELECT ps.*, pu.username, pu.access_level, pu.organization, pu.is_active
  INTO v_session
  FROM public.portal_sessions ps
  JOIN public.portal_users pu ON ps.portal_user_id = pu.id
  WHERE ps.session_token = p_session_token
    AND ps.expires_at > now()
    AND pu.is_active = true;
  
  IF v_session IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid or expired session');
  END IF;
  
  -- Extend session
  UPDATE public.portal_sessions
  SET expires_at = now() + INTERVAL '8 hours'
  WHERE id = v_session.id;
  
  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_session.portal_user_id,
    'username', v_session.username,
    'access_level', v_session.access_level,
    'organization', v_session.organization
  );
END;
$$;

-- Function to create portal credential (admin only)
CREATE OR REPLACE FUNCTION public.create_portal_credential(
  p_access_level TEXT,
  p_organization TEXT DEFAULT NULL,
  p_max_uses INTEGER DEFAULT 1,
  p_expires_hours INTEGER DEFAULT 24
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_user RECORD;
  v_credential_code TEXT;
  v_credential_id UUID;
BEGIN
  -- Check if current user is admin
  SELECT * INTO v_admin_user
  FROM public.portal_users
  WHERE user_id = auth.uid() 
    AND access_level IN ('admin', 'super_admin')
    AND is_active = true;
  
  IF v_admin_user IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Admin access required');
  END IF;
  
  -- Generate unique credential code
  v_credential_code := 'PTC-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
  
  -- Create credential
  INSERT INTO public.portal_credentials (
    credential_code, access_level, organization, max_uses, 
    expires_at, created_by
  ) VALUES (
    v_credential_code, p_access_level, p_organization, p_max_uses,
    now() + (p_expires_hours || ' hours')::INTERVAL, v_admin_user.id
  ) RETURNING id INTO v_credential_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'credential_code', v_credential_code,
    'access_level', p_access_level,
    'expires_at', now() + (p_expires_hours || ' hours')::INTERVAL
  );
END;
$$;

-- Insert default super admin credential (expires in 7 days)
INSERT INTO public.portal_credentials (
  credential_code, access_level, max_uses, expires_at
) VALUES (
  'PTC-ADMIN2024', 'super_admin', 5, now() + INTERVAL '7 days'
);

-- Trigger to update updated_at
CREATE TRIGGER update_portal_users_updated_at
  BEFORE UPDATE ON public.portal_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portal_credentials_updated_at
  BEFORE UPDATE ON public.portal_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();