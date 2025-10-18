-- Create app_role enum first
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user profiles table with KYC fields
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name text,
  phone text,
  date_of_birth date,
  location text,
  user_category text CHECK (user_category IN ('individual', 'business', 'institutional')),
  institution_name text,
  business_permit_ref text,
  verification_status text DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  verification_notes text,
  verified_at timestamp with time zone,
  verified_by uuid REFERENCES auth.users(id),
  benefits_unlocked jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create KYC documents table
CREATE TABLE IF NOT EXISTS public.kyc_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_type text NOT NULL CHECK (document_type IN ('national_id', 'passport', 'driving_license', 'business_permit', 'tax_certificate', 'utility_bill', 'bank_statement')),
  file_path text NOT NULL,
  file_name text NOT NULL,
  file_size bigint,
  mime_type text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  rejection_reason text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamp with time zone,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create security settings table
CREATE TABLE IF NOT EXISTS public.user_security_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  biometric_enabled boolean DEFAULT false,
  auto_logout_minutes integer DEFAULT 30,
  two_factor_enabled boolean DEFAULT false,
  two_factor_method text CHECK (two_factor_method IN ('sms', 'email', 'app')),
  failed_pin_attempts integer DEFAULT 0,
  account_locked_until timestamp with time zone,
  last_password_change timestamp with time zone,
  security_questions jsonb DEFAULT '[]'::jsonb,
  trusted_devices jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create user sessions table
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_token text NOT NULL,
  device_info jsonb,
  ip_address inet,
  location_data jsonb,
  is_active boolean DEFAULT true,
  last_activity timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create fraud detection logs table
CREATE TABLE IF NOT EXISTS public.fraud_detection_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  risk_score integer CHECK (risk_score >= 0 AND risk_score <= 100),
  details jsonb NOT NULL,
  ip_address inet,
  user_agent text,
  location_data jsonb,
  action_taken text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Create audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  resource_type text,
  resource_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email_notifications boolean DEFAULT true,
  sms_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT true,
  security_alerts boolean DEFAULT true,
  transaction_alerts boolean DEFAULT true,
  marketing_emails boolean DEFAULT false,
  weekly_summaries boolean DEFAULT true,
  chama_updates boolean DEFAULT true,
  loan_reminders boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_detection_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for KYC documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kyc-documents', 
  'kyc-documents', 
  false, 
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;