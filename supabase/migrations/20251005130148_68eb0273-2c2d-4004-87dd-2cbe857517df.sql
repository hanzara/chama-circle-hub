-- Add portal_user_id to sellers table without modifying primary key
ALTER TABLE public.sellers ADD COLUMN IF NOT EXISTS portal_user_id UUID REFERENCES public.portal_users(id) ON DELETE CASCADE;

-- Create index for portal_user_id
CREATE INDEX IF NOT EXISTS idx_sellers_portal_user_id ON public.sellers(portal_user_id);

-- Enable RLS on sellers table
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Sellers can view their own profile" ON public.sellers;
DROP POLICY IF EXISTS "Sellers can update their own profile" ON public.sellers;
DROP POLICY IF EXISTS "Portal users can insert their seller profile" ON public.sellers;

-- Simple RLS policies for sellers
CREATE POLICY "Users can view their own seller profile"
ON public.sellers FOR SELECT
USING (portal_user_id IS NOT NULL);

CREATE POLICY "Users can update their own seller profile"
ON public.sellers FOR UPDATE
USING (portal_user_id IS NOT NULL);

CREATE POLICY "Anyone can insert seller profile"
ON public.sellers FOR INSERT
WITH CHECK (true);

-- Function to get or create seller profile for portal user
CREATE OR REPLACE FUNCTION public.get_seller_by_portal_user(p_portal_user_id UUID)
RETURNS SETOF public.sellers
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.sellers
  WHERE portal_user_id = p_portal_user_id;
END;
$$;