-- Create enhanced wallet tables for multi-currency support
CREATE TABLE IF NOT EXISTS public.wallet_currencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  currency_code TEXT NOT NULL,
  balance DECIMAL(20,8) NOT NULL DEFAULT 0,
  locked_balance DECIMAL(20,8) NOT NULL DEFAULT 0,
  wallet_address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, currency_code)
);

-- Enable RLS
ALTER TABLE public.wallet_currencies ENABLE ROW LEVEL SECURITY;

-- Create policies for wallet_currencies
CREATE POLICY "Users can manage their own wallet currencies"
ON public.wallet_currencies
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create currency exchange rates table
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate DECIMAL(20,8) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source TEXT DEFAULT 'system',
  UNIQUE(from_currency, to_currency)
);

-- Insert initial exchange rates (USD base)
INSERT INTO public.exchange_rates (from_currency, to_currency, rate, source) VALUES
('USD', 'EUR', 0.92, 'system'),
('USD', 'GBP', 0.80, 'system'),
('USD', 'JPY', 149.50, 'system'),
('USD', 'NGN', 1580.00, 'system'),
('USD', 'KES', 129.50, 'system'),
('USD', 'BTC', 0.000023, 'system'),
('USD', 'ETH', 0.00041, 'system'),
('USD', 'USDT', 1.00, 'system'),
('USD', 'USDC', 1.00, 'system'),
-- Reverse rates
('EUR', 'USD', 1.087, 'system'),
('GBP', 'USD', 1.25, 'system'),
('JPY', 'USD', 0.0067, 'system'),
('NGN', 'USD', 0.00063, 'system'),
('KES', 'USD', 0.0077, 'system'),
('BTC', 'USD', 43500.00, 'system'),
('ETH', 'USD', 2450.00, 'system'),
('USDT', 'USD', 1.00, 'system'),
('USDC', 'USD', 1.00, 'system')
ON CONFLICT (from_currency, to_currency) DO UPDATE SET
rate = EXCLUDED.rate,
updated_at = now();

-- Create wallet transaction types table
CREATE TABLE IF NOT EXISTS public.wallet_transaction_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type_code TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert transaction types
INSERT INTO public.wallet_transaction_types (type_code, display_name, description) VALUES
('deposit', 'Deposit', 'Money added to wallet'),
('withdrawal', 'Withdrawal', 'Money withdrawn from wallet'),
('transfer', 'Transfer', 'Money transferred between wallets'),
('conversion', 'Currency Conversion', 'Currency exchange transaction'),
('payment', 'Payment', 'Payment to merchant or individual'),
('refund', 'Refund', 'Refund from payment'),
('fee', 'Fee', 'Transaction or service fee'),
('reward', 'Reward', 'Bonus or cashback'),
('staking', 'Staking', 'Cryptocurrency staking'),
('unstaking', 'Unstaking', 'Cryptocurrency unstaking')
ON CONFLICT (type_code) DO NOTHING;

-- Enhanced wallet transactions table
CREATE TABLE IF NOT EXISTS public.enhanced_wallet_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  from_currency TEXT,
  to_currency TEXT,
  from_amount DECIMAL(20,8),
  to_amount DECIMAL(20,8),
  exchange_rate DECIMAL(20,8),
  fee_amount DECIMAL(20,8) DEFAULT 0,
  fee_currency TEXT,
  transaction_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  description TEXT,
  reference_id TEXT,
  external_id TEXT,
  metadata JSONB DEFAULT '{}',
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled'))
);

-- Enable RLS
ALTER TABLE public.enhanced_wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for enhanced_wallet_transactions
CREATE POLICY "Users can manage their own enhanced transactions"
ON public.enhanced_wallet_transactions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create function to get exchange rate
CREATE OR REPLACE FUNCTION public.get_exchange_rate(from_curr TEXT, to_curr TEXT)
RETURNS DECIMAL(20,8)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  rate_value DECIMAL(20,8);
BEGIN
  -- If same currency, return 1
  IF from_curr = to_curr THEN
    RETURN 1.0;
  END IF;
  
  -- Try direct rate
  SELECT rate INTO rate_value
  FROM public.exchange_rates
  WHERE from_currency = from_curr AND to_currency = to_curr;
  
  -- If direct rate found, return it
  IF rate_value IS NOT NULL THEN
    RETURN rate_value;
  END IF;
  
  -- Try reverse rate (1/rate)
  SELECT 1.0/rate INTO rate_value
  FROM public.exchange_rates
  WHERE from_currency = to_curr AND to_currency = from_curr;
  
  -- If reverse rate found, return it
  IF rate_value IS NOT NULL THEN
    RETURN rate_value;
  END IF;
  
  -- If no rate found, return 1 (fallback)
  RETURN 1.0;
END;
$$;

-- Create function to process currency conversion
CREATE OR REPLACE FUNCTION public.convert_currency(
  p_user_id UUID,
  p_from_currency TEXT,
  p_to_currency TEXT,
  p_amount DECIMAL(20,8)
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_exchange_rate DECIMAL(20,8);
  v_converted_amount DECIMAL(20,8);
  v_transaction_id UUID;
  v_from_balance DECIMAL(20,8);
BEGIN
  -- Get current exchange rate
  v_exchange_rate := public.get_exchange_rate(p_from_currency, p_to_currency);
  v_converted_amount := p_amount * v_exchange_rate;
  
  -- Check if user has sufficient balance
  SELECT balance INTO v_from_balance
  FROM public.wallet_currencies
  WHERE user_id = p_user_id AND currency_code = p_from_currency;
  
  IF v_from_balance IS NULL OR v_from_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance in % wallet', p_from_currency;
  END IF;
  
  -- Create transaction record
  INSERT INTO public.enhanced_wallet_transactions (
    user_id, from_currency, to_currency, from_amount, to_amount, 
    exchange_rate, transaction_type, status, description
  ) VALUES (
    p_user_id, p_from_currency, p_to_currency, p_amount, v_converted_amount,
    v_exchange_rate, 'conversion', 'processing', 
    FORMAT('Convert %s %s to %s %s', p_amount, p_from_currency, v_converted_amount, p_to_currency)
  ) RETURNING id INTO v_transaction_id;
  
  -- Update balances
  UPDATE public.wallet_currencies
  SET balance = balance - p_amount, updated_at = now()
  WHERE user_id = p_user_id AND currency_code = p_from_currency;
  
  -- Add or update target currency balance
  INSERT INTO public.wallet_currencies (user_id, currency_code, balance)
  VALUES (p_user_id, p_to_currency, v_converted_amount)
  ON CONFLICT (user_id, currency_code)
  DO UPDATE SET balance = wallet_currencies.balance + v_converted_amount, updated_at = now();
  
  -- Mark transaction as completed
  UPDATE public.enhanced_wallet_transactions
  SET status = 'completed', processed_at = now(), updated_at = now()
  WHERE id = v_transaction_id;
  
  RETURN v_transaction_id;
END;
$$;

-- Create function to add funds to wallet
CREATE OR REPLACE FUNCTION public.add_funds_to_wallet(
  p_user_id UUID,
  p_currency TEXT,
  p_amount DECIMAL(20,8),
  p_source TEXT DEFAULT 'deposit',
  p_reference TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transaction_id UUID;
BEGIN
  -- Create transaction record
  INSERT INTO public.enhanced_wallet_transactions (
    user_id, to_currency, to_amount, transaction_type, status, description, reference_id
  ) VALUES (
    p_user_id, p_currency, p_amount, 'deposit', 'completed',
    FORMAT('Deposit %s %s via %s', p_amount, p_currency, p_source), p_reference
  ) RETURNING id INTO v_transaction_id;
  
  -- Add to wallet balance
  INSERT INTO public.wallet_currencies (user_id, currency_code, balance)
  VALUES (p_user_id, p_currency, p_amount)
  ON CONFLICT (user_id, currency_code)
  DO UPDATE SET balance = wallet_currencies.balance + p_amount, updated_at = now();
  
  RETURN v_transaction_id;
END;
$$;

-- Create function to send payment
CREATE OR REPLACE FUNCTION public.send_payment(
  p_sender_id UUID,
  p_recipient_id UUID,
  p_currency TEXT,
  p_amount DECIMAL(20,8),
  p_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transaction_id UUID;
  v_sender_balance DECIMAL(20,8);
BEGIN
  -- Check sender balance
  SELECT balance INTO v_sender_balance
  FROM public.wallet_currencies
  WHERE user_id = p_sender_id AND currency_code = p_currency;
  
  IF v_sender_balance IS NULL OR v_sender_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance in % wallet', p_currency;
  END IF;
  
  -- Create transaction records for both sender and recipient
  INSERT INTO public.enhanced_wallet_transactions (
    user_id, from_currency, from_amount, transaction_type, status, description
  ) VALUES (
    p_sender_id, p_currency, p_amount, 'payment', 'completed',
    COALESCE(p_description, FORMAT('Payment of %s %s', p_amount, p_currency))
  ) RETURNING id INTO v_transaction_id;
  
  INSERT INTO public.enhanced_wallet_transactions (
    user_id, to_currency, to_amount, transaction_type, status, description
  ) VALUES (
    p_recipient_id, p_currency, p_amount, 'deposit', 'completed',
    COALESCE(p_description, FORMAT('Received %s %s', p_amount, p_currency))
  );
  
  -- Update balances
  UPDATE public.wallet_currencies
  SET balance = balance - p_amount, updated_at = now()
  WHERE user_id = p_sender_id AND currency_code = p_currency;
  
  INSERT INTO public.wallet_currencies (user_id, currency_code, balance)
  VALUES (p_recipient_id, p_currency, p_amount)
  ON CONFLICT (user_id, currency_code)
  DO UPDATE SET balance = wallet_currencies.balance + p_amount, updated_at = now();
  
  RETURN v_transaction_id;
END;
$$;

-- Create trigger to update wallet_currencies updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_wallet_currencies_updated_at
  BEFORE UPDATE ON public.wallet_currencies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enhanced_wallet_transactions_updated_at
  BEFORE UPDATE ON public.enhanced_wallet_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();