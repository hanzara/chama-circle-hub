-- ============================================
-- CHAMA APP FINANCIAL SEPARATION UPGRADE
-- ============================================
-- This migration ensures complete separation between:
-- 1. User funds (savings, contributions, balances)
-- 2. Platform revenue (fees collected by the app)
-- ============================================

-- 1. Create platform accounts table to track app revenue separately
CREATE TABLE IF NOT EXISTS public.platform_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_type VARCHAR(50) NOT NULL, -- 'fee_revenue', 'withdrawal_fees', 'loan_fees', etc.
  balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_collected NUMERIC(15,2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) NOT NULL DEFAULT 'KES',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT positive_balance CHECK (balance >= 0)
);

-- 2. Create transaction ledger for double-entry bookkeeping
CREATE TABLE IF NOT EXISTS public.transaction_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL,
  transaction_type VARCHAR(50) NOT NULL, -- 'user_deposit', 'user_withdrawal', 'fee_collection', etc.
  account_type VARCHAR(50) NOT NULL, -- 'user_wallet', 'platform_revenue', 'chama_pool'
  account_id UUID, -- references user_wallets.id or platform_accounts.id
  debit_amount NUMERIC(15,2) DEFAULT 0,
  credit_amount NUMERIC(15,2) DEFAULT 0,
  balance_after NUMERIC(15,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'KES',
  reference VARCHAR(255),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT valid_entry CHECK (
    (debit_amount > 0 AND credit_amount = 0) OR 
    (credit_amount > 0 AND debit_amount = 0)
  )
);

-- 3. Create fee collections tracking table
CREATE TABLE IF NOT EXISTS public.fee_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  fee_type VARCHAR(50) NOT NULL, -- 'withdrawal', 'loan_processing', 'monthly_maintenance', etc.
  amount NUMERIC(15,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'KES',
  source_transaction_id UUID,
  platform_account_id UUID REFERENCES public.platform_accounts(id),
  collection_method VARCHAR(50), -- 'direct_deduction', 'paystack_split', 'manual'
  paystack_reference VARCHAR(255),
  status VARCHAR(20) DEFAULT 'collected', -- 'collected', 'pending', 'refunded'
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Create wallet balance snapshots for audit trail
CREATE TABLE IF NOT EXISTS public.wallet_balance_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL,
  wallet_type VARCHAR(50) NOT NULL, -- 'user_wallet', 'chama_wallet'
  balance NUMERIC(15,2) NOT NULL,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  snapshot_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  transaction_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(wallet_id, wallet_type, snapshot_date)
);

-- 5. Create withdrawal requests table with approval workflow
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  fee_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  net_amount NUMERIC(15,2) NOT NULL, -- amount - fee_amount
  currency VARCHAR(10) DEFAULT 'KES',
  withdrawal_method VARCHAR(50) NOT NULL, -- 'mpesa', 'bank_transfer'
  destination_details JSONB NOT NULL, -- phone number or bank details
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'processing', 'completed', 'failed', 'cancelled'
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  processed_at TIMESTAMP WITH TIME ZONE,
  paystack_reference VARCHAR(255),
  rejection_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT positive_amounts CHECK (amount > 0 AND fee_amount >= 0 AND net_amount > 0)
);

-- 6. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_transaction_ledger_account ON public.transaction_ledger(account_type, account_id);
CREATE INDEX IF NOT EXISTS idx_transaction_ledger_transaction ON public.transaction_ledger(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_ledger_created ON public.transaction_ledger(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fee_collections_user ON public.fee_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_fee_collections_type ON public.fee_collections(fee_type);
CREATE INDEX IF NOT EXISTS idx_fee_collections_platform_account ON public.fee_collections(platform_account_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user ON public.withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON public.withdrawal_requests(status);

-- 7. Enable RLS on all new tables
ALTER TABLE public.platform_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_balance_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies for platform_accounts (admin only)
CREATE POLICY "Only admins can view platform accounts"
  ON public.platform_accounts FOR SELECT
  USING (is_admin());

CREATE POLICY "Only admins can manage platform accounts"
  ON public.platform_accounts FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- 9. RLS Policies for transaction_ledger
CREATE POLICY "Users can view their own ledger entries"
  ON public.transaction_ledger FOR SELECT
  USING (
    account_type = 'user_wallet' AND 
    account_id IN (SELECT id FROM public.user_wallets WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can view all ledger entries"
  ON public.transaction_ledger FOR SELECT
  USING (is_admin());

-- 10. RLS Policies for fee_collections
CREATE POLICY "Users can view their own fee collections"
  ON public.fee_collections FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all fee collections"
  ON public.fee_collections FOR SELECT
  USING (is_admin());

-- 11. RLS Policies for withdrawal_requests
CREATE POLICY "Users can view their own withdrawal requests"
  ON public.withdrawal_requests FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own withdrawal requests"
  ON public.withdrawal_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can cancel their pending withdrawal requests"
  ON public.withdrawal_requests FOR UPDATE
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (status IN ('pending', 'cancelled'));

CREATE POLICY "Admins can manage all withdrawal requests"
  ON public.withdrawal_requests FOR ALL
  USING (is_admin());

-- 12. RLS Policies for wallet_balance_snapshots
CREATE POLICY "Users can view their wallet snapshots"
  ON public.wallet_balance_snapshots FOR SELECT
  USING (
    wallet_id IN (SELECT id FROM public.user_wallets WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can view all wallet snapshots"
  ON public.wallet_balance_snapshots FOR SELECT
  USING (is_admin());

-- 13. Function to record ledger entry (double-entry bookkeeping)
CREATE OR REPLACE FUNCTION public.record_ledger_entry(
  p_transaction_id UUID,
  p_transaction_type VARCHAR,
  p_debit_account_type VARCHAR,
  p_debit_account_id UUID,
  p_credit_account_type VARCHAR,
  p_credit_account_id UUID,
  p_amount NUMERIC,
  p_currency VARCHAR DEFAULT 'KES',
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS VOID AS $$
DECLARE
  v_debit_balance NUMERIC;
  v_credit_balance NUMERIC;
BEGIN
  -- Get current balances
  IF p_debit_account_type = 'user_wallet' THEN
    SELECT balance INTO v_debit_balance FROM public.user_wallets WHERE id = p_debit_account_id;
  ELSIF p_debit_account_type = 'platform_revenue' THEN
    SELECT balance INTO v_debit_balance FROM public.platform_accounts WHERE id = p_debit_account_id;
  END IF;

  IF p_credit_account_type = 'user_wallet' THEN
    SELECT balance INTO v_credit_balance FROM public.user_wallets WHERE id = p_credit_account_id;
  ELSIF p_credit_account_type = 'platform_revenue' THEN
    SELECT balance INTO v_credit_balance FROM public.platform_accounts WHERE id = p_credit_account_id;
  END IF;

  -- Record debit entry
  INSERT INTO public.transaction_ledger (
    transaction_id, transaction_type, account_type, account_id,
    debit_amount, credit_amount, balance_after, currency, description, metadata
  ) VALUES (
    p_transaction_id, p_transaction_type, p_debit_account_type, p_debit_account_id,
    p_amount, 0, v_debit_balance - p_amount, p_currency, p_description, p_metadata
  );

  -- Record credit entry
  INSERT INTO public.transaction_ledger (
    transaction_id, transaction_type, account_type, account_id,
    debit_amount, credit_amount, balance_after, currency, description, metadata
  ) VALUES (
    p_transaction_id, p_transaction_type, p_credit_account_type, p_credit_account_id,
    0, p_amount, v_credit_balance + p_amount, p_currency, p_description, p_metadata
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Function to collect fee and update platform account
CREATE OR REPLACE FUNCTION public.collect_platform_fee(
  p_user_id UUID,
  p_fee_type VARCHAR,
  p_amount NUMERIC,
  p_source_transaction_id UUID DEFAULT NULL,
  p_payment_reference VARCHAR DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_fee_id UUID;
  v_platform_account_id UUID;
  v_user_wallet_id UUID;
BEGIN
  -- Get or create platform account for this fee type
  SELECT id INTO v_platform_account_id
  FROM public.platform_accounts
  WHERE account_type = p_fee_type AND is_active = true
  LIMIT 1;

  IF v_platform_account_id IS NULL THEN
    INSERT INTO public.platform_accounts (account_type, description)
    VALUES (p_fee_type, 'Platform revenue from ' || p_fee_type)
    RETURNING id INTO v_platform_account_id;
  END IF;

  -- Get user wallet
  SELECT id INTO v_user_wallet_id
  FROM public.user_wallets
  WHERE user_id = p_user_id
  LIMIT 1;

  -- Record fee collection
  INSERT INTO public.fee_collections (
    user_id, fee_type, amount, platform_account_id,
    source_transaction_id, paystack_reference, status
  ) VALUES (
    p_user_id, p_fee_type, p_amount, v_platform_account_id,
    p_source_transaction_id, p_payment_reference, 'collected'
  ) RETURNING id INTO v_fee_id;

  -- Update platform account balance
  UPDATE public.platform_accounts
  SET balance = balance + p_amount,
      total_collected = total_collected + p_amount,
      updated_at = now()
  WHERE id = v_platform_account_id;

  -- Record ledger entry
  IF v_user_wallet_id IS NOT NULL THEN
    PERFORM record_ledger_entry(
      v_fee_id,
      'fee_collection',
      'user_wallet',
      v_user_wallet_id,
      'platform_revenue',
      v_platform_account_id,
      p_amount,
      'KES',
      FORMAT('Fee collection: %s', p_fee_type),
      jsonb_build_object('fee_type', p_fee_type, 'user_id', p_user_id)
    );
  END IF;

  RETURN v_fee_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Function to create daily wallet snapshots
CREATE OR REPLACE FUNCTION public.create_daily_wallet_snapshots()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  -- Snapshot user wallets
  INSERT INTO public.wallet_balance_snapshots (
    wallet_id, wallet_type, balance, snapshot_date, transaction_count
  )
  SELECT 
    id,
    'user_wallet',
    balance,
    CURRENT_DATE,
    (SELECT COUNT(*) FROM public.wallet_transactions WHERE user_id = uw.user_id AND DATE(created_at) = CURRENT_DATE)
  FROM public.user_wallets uw
  ON CONFLICT (wallet_id, wallet_type, snapshot_date) 
  DO UPDATE SET 
    balance = EXCLUDED.balance,
    transaction_count = EXCLUDED.transaction_count,
    snapshot_time = now();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. Function to safely process withdrawal (prevents admin from touching user funds)
CREATE OR REPLACE FUNCTION public.process_user_withdrawal(
  p_withdrawal_request_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_request RECORD;
  v_user_wallet RECORD;
  v_platform_account_id UUID;
  v_ledger_id UUID;
BEGIN
  -- Get withdrawal request
  SELECT * INTO v_request
  FROM public.withdrawal_requests
  WHERE id = p_withdrawal_request_id
  AND status = 'approved'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Withdrawal request not found or not approved');
  END IF;

  -- Get user wallet
  SELECT * INTO v_user_wallet
  FROM public.user_wallets
  WHERE id = v_request.wallet_id
  FOR UPDATE;

  -- Check sufficient balance
  IF v_user_wallet.balance < v_request.amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
  END IF;

  -- Deduct from user wallet
  UPDATE public.user_wallets
  SET balance = balance - v_request.amount
  WHERE id = v_request.wallet_id;

  -- Collect fee to platform account
  IF v_request.fee_amount > 0 THEN
    PERFORM collect_platform_fee(
      v_request.user_id,
      'withdrawal',
      v_request.fee_amount,
      p_withdrawal_request_id,
      v_request.paystack_reference
    );
  END IF;

  -- Update withdrawal request status
  UPDATE public.withdrawal_requests
  SET status = 'processing',
      processed_at = now(),
      updated_at = now()
  WHERE id = p_withdrawal_request_id;

  -- Record wallet transaction
  INSERT INTO public.wallet_transactions (
    user_id, type, amount, status, description
  ) VALUES (
    v_request.user_id,
    'withdrawal',
    v_request.amount,
    'completed',
    FORMAT('Withdrawal request processed. Net: KES %s, Fee: KES %s', v_request.net_amount, v_request.fee_amount)
  );

  RETURN jsonb_build_object(
    'success', true,
    'withdrawal_id', p_withdrawal_request_id,
    'amount', v_request.amount,
    'fee', v_request.fee_amount,
    'net_amount', v_request.net_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 17. Add trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_platform_accounts_updated_at
  BEFORE UPDATE ON public.platform_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_withdrawal_requests_updated_at
  BEFORE UPDATE ON public.withdrawal_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 18. Insert default platform accounts
INSERT INTO public.platform_accounts (account_type, description) VALUES
  ('withdrawal_fees', 'Revenue from withdrawal fees'),
  ('loan_processing_fees', 'Revenue from loan processing fees'),
  ('monthly_maintenance_fees', 'Revenue from monthly maintenance fees'),
  ('transaction_fees', 'Revenue from general transaction fees')
ON CONFLICT DO NOTHING;

-- 19. Create view for platform revenue summary
CREATE OR REPLACE VIEW public.platform_revenue_summary AS
SELECT 
  pa.account_type,
  pa.balance AS current_balance,
  pa.total_collected,
  COUNT(fc.id) AS total_transactions,
  COALESCE(SUM(fc.amount), 0) AS total_fees_collected,
  pa.updated_at AS last_updated
FROM public.platform_accounts pa
LEFT JOIN public.fee_collections fc ON fc.platform_account_id = pa.id
WHERE pa.is_active = true
GROUP BY pa.id, pa.account_type, pa.balance, pa.total_collected, pa.updated_at;

COMMENT ON TABLE public.platform_accounts IS 'Stores platform revenue separately from user funds';
COMMENT ON TABLE public.transaction_ledger IS 'Double-entry bookkeeping ledger for all financial transactions';
COMMENT ON TABLE public.fee_collections IS 'Tracks all fees collected from users';
COMMENT ON TABLE public.withdrawal_requests IS 'Manages withdrawal requests with approval workflow';
COMMENT ON FUNCTION public.collect_platform_fee IS 'Safely collects fees and updates platform accounts';
COMMENT ON FUNCTION public.process_user_withdrawal IS 'Processes withdrawals while preventing unauthorized access to user funds';