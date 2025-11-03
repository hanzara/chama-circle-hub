-- Allow creators to view their own chamas so insert returning works under RLS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'chamas' 
      AND policyname = 'Creators can view their chamas'
  ) THEN
    CREATE POLICY "Creators can view their chamas"
    ON public.chamas
    FOR SELECT
    USING (created_by = auth.uid());
  END IF;
END $$;