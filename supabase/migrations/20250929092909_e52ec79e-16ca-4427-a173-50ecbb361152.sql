-- Create trigger to automatically create seller wallet
CREATE OR REPLACE FUNCTION public.create_seller_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.seller_wallets (seller_id)
  VALUES (NEW.id)
  ON CONFLICT (seller_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on sellers table
DROP TRIGGER IF EXISTS trigger_create_seller_wallet ON public.sellers;
CREATE TRIGGER trigger_create_seller_wallet
  AFTER INSERT ON public.sellers
  FOR EACH ROW
  EXECUTE FUNCTION public.create_seller_wallet();

-- Fix the policy conflict by dropping and recreating policies that might exist
DROP POLICY IF EXISTS "Sellers can view sessions for their hotspots" ON public.hotspot_sessions;
DROP POLICY IF EXISTS "Sellers can manage sessions for their hotspots" ON public.hotspot_sessions;

-- Create proper policies for hotspot sessions
CREATE POLICY "Sellers can manage sessions for their hotspots" ON public.hotspot_sessions
  FOR ALL USING (hotspot_id IN (SELECT id FROM public.hotspots WHERE seller_id = auth.uid()));

-- Also create some indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hotspots_seller_id ON public.hotspots(seller_id);
CREATE INDEX IF NOT EXISTS idx_packages_hotspot_id ON public.packages(hotspot_id);
CREATE INDEX IF NOT EXISTS idx_wifi_transactions_seller_id ON public.wifi_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_hotspot_sessions_hotspot_id ON public.hotspot_sessions(hotspot_id);
CREATE INDEX IF NOT EXISTS idx_payouts_seller_id ON public.payouts(seller_id);