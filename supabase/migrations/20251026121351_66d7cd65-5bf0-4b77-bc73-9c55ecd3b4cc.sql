-- Add missing columns to wallet_transactions table
ALTER TABLE wallet_transactions 
  ADD COLUMN IF NOT EXISTS wallet_id UUID REFERENCES user_central_wallets(id),
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS payment_reference TEXT,
  ADD COLUMN IF NOT EXISTS reference_number TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS balance_before NUMERIC,
  ADD COLUMN IF NOT EXISTS balance_after NUMERIC,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_payment_ref ON wallet_transactions(payment_reference);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_reference_number ON wallet_transactions(reference_number);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_status ON wallet_transactions(user_id, status);

-- Add policy for service role
DROP POLICY IF EXISTS "Service role can manage wallet transactions" ON wallet_transactions;
CREATE POLICY "Service role can manage wallet transactions"
  ON wallet_transactions FOR ALL
  USING (auth.role() = 'service_role');

-- Atomic wallet balance update function with row locking
CREATE OR REPLACE FUNCTION update_wallet_balance_atomic(
  p_user_id UUID,
  p_amount NUMERIC,
  p_transaction_type TEXT,
  p_reference TEXT,
  p_payment_method TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet_id UUID;
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
  v_transaction_id UUID;
  v_result JSONB;
BEGIN
  -- Lock wallet row to prevent race conditions
  SELECT id, balance INTO v_wallet_id, v_current_balance
  FROM user_central_wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Create wallet if doesn't exist
  IF v_wallet_id IS NULL THEN
    INSERT INTO user_central_wallets (user_id, balance)
    VALUES (p_user_id, 0)
    RETURNING id, balance INTO v_wallet_id, v_current_balance;
  END IF;

  -- Calculate new balance based on transaction type
  IF p_transaction_type IN ('credit', 'deposit') THEN
    v_new_balance := v_current_balance + p_amount;
  ELSIF p_transaction_type IN ('debit', 'withdrawal', 'payment') THEN
    v_new_balance := v_current_balance - p_amount;
    
    IF v_new_balance < 0 THEN
      RAISE EXCEPTION 'Insufficient balance. Current: KES %, Required: KES %', v_current_balance, p_amount;
    END IF;
  ELSE
    RAISE EXCEPTION 'Invalid transaction type: %', p_transaction_type;
  END IF;

  -- Update wallet balance atomically
  UPDATE user_central_wallets
  SET balance = v_new_balance,
      updated_at = NOW()
  WHERE id = v_wallet_id;

  -- Create transaction record
  INSERT INTO wallet_transactions (
    user_id,
    wallet_id,
    amount,
    type,
    status,
    reference_number,
    payment_method,
    payment_reference,
    description,
    currency,
    balance_before,
    balance_after,
    completed_at,
    metadata
  ) VALUES (
    p_user_id,
    v_wallet_id,
    p_amount,
    p_transaction_type,
    'completed',
    p_reference,
    p_payment_method,
    p_reference,
    p_description,
    'KES',
    v_current_balance,
    v_new_balance,
    NOW(),
    p_metadata
  ) RETURNING id INTO v_transaction_id;

  -- Build success response
  v_result := jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'wallet_id', v_wallet_id,
    'balance_before', v_current_balance,
    'balance_after', v_new_balance,
    'amount', p_amount,
    'transaction_type', p_transaction_type
  );

  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Wallet update error: %', SQLERRM;
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Function to check transaction uniqueness
CREATE OR REPLACE FUNCTION is_transaction_unique(p_reference TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN NOT EXISTS(
    SELECT 1 FROM wallet_transactions 
    WHERE reference_number = p_reference 
       OR payment_reference = p_reference
  );
END;
$$;

COMMENT ON FUNCTION update_wallet_balance_atomic IS 'Atomically updates wallet balance with row-level locking to prevent race conditions and double-processing';
COMMENT ON FUNCTION is_transaction_unique IS 'Verifies transaction reference is unique before processing';