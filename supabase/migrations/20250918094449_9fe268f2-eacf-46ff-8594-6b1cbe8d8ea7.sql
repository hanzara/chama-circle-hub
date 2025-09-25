-- Smart Finance Backend Tables

-- User Financial Profile
CREATE TABLE public.user_financial_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  monthly_income DECIMAL(15,2),
  current_savings DECIMAL(15,2) DEFAULT 0,
  monthly_expenses DECIMAL(15,2),
  risk_tolerance TEXT CHECK (risk_tolerance IN ('low', 'medium', 'high')) DEFAULT 'medium',
  financial_goals JSONB DEFAULT '[]'::jsonb,
  ai_insights_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Financial Transactions (for expense tracking)
CREATE TABLE public.financial_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT,
  transaction_type TEXT CHECK (transaction_type IN ('income', 'expense', 'investment', 'savings')) NOT NULL,
  payment_method TEXT,
  auto_categorized BOOLEAN DEFAULT false,
  ai_confidence DECIMAL(3,2),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Financial Goals
CREATE TABLE public.financial_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_amount DECIMAL(15,2) NOT NULL,
  current_amount DECIMAL(15,2) DEFAULT 0,
  target_date DATE,
  category TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('active', 'completed', 'paused', 'cancelled')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI Recommendations
CREATE TABLE public.ai_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('investment', 'savings', 'budget', 'loan', 'expense_reduction')) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  expected_impact DECIMAL(15,2),
  impact_description TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('new', 'viewed', 'implemented', 'dismissed')) DEFAULT 'new',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Financial Learning Progress
CREATE TABLE public.financial_learning_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  module_title TEXT NOT NULL,
  progress_percentage INTEGER CHECK (progress_percentage >= 0 AND progress_percentage <= 100) DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  points_earned INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User Achievements
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  achievement_title TEXT NOT NULL,
  achievement_description TEXT,
  icon TEXT,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  points_awarded INTEGER DEFAULT 0,
  UNIQUE(user_id, achievement_id)
);

-- AI Chat History
CREATE TABLE public.ai_chat_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('user', 'assistant')) NOT NULL,
  context_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_financial_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own financial profile" ON public.user_financial_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own transactions" ON public.financial_transactions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own goals" ON public.financial_goals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own recommendations" ON public.ai_recommendations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own learning progress" ON public.financial_learning_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own achievements" ON public.user_achievements
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own chat history" ON public.ai_chat_history
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX idx_financial_transactions_user_date ON public.financial_transactions(user_id, transaction_date DESC);
CREATE INDEX idx_financial_goals_user_status ON public.financial_goals(user_id, status);
CREATE INDEX idx_ai_recommendations_user_status ON public.ai_recommendations(user_id, status);
CREATE INDEX idx_financial_learning_user ON public.financial_learning_progress(user_id);
CREATE INDEX idx_ai_chat_history_user_date ON public.ai_chat_history(user_id, created_at DESC);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_financial_profiles_updated_at BEFORE UPDATE ON public.user_financial_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_goals_updated_at BEFORE UPDATE ON public.financial_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_learning_progress_updated_at BEFORE UPDATE ON public.financial_learning_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();