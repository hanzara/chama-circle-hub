-- Add chama_id column to mpesa_transactions table
ALTER TABLE public.mpesa_transactions 
ADD COLUMN chama_id UUID REFERENCES public.chamas(id);

-- Add index for better query performance
CREATE INDEX idx_mpesa_transactions_chama_id ON public.mpesa_transactions(chama_id);

-- Add purpose column if it doesn't exist (for payment_purpose enum)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mpesa_transactions' 
    AND column_name = 'purpose' 
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.mpesa_transactions 
    ADD COLUMN purpose VARCHAR(50);
  END IF;
END $$;