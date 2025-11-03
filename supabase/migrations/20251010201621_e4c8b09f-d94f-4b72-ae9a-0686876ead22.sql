-- Create function for withdrawing from savings accounts
CREATE OR REPLACE FUNCTION public.withdraw_from_savings_account(
  p_account_id uuid,
  p_amount numeric,
  p_payment_method varchar DEFAULT 'mobile_money',
  p_payment_reference varchar DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account RECORD;
  v_member_id uuid;
  v_chama_id uuid;
  v_withdrawal_fee numeric;
  v_net_amount numeric;
  v_transaction_id uuid;
BEGIN
  -- Get account details
  SELECT * INTO v_account 
  FROM chama_member_savings_accounts 
  WHERE id = p_account_id;
  
  IF v_account IS NULL THEN
    RAISE EXCEPTION 'Savings account not found';
  END IF;
  
  v_member_id := v_account.member_id;
  v_chama_id := v_account.chama_id;
  
  -- Check if user owns this account
  IF NOT EXISTS (
    SELECT 1 FROM chama_members 
    WHERE id = v_member_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'You do not have permission to withdraw from this account';
  END IF;
  
  -- Check sufficient balance
  IF v_account.current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance. Available: KES %', v_account.current_balance;
  END IF;
  
  -- Calculate withdrawal fee (use account's withdrawal fee or default 2%)
  v_withdrawal_fee := p_amount * COALESCE(v_account.withdrawal_fee, 2) / 100;
  v_net_amount := p_amount - v_withdrawal_fee;
  
  -- Update account balance
  UPDATE chama_member_savings_accounts
  SET current_balance = current_balance - p_amount,
      updated_at = now()
  WHERE id = p_account_id;
  
  -- Record transaction
  INSERT INTO chama_savings_transactions (
    chama_id,
    member_id,
    savings_account_id,
    transaction_type,
    amount,
    balance_after,
    payment_method,
    reference_number,
    transaction_fee,
    description
  ) VALUES (
    v_chama_id,
    v_member_id,
    p_account_id,
    'withdrawal',
    p_amount,
    v_account.current_balance - p_amount,
    p_payment_method,
    p_payment_reference,
    v_withdrawal_fee,
    FORMAT('Withdrawal from %s', v_account.account_name)
  ) RETURNING id INTO v_transaction_id;
  
  -- Log activity
  INSERT INTO chama_activities (
    chama_id,
    member_id,
    activity_type,
    description,
    amount
  ) VALUES (
    v_chama_id,
    v_member_id,
    'savings_withdrawal',
    FORMAT('Withdrew KES %s from %s', p_amount, v_account.account_name),
    p_amount
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'gross_amount', p_amount,
    'fee_charged', v_withdrawal_fee,
    'net_withdrawn', v_net_amount,
    'new_balance', v_account.current_balance - p_amount
  );
END;
$$;

-- Create function to calculate interest earnings
CREATE OR REPLACE FUNCTION public.calculate_savings_interest_batch()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Calculate and add interest to all active savings accounts
  -- Interest is calculated daily and added monthly
  INSERT INTO chama_savings_transactions (
    chama_id,
    member_id,
    savings_account_id,
    transaction_type,
    amount,
    balance_after,
    description
  )
  SELECT 
    csa.chama_id,
    csa.member_id,
    csa.id,
    'interest',
    ROUND((csa.current_balance * csa.interest_rate / 100) / 12, 2) as interest_amount,
    csa.current_balance + ROUND((csa.current_balance * csa.interest_rate / 100) / 12, 2),
    FORMAT('Monthly interest at %s%% annual rate', csa.interest_rate)
  FROM chama_member_savings_accounts csa
  WHERE csa.status = 'active'
    AND csa.current_balance > 0;
  
  -- Update account balances
  UPDATE chama_member_savings_accounts csa
  SET current_balance = current_balance + ROUND((current_balance * interest_rate / 100) / 12, 2),
      updated_at = now()
  WHERE status = 'active'
    AND current_balance > 0;
END;
$$;

-- Enable realtime for savings tables
ALTER TABLE chama_member_savings_accounts REPLICA IDENTITY FULL;
ALTER TABLE chama_savings_transactions REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE chama_member_savings_accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE chama_savings_transactions;