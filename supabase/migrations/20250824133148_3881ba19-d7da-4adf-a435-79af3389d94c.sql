-- Create card types and status enums
CREATE TYPE public.card_type AS ENUM ('virtual', 'physical');
CREATE TYPE public.card_subtype AS ENUM ('single_use', 'recurring');
CREATE TYPE public.card_status AS ENUM ('active', 'locked', 'frozen', 'expired', 'cancelled');
CREATE TYPE public.notification_type AS ENUM ('sms', 'email', 'push');

-- Create user_cards table
CREATE TABLE public.user_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  card_name TEXT NOT NULL,
  card_type card_type NOT NULL,
  card_subtype card_subtype,
  card_number TEXT,
  card_holder_name TEXT,
  expiry_date DATE,
  cvv TEXT,
  status card_status NOT NULL DEFAULT 'active',
  primary_currency TEXT NOT NULL DEFAULT 'USD',
  currency_priority TEXT[] DEFAULT '{USD}',
  daily_limit DECIMAL(15,2),
  weekly_limit DECIMAL(15,2), 
  monthly_limit DECIMAL(15,2),
  current_balance DECIMAL(15,2) DEFAULT 0,
  international_enabled BOOLEAN DEFAULT true,
  pin_hash TEXT,
  auto_expiry_date DATE,
  is_apple_pay_enabled BOOLEAN DEFAULT false,
  is_google_pay_enabled BOOLEAN DEFAULT false,
  is_paypal_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create card notifications settings table
CREATE TABLE public.card_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES public.user_cards(id) ON DELETE CASCADE,
  notification_type notification_type NOT NULL,
  transaction_alerts BOOLEAN DEFAULT true,
  declined_payments BOOLEAN DEFAULT true,
  suspicious_activity BOOLEAN DEFAULT true,
  spending_limits BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create card transactions table
CREATE TABLE public.card_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES public.user_cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  merchant_name TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency_used TEXT NOT NULL,
  category TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create KYC information table for physical cards
CREATE TABLE public.card_kyc (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES public.user_cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  document_type TEXT,
  document_number TEXT,
  document_image_url TEXT,
  full_name TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  verification_status TEXT DEFAULT 'pending',
  shipping_address TEXT,
  estimated_delivery DATE,
  tracking_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create card rewards table
CREATE TABLE public.card_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES public.user_cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  total_cashback DECIMAL(15,2) DEFAULT 0,
  current_milestone DECIMAL(15,2) DEFAULT 0,
  next_milestone DECIMAL(15,2) DEFAULT 100,
  reward_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_kyc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_rewards ENABLE ROW LEVEL SECURITY;

-- Create policies for user_cards
CREATE POLICY "Users can view their own cards"
ON public.user_cards FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cards"
ON public.user_cards FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cards"
ON public.user_cards FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cards"
ON public.user_cards FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for card_notifications
CREATE POLICY "Users can view their card notifications"
ON public.card_notifications FOR SELECT
USING (EXISTS (SELECT 1 FROM public.user_cards WHERE id = card_id AND user_id = auth.uid()));

CREATE POLICY "Users can manage their card notifications"
ON public.card_notifications FOR ALL
USING (EXISTS (SELECT 1 FROM public.user_cards WHERE id = card_id AND user_id = auth.uid()));

-- Create policies for card_transactions
CREATE POLICY "Users can view their card transactions"
ON public.card_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their card transactions"
ON public.card_transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create policies for card_kyc
CREATE POLICY "Users can manage their card KYC"
ON public.card_kyc FOR ALL
USING (auth.uid() = user_id);

-- Create policies for card_rewards
CREATE POLICY "Users can view their card rewards"
ON public.card_rewards FOR ALL
USING (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_cards_updated_at
  BEFORE UPDATE ON public.user_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_card_rewards_updated_at
  BEFORE UPDATE ON public.card_rewards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();