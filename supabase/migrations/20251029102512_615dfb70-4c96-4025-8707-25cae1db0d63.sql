-- Fix the transfer_funds function to set search_path
CREATE OR REPLACE FUNCTION public.transfer_funds(
  p_sender_id uuid,
  p_receiver_id uuid,
  p_amount numeric,
  p_fee numeric
) RETURNS json 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;