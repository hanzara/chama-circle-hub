-- Create multiple savings accounts feature for chama members
CREATE TABLE public.chama_member_savings_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chama_id UUID NOT NULL,
  member_id UUID NOT NULL,
  account_name VARCHAR(100) NOT NULL,
  account_type VARCHAR(50) NOT NULL DEFAULT 'regular', -- regular, emergency, goal-based, premium
  target_amount NUMERIC(15,2),
  current_balance NUMERIC(15,2) DEFAULT 0,
  interest_rate NUMERIC(5,2) DEFAULT 5.0, -- Higher rates for premium accounts
  minimum_balance NUMERIC(15,2) DEFAULT 0,
  withdrawal_fee NUMERIC(10,2) DEFAULT 0,
  monthly_target NUMERIC(15,2),
  auto_save_enabled BOOLEAN DEFAULT false,
  auto_save_amount NUMERIC(10,2),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_member_account_name UNIQUE(member_id, account_name)
);

-- Create savings account transactions table
CREATE TABLE public.chama_savings_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  savings_account_id UUID NOT NULL,
  chama_id UUID NOT NULL,
  member_id UUID NOT NULL,
  transaction_type VARCHAR(20) NOT NULL, -- deposit, withdrawal, interest, fee
  amount NUMERIC(15,2) NOT NULL,
  balance_after NUMERIC(15,2) NOT NULL,
  transaction_fee NUMERIC(10,2) DEFAULT 0,
  description TEXT,
  reference_number VARCHAR(50),
  payment_method VARCHAR(20) DEFAULT 'mobile_money',
  status VARCHAR(20) DEFAULT 'completed',
  processed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create premium features subscription table
CREATE TABLE public.premium_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  chama_id UUID,
  subscription_type VARCHAR(50) NOT NULL, -- individual, chama_admin, enterprise
  features JSONB NOT NULL DEFAULT '[]', -- List of enabled features
  monthly_fee NUMERIC(10,2) NOT NULL,
  billing_cycle VARCHAR(20) DEFAULT 'monthly',
  status VARCHAR(20) DEFAULT 'active',
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create investment advisory table for premium feature
CREATE TABLE public.investment_advisory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  advisory_type VARCHAR(50) NOT NULL, -- ai_recommendation, expert_consultation, portfolio_review
  investment_amount NUMERIC(15,2),
  risk_profile VARCHAR(20),
  recommendations JSONB,
  status VARCHAR(20) DEFAULT 'pending',
  advisor_fee NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.chama_member_savings_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chama_savings_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_advisory ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chama_member_savings_accounts
CREATE POLICY "Members can manage their savings accounts in their chama"
ON public.chama_member_savings_accounts
FOR ALL
USING (
  member_id IN (
    SELECT id FROM public.chama_members 
    WHERE user_id = auth.uid() AND chama_id = chama_member_savings_accounts.chama_id
  )
)
WITH CHECK (
  member_id IN (
    SELECT id FROM public.chama_members 
    WHERE user_id = auth.uid() AND chama_id = chama_member_savings_accounts.chama_id
  )
);

CREATE POLICY "Chama admins can view all savings accounts in their chama"
ON public.chama_member_savings_accounts
FOR SELECT
USING (is_chama_admin_or_treasurer(chama_id));

-- RLS Policies for chama_savings_transactions
CREATE POLICY "Members can view their savings transactions"
ON public.chama_savings_transactions
FOR SELECT
USING (
  member_id IN (
    SELECT id FROM public.chama_members 
    WHERE user_id = auth.uid() AND chama_id = chama_savings_transactions.chama_id
  )
);

CREATE POLICY "Members can create deposits to their savings accounts"
ON public.chama_savings_transactions
FOR INSERT
WITH CHECK (
  member_id IN (
    SELECT id FROM public.chama_members 
    WHERE user_id = auth.uid() AND chama_id = chama_savings_transactions.chama_id
  )
  AND transaction_type = 'deposit'
);

CREATE POLICY "Admins can manage all savings transactions in their chama"
ON public.chama_savings_transactions
FOR ALL
USING (is_chama_admin_or_treasurer(chama_id));

-- RLS Policies for premium_subscriptions
CREATE POLICY "Users can manage their premium subscriptions"
ON public.premium_subscriptions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for investment_advisory
CREATE POLICY "Users can manage their investment advisory"
ON public.investment_advisory
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create function to calculate savings account interest
CREATE OR REPLACE FUNCTION public.calculate_savings_interest(account_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  account_data RECORD;
  daily_interest NUMERIC;
BEGIN
  SELECT * INTO account_data 
  FROM public.chama_member_savings_accounts 
  WHERE id = account_id;
  
  IF account_data IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Calculate daily interest (annual rate / 365)
  daily_interest := (account_data.current_balance * account_data.interest_rate / 100) / 365;
  
  RETURN ROUND(daily_interest, 2);
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function to process savings deposit with fees
CREATE OR REPLACE FUNCTION public.deposit_to_savings_account(
  p_account_id UUID,
  p_amount NUMERIC,
  p_payment_method VARCHAR DEFAULT 'mobile_money',
  p_reference VARCHAR DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  account_data RECORD;
  member_data RECORD;
  transaction_fee NUMERIC := 0;
  net_amount NUMERIC;
  new_balance NUMERIC;
  transaction_id UUID;
BEGIN
  -- Get account details
  SELECT * INTO account_data 
  FROM public.chama_member_savings_accounts 
  WHERE id = p_account_id;
  
  IF account_data IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Savings account not found');
  END IF;
  
  -- Check if user owns this account
  SELECT * INTO member_data
  FROM public.chama_members
  WHERE id = account_data.member_id AND user_id = auth.uid();
  
  IF member_data IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Unauthorized access');
  END IF;
  
  -- Calculate transaction fee (0.5% for regular, 0.3% for premium accounts)
  IF account_data.account_type = 'premium' THEN
    transaction_fee := p_amount * 0.003; -- 0.3%
  ELSE
    transaction_fee := p_amount * 0.005; -- 0.5%
  END IF;
  
  net_amount := p_amount - transaction_fee;
  new_balance := account_data.current_balance + net_amount;
  
  -- Update account balance
  UPDATE public.chama_member_savings_accounts
  SET current_balance = new_balance, updated_at = now()
  WHERE id = p_account_id;
  
  -- Record transaction
  INSERT INTO public.chama_savings_transactions (
    savings_account_id, chama_id, member_id, transaction_type, 
    amount, balance_after, transaction_fee, description, reference_number, payment_method
  ) VALUES (
    p_account_id, account_data.chama_id, account_data.member_id, 'deposit',
    net_amount, new_balance, transaction_fee, 
    FORMAT('Deposit to %s account', account_data.account_name), 
    p_reference, p_payment_method
  ) RETURNING id INTO transaction_id;
  
  -- Record fee transaction
  IF transaction_fee > 0 THEN
    INSERT INTO public.chama_savings_transactions (
      savings_account_id, chama_id, member_id, transaction_type,
      amount, balance_after, transaction_fee, description
    ) VALUES (
      p_account_id, account_data.chama_id, account_data.member_id, 'fee',
      transaction_fee, new_balance, 0, 'Transaction fee'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Deposit successful',
    'transaction_id', transaction_id,
    'fee_charged', transaction_fee,
    'net_deposited', net_amount,
    'new_balance', new_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add triggers for automatic updates
CREATE TRIGGER update_savings_accounts_updated_at
  BEFORE UPDATE ON public.chama_member_savings_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_premium_subscriptions_updated_at
  BEFORE UPDATE ON public.premium_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();