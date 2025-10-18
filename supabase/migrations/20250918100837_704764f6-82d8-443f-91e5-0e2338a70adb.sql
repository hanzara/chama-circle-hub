-- Enhance smart finance backend with additional tables and functions

-- Create user financial profiles table if not exists
CREATE TABLE IF NOT EXISTS public.user_financial_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  monthly_income DECIMAL(15,2),
  current_savings DECIMAL(15,2),
  monthly_expenses DECIMAL(15,2),
  risk_tolerance TEXT DEFAULT 'medium' CHECK (risk_tolerance IN ('low', 'medium', 'high')),
  financial_goals JSONB DEFAULT '[]',
  ai_insights_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_financial_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own financial profile" 
ON public.user_financial_profiles 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE OR REPLACE TRIGGER update_user_financial_profiles_updated_at
BEFORE UPDATE ON public.user_financial_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create AI credit scoring function
CREATE OR REPLACE FUNCTION public.calculate_ai_credit_score(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_base_score INTEGER := 650;
  v_income_score INTEGER := 0;
  v_savings_score INTEGER := 0;
  v_expense_score INTEGER := 0;
  v_transaction_score INTEGER := 0;
  v_profile RECORD;
  v_transaction_count INTEGER;
  v_avg_monthly_expense DECIMAL;
BEGIN
  -- Get user profile
  SELECT * INTO v_profile
  FROM public.user_financial_profiles
  WHERE user_id = p_user_id;
  
  IF v_profile IS NULL THEN
    RETURN v_base_score;
  END IF;
  
  -- Income contribution (0-50 points)
  IF v_profile.monthly_income IS NOT NULL THEN
    v_income_score := LEAST(50, (v_profile.monthly_income / 10000) * 10);
  END IF;
  
  -- Savings contribution (0-75 points)
  IF v_profile.current_savings IS NOT NULL THEN
    v_savings_score := LEAST(75, (v_profile.current_savings / 50000) * 25);
  END IF;
  
  -- Expense ratio contribution (0-50 points)
  IF v_profile.monthly_income IS NOT NULL AND v_profile.monthly_expenses IS NOT NULL THEN
    IF v_profile.monthly_income > 0 THEN
      v_expense_score := GREATEST(0, 50 - ((v_profile.monthly_expenses / v_profile.monthly_income) * 50));
    END IF;
  END IF;
  
  -- Transaction history contribution (0-25 points)
  SELECT COUNT(*) INTO v_transaction_count
  FROM public.financial_transactions
  WHERE user_id = p_user_id
    AND created_at >= NOW() - INTERVAL '3 months';
  
  v_transaction_score := LEAST(25, v_transaction_count);
  
  RETURN v_base_score + v_income_score + v_savings_score + v_expense_score + v_transaction_score;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create financial insights generation function
CREATE OR REPLACE FUNCTION public.generate_financial_insights(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_insights JSONB := '[]'::jsonb;
  v_profile RECORD;
  v_monthly_income DECIMAL;
  v_monthly_expenses DECIMAL;
  v_savings_rate DECIMAL;
  v_expense_categories JSONB;
BEGIN
  -- Get user profile
  SELECT * INTO v_profile
  FROM public.user_financial_profiles
  WHERE user_id = p_user_id;
  
  IF v_profile IS NULL THEN
    RETURN v_insights;
  END IF;
  
  -- Calculate current month metrics
  SELECT 
    COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0)
  INTO v_monthly_income, v_monthly_expenses
  FROM public.financial_transactions
  WHERE user_id = p_user_id
    AND transaction_date >= date_trunc('month', CURRENT_DATE);
  
  -- Calculate savings rate
  IF v_monthly_income > 0 THEN
    v_savings_rate := ((v_monthly_income - v_monthly_expenses) / v_monthly_income) * 100;
  END IF;
  
  -- Generate insights
  IF v_savings_rate IS NOT NULL THEN
    IF v_savings_rate >= 20 THEN
      v_insights := v_insights || jsonb_build_object(
        'type', 'positive',
        'title', 'Excellent Savings Rate',
        'description', FORMAT('Your savings rate of %.1f%% is outstanding!', v_savings_rate),
        'priority', 'high'
      );
    ELSIF v_savings_rate >= 10 THEN
      v_insights := v_insights || jsonb_build_object(
        'type', 'neutral',
        'title', 'Good Savings Progress',
        'description', FORMAT('Your savings rate of %.1f%% is good. Try to reach 20%% for optimal financial health.', v_savings_rate),
        'priority', 'medium'
      );
    ELSE
      v_insights := v_insights || jsonb_build_object(
        'type', 'warning',
        'title', 'Improve Your Savings',
        'description', FORMAT('Your savings rate of %.1f%% needs improvement. Aim for at least 10%%.', v_savings_rate),
        'priority', 'high'
      );
    END IF;
  END IF;
  
  -- Expense category analysis
  SELECT jsonb_object_agg(category, total_amount)
  INTO v_expense_categories
  FROM (
    SELECT 
      category,
      SUM(amount) as total_amount
    FROM public.financial_transactions
    WHERE user_id = p_user_id
      AND transaction_type = 'expense'
      AND transaction_date >= date_trunc('month', CURRENT_DATE)
    GROUP BY category
    ORDER BY total_amount DESC
    LIMIT 3
  ) t;
  
  IF v_expense_categories IS NOT NULL THEN
    v_insights := v_insights || jsonb_build_object(
      'type', 'info',
      'title', 'Top Expense Categories',
      'description', 'Review your spending in these top categories for potential savings.',
      'data', v_expense_categories,
      'priority', 'medium'
    );
  END IF;
  
  RETURN v_insights;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;