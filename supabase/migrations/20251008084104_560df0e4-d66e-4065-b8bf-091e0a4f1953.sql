-- Add marketplace fields to chamas table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'chamas' AND column_name = 'is_marketplace_chama') THEN
        ALTER TABLE public.chamas ADD COLUMN is_marketplace_chama BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'chamas' AND column_name = 'purchase_amount') THEN
        ALTER TABLE public.chamas ADD COLUMN purchase_amount NUMERIC DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'chamas' AND column_name = 'purchased_by') THEN
        ALTER TABLE public.chamas ADD COLUMN purchased_by UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'chamas' AND column_name = 'purchased_at') THEN
        ALTER TABLE public.chamas ADD COLUMN purchased_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Update RLS policies for marketplace chamas
DROP POLICY IF EXISTS "Users can view marketplace chamas" ON public.chamas;
CREATE POLICY "Users can view marketplace chamas"
ON public.chamas FOR SELECT
USING (
  is_marketplace_chama = true AND (purchased_by IS NULL OR purchased_by = auth.uid())
);

DROP POLICY IF EXISTS "Users can purchase marketplace chamas" ON public.chamas;
CREATE POLICY "Users can purchase marketplace chamas"
ON public.chamas FOR UPDATE
USING (is_marketplace_chama = true AND purchased_by IS NULL)
WITH CHECK (purchased_by = auth.uid());

-- Insert marketplace chamas (2-20 members at 20 KES per member)
INSERT INTO public.chamas (name, description, contribution_amount, contribution_frequency, max_members, is_marketplace_chama, purchase_amount, status, created_by)
SELECT 
  'Chama ' || generate_series || ' Members',
  'A pre-made chama for ' || generate_series || ' members. Perfect for starting your savings journey together!',
  1000,
  'monthly',
  generate_series,
  true,
  generate_series * 20,
  'active',
  (SELECT id FROM auth.users LIMIT 1)
FROM generate_series(2, 20)
ON CONFLICT DO NOTHING;