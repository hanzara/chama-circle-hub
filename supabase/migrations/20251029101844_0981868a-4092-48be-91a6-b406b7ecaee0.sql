-- Create user_central_wallets table if not exists
CREATE TABLE IF NOT EXISTS public.user_central_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create wallet_transactions table if not exists
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  fee numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  type text,
  description text,
  reference_id text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_central_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_central_wallets
CREATE POLICY "Users can view their own wallet"
  ON public.user_central_wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet"
  ON public.user_central_wallets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallet"
  ON public.user_central_wallets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for wallet_transactions
CREATE POLICY "Users can view their own transactions"
  ON public.wallet_transactions FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id OR auth.uid() = user_id);

CREATE POLICY "Users can insert transactions"
  ON public.wallet_transactions FOR INSERT
  WITH CHECK (auth.uid() = sender_id OR auth.uid() = user_id);

-- Create the transfer_funds function
CREATE OR REPLACE FUNCTION public.transfer_funds(
  p_sender_id uuid,
  p_receiver_id uuid,
  p_amount numeric,
  p_fee numeric
) RETURNS json AS $$
DECLARE
  sender_balance numeric;
  receiver_balance numeric;
  total_cost numeric;
  remaining_balance numeric;
BEGIN
  -- Calculate total cost
  total_cost := p_amount + p_fee;
  
  -- Get sender balance
  SELECT balance INTO sender_balance
  FROM public.user_central_wallets
  WHERE user_id = p_sender_id;
  
  -- Check if sender has sufficient balance
  IF sender_balance IS NULL OR sender_balance < total_cost THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient balance',
      'balance', COALESCE(sender_balance, 0)
    );
  END IF;
  
  -- Deduct from sender
  UPDATE public.user_central_wallets
  SET balance = balance - total_cost,
      updated_at = now()
  WHERE user_id = p_sender_id;
  
  -- Add to receiver (create wallet if doesn't exist)
  INSERT INTO public.user_central_wallets (user_id, balance)
  VALUES (p_receiver_id, p_amount)
  ON CONFLICT (user_id) 
  DO UPDATE SET balance = user_central_wallets.balance + p_amount,
                updated_at = now();
  
  -- Record transaction
  INSERT INTO public.wallet_transactions (sender_id, receiver_id, amount, fee, status, type)
  VALUES (p_sender_id, p_receiver_id, p_amount, p_fee, 'success', 'transfer');
  
  -- Calculate remaining balance
  remaining_balance := sender_balance - total_cost;
  
  RETURN json_build_object(
    'success', true,
    'remaining_balance', remaining_balance,
    'amount_sent', p_amount,
    'fee', p_fee
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;