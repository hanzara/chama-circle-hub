-- Create personal_savings_goals table only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'personal_savings_goals') THEN
        CREATE TABLE public.personal_savings_goals (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          goal_name TEXT NOT NULL,
          target_amount NUMERIC NOT NULL DEFAULT 0,
          current_amount NUMERIC NOT NULL DEFAULT 0,
          target_date DATE,
          status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        
        ALTER TABLE public.personal_savings_goals ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can manage their own savings goals" ON public.personal_savings_goals
          FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Create personal_savings_transactions table only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'personal_savings_transactions') THEN
        CREATE TABLE public.personal_savings_transactions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          savings_goal_id UUID REFERENCES public.personal_savings_goals(id),
          amount NUMERIC NOT NULL,
          transaction_type TEXT NOT NULL DEFAULT 'deposit' CHECK (transaction_type IN ('deposit', 'withdrawal')),
          frequency TEXT DEFAULT 'one_time' CHECK (frequency IN ('one_time', 'weekly', 'monthly', 'quarterly')),
          notes TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        
        ALTER TABLE public.personal_savings_transactions ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can manage their own savings transactions" ON public.personal_savings_transactions
          FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;