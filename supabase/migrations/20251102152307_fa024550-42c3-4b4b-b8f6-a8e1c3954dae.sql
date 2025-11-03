-- Add sender_id and receiver_id to wallet_transactions for P2P tracking
ALTER TABLE public.wallet_transactions
ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS receiver_id UUID REFERENCES auth.users(id);

-- Create index for deduplication checks
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_dedup 
ON public.wallet_transactions(sender_id, receiver_id, amount, created_at);

-- Create atomic wallet transfer function with deduplication
CREATE OR REPLACE FUNCTION public.atomic_wallet_transfer(
  p_sender_id UUID,
  p_receiver_id UUID,
  p_amount NUMERIC,
  p_fee NUMERIC,
  p_description TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sender_balance NUMERIC;
  v_receiver_balance NUMERIC;
  v_transaction_id UUID;
  v_reference_id TEXT;
  v_duplicate_check INTEGER;
BEGIN
  -- Generate reference ID
  v_reference_id := 'TXN' || EXTRACT(EPOCH FROM NOW())::BIGINT || FLOOR(RANDOM() * 1000)::INT;
  
  -- Check for duplicate transaction in the last 5 minutes
  SELECT COUNT(*) INTO v_duplicate_check
  FROM public.wallet_transactions
  WHERE sender_id = p_sender_id
    AND receiver_id = p_receiver_id
    AND amount = p_amount
    AND created_at > NOW() - INTERVAL '5 minutes'
    AND status IN ('pending', 'completed');
  
  IF v_duplicate_check > 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Duplicate transaction detected. Please wait before retrying.'
    );
  END IF;
  
  -- Lock sender's wallet row for update
  SELECT balance INTO v_sender_balance
  FROM public.user_central_wallets
  WHERE user_id = p_sender_id
  FOR UPDATE;
  
  -- Check if sender wallet exists
  IF v_sender_balance IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Sender wallet not found'
    );
  END IF;
  
  -- Check sufficient balance
  IF v_sender_balance < (p_amount + p_fee) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient balance',
      'balance', v_sender_balance
    );
  END IF;
  
  -- Lock receiver's wallet (create if doesn't exist)
  INSERT INTO public.user_central_wallets (user_id, balance)
  VALUES (p_receiver_id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  SELECT balance INTO v_receiver_balance
  FROM public.user_central_wallets
  WHERE user_id = p_receiver_id
  FOR UPDATE;
  
  -- Insert transaction record FIRST (atomic operation)
  INSERT INTO public.wallet_transactions (
    user_id,
    sender_id,
    receiver_id,
    amount,
    type,
    currency,
    description,
    status,
    reference_id
  ) VALUES (
    p_sender_id,
    p_sender_id,
    p_receiver_id,
    -p_amount - p_fee,
    'transfer',
    'KES',
    COALESCE(p_description, 'Wallet transfer'),
    'completed',
    v_reference_id
  )
  RETURNING id INTO v_transaction_id;
  
  -- If transaction record insert fails, the entire transaction will rollback
  IF v_transaction_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Failed to create transaction record'
    );
  END IF;
  
  -- Insert receiver's transaction record
  INSERT INTO public.wallet_transactions (
    user_id,
    sender_id,
    receiver_id,
    amount,
    type,
    currency,
    description,
    status,
    reference_id
  ) VALUES (
    p_receiver_id,
    p_sender_id,
    p_receiver_id,
    p_amount,
    'transfer',
    'KES',
    COALESCE(p_description, 'Wallet transfer received'),
    'completed',
    v_reference_id
  );
  
  -- Update sender's balance (deduct amount + fee)
  UPDATE public.user_central_wallets
  SET balance = balance - p_amount - p_fee,
      updated_at = NOW()
  WHERE user_id = p_sender_id;
  
  -- Update receiver's balance (add amount)
  UPDATE public.user_central_wallets
  SET balance = balance + p_amount,
      updated_at = NOW()
  WHERE user_id = p_receiver_id;
  
  -- Get updated sender balance
  SELECT balance INTO v_sender_balance
  FROM public.user_central_wallets
  WHERE user_id = p_sender_id;
  
  -- Return success with details
  RETURN json_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'reference_id', v_reference_id,
    'amount_sent', p_amount,
    'fee', p_fee,
    'remaining_balance', v_sender_balance
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Rollback happens automatically, return error
    RETURN json_build_object(
      'success', false,
      'error', 'Transaction failed: ' || SQLERRM
    );
END;
$$;