-- Create budget-related tables
CREATE TABLE public.user_budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  month DATE NOT NULL,
  total_budget NUMERIC NOT NULL DEFAULT 0,
  total_income NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.budget_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id UUID NOT NULL,
  category TEXT NOT NULL,
  budget_limit NUMERIC NOT NULL DEFAULT 0,
  spent_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.budget_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  budget_id UUID,
  alert_type TEXT NOT NULL,
  category TEXT,
  message TEXT NOT NULL,
  percentage_used NUMERIC,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create deals and merchant tables
CREATE TABLE public.merchants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  logo_url TEXT,
  contact_info JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  merchant_id UUID NOT NULL,
  discount_percentage NUMERIC,
  discount_amount NUMERIC,
  minimum_spend NUMERIC DEFAULT 0,
  maximum_discount NUMERIC,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  usage_limit INTEGER,
  current_usage INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  terms_conditions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.bill_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  logo_url TEXT,
  service_fee NUMERIC DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.user_deal_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  deal_id UUID NOT NULL,
  merchant_id UUID NOT NULL,
  discount_amount NUMERIC NOT NULL,
  final_amount NUMERIC NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.user_bill_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bill_provider_id UUID NOT NULL,
  account_number TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  service_fee NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reference_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE public.budget_categories 
ADD CONSTRAINT fk_budget_categories_budget 
FOREIGN KEY (budget_id) REFERENCES public.user_budgets(id) ON DELETE CASCADE;

ALTER TABLE public.budget_alerts 
ADD CONSTRAINT fk_budget_alerts_budget 
FOREIGN KEY (budget_id) REFERENCES public.user_budgets(id) ON DELETE CASCADE;

ALTER TABLE public.deals 
ADD CONSTRAINT fk_deals_merchant 
FOREIGN KEY (merchant_id) REFERENCES public.merchants(id) ON DELETE CASCADE;

ALTER TABLE public.user_deal_usage 
ADD CONSTRAINT fk_user_deal_usage_deal 
FOREIGN KEY (deal_id) REFERENCES public.deals(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_user_deal_usage_merchant 
FOREIGN KEY (merchant_id) REFERENCES public.merchants(id) ON DELETE CASCADE;

ALTER TABLE public.user_bill_payments 
ADD CONSTRAINT fk_user_bill_payments_provider 
FOREIGN KEY (bill_provider_id) REFERENCES public.bill_providers(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.user_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_deal_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bill_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own budgets" ON public.user_budgets 
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their budget categories" ON public.budget_categories 
FOR ALL USING (budget_id IN (SELECT id FROM public.user_budgets WHERE user_id = auth.uid())) 
WITH CHECK (budget_id IN (SELECT id FROM public.user_budgets WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their budget alerts" ON public.budget_alerts 
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view active merchants" ON public.merchants 
FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active deals" ON public.deals 
FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active bill providers" ON public.bill_providers 
FOR SELECT USING (is_active = true);

CREATE POLICY "Users can manage their own deal usage" ON public.user_deal_usage 
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own bill payments" ON public.user_bill_payments 
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_budgets_updated_at BEFORE UPDATE ON public.user_budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budget_categories_updated_at BEFORE UPDATE ON public.budget_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_merchants_updated_at BEFORE UPDATE ON public.merchants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bill_providers_updated_at BEFORE UPDATE ON public.bill_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_bill_payments_updated_at BEFORE UPDATE ON public.user_bill_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();