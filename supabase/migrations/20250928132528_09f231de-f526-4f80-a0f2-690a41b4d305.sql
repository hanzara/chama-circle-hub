-- Create sellers table for hotspot owners
CREATE TABLE public.sellers (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  business_name TEXT,
  phone TEXT,
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'approved', 'rejected')),
  kyc_docs JSONB DEFAULT '{}',
  bank_details JSONB DEFAULT '{}',
  mpesa_number TEXT,
  commission_rate NUMERIC DEFAULT 10.0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create hotspots table
CREATE TABLE public.hotspots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES public.sellers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  ssid TEXT,
  lat NUMERIC,
  lng NUMERIC,
  address TEXT,
  max_concurrent INTEGER DEFAULT 50,
  verified BOOLEAN DEFAULT false,
  proof_docs JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create packages table
CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotspot_id UUID REFERENCES public.hotspots(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  price INTEGER NOT NULL, -- in cents
  duration_minutes INTEGER,
  data_mb INTEGER,
  max_concurrent INTEGER DEFAULT 10,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create seller wallets table
CREATE TABLE public.seller_wallets (
  seller_id UUID PRIMARY KEY REFERENCES public.sellers(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0, -- in cents
  total_earned INTEGER DEFAULT 0,
  total_withdrawn INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create wifi transactions table
CREATE TABLE public.wifi_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID,
  seller_id UUID REFERENCES public.sellers(id),
  hotspot_id UUID REFERENCES public.hotspots(id),
  package_id UUID REFERENCES public.packages(id),
  amount INTEGER NOT NULL, -- in cents
  commission INTEGER NOT NULL, -- in cents
  net_amount INTEGER NOT NULL, -- in cents
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  voucher_code TEXT UNIQUE,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create payouts table
CREATE TABLE public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES public.sellers(id),
  amount INTEGER NOT NULL, -- in cents
  fee INTEGER DEFAULT 0,
  status TEXT DEFAULT 'requested' CHECK (status IN ('requested', 'processing', 'completed', 'failed')),
  payout_method TEXT DEFAULT 'mpesa',
  reference_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- Create hotspot sessions table
CREATE TABLE public.hotspot_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotspot_id UUID REFERENCES public.hotspots(id),
  buyer_id UUID,
  voucher_code TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  bytes_used BIGINT DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'disconnected')),
  device_info JSONB DEFAULT '{}'
);

-- Create indexes for better performance
CREATE INDEX idx_hotspots_seller_id ON public.hotspots(seller_id);
CREATE INDEX idx_packages_hotspot_id ON public.packages(hotspot_id);
CREATE INDEX idx_wifi_transactions_seller_id ON public.wifi_transactions(seller_id);
CREATE INDEX idx_wifi_transactions_created_at ON public.wifi_transactions(created_at);
CREATE INDEX idx_hotspot_sessions_hotspot_id ON public.hotspot_sessions(hotspot_id);
CREATE INDEX idx_hotspot_sessions_status ON public.hotspot_sessions(status);

-- Enable RLS
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotspots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wifi_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotspot_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for sellers
CREATE POLICY "Sellers can manage their own profile" ON public.sellers
  FOR ALL USING (auth.uid() = id);

-- RLS policies for hotspots
CREATE POLICY "Sellers can manage their hotspots" ON public.hotspots
  FOR ALL USING (seller_id IN (SELECT id FROM public.sellers WHERE id = auth.uid()));

CREATE POLICY "Anyone can view verified hotspots" ON public.hotspots
  FOR SELECT USING (verified = true AND status = 'active');

-- RLS policies for packages
CREATE POLICY "Sellers can manage their packages" ON public.packages
  FOR ALL USING (hotspot_id IN (
    SELECT id FROM public.hotspots WHERE seller_id = auth.uid()
  ));

CREATE POLICY "Anyone can view active packages" ON public.packages
  FOR SELECT USING (active = true AND hotspot_id IN (
    SELECT id FROM public.hotspots WHERE verified = true AND status = 'active'
  ));

-- RLS policies for seller wallets
CREATE POLICY "Sellers can view their wallet" ON public.seller_wallets
  FOR SELECT USING (seller_id = auth.uid());

-- RLS policies for wifi transactions
CREATE POLICY "Sellers can view their transactions" ON public.wifi_transactions
  FOR SELECT USING (seller_id = auth.uid());

-- RLS policies for payouts
CREATE POLICY "Sellers can manage their payouts" ON public.payouts
  FOR ALL USING (seller_id = auth.uid());

-- RLS policies for hotspot sessions
CREATE POLICY "Sellers can view sessions for their hotspots" ON public.hotspot_sessions
  FOR SELECT USING (hotspot_id IN (
    SELECT id FROM public.hotspots WHERE seller_id = auth.uid()
  ));

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sellers_updated_at BEFORE UPDATE ON public.sellers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER hotspots_updated_at BEFORE UPDATE ON public.hotspots
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER packages_updated_at BEFORE UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER seller_wallets_updated_at BEFORE UPDATE ON public.seller_wallets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to initialize seller wallet
CREATE OR REPLACE FUNCTION public.create_seller_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.seller_wallets (seller_id)
  VALUES (NEW.id)
  ON CONFLICT (seller_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_seller_wallet_trigger
  AFTER INSERT ON public.sellers
  FOR EACH ROW EXECUTE FUNCTION public.create_seller_wallet();

-- Generate voucher code function
CREATE OR REPLACE FUNCTION public.generate_voucher_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;