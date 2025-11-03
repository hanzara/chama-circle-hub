-- Create wallet tables if they don't exist
CREATE TABLE IF NOT EXISTS public.user_central_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  balance DECIMAL(15, 2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  reference TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_central_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_central_wallets
DROP POLICY IF EXISTS "Users can view their own wallet" ON public.user_central_wallets;
CREATE POLICY "Users can view their own wallet" 
  ON public.user_central_wallets FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own wallet" ON public.user_central_wallets;
CREATE POLICY "Users can insert their own wallet" 
  ON public.user_central_wallets FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for wallet_transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.wallet_transactions;
CREATE POLICY "Users can view their own transactions" 
  ON public.wallet_transactions FOR SELECT 
  USING (auth.uid() = user_id);

-- Create transfer_funds function
CREATE OR REPLACE FUNCTION public.transfer_funds(
  p_sender_id UUID,
  p_receiver_id UUID,
  p_amount DECIMAL,
  p_fee DECIMAL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sender_balance DECIMAL;
  v_total_deduction DECIMAL;
  v_result JSON;
BEGIN
  -- Calculate total to deduct (amount + fee)
  v_total_deduction := p_amount + p_fee;
  
  -- Get sender's current balance
  SELECT balance INTO v_sender_balance
  FROM public.user_central_wallets
  WHERE user_id = p_sender_id
  FOR UPDATE;
  
  -- Check if sender has sufficient balance
  IF v_sender_balance IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Sender wallet not found',
      'balance', 0
    );
  END IF;
  
  IF v_sender_balance < v_total_deduction THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient balance',
      'balance', v_sender_balance
    );
  END IF;
  
  -- Deduct from sender
  UPDATE public.user_central_wallets
  SET balance = balance - v_total_deduction,
      updated_at = now()
  WHERE user_id = p_sender_id;
  
  -- Add to receiver (only the amount, not the fee)
  INSERT INTO public.user_central_wallets (user_id, balance, created_at, updated_at)
  VALUES (p_receiver_id, p_amount, now(), now())
  ON CONFLICT (user_id)
  DO UPDATE SET 
    balance = user_central_wallets.balance + p_amount,
    updated_at = now();
  
  -- Record sender transaction
  INSERT INTO public.wallet_transactions (user_id, type, amount, description, status)
  VALUES (
    p_sender_id, 
    'transfer_out', 
    -(p_amount + p_fee), 
    'Transfer to user', 
    'completed'
  );
  
  -- Record receiver transaction
  INSERT INTO public.wallet_transactions (user_id, type, amount, description, status)
  VALUES (
    p_receiver_id, 
    'transfer_in', 
    p_amount, 
    'Transfer from user', 
    'completed'
  );
  
  -- Record fee transaction
  IF p_fee > 0 THEN
    INSERT INTO public.wallet_transactions (user_id, type, amount, description, status)
    VALUES (
      p_sender_id, 
      'fee', 
      -p_fee, 
      'Transfer fee', 
      'completed'
    );
  END IF;
  
  -- Return success
  RETURN json_build_object(
    'success', true,
    'remaining_balance', v_sender_balance - v_total_deduction,
    'amount_sent', p_amount,
    'fee', p_fee
  );
END;
$$;