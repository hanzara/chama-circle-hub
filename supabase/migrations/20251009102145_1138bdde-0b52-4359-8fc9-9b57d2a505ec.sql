-- Add missing fields to chama_loans table
ALTER TABLE public.chama_loans
ADD COLUMN IF NOT EXISTS purpose TEXT,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.chama_members(id),
ADD COLUMN IF NOT EXISTS repayment_schedule JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create credit scores table for tracking member loan performance
CREATE TABLE IF NOT EXISTS public.member_credit_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  chama_id UUID NOT NULL REFERENCES public.chamas(id) ON DELETE CASCADE,
  credit_score INTEGER DEFAULT 50 CHECK (credit_score >= 0 AND credit_score <= 100),
  total_loans_taken INTEGER DEFAULT 0,
  total_amount_borrowed NUMERIC DEFAULT 0,
  total_amount_repaid NUMERIC DEFAULT 0,
  on_time_repayments INTEGER DEFAULT 0,
  late_repayments INTEGER DEFAULT 0,
  missed_repayments INTEGER DEFAULT 0,
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, chama_id)
);

-- Enable RLS on credit scores
ALTER TABLE public.member_credit_scores ENABLE ROW LEVEL SECURITY;

-- Members can view their own credit scores
CREATE POLICY "Members can view their credit scores"
ON public.member_credit_scores
FOR SELECT
USING (
  user_id = auth.uid() OR
  chama_id IN (
    SELECT chama_id FROM public.chama_members
    WHERE user_id = auth.uid() AND role IN ('admin', 'treasurer', 'chairman')
  )
);

-- Function to calculate and update credit score
CREATE OR REPLACE FUNCTION public.calculate_member_credit_score(
  p_user_id UUID,
  p_chama_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_borrowed NUMERIC := 0;
  v_total_repaid NUMERIC := 0;
  v_on_time INTEGER := 0;
  v_late INTEGER := 0;
  v_missed INTEGER := 0;
  v_base_score NUMERIC := 0;
  v_bonus_points INTEGER := 0;
  v_final_score INTEGER := 50;
BEGIN
  -- Get totals from loans
  SELECT 
    COALESCE(SUM(amount), 0),
    COALESCE(SUM(repaid_amount), 0)
  INTO v_total_borrowed, v_total_repaid
  FROM public.chama_loans
  WHERE borrower_id = (
    SELECT id FROM public.chama_members 
    WHERE user_id = p_user_id AND chama_id = p_chama_id
  );

  -- Count repayment performance
  SELECT 
    COUNT(CASE WHEN payment_date <= due_date THEN 1 END),
    COUNT(CASE WHEN payment_date > due_date THEN 1 END),
    COUNT(CASE WHEN status = 'pending' AND due_date < now() THEN 1 END)
  INTO v_on_time, v_late, v_missed
  FROM public.chama_loan_repayments clr
  JOIN public.chama_loans cl ON clr.loan_id = cl.id
  WHERE cl.borrower_id = (
    SELECT id FROM public.chama_members 
    WHERE user_id = p_user_id AND chama_id = p_chama_id
  );

  -- Calculate base score (repayment ratio)
  IF v_total_borrowed > 0 THEN
    v_base_score := (v_total_repaid / v_total_borrowed) * 100;
  ELSE
    v_base_score := 50; -- Default for new members
  END IF;

  -- Add bonus points
  v_bonus_points := (v_on_time * 5) + (v_late * -10) + (v_missed * -20);

  -- Calculate final score (capped at 0-100)
  v_final_score := GREATEST(0, LEAST(100, ROUND(v_base_score + v_bonus_points)));

  -- Update or insert credit score record
  INSERT INTO public.member_credit_scores (
    user_id, chama_id, credit_score, 
    total_amount_borrowed, total_amount_repaid,
    on_time_repayments, late_repayments, missed_repayments,
    last_calculated_at
  )
  VALUES (
    p_user_id, p_chama_id, v_final_score,
    v_total_borrowed, v_total_repaid,
    v_on_time, v_late, v_missed,
    now()
  )
  ON CONFLICT (user_id, chama_id) DO UPDATE SET
    credit_score = v_final_score,
    total_amount_borrowed = v_total_borrowed,
    total_amount_repaid = v_total_repaid,
    on_time_repayments = v_on_time,
    late_repayments = v_late,
    missed_repayments = v_missed,
    last_calculated_at = now(),
    updated_at = now();

  RETURN v_final_score;
END;
$$;

-- Trigger to auto-update credit score on repayment
CREATE OR REPLACE FUNCTION public.trigger_update_credit_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_chama_id UUID;
BEGIN
  -- Get user_id and chama_id from the loan
  SELECT cm.user_id, cl.chama_id
  INTO v_user_id, v_chama_id
  FROM public.chama_loans cl
  JOIN public.chama_members cm ON cl.borrower_id = cm.id
  WHERE cl.id = NEW.loan_id;

  -- Recalculate credit score
  PERFORM public.calculate_member_credit_score(v_user_id, v_chama_id);

  RETURN NEW;
END;
$$;

-- Create trigger on loan repayments
DROP TRIGGER IF EXISTS update_credit_score_on_repayment ON public.chama_loan_repayments;
CREATE TRIGGER update_credit_score_on_repayment
AFTER INSERT OR UPDATE ON public.chama_loan_repayments
FOR EACH ROW
EXECUTE FUNCTION public.trigger_update_credit_score();

-- Add updated_at trigger to chama_loans
CREATE OR REPLACE FUNCTION public.update_loan_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_loan_updated_at ON public.chama_loans;
CREATE TRIGGER set_loan_updated_at
BEFORE UPDATE ON public.chama_loans
FOR EACH ROW
EXECUTE FUNCTION public.update_loan_updated_at();