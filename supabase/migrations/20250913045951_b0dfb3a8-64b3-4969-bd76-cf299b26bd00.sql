-- Ensure RLS and policies for mpesa_transactions
ALTER TABLE public.mpesa_transactions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'mpesa_transactions' AND policyname = 'Users can insert their own M-Pesa transactions'
  ) THEN
    CREATE POLICY "Users can insert their own M-Pesa transactions"
    ON public.mpesa_transactions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'mpesa_transactions' AND policyname = 'Users can update their own M-Pesa transactions'
  ) THEN
    CREATE POLICY "Users can update their own M-Pesa transactions"
    ON public.mpesa_transactions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;