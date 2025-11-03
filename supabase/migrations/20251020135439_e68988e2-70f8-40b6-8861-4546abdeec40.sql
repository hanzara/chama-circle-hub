-- Add missing columns to chama_loans table for disbursement tracking
ALTER TABLE public.chama_loans 
ADD COLUMN IF NOT EXISTS disbursement_status BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS member_payment_number TEXT,
ADD COLUMN IF NOT EXISTS funds_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS report TEXT;

-- Add comment to explain the columns
COMMENT ON COLUMN public.chama_loans.disbursement_status IS 'Indicates if the loan has been marked as disbursed';
COMMENT ON COLUMN public.chama_loans.member_payment_number IS 'Phone number or account where funds should be sent';
COMMENT ON COLUMN public.chama_loans.funds_sent_at IS 'Timestamp when funds were actually sent to member';
COMMENT ON COLUMN public.chama_loans.report IS 'Detailed loan disbursement report';