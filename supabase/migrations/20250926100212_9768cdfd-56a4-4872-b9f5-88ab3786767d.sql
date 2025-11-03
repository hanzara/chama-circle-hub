-- Create fee configuration table
CREATE TABLE public.fee_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_type VARCHAR NOT NULL,
  fee_type VARCHAR NOT NULL, -- 'fixed', 'percentage', 'tiered'
  minimum_fee NUMERIC DEFAULT 0,
  maximum_fee NUMERIC DEFAULT NULL,
  percentage_rate NUMERIC DEFAULT 0,
  tiers JSONB DEFAULT '[]'::jsonb, -- For tiered fee structure
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert Kenyan-friendly fee configurations
INSERT INTO public.fee_configurations (transaction_type, fee_type, minimum_fee, maximum_fee, percentage_rate, tiers) VALUES
-- M-Pesa style fees for wallet top-ups
('wallet_topup', 'tiered', 0, 50, 0, '[
  {"min": 0, "max": 100, "fee": 1},
  {"min": 101, "max": 500, "fee": 5},
  {"min": 501, "max": 1000, "fee": 7},
  {"min": 1001, "max": 5000, "fee": 15},
  {"min": 5001, "max": 20000, "fee": 25},
  {"min": 20001, "max": 100000, "fee": 50}
]'::jsonb),

-- Chama contribution fees
('chama_contribution', 'percentage', 2, 20, 0.5, '[]'::jsonb),

-- Loan processing fees
('loan_processing', 'percentage', 50, 500, 1.5, '[]'::jsonb),

-- Withdrawal fees
('withdrawal', 'tiered', 5, 100, 0, '[
  {"min": 0, "max": 500, "fee": 5},
  {"min": 501, "max": 2000, "fee": 10},
  {"min": 2001, "max": 10000, "fee": 25},
  {"min": 10001, "max": 50000, "fee": 50},
  {"min": 50001, "max": 200000, "fee": 100}
]'::jsonb),

-- Send money fees
('send_money', 'tiered', 3, 30, 0, '[
  {"min": 0, "max": 100, "fee": 3},
  {"min": 101, "max": 500, "fee": 7},
  {"min": 501, "max": 1000, "fee": 12},
  {"min": 1001, "max": 5000, "fee": 20},
  {"min": 5001, "max": 20000, "fee": 30}
]'::jsonb),

-- Investment advisory fees (already defined in code but let's centralize)
('investment_advisory_ai', 'percentage', 99, 1000, 0.1, '[]'::jsonb),
('investment_advisory_expert', 'percentage', 499, 5000, 0.5, '[]'::jsonb),
('investment_advisory_portfolio', 'percentage', 999, 10000, 1.0, '[]'::jsonb),

-- Premium subscription fees (no processing fee)
('premium_subscription', 'fixed', 0, 0, 0, '[]'::jsonb),

-- Game entry fees (house edge)
('game_entry', 'percentage', 10, 100, 15, '[]'::jsonb);

-- Create transaction fees tracking table
CREATE TABLE public.transaction_fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID,
  transaction_type VARCHAR NOT NULL,
  amount NUMERIC NOT NULL,
  fee_amount NUMERIC NOT NULL,
  fee_configuration_id UUID REFERENCES public.fee_configurations(id),
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fee_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_fees ENABLE ROW LEVEL SECURITY;

-- Policies for fee configurations (public read)
CREATE POLICY "Anyone can view fee configurations" 
ON public.fee_configurations FOR SELECT 
USING (is_active = true);

-- Policies for transaction fees (users can view their own)
CREATE POLICY "Users can view their own transaction fees" 
ON public.transaction_fees FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert transaction fees" 
ON public.transaction_fees FOR INSERT 
WITH CHECK (true);

-- Add updated_at trigger
CREATE TRIGGER update_fee_configurations_updated_at
  BEFORE UPDATE ON public.fee_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate transaction fee
CREATE OR REPLACE FUNCTION public.calculate_transaction_fee(
  p_transaction_type VARCHAR,
  p_amount NUMERIC
) RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  config RECORD;
  calculated_fee NUMERIC := 0;
  tier JSONB;
BEGIN
  -- Get fee configuration
  SELECT * INTO config
  FROM public.fee_configurations
  WHERE transaction_type = p_transaction_type AND is_active = true
  LIMIT 1;
  
  IF config IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Calculate fee based on type
  CASE config.fee_type
    WHEN 'fixed' THEN
      calculated_fee := config.minimum_fee;
    
    WHEN 'percentage' THEN
      calculated_fee := p_amount * (config.percentage_rate / 100);
      calculated_fee := GREATEST(calculated_fee, COALESCE(config.minimum_fee, 0));
      IF config.maximum_fee IS NOT NULL THEN
        calculated_fee := LEAST(calculated_fee, config.maximum_fee);
      END IF;
    
    WHEN 'tiered' THEN
      -- Find the appropriate tier
      FOR tier IN SELECT * FROM jsonb_array_elements(config.tiers)
      LOOP
        IF p_amount >= (tier->>'min')::numeric AND 
           (tier->>'max' IS NULL OR p_amount <= (tier->>'max')::numeric) THEN
          calculated_fee := (tier->>'fee')::numeric;
          EXIT;
        END IF;
      END LOOP;
  END CASE;
  
  RETURN ROUND(calculated_fee, 2);
END;
$$;