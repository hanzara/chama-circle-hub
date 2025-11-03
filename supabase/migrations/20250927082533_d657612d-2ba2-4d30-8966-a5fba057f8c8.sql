-- Create enhanced user profiles with KYC support
CREATE TABLE IF NOT EXISTS public.user_profiles_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  date_of_birth DATE,
  location TEXT,
  user_category TEXT CHECK (user_category IN ('individual', 'student', 'business', 'institution')),
  institution_name TEXT,
  business_name TEXT,
  business_permit_ref TEXT,
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'under_review', 'verified', 'rejected')),
  kyc_submitted_at TIMESTAMP WITH TIME ZONE,
  kyc_verified_at TIMESTAMP WITH TIME ZONE,
  kyc_rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  verification_tier INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create KYC documents table
CREATE TABLE IF NOT EXISTS public.kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('national_id', 'passport', 'drivers_license', 'business_permit', 'tax_certificate')),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'verified', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user PINs table for secure PIN storage
CREATE TABLE IF NOT EXISTS public.user_pins_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  pin_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  failed_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  last_verified TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user sessions table for session management
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  device_id TEXT,
  device_info JSONB,
  ip_address INET,
  location_data JSONB,
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create fraud detection logs
CREATE TABLE IF NOT EXISTS public.fraud_detection_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  risk_score INTEGER DEFAULT 0,
  flags JSONB DEFAULT '[]',
  details JSONB DEFAULT '{}',
  action_taken TEXT,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create custom bill providers table for user-added paybills
CREATE TABLE IF NOT EXISTS public.user_bill_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_name TEXT NOT NULL,
  provider_type TEXT CHECK (provider_type IN ('paybill', 'till', 'account')) NOT NULL,
  paybill_number TEXT,
  till_number TEXT,
  account_number TEXT,
  provider_code TEXT,
  category TEXT NOT NULL,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_profiles_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_pins_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_detection_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bill_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs_enhanced ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles_enhanced
CREATE POLICY "Users can view their own profile" ON public.user_profiles_enhanced
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles_enhanced
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles_enhanced
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.user_profiles_enhanced
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for kyc_documents
CREATE POLICY "Users can manage their own KYC documents" ON public.kyc_documents
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all KYC documents" ON public.kyc_documents
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_pins_enhanced (very restrictive)
CREATE POLICY "Users can manage their own PIN" ON public.user_pins_enhanced
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_sessions
CREATE POLICY "Users can view their own sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage sessions" ON public.user_sessions
  FOR ALL USING (true); -- Edge functions will handle security

-- RLS Policies for fraud_detection_logs
CREATE POLICY "Users can view their own fraud logs" ON public.fraud_detection_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all fraud logs" ON public.fraud_detection_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_bill_providers
CREATE POLICY "Users can manage their own bill providers" ON public.user_bill_providers
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for audit_logs_enhanced
CREATE POLICY "Admins can view audit logs" ON public.audit_logs_enhanced
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Functions for PIN management
CREATE OR REPLACE FUNCTION public.set_user_pin_enhanced(p_user_id UUID, p_pin TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_salt TEXT;
  v_hash TEXT;
BEGIN
  -- Generate random salt
  v_salt := encode(gen_random_bytes(32), 'hex');
  
  -- Hash PIN with salt using SHA-256
  v_hash := encode(digest(v_salt || p_pin, 'sha256'), 'hex');
  
  -- Insert or update PIN
  INSERT INTO public.user_pins_enhanced (user_id, pin_hash, salt)
  VALUES (p_user_id, v_hash, v_salt)
  ON CONFLICT (user_id) DO UPDATE SET
    pin_hash = EXCLUDED.pin_hash,
    salt = EXCLUDED.salt,
    failed_attempts = 0,
    locked_until = NULL,
    updated_at = now();
    
  RETURN jsonb_build_object('success', true, 'message', 'PIN set successfully');
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_user_pin_enhanced(p_user_id UUID, p_pin TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stored_hash TEXT;
  v_salt TEXT;
  v_computed_hash TEXT;
  v_failed_attempts INTEGER;
  v_locked_until TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get stored PIN data
  SELECT pin_hash, salt, failed_attempts, locked_until
  INTO v_stored_hash, v_salt, v_failed_attempts, v_locked_until
  FROM public.user_pins_enhanced
  WHERE user_id = p_user_id;
  
  IF v_stored_hash IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'PIN not set');
  END IF;
  
  -- Check if account is locked
  IF v_locked_until IS NOT NULL AND v_locked_until > now() THEN
    RETURN jsonb_build_object('success', false, 'message', 'Account temporarily locked. Try again later.');
  END IF;
  
  -- Compute hash of provided PIN
  v_computed_hash := encode(digest(v_salt || p_pin, 'sha256'), 'hex');
  
  -- Verify PIN
  IF v_computed_hash = v_stored_hash THEN
    -- Reset failed attempts and update last verified
    UPDATE public.user_pins_enhanced
    SET failed_attempts = 0, locked_until = NULL, last_verified = now()
    WHERE user_id = p_user_id;
    
    RETURN jsonb_build_object('success', true, 'message', 'PIN verified successfully');
  ELSE
    -- Increment failed attempts
    v_failed_attempts := v_failed_attempts + 1;
    
    -- Lock account if too many failures
    IF v_failed_attempts >= 5 THEN
      UPDATE public.user_pins_enhanced
      SET failed_attempts = v_failed_attempts, locked_until = now() + INTERVAL '30 minutes'
      WHERE user_id = p_user_id;
      
      RETURN jsonb_build_object('success', false, 'message', 'Too many failed attempts. Account locked for 30 minutes.');
    ELSE
      UPDATE public.user_pins_enhanced
      SET failed_attempts = v_failed_attempts
      WHERE user_id = p_user_id;
      
      RETURN jsonb_build_object('success', false, 'message', FORMAT('Invalid PIN. %s attempts remaining.', 5 - v_failed_attempts));
    END IF;
  END IF;
END;
$$;

-- Function to check fraud risk
CREATE OR REPLACE FUNCTION public.assess_fraud_risk(p_user_id UUID, p_event_type TEXT, p_amount NUMERIC DEFAULT NULL, p_location JSONB DEFAULT NULL)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_risk_score INTEGER := 0;
  v_recent_transactions INTEGER;
  v_user_profile RECORD;
  v_flags JSONB := '[]'::jsonb;
BEGIN
  -- Get user profile for verification status
  SELECT * INTO v_user_profile FROM public.user_profiles_enhanced WHERE user_id = p_user_id;
  
  -- Base risk factors
  IF v_user_profile.kyc_status != 'verified' THEN
    v_risk_score := v_risk_score + 30;
    v_flags := v_flags || jsonb_build_array('unverified_user');
  END IF;
  
  -- Check transaction frequency
  SELECT COUNT(*) INTO v_recent_transactions
  FROM public.enhanced_wallet_transactions
  WHERE user_id = p_user_id AND created_at > now() - INTERVAL '1 hour';
  
  IF v_recent_transactions > 10 THEN
    v_risk_score := v_risk_score + 50;
    v_flags := v_flags || jsonb_build_array('high_frequency_transactions');
  END IF;
  
  -- Amount-based risk
  IF p_amount IS NOT NULL AND p_amount > 50000 THEN
    v_risk_score := v_risk_score + 25;
    v_flags := v_flags || jsonb_build_array('high_amount_transaction');
  END IF;
  
  -- Log the assessment
  INSERT INTO public.fraud_detection_logs (user_id, event_type, risk_score, flags)
  VALUES (p_user_id, p_event_type, v_risk_score, v_flags);
  
  RETURN v_risk_score;
END;
$$;

-- Triggers for audit logging
CREATE OR REPLACE FUNCTION public.log_profile_changes()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.audit_logs_enhanced (user_id, action, resource_type, resource_id, old_values, new_values)
  VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    TG_OP,
    'user_profile',
    COALESCE(NEW.id::text, OLD.id::text),
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER audit_profile_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.user_profiles_enhanced
  FOR EACH ROW EXECUTE FUNCTION public.log_profile_changes();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_enhanced_user_id ON public.user_profiles_enhanced(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_enhanced_kyc_status ON public.user_profiles_enhanced(kyc_status);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_user_id ON public.kyc_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_status ON public.kyc_documents(status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_fraud_logs_user_id ON public.fraud_detection_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bill_providers_user_id ON public.user_bill_providers(user_id);