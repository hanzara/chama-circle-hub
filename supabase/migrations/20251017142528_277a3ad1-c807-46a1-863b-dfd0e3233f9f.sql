-- Enable RLS on Smart Finance tables
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_financial_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for financial_goals
CREATE POLICY "Users can view their own financial goals"
ON public.financial_goals
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own financial goals"
ON public.financial_goals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial goals"
ON public.financial_goals
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial goals"
ON public.financial_goals
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for financial_transactions
CREATE POLICY "Users can view their own financial transactions"
ON public.financial_transactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own financial transactions"
ON public.financial_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial transactions"
ON public.financial_transactions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial transactions"
ON public.financial_transactions
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for user_financial_profiles
CREATE POLICY "Users can view their own financial profile"
ON public.user_financial_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own financial profile"
ON public.user_financial_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial profile"
ON public.user_financial_profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial profile"
ON public.user_financial_profiles
FOR DELETE
USING (auth.uid() = user_id);