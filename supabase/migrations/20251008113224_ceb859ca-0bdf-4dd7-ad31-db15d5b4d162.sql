-- Ensure chama_members has all required wallet and role fields
ALTER TABLE chama_members 
ADD COLUMN IF NOT EXISTS savings_balance NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS mgr_balance NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS withdrawal_locked BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS mgr_turn_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS mgr_turn_date DATE;

-- Create audit logs table for tracking all actions
CREATE TABLE IF NOT EXISTS chama_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chama_id UUID REFERENCES chamas(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES chama_members(id),
  action VARCHAR NOT NULL,
  target_member_id UUID REFERENCES chama_members(id),
  details JSONB DEFAULT '{}',
  amount NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on audit trail
ALTER TABLE chama_audit_trail ENABLE ROW LEVEL SECURITY;

-- Policy: Members can view audit trail for their chama
CREATE POLICY "Members can view audit trail" ON chama_audit_trail
  FOR SELECT USING (
    is_chama_member(chama_id)
  );

-- Policy: Admins/treasurers can insert audit logs
CREATE POLICY "Admins can create audit logs" ON chama_audit_trail
  FOR INSERT WITH CHECK (
    is_chama_admin_or_treasurer(chama_id)
  );

-- Create user central wallet table
CREATE TABLE IF NOT EXISTS user_central_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  balance NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on central wallets
ALTER TABLE user_central_wallets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own central wallet
CREATE POLICY "Users manage own central wallet" ON user_central_wallets
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to initialize central wallet on user creation
CREATE OR REPLACE FUNCTION handle_new_user_central_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_central_wallets (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created_central_wallet ON auth.users;
CREATE TRIGGER on_auth_user_created_central_wallet
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_central_wallet();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_chama_audit_trail_chama ON chama_audit_trail(chama_id);
CREATE INDEX IF NOT EXISTS idx_chama_audit_trail_actor ON chama_audit_trail(actor_id);
CREATE INDEX IF NOT EXISTS idx_chama_members_role ON chama_members(role);
CREATE INDEX IF NOT EXISTS idx_chama_members_withdrawal_locked ON chama_members(withdrawal_locked);