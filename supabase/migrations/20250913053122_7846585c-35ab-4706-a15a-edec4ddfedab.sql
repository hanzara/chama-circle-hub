-- Create personal savings goals table
CREATE TABLE public.personal_savings_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_name TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC DEFAULT 0,
  target_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create personal savings transactions table
CREATE TABLE public.personal_savings_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  savings_goal_id UUID REFERENCES public.personal_savings_goals(id),
  amount NUMERIC NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal')),
  frequency TEXT DEFAULT 'one_time' CHECK (frequency IN ('daily', 'weekly', 'monthly', 'one_time')),
  payment_method TEXT DEFAULT 'wallet',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.personal_savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_savings_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for personal_savings_goals
CREATE POLICY "Users can manage their own savings goals" 
ON public.personal_savings_goals 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for personal_savings_transactions
CREATE POLICY "Users can manage their own savings transactions" 
ON public.personal_savings_transactions 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger for personal_savings_goals
CREATE TRIGGER update_personal_savings_goals_updated_at
BEFORE UPDATE ON public.personal_savings_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to add personal savings
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
  
  -- Add wallet transaction record
  INSERT INTO public.wallet_transactions (user_id, type, amount, description, status)
  VALUES (v_user_id, 'savings_deposit', -p_amount, 
          COALESCE('Savings: ' || p_goal_name, 'Personal savings deposit'), 'completed');
  
  RETURN v_transaction_id;
END;
$$;