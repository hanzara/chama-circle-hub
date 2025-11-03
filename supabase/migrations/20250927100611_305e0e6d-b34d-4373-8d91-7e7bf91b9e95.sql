-- Fix the existing policy conflict and create enhanced auth system
-- First drop the conflicting policy if it exists

DO $$
BEGIN
    -- Drop existing policies that might conflict
    DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles_enhanced;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles_enhanced;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles_enhanced;
    DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles_enhanced;
    DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles_enhanced;
EXCEPTION
    WHEN undefined_table THEN NULL;
END $$;

-- Create enhanced user profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles_enhanced (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Basic Profile
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT NOT NULL,
  date_of_birth DATE,
  location TEXT,
  user_category TEXT CHECK (user_category IN ('individual', 'business', 'organization')) DEFAULT 'individual',
  
  -- Business Information (for business users)
  institution_name TEXT,
  business_name TEXT,
  business_permit_ref TEXT,
  
  -- Profile Status
  profile_completion_percentage INTEGER DEFAULT 0,
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  
  -- KYC Status
  kyc_status TEXT CHECK (kyc_status IN ('pending', 'in_review', 'verified', 'rejected')) DEFAULT 'pending',
  kyc_submitted_at TIMESTAMP WITH TIME ZONE,
  kyc_verified_at TIMESTAMP WITH TIME ZONE,
  kyc_verified_by UUID,
  kyc_rejection_reason TEXT,
  
  -- Verification Benefits
  is_verified BOOLEAN DEFAULT FALSE,
  verification_tier TEXT CHECK (verification_tier IN ('basic', 'standard', 'premium')) DEFAULT 'basic',
  max_transaction_limit DECIMAL(15,2) DEFAULT 10000,
  max_daily_limit DECIMAL(15,2) DEFAULT 50000,
  
  -- Privacy Settings
  profile_visibility TEXT CHECK (profile_visibility IN ('public', 'chama_members', 'private')) DEFAULT 'chama_members',
  show_investments BOOLEAN DEFAULT FALSE,
  
  -- Compliance
  terms_accepted BOOLEAN DEFAULT FALSE,
  terms_accepted_at TIMESTAMP WITH TIME ZONE,
  privacy_policy_accepted BOOLEAN DEFAULT FALSE,
  privacy_policy_accepted_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  avatar_url TEXT,
  last_login_at TIMESTAMP WITH TIME ZONE,
  last_active_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profiles_enhanced ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles_enhanced
CREATE POLICY "enhanced_users_view_own_profile" ON public.user_profiles_enhanced
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "enhanced_users_update_own_profile" ON public.user_profiles_enhanced
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "enhanced_users_insert_own_profile" ON public.user_profiles_enhanced
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "enhanced_admins_view_all_profiles" ON public.user_profiles_enhanced
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "enhanced_admins_update_all_profiles" ON public.user_profiles_enhanced
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));