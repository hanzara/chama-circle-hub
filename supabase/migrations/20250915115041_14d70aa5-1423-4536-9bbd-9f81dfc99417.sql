-- Create peer lending system tables
CREATE TABLE IF NOT EXISTS public.peer_lending_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  borrower_email TEXT NOT NULL,
  borrower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  interest_rate DECIMAL(5,2) NOT NULL DEFAULT 10.0,
  duration_months INTEGER NOT NULL DEFAULT 6,
  purpose TEXT,
  offer_message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'disbursed', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  disbursed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.peer_lending_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES public.peer_lending_offers(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('disbursement', 'repayment')),
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  payment_method TEXT DEFAULT 'wallet',
  transaction_reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_profile_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.peer_lending_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_lending_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profile_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for peer_lending_offers
CREATE POLICY "peer_lending_offers_insert" ON public.peer_lending_offers
  FOR INSERT WITH CHECK (auth.uid() = lender_id);

CREATE POLICY "peer_lending_offers_select" ON public.peer_lending_offers
  FOR SELECT USING (auth.uid() = lender_id OR auth.uid() = borrower_id);

CREATE POLICY "peer_lending_offers_update_borrower" ON public.peer_lending_offers
  FOR UPDATE USING (auth.uid() = borrower_id);

CREATE POLICY "peer_lending_offers_update_lender" ON public.peer_lending_offers
  FOR UPDATE USING (auth.uid() = lender_id);

-- RLS Policies for peer_lending_transactions
CREATE POLICY "peer_lending_transactions_select" ON public.peer_lending_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.peer_lending_offers 
      WHERE id = peer_lending_transactions.offer_id 
      AND (lender_id = auth.uid() OR borrower_id = auth.uid())
    )
  );

CREATE POLICY "peer_lending_transactions_insert" ON public.peer_lending_transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.peer_lending_offers 
      WHERE id = peer_lending_transactions.offer_id 
      AND (lender_id = auth.uid() OR borrower_id = auth.uid())
    )
  );

-- RLS Policies for user_profile_photos
CREATE POLICY "user_profile_photos_all" ON public.user_profile_photos
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Function to create peer lending offer
CREATE OR REPLACE FUNCTION public.create_peer_lending_offer(
  p_borrower_email TEXT,
  p_amount DECIMAL,
  p_interest_rate DECIMAL,
  p_duration_months INTEGER,
  p_purpose TEXT,
  p_offer_message TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_offer_id UUID;
  v_borrower_id UUID;
BEGIN
  -- Get borrower user_id from email
  SELECT au.id INTO v_borrower_id 
  FROM auth.users au 
  WHERE au.email = p_borrower_email;
  
  -- Create the offer
  INSERT INTO public.peer_lending_offers (
    lender_id, borrower_email, borrower_id, amount, interest_rate, 
    duration_months, purpose, offer_message
  ) VALUES (
    auth.uid(), p_borrower_email, v_borrower_id, p_amount, p_interest_rate,
    p_duration_months, p_purpose, p_offer_message
  ) RETURNING id INTO v_offer_id;
  
  RETURN v_offer_id;
END;
$$;

-- Function to accept/reject offer
CREATE OR REPLACE FUNCTION public.respond_to_lending_offer(
  p_offer_id UUID,
  p_response TEXT,
  p_user_pin TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_offer RECORD;
  v_pin_valid BOOLEAN;
BEGIN
  -- Get offer details
  SELECT * INTO v_offer FROM public.peer_lending_offers WHERE id = p_offer_id;
  
  IF v_offer IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Offer not found');
  END IF;
  
  -- Verify user is the borrower
  IF v_offer.borrower_id != auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'message', 'Unauthorized');
  END IF;
  
  -- Verify PIN
  v_pin_valid := public.verify_user_pin_v2(auth.uid(), p_user_pin);
  IF NOT v_pin_valid THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid PIN');
  END IF;
  
  -- Update offer status
  UPDATE public.peer_lending_offers 
  SET status = p_response, 
      accepted_at = CASE WHEN p_response = 'accepted' THEN now() ELSE NULL END,
      updated_at = now()
  WHERE id = p_offer_id;
  
  RETURN jsonb_build_object('success', true, 'message', 'Response recorded successfully');
END;
$$;

-- Function to disburse loan
CREATE OR REPLACE FUNCTION public.disburse_peer_loan(
  p_offer_id UUID,
  p_user_pin TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_offer RECORD;
  v_pin_valid BOOLEAN;
  v_transaction_id UUID;
BEGIN
  -- Get offer details
  SELECT * INTO v_offer FROM public.peer_lending_offers WHERE id = p_offer_id;
  
  IF v_offer IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Offer not found');
  END IF;
  
  -- Verify user is the lender
  IF v_offer.lender_id != auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'message', 'Unauthorized');
  END IF;
  
  -- Check offer is accepted
  IF v_offer.status != 'accepted' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Offer not accepted yet');
  END IF;
  
  -- Verify PIN
  v_pin_valid := public.verify_user_pin_v2(auth.uid(), p_user_pin);
  IF NOT v_pin_valid THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid PIN');
  END IF;
  
  -- Create disbursement transaction
  INSERT INTO public.peer_lending_transactions (
    offer_id, transaction_type, amount, status
  ) VALUES (
    p_offer_id, 'disbursement', v_offer.amount, 'completed'
  ) RETURNING id INTO v_transaction_id;
  
  -- Update offer status
  UPDATE public.peer_lending_offers 
  SET status = 'disbursed', 
      disbursed_at = now(),
      updated_at = now()
  WHERE id = p_offer_id;
  
  RETURN jsonb_build_object('success', true, 'message', 'Loan disbursed successfully', 'transaction_id', v_transaction_id);
END;
$$;