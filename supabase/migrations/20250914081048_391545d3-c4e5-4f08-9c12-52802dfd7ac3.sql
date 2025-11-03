-- Fix the add_personal_savings function to use correct wallet transaction type
CREATE OR REPLACE FUNCTION public.add_personal_savings(
  p_amount NUMERIC,
  p_goal_name TEXT DEFAULT NULL,
  p_frequency TEXT DEFAULT 'one_time',
  p_notes TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_goal_id UUID;
  v_transaction_id UUID;
  v_wallet_balance NUMERIC;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Check wallet balance
  SELECT balance INTO v_wallet_balance
  FROM public.user_wallets
  WHERE user_id = v_user_id;
  
  IF v_wallet_balance IS NULL OR v_wallet_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient wallet balance';
  END IF;
  
  -- Create or find savings goal
  IF p_goal_name IS NOT NULL THEN
    -- Try to find existing goal
    SELECT id INTO v_goal_id
    FROM public.personal_savings_goals
    WHERE user_id = v_user_id AND goal_name = p_goal_name AND status = 'active'
    LIMIT 1;
    
    -- Create new goal if doesn't exist
    IF v_goal_id IS NULL THEN
      INSERT INTO public.personal_savings_goals (user_id, goal_name, target_amount)
      VALUES (v_user_id, p_goal_name, p_amount * 10) -- Default target is 10x the initial amount
      RETURNING id INTO v_goal_id;
    END IF;
  END IF;
  
  -- Create savings transaction
  INSERT INTO public.personal_savings_transactions (
    user_id, savings_goal_id, amount, transaction_type, frequency, notes
  ) VALUES (
    v_user_id, v_goal_id, p_amount, 'deposit', p_frequency, p_notes
  ) RETURNING id INTO v_transaction_id;
  
  -- Update savings goal current amount
  IF v_goal_id IS NOT NULL THEN
    UPDATE public.personal_savings_goals
    SET current_amount = current_amount + p_amount,
        updated_at = now()
    WHERE id = v_goal_id;
  END IF;
  
  -- Deduct from wallet
  UPDATE public.user_wallets
  SET balance = balance - p_amount
  WHERE user_id = v_user_id;
  
  -- Add wallet transaction record (using 'withdrawal' since money is leaving the wallet)
  INSERT INTO public.wallet_transactions (user_id, type, amount, description, status)
  VALUES (v_user_id, 'withdrawal', p_amount, 
          COALESCE('Savings: ' || p_goal_name, 'Personal savings deposit'), 'completed');
  
  RETURN v_transaction_id;
END;
$$;