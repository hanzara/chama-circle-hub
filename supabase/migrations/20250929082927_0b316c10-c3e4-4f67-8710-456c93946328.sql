-- Create tables for WiFi Access system (fixed)

-- WiFi Hotspots table
CREATE TABLE public.wifi_hotspots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL, -- references user ID directly for now
  name TEXT NOT NULL,
  description TEXT,
  location_lat DECIMAL(10,8) NOT NULL,
  location_lng DECIMAL(11,8) NOT NULL,
  address TEXT NOT NULL,
  coverage_radius INTEGER DEFAULT 100, -- meters
  max_concurrent_users INTEGER DEFAULT 50,
  current_active_users INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  rating DECIMAL(3,2) DEFAULT 0.0,
  total_ratings INTEGER DEFAULT 0,
  setup_type TEXT DEFAULT 'voucher' CHECK (setup_type IN ('voucher', 'auto_provision', 'qr_code')),
  network_ssid TEXT,
  captive_portal_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WiFi Packages table
CREATE TABLE public.wifi_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hotspot_id UUID NOT NULL REFERENCES public.wifi_hotspots(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  data_limit_mb INTEGER, -- null means unlimited
  price DECIMAL(12,2) NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 10.0, -- percentage for platform
  is_active BOOLEAN DEFAULT true,
  is_stackable BOOLEAN DEFAULT false, -- can extend existing sessions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buyer Wallets table (separate from user_wallets for wifi-specific balance)
CREATE TABLE public.buyer_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  balance DECIMAL(12,2) DEFAULT 0.0,
  pending_balance DECIMAL(12,2) DEFAULT 0.0,
  total_spent DECIMAL(12,2) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WiFi Sessions table
CREATE TABLE public.wifi_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  hotspot_id UUID NOT NULL REFERENCES public.wifi_hotspots(id),
  package_id UUID NOT NULL REFERENCES public.wifi_packages(id),
  session_token TEXT UNIQUE NOT NULL,
  voucher_code TEXT UNIQUE,
  qr_code_data TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated', 'extended')),
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  data_used_mb INTEGER DEFAULT 0,
  data_limit_mb INTEGER,
  amount_paid DECIMAL(12,2) NOT NULL,
  commission_amount DECIMAL(12,2) NOT NULL,
  seller_amount DECIMAL(12,2) NOT NULL,
  can_extend BOOLEAN DEFAULT true,
  device_mac TEXT,
  device_ip INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Package Purchases table
CREATE TABLE public.package_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  package_id UUID NOT NULL REFERENCES public.wifi_packages(id),
  hotspot_id UUID NOT NULL REFERENCES public.wifi_hotspots(id),
  session_id UUID REFERENCES public.wifi_sessions(id),
  amount DECIMAL(12,2) NOT NULL,
  commission_amount DECIMAL(12,2) NOT NULL,
  seller_amount DECIMAL(12,2) NOT NULL,
  platform_fee DECIMAL(12,2) DEFAULT 0.0,
  payment_method TEXT NOT NULL,
  payment_reference TEXT,
  idempotency_key TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wallet Transactions for WiFi
CREATE TABLE public.wifi_wallet_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wallet_id UUID NOT NULL REFERENCES public.buyer_wallets(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('topup', 'purchase', 'refund', 'commission')),
  amount DECIMAL(12,2) NOT NULL,
  description TEXT NOT NULL,
  reference_id UUID, -- links to purchase or session
  payment_method TEXT,
  payment_reference TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hotspot Ratings & Reviews
CREATE TABLE public.hotspot_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  hotspot_id UUID NOT NULL REFERENCES public.wifi_hotspots(id),
  session_id UUID REFERENCES public.wifi_sessions(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  speed_rating INTEGER CHECK (speed_rating >= 1 AND speed_rating <= 5),
  reliability_rating INTEGER CHECK (reliability_rating >= 1 AND reliability_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, hotspot_id, session_id)
);

-- Issue Reports
CREATE TABLE public.wifi_issue_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  hotspot_id UUID REFERENCES public.wifi_hotspots(id),
  session_id UUID REFERENCES public.wifi_sessions(id),
  issue_type TEXT NOT NULL CHECK (issue_type IN ('no_connectivity', 'slow_speed', 'invalid_voucher', 'billing_issue', 'other')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.wifi_hotspots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wifi_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wifi_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wifi_wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotspot_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wifi_issue_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for WiFi Hotspots (public read for active hotspots)
CREATE POLICY "Anyone can view active hotspots" ON public.wifi_hotspots
  FOR SELECT USING (status = 'active');

CREATE POLICY "Sellers can manage their hotspots" ON public.wifi_hotspots
  FOR ALL USING (seller_id = auth.uid());

-- RLS Policies for WiFi Packages
CREATE POLICY "Anyone can view active packages" ON public.wifi_packages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Sellers can manage packages for their hotspots" ON public.wifi_packages
  FOR ALL USING (hotspot_id IN (
    SELECT id FROM public.wifi_hotspots WHERE seller_id = auth.uid()
  ));

-- RLS Policies for Buyer Wallets
CREATE POLICY "Users can manage their own wallet" ON public.buyer_wallets
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for WiFi Sessions
CREATE POLICY "Users can view their own sessions" ON public.wifi_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Sellers can view sessions for their hotspots" ON public.wifi_sessions
  FOR SELECT USING (hotspot_id IN (
    SELECT id FROM public.wifi_hotspots WHERE seller_id = auth.uid()
  ));

-- RLS Policies for Package Purchases
CREATE POLICY "Users can view their own purchases" ON public.package_purchases
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own purchases" ON public.package_purchases
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for Wallet Transactions
CREATE POLICY "Users can view their own wallet transactions" ON public.wifi_wallet_transactions
  FOR SELECT USING (user_id = auth.uid());

-- RLS Policies for Ratings
CREATE POLICY "Anyone can view ratings" ON public.hotspot_ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own ratings" ON public.hotspot_ratings
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for Issue Reports
CREATE POLICY "Users can manage their own issue reports" ON public.wifi_issue_reports
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Sellers can view reports for their hotspots" ON public.wifi_issue_reports
  FOR SELECT USING (hotspot_id IN (
    SELECT id FROM public.wifi_hotspots WHERE seller_id = auth.uid()
  ));

-- Indexes for performance
CREATE INDEX idx_wifi_hotspots_location ON public.wifi_hotspots (location_lat, location_lng);
CREATE INDEX idx_wifi_hotspots_seller ON public.wifi_hotspots (seller_id);
CREATE INDEX idx_wifi_packages_hotspot ON public.wifi_packages (hotspot_id);
CREATE INDEX idx_wifi_sessions_user ON public.wifi_sessions (user_id);
CREATE INDEX idx_wifi_sessions_hotspot ON public.wifi_sessions (hotspot_id);
CREATE INDEX idx_wifi_sessions_status ON public.wifi_sessions (status);
CREATE INDEX idx_package_purchases_user ON public.package_purchases (user_id);
CREATE INDEX idx_wallet_transactions_user ON public.wifi_wallet_transactions (user_id);

-- Triggers for updated_at
CREATE TRIGGER update_wifi_hotspots_updated_at BEFORE UPDATE ON public.wifi_hotspots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wifi_packages_updated_at BEFORE UPDATE ON public.wifi_packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_buyer_wallets_updated_at BEFORE UPDATE ON public.buyer_wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wifi_sessions_updated_at BEFORE UPDATE ON public.wifi_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create buyer wallet on first wifi purchase
CREATE OR REPLACE FUNCTION public.create_buyer_wallet_on_first_purchase()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.buyer_wallets (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_buyer_wallet_trigger
  BEFORE INSERT ON public.package_purchases
  FOR EACH ROW EXECUTE FUNCTION public.create_buyer_wallet_on_first_purchase();

-- Function to update hotspot ratings
CREATE OR REPLACE FUNCTION public.update_hotspot_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.wifi_hotspots 
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0.0) 
      FROM public.hotspot_ratings 
      WHERE hotspot_id = NEW.hotspot_id
    ),
    total_ratings = (
      SELECT COUNT(*) 
      FROM public.hotspot_ratings 
      WHERE hotspot_id = NEW.hotspot_id
    )
  WHERE id = NEW.hotspot_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_hotspot_rating_trigger
  AFTER INSERT OR UPDATE ON public.hotspot_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_hotspot_rating();