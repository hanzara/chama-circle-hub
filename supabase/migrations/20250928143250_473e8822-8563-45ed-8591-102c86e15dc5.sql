-- Make user_id nullable for portal users since they're not regular auth users
ALTER TABLE public.portal_users 
ALTER COLUMN user_id DROP NOT NULL;

-- Insert sample portal users for testing
INSERT INTO public.portal_users (username, email, access_level, organization, is_active) VALUES 
('admin', 'admin@company.com', 'super_admin', 'Main Organization', true),
('manager', 'manager@company.com', 'admin', 'Main Organization', true),
('user', 'user@company.com', 'member', 'Main Organization', true);

-- Insert additional portal credentials for different access levels  
INSERT INTO public.portal_credentials (credential_code, access_level, max_uses, expires_at, is_active) VALUES
('PTC-MANAGER2024', 'admin', 100, NOW() + INTERVAL '30 days', true),
('PTC-USER2024', 'member', 50, NOW() + INTERVAL '30 days', true)
ON CONFLICT (credential_code) DO NOTHING;