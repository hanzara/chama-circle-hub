-- Create table for tracking chama purchase attempts
CREATE TABLE IF NOT EXISTS public.pending_chama_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chama_id UUID NOT NULL REFERENCES public.chamas(id) ON DELETE CASCADE,
  buyer_user_id UUID NOT NULL,
  expected_amount DECIMAL(15, 2) NOT NULL,
  paystack_reference TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'verified', 'failed', 'expired')),
  amount_paid DECIMAL(15, 2),
  payment_verified_at TIMESTAMPTZ,
  ownership_granted BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 minutes')
);

-- Create index for faster lookups
CREATE INDEX idx_pending_purchases_reference ON public.pending_chama_purchases(paystack_reference);
CREATE INDEX idx_pending_purchases_buyer ON public.pending_chama_purchases(buyer_user_id);
CREATE INDEX idx_pending_purchases_status ON public.pending_chama_purchases(payment_status);

-- Enable RLS
ALTER TABLE public.pending_chama_purchases ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own purchase attempts
CREATE POLICY "Users can view their own pending purchases"
ON public.pending_chama_purchases
FOR SELECT
USING (auth.uid() = buyer_user_id);

-- Policy: Users can create their own purchase attempts
CREATE POLICY "Users can create pending purchases"
ON public.pending_chama_purchases
FOR INSERT
WITH CHECK (auth.uid() = buyer_user_id);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_pending_purchases_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_pending_purchases_timestamp
BEFORE UPDATE ON public.pending_chama_purchases
FOR EACH ROW
EXECUTE FUNCTION public.update_pending_purchases_timestamp();

-- Function to expire old pending purchases
CREATE OR REPLACE FUNCTION public.expire_old_pending_purchases()
RETURNS void AS $$
BEGIN
  UPDATE public.pending_chama_purchases
  SET payment_status = 'expired'
  WHERE payment_status = 'pending'
    AND expires_at < now()
    AND ownership_granted = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON TABLE public.pending_chama_purchases IS 'Tracks chama purchase attempts with payment verification';