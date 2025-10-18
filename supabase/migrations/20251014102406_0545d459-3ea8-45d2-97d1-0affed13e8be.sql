-- Create member wallets table
CREATE TABLE IF NOT EXISTS public.member_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES public.chama_members(id) ON DELETE CASCADE,
  chama_id uuid NOT NULL REFERENCES public.chamas(id) ON DELETE CASCADE,
  balance numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(member_id, chama_id)
);

-- Create chama central wallets table
CREATE TABLE IF NOT EXISTS public.chama_central_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chama_id uuid NOT NULL UNIQUE REFERENCES public.chamas(id) ON DELETE CASCADE,
  balance numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Update loan_requests table to include all needed fields
ALTER TABLE public.chama_loan_requests
ADD COLUMN IF NOT EXISTS amount_paid numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS amount_remaining numeric GENERATED ALWAYS AS (amount - COALESCE(amount_paid, 0)) STORED,
ADD COLUMN IF NOT EXISTS disbursement_status boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS report text,
ADD COLUMN IF NOT EXISTS reward_status boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS member_payment_number text,
ADD COLUMN IF NOT EXISTS funds_sent_at timestamp with time zone;

-- Create loan_disbursements table for tracking disbursement workflow
CREATE TABLE IF NOT EXISTS public.loan_disbursements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid NOT NULL REFERENCES public.chama_loan_requests(id) ON DELETE CASCADE,
  chama_id uuid NOT NULL REFERENCES public.chamas(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  member_payment_number text NOT NULL,
  disbursed_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending, sent, completed
  created_at timestamp with time zone DEFAULT now(),
  sent_at timestamp with time zone
);

-- Enable RLS on new tables
ALTER TABLE public.member_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chama_central_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_disbursements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for member_wallets
CREATE POLICY "Members can view their own wallet"
  ON public.member_wallets FOR SELECT
  USING (
    member_id IN (
      SELECT id FROM public.chama_members 
      WHERE user_id = auth.uid() AND chama_id = member_wallets.chama_id
    )
  );

CREATE POLICY "Admins can view all member wallets in their chama"
  ON public.member_wallets FOR SELECT
  USING (is_chama_admin_or_treasurer(chama_id));

CREATE POLICY "System can manage member wallets"
  ON public.member_wallets FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for chama_central_wallets
CREATE POLICY "Members can view their chama central wallet"
  ON public.chama_central_wallets FOR SELECT
  USING (is_chama_member(chama_id));

CREATE POLICY "Admins can manage central wallet"
  ON public.chama_central_wallets FOR ALL
  USING (is_chama_admin_or_treasurer(chama_id));

-- RLS Policies for loan_disbursements
CREATE POLICY "Members can view their loan disbursements"
  ON public.loan_disbursements FOR SELECT
  USING (
    loan_id IN (
      SELECT lr.id FROM public.chama_loan_requests lr
      JOIN public.chama_members cm ON lr.borrower_id = cm.id
      WHERE cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage disbursements"
  ON public.loan_disbursements FOR ALL
  USING (is_chama_admin_or_treasurer(chama_id));

-- Create trigger for updating member wallet updated_at
CREATE OR REPLACE FUNCTION update_member_wallet_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER member_wallet_updated_at
  BEFORE UPDATE ON public.member_wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_member_wallet_timestamp();

-- Create function to initialize member wallet
CREATE OR REPLACE FUNCTION create_member_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.member_wallets (member_id, chama_id, balance)
  VALUES (NEW.id, NEW.chama_id, 0)
  ON CONFLICT (member_id, chama_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_member_wallet_trigger
  AFTER INSERT ON public.chama_members
  FOR EACH ROW
  EXECUTE FUNCTION create_member_wallet();

-- Create function to initialize chama central wallet
CREATE OR REPLACE FUNCTION create_chama_central_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.chama_central_wallets (chama_id, balance)
  VALUES (NEW.id, 0)
  ON CONFLICT (chama_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_chama_central_wallet_trigger
  AFTER INSERT ON public.chamas
  FOR EACH ROW
  EXECUTE FUNCTION create_chama_central_wallet();