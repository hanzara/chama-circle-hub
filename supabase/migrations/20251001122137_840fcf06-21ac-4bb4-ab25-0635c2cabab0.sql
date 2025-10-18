-- Add test WiFi hotspot and packages for testing

-- Insert a test hotspot (if it doesn't exist)
INSERT INTO public.wifi_hotspots (
  seller_id,
  name,
  address,
  description,
  location_lat,
  location_lng,
  network_ssid,
  setup_type,
  max_concurrent_users,
  status
)
SELECT 
  (SELECT id FROM auth.users LIMIT 1), -- Use first available user as seller
  'ChamaVault Test Hotspot',
  'Nairobi CBD - Test Location, Kenya',
  'Public WiFi hotspot for testing ChamaVault WiFi access features',
  -1.2864,
  36.8172,
  'ChamaVault-Public-WiFi',
  'qr_code',
  50,
  'active'
WHERE NOT EXISTS (
  SELECT 1 FROM public.wifi_hotspots WHERE name = 'ChamaVault Test Hotspot'
);

-- Insert test WiFi packages
INSERT INTO public.wifi_packages (
  hotspot_id,
  name,
  description,
  duration_minutes,
  data_limit_mb,
  price,
  commission_rate,
  is_active,
  is_stackable
)
SELECT 
  h.id,
  pkg.name,
  pkg.description,
  pkg.duration_minutes,
  pkg.data_limit_mb,
  pkg.price,
  pkg.commission_rate,
  true,
  pkg.is_stackable
FROM public.wifi_hotspots h
CROSS JOIN (
  VALUES 
    ('Quick Connect - 1 Hour', 'Perfect for quick browsing and social media', 60, 500, 50, 10, true),
    ('Half Day Pass', 'Great for working remotely or studying', 360, 2000, 150, 10, true),
    ('Full Day Pass', 'Unlimited access for the entire day', 1440, 5000, 250, 10, true),
    ('Weekly Pass', 'Best value for regular users - 7 days of unlimited access', 10080, 20000, 800, 10, false)
) AS pkg(name, description, duration_minutes, data_limit_mb, price, commission_rate, is_stackable)
WHERE h.name = 'ChamaVault Test Hotspot'
  AND NOT EXISTS (
    SELECT 1 FROM public.wifi_packages wp 
    WHERE wp.hotspot_id = h.id AND wp.name = pkg.name
  );