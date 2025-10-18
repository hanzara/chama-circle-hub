-- Add Verdio Wi-Fi packages to test hotspot

-- Student / Hustler Daily Bundles
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
  10, -- 10% commission rate
  true,
  pkg.is_stackable
FROM public.wifi_hotspots h
CROSS JOIN (
  VALUES 
    -- Student / Hustler Daily Bundles
    ('Student 1GB - 1 Hour', 'Perfect for quick browsing and social media - KES 5', 60, 1024, 5, true),
    ('Student 2GB - 2 Hours', 'Great for homework and streaming - KES 10', 120, 2048, 10, true),
    ('Unlimited Night Pass', 'Unlimited access 10pm - 6am - KES 20', 480, NULL, 20, false),
    ('Student 5GB - Daily', 'Full day access with 5GB data - KES 30', 1440, 5120, 30, true),
    
    -- Home & Family Packs
    ('Home 10GB - 3 Days', 'Perfect for the family - 3 days unlimited - KES 50', 4320, 10240, 50, true),
    ('Home 20GB - Weekly', 'One week of connectivity - KES 100', 10080, 20480, 100, true),
    ('Home 50GB - Monthly', 'Full month access with generous data - KES 300', 43200, 51200, 300, false),
    ('Unlimited Lite - Monthly', '30 days unlimited (fair use: 150GB cap) - KES 500', 43200, 153600, 500, false),
    
    -- Small Biz / Kiosk Hotspot
    ('Biz 20GB - Weekly', 'Sharable for small business - 7 days - KES 200', 10080, 20480, 200, true),
    ('Biz Unlimited - Monthly', 'Unlimited WiFi for business (fair use) - KES 1000', 43200, 999999, 1000, false)
) AS pkg(name, description, duration_minutes, data_limit_mb, price, is_stackable)
WHERE h.name = 'ChamaVault Test Hotspot'
  AND NOT EXISTS (
    SELECT 1 FROM public.wifi_packages wp 
    WHERE wp.hotspot_id = h.id AND wp.name = pkg.name
  );