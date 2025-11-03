-- Create peer lending system tables

-- User PIN table for validation
CREATE TABLE IF NOT EXISTS public.user_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pin_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Peer lending offers table
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

-- Peer lending transactions table
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

-- User profile photos table
CREATE TABLE IF NOT EXISTS public.user_profile_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_lending_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_lending_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profile_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_pins
CREATE POLICY "Users can manage their own PIN" ON public.user_pins
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS Policies for peer_lending_offers
CREATE POLICY "Users can create lending offers" ON public.peer_lending_offers
  FOR INSERT WITH CHECK (auth.uid() = lender_id);

CREATE POLICY "Users can view offers they sent or received" ON public.peer_lending_offers
  FOR SELECT USING (auth.uid() = lender_id OR auth.uid() = borrower_id);

CREATE POLICY "Borrowers can update offer status" ON public.peer_lending_offers
  FOR UPDATE USING (auth.uid() = borrower_id);

CREATE POLICY "Lenders can update their offers" ON public.peer_lending_offers
  FOR UPDATE USING (auth.uid() = lender_id);

-- RLS Policies for peer_lending_transactions
CREATE POLICY "Users can view their lending transactions" ON public.peer_lending_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.peer_lending_offers 
      WHERE id = peer_lending_transactions.offer_id 
      AND (lender_id = auth.uid() OR borrower_id = auth.uid())
    )
  );

CREATE POLICY "Users can create lending transactions" ON public.peer_lending_transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.peer_lending_offers 
      WHERE id = peer_lending_transactions.offer_id 
      AND (lender_id = auth.uid() OR borrower_id = auth.uid())
    )
  );

-- RLS Policies for user_profile_photos
CREATE POLICY "Users can manage their own profile photo" ON public.user_profile_photos
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Functions
CREATE OR REPLACE FUNCTION public.set_user_pin(p_user_id UUID, p_pin TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_salt TEXT;
  v_hash TEXT;
BEGIN
  -- Generate random salt
  v_salt := encode(gen_random_bytes(16), 'hex');
  
  -- Hash PIN with salt
  v_hash := encode(digest(v_salt || p_pin, 'sha256'), 'hex');
  
  -- Insert or update PIN
  INSERT INTO public.user_pins (user_id, pin_hash, salt)
  VALUES (p_user_id, v_hash, v_salt)
  ON CONFLICT (user_id) DO UPDATE SET
    pin_hash = EXCLUDED.pin_hash,
    salt = EXCLUDED.salt,
    updated_at = now();
    
  RETURN jsonb_build_object('success', true, 'message', 'PIN set successfully');
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_user_pin(p_user_id UUID, p_pin TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stored_hash TEXT;
  stored_salt TEXT;
  computed_hash TEXT;
BEGIN
  SELECT pin_hash, salt INTO stored_hash, stored_salt
  FROM public.user_pins
  WHERE user_id = p_user_id;
  
  IF stored_hash IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Simple hash comparison (in production, use proper bcrypt)
  computed_hash := encode(digest(stored_salt || p_pin, 'sha256'), 'hex');
  
  RETURN computed_hash = stored_hash;
END;
$$;

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
  p_response TEXT, -- 'accepted' or 'rejected'
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
  v_pin_valid := public.verify_user_pin(auth.uid(), p_user_pin);
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
  v_pin_valid := public.verify_user_pin(auth.uid(), p_user_pin);
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

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_pins_updated_at
  BEFORE UPDATE ON public.user_pins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_peer_lending_offers_updated_at
  BEFORE UPDATE ON public.peer_lending_offers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_peer_lending_transactions_updated_at
  BEFORE UPDATE ON public.peer_lending_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();