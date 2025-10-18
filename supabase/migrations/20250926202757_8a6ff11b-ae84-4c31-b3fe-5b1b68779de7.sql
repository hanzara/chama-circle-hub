-- Fix the ALTER TABLE syntax by adding columns one by one
ALTER TABLE public.financial_transactions ADD COLUMN IF NOT EXISTS budget_category TEXT;
ALTER TABLE public.financial_transactions ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE public.financial_transactions ADD COLUMN IF NOT EXISTS recurring_pattern TEXT;
ALTER TABLE public.financial_transactions ADD COLUMN IF NOT EXISTS merchant_name TEXT;
ALTER TABLE public.financial_transactions ADD COLUMN IF NOT EXISTS auto_categorized BOOLEAN DEFAULT FALSE;
ALTER TABLE public.financial_transactions ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.financial_transactions ADD COLUMN IF NOT EXISTS notes TEXT;