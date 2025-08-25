-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  company_name TEXT,
  phone_number TEXT,
  country TEXT,
  timezone TEXT DEFAULT 'UTC',
  preferred_currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wallets table for multi-currency balances
CREATE TABLE public.wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  currency_code TEXT NOT NULL,
  balance DECIMAL(20,8) NOT NULL DEFAULT 0,
  available_balance DECIMAL(20,8) NOT NULL DEFAULT 0,
  locked_balance DECIMAL(20,8) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, currency_code)
);

-- Create payment channels table
CREATE TABLE public.payment_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  channel_type TEXT NOT NULL, -- 'bank', 'card', 'crypto', 'mobile_money', 'wire'
  display_name TEXT,
  api_credentials JSONB, -- encrypted API keys/tokens
  configuration JSONB, -- channel-specific settings
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error', 'maintenance')),
  health_status TEXT DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'degraded', 'down')),
  last_health_check TIMESTAMP WITH TIME ZONE,
  success_rate DECIMAL(5,2) DEFAULT 100.00,
  avg_response_time INTEGER DEFAULT 0, -- milliseconds
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  external_id TEXT, -- provider's transaction ID
  type TEXT NOT NULL CHECK (type IN ('inbound', 'outbound', 'internal', 'conversion')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  source_currency TEXT NOT NULL,
  source_amount DECIMAL(20,8) NOT NULL,
  destination_currency TEXT,
  destination_amount DECIMAL(20,8),
  exchange_rate DECIMAL(20,8),
  fee_amount DECIMAL(20,8) DEFAULT 0,
  fee_currency TEXT,
  payment_channel_id UUID REFERENCES public.payment_channels(id),
  recipient_info JSONB, -- recipient details
  metadata JSONB, -- additional transaction data
  route_taken JSONB, -- which channels were used in routing
  ai_score DECIMAL(5,2), -- AI confidence score for the route
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create treasury rules table for automation
CREATE TABLE public.treasury_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('auto_convert', 'balance_maintain', 'profit_taking', 'volatility_shield')),
  conditions JSONB NOT NULL, -- trigger conditions
  actions JSONB NOT NULL, -- what to do when triggered
  is_active BOOLEAN DEFAULT true,
  last_executed TIMESTAMP WITH TIME ZONE,
  execution_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create API keys table for developer access
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE, -- hashed API key
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb, -- granular permissions
  is_active BOOLEAN DEFAULT true,
  last_used TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create security events table for audit logging
CREATE TABLE public.security_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_description TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create routing preferences table
CREATE TABLE public.routing_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  autopilot_enabled BOOLEAN DEFAULT false,
  priority_order JSONB DEFAULT '["cost", "success_rate", "speed"]'::jsonb,
  custom_rules JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treasury_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routing_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for wallets
CREATE POLICY "Users can view their own wallets" ON public.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own wallets" ON public.wallets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own wallets" ON public.wallets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for payment channels
CREATE POLICY "Users can manage their own payment channels" ON public.payment_channels FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for treasury rules
CREATE POLICY "Users can manage their own treasury rules" ON public.treasury_rules FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for API keys
CREATE POLICY "Users can manage their own API keys" ON public.api_keys FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for security events
CREATE POLICY "Users can view their own security events" ON public.security_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert security events" ON public.security_events FOR INSERT WITH CHECK (true);

-- Create RLS policies for routing preferences
CREATE POLICY "Users can manage their own routing preferences" ON public.routing_preferences FOR ALL USING (auth.uid() = user_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  -- Create default routing preferences
  INSERT INTO public.routing_preferences (user_id)
  VALUES (NEW.id);
  
  -- Create default wallet entries for major currencies
  INSERT INTO public.wallets (user_id, currency_code) VALUES
    (NEW.id, 'USD'),
    (NEW.id, 'EUR'),
    (NEW.id, 'GBP'),
    (NEW.id, 'BTC'),
    (NEW.id, 'ETH');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payment_channels_updated_at BEFORE UPDATE ON public.payment_channels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_treasury_rules_updated_at BEFORE UPDATE ON public.treasury_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_routing_preferences_updated_at BEFORE UPDATE ON public.routing_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_transactions_user_id_created_at ON public.transactions(user_id, created_at DESC);
CREATE INDEX idx_payment_channels_user_id_status ON public.payment_channels(user_id, status);
CREATE INDEX idx_wallets_user_id_currency ON public.wallets(user_id, currency_code);
CREATE INDEX idx_security_events_user_id_created_at ON public.security_events(user_id, created_at DESC);