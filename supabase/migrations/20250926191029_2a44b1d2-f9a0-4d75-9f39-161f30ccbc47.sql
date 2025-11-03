-- Credit Scoring Functions
CREATE OR REPLACE FUNCTION public.calculate_credit_score(user_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  base_score INTEGER := 600;
  repayment_score INTEGER := 0;
  kyc_score INTEGER := 0;
  chama_score INTEGER := 0;
  social_proof_score INTEGER := 0;
  final_score INTEGER;
BEGIN
  -- Repayment History Score (40% weight)
  SELECT COALESCE(
    CASE 
      WHEN COUNT(*) = 0 THEN 0
      ELSE (COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100 / COUNT(*))
    END, 0
  ) INTO repayment_score
  FROM public.loan_repayments lr
  JOIN public.loan_applications la ON lr.loan_application_id = la.id
  WHERE la.borrower_id = user_id_param;
  
  -- KYC Score (20% weight) - Based on profile completeness
  SELECT CASE 
    WHEN EXISTS(SELECT 1 FROM auth.users WHERE id = user_id_param) THEN 80
    ELSE 0
  END INTO kyc_score;
  
  -- Chama Participation Score (20% weight)
  SELECT COALESCE(
    LEAST(100, COUNT(*) * 20), 0
  ) INTO chama_score
  FROM public.chama_members
  WHERE user_id = user_id_param AND is_active = true;
  
  -- Social Proof Score (20% weight)
  SELECT COALESCE(
    LEAST(100, COUNT(*) * 30), 0
  ) INTO social_proof_score
  FROM public.chama_contributions_new cc
  JOIN public.chama_members cm ON cc.member_id = cm.id
  WHERE cm.user_id = user_id_param;
  
  -- Calculate final score
  final_score := base_score + 
    (repayment_score * 0.4)::INTEGER + 
    (kyc_score * 0.2)::INTEGER + 
    (chama_score * 0.2)::INTEGER + 
    (social_proof_score * 0.2)::INTEGER;
  
  -- Ensure score is within bounds
  final_score := GREATEST(300, LEAST(850, final_score));
  
  -- Store in history
  INSERT INTO public.credit_score_history (user_id, score, factors, calculation_method)
  VALUES (
    user_id_param, 
    final_score,
    jsonb_build_object(
      'repayment_score', repayment_score,
      'kyc_score', kyc_score,
      'chama_score', chama_score,
      'social_proof_score', social_proof_score
    ),
    'standard_v1'
  );
  
  RETURN final_score;
END;
$$;

-- Auto-approve loan function
CREATE OR REPLACE FUNCTION public.auto_approve_loan(application_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  app_record RECORD;
  credit_score INTEGER;
  debt_to_income NUMERIC;
  auto_approved BOOLEAN := false;
BEGIN
  -- Get application details
  SELECT * INTO app_record FROM public.loan_applications WHERE id = application_id;
  
  IF app_record IS NULL THEN
    RETURN false;
  END IF;
  
  -- Calculate current credit score
  credit_score := public.calculate_credit_score(app_record.borrower_id);
  
  -- Calculate debt to income ratio
  debt_to_income := (app_record.monthly_payment / NULLIF(app_record.monthly_income, 0));
  
  -- Auto-approve rules
  IF app_record.loan_amount <= 50000 AND 
     credit_score >= 650 AND 
     debt_to_income <= 0.3 THEN
    
    UPDATE public.loan_applications 
    SET 
      status = 'approved',
      approved_at = now(),
      credit_score = credit_score,
      eligibility_score = 85.0
    WHERE id = application_id;
    
    auto_approved := true;
  END IF;
  
  RETURN auto_approved;
END;
$$;

-- Generate loan repayment schedule
CREATE OR REPLACE FUNCTION public.generate_repayment_schedule(application_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  app_record RECORD;
  payment_date DATE;
  payment_number INTEGER := 1;
  remaining_balance NUMERIC;
  principal_payment NUMERIC;
  interest_payment NUMERIC;
  monthly_rate NUMERIC;
BEGIN
  -- Get loan application details
  SELECT * INTO app_record FROM public.loan_applications WHERE id = application_id;
  
  IF app_record IS NULL OR app_record.status != 'approved' THEN
    RETURN;
  END IF;
  
  -- Calculate monthly interest rate
  monthly_rate := (app_record.interest_rate / 100) / 12;
  remaining_balance := app_record.loan_amount;
  payment_date := CURRENT_DATE + INTERVAL '1 month';
  
  -- Generate repayment schedule
  FOR i IN 1..app_record.loan_term_months LOOP
    -- Calculate interest and principal portions
    interest_payment := remaining_balance * monthly_rate;
    principal_payment := app_record.monthly_payment - interest_payment;
    remaining_balance := remaining_balance - principal_payment;
    
    -- Insert repayment record
    INSERT INTO public.loan_repayments (
      loan_application_id,
      payment_number,
      due_date,
      payment_amount,
      principal_amount,
      interest_amount,
      remaining_balance
    ) VALUES (
      application_id,
      payment_number,
      payment_date,
      app_record.monthly_payment,
      principal_payment,
      interest_payment,
      GREATEST(0, remaining_balance)
    );
    
    payment_number := payment_number + 1;
    payment_date := payment_date + INTERVAL '1 month';
  END LOOP;
  
  -- Update loan application with next payment due
  UPDATE public.loan_applications 
  SET next_payment_due = CURRENT_DATE + INTERVAL '1 month'
  WHERE id = application_id;
END;
$$;

-- Function to process loan disbursement
CREATE OR REPLACE FUNCTION public.disburse_loan(application_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  app_record RECORD;
  result JSONB;
BEGIN
  -- Get application details
  SELECT * INTO app_record FROM public.loan_applications WHERE id = application_id;
  
  IF app_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Loan application not found');
  END IF;
  
  IF app_record.status != 'approved' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Loan not approved for disbursement');
  END IF;
  
  -- Update loan status
  UPDATE public.loan_applications 
  SET 
    status = 'active',
    disbursed_at = now(),
    funded_at = now(),
    funding_progress = 100
  WHERE id = application_id;
  
  -- Generate repayment schedule
  PERFORM public.generate_repayment_schedule(application_id);
  
  -- Add funds to user wallet (simplified - in production this would integrate with payment systems)
  INSERT INTO public.wallet_transactions (user_id, type, amount, description, status)
  VALUES (
    app_record.borrower_id,
    'loan_disbursement',
    app_record.loan_amount,
    'Loan disbursement for application #' || application_id::text,
    'completed'
  );
  
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Loan disbursed successfully',
    'amount', app_record.loan_amount
  );
END;
$$;

-- Function to process loan repayment
CREATE OR REPLACE FUNCTION public.process_loan_repayment(
  repayment_id UUID,
  payment_amount NUMERIC,
  payment_method VARCHAR DEFAULT 'mobile_money',
  payment_reference VARCHAR DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  repayment_record RECORD;
  loan_record RECORD;
  remaining_amount NUMERIC;
  result JSONB;
BEGIN
  -- Get repayment details
  SELECT lr.*, la.borrower_id, la.loan_amount 
  INTO repayment_record
  FROM public.loan_repayments lr
  JOIN public.loan_applications la ON lr.loan_application_id = la.id
  WHERE lr.id = repayment_id;
  
  IF repayment_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Repayment record not found');
  END IF;
  
  -- Verify the user owns this loan
  IF auth.uid() != repayment_record.borrower_id THEN
    RETURN jsonb_build_object('success', false, 'message', 'Unauthorized');
  END IF;
  
  -- Calculate remaining amount to pay
  remaining_amount := repayment_record.payment_amount - repayment_record.amount_paid;
  
  IF payment_amount > remaining_amount THEN
    payment_amount := remaining_amount;
  END IF;
  
  -- Update repayment record
  UPDATE public.loan_repayments
  SET 
    amount_paid = amount_paid + payment_amount,
    payment_date = CASE WHEN amount_paid + payment_amount >= payment_amount THEN now() ELSE payment_date END,
    payment_method = COALESCE(payment_method, loan_repayments.payment_method),
    payment_reference = COALESCE(payment_reference, loan_repayments.payment_reference),
    status = CASE 
      WHEN amount_paid + payment_amount >= payment_amount THEN 'completed'
      ELSE 'partial'
    END,
    updated_at = now()
  WHERE id = repayment_id;
  
  -- Record transaction
  INSERT INTO public.wallet_transactions (user_id, type, amount, description, status)
  VALUES (
    repayment_record.borrower_id,
    'loan_repayment',
    -payment_amount,
    'Loan repayment for payment #' || repayment_record.payment_number,
    'completed'
  );
  
  -- Check if loan is fully paid
  IF NOT EXISTS(
    SELECT 1 FROM public.loan_repayments 
    WHERE loan_application_id = repayment_record.loan_application_id 
    AND status != 'completed'
  ) THEN
    UPDATE public.loan_applications
    SET status = 'completed'
    WHERE id = repayment_record.loan_application_id;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Payment processed successfully',
    'amount_paid', payment_amount,
    'remaining_balance', remaining_amount - payment_amount
  );
END;
$$;