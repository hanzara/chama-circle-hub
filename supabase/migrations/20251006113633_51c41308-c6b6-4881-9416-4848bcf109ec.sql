-- Financial Separation System - Core Functions Only
-- This creates the essential database functions for account separation

-- 1. Function to collect platform fees separately
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

  RETURN v_fee_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Function to safely process withdrawals
CREATE OR REPLACE FUNCTION public.process_user_withdrawal(
  p_withdrawal_request_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_request RECORD;
  v_user_wallet RECORD;
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
    FORMAT('Withdrawal: Net KES %s, Fee KES %s', v_request.net_amount, v_request.fee_amount)
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

-- 3. Function for daily wallet balance snapshots
CREATE OR REPLACE FUNCTION public.create_daily_wallet_snapshots()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
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

-- 4. Create platform revenue summary view
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

COMMENT ON FUNCTION public.collect_platform_fee IS 'Safely collects fees and updates platform revenue accounts';
COMMENT ON FUNCTION public.process_user_withdrawal IS 'Processes withdrawals with proper fee separation';
COMMENT ON VIEW public.platform_revenue_summary IS 'Summary of all platform revenue streams';