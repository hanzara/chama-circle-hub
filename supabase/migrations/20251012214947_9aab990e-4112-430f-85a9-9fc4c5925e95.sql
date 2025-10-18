-- =====================================================
-- CHAMA BACKEND - Part 1: Update Existing Tables
-- =====================================================

-- 1. Update profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS central_wallet_balance numeric DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text;

-- 2. Update chamas table  
ALTER TABLE chamas ADD COLUMN IF NOT EXISTS admin_id uuid REFERENCES profiles(id);
ALTER TABLE chamas ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}'::jsonb;
ALTER TABLE chamas ADD COLUMN IF NOT EXISTS schedule jsonb DEFAULT '[]'::jsonb;

-- 3. Update chama_members
ALTER TABLE chama_members ADD COLUMN IF NOT EXISTS merry_balance numeric DEFAULT 0;

-- 4. Update contributions
ALTER TABLE chama_contributions_new ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;
ALTER TABLE chama_contributions_new ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES profiles(id);

-- 5. Update invitations
ALTER TABLE member_invitations ADD COLUMN IF NOT EXISTS token text;
ALTER TABLE member_invitations ADD COLUMN IF NOT EXISTS invited_phone text;
ALTER TABLE member_invitations ADD COLUMN IF NOT EXISTS invited_email text;
ALTER TABLE member_invitations ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Generate tokens for existing invitations
UPDATE member_invitations SET token = gen_random_uuid()::text WHERE token IS NULL;

-- 6. Update loans
ALTER TABLE chama_loans ADD COLUMN IF NOT EXISTS outstanding numeric;
ALTER TABLE chama_loans ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
UPDATE chama_loans SET outstanding = amount WHERE outstanding IS NULL;

-- 7. Update notifications
ALTER TABLE chama_notifications ADD COLUMN IF NOT EXISTS data jsonb DEFAULT '{}'::jsonb;
ALTER TABLE chama_notifications ADD COLUMN IF NOT EXISTS body text;