-- Fix invitation function ambiguity by dropping old versions
DROP FUNCTION IF EXISTS public.create_chama_invitation(uuid, text, text, text);
DROP FUNCTION IF EXISTS public.create_chama_invitation(uuid, text, text, character varying);

-- Create single definitive version
CREATE OR REPLACE FUNCTION public.create_chama_invitation(
  p_chama_id UUID,
  p_email TEXT DEFAULT NULL,
  p_phone_number TEXT DEFAULT NULL,
  p_role TEXT DEFAULT 'member'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invitation_id UUID;
  v_invitation_token TEXT;
BEGIN
  -- Check if user is admin
  IF NOT public.is_chama_admin(p_chama_id) THEN
    RAISE EXCEPTION 'Only admins can send invitations';
  END IF;

  -- Validate input
  IF p_email IS NULL AND p_phone_number IS NULL THEN
    RAISE EXCEPTION 'Either email or phone number must be provided';
  END IF;

  -- Generate invitation token
  v_invitation_token := encode(gen_random_bytes(32), 'hex');

  -- Create invitation
  INSERT INTO public.member_invitations (
    chama_id,
    email,
    phone_number,
    role,
    invitation_token,
    invited_by,
    expires_at
  ) VALUES (
    p_chama_id,
    p_email,
    p_phone_number,
    p_role,
    v_invitation_token,
    auth.uid(),
    NOW() + INTERVAL '7 days'
  ) RETURNING id INTO v_invitation_id;

  -- TODO: Send email/SMS with invitation link
  -- Link format: ${app_url}/invite/${v_invitation_token}

  RETURN v_invitation_id;
END;
$$;

-- Unlock all chama wallet withdrawals by default
ALTER TABLE public.chama_members 
ALTER COLUMN withdrawal_locked SET DEFAULT false;

-- Update existing members to have unlocked withdrawals
UPDATE public.chama_members 
SET withdrawal_locked = false 
WHERE withdrawal_locked = true;

-- Create function for depositing to savings accounts
CREATE OR REPLACE FUNCTION public.deposit_to_savings_account(
  p_account_id UUID,
  p_amount NUMERIC,
  p_payment_method VARCHAR DEFAULT 'mobile_money',
  p_reference VARCHAR DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_account RECORD;
  v_member RECORD;
  v_fee NUMERIC;
  v_net_amount NUMERIC;
  v_new_balance NUMERIC;
  v_transaction_id UUID;
BEGIN
  -- Get account details
  SELECT * INTO v_account
  FROM public.chama_member_savings_accounts
  WHERE id = p_account_id;

  IF v_account IS NULL THEN
    RAISE EXCEPTION 'Savings account not found';
  END IF;

  -- Get member details
  SELECT * INTO v_member
  FROM public.chama_members
  WHERE id = v_account.member_id AND user_id = auth.uid();

  IF v_member IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: You can only deposit to your own account';
  END IF;

  -- Calculate fee (0.5% for regular, 0.2% for premium)
  IF v_account.account_type = 'premium' THEN
    v_fee := p_amount * 0.002;
  ELSE
    v_fee := p_amount * 0.005;
  END IF;

  v_net_amount := p_amount - v_fee;
  v_new_balance := v_account.current_balance + v_net_amount;

  -- Update account balance
  UPDATE public.chama_member_savings_accounts
  SET current_balance = v_new_balance,
      updated_at = NOW()
  WHERE id = p_account_id;

  -- Create transaction record
  INSERT INTO public.chama_savings_transactions (
    chama_id,
    savings_account_id,
    member_id,
    transaction_type,
    amount,
    transaction_fee,
    balance_after,
    payment_method,
    reference_number,
    description,
    status
  ) VALUES (
    v_account.chama_id,
    p_account_id,
    v_account.member_id,
    'deposit',
    p_amount,
    v_fee,
    v_new_balance,
    p_payment_method,
    p_reference,
    FORMAT('Deposit to %s', v_account.account_name),
    'completed'
  ) RETURNING id INTO v_transaction_id;

  -- Log activity
  INSERT INTO public.chama_activities (
    chama_id,
    member_id,
    activity_type,
    description,
    amount
  ) VALUES (
    v_account.chama_id,
    v_account.member_id,
    'savings_deposit',
    FORMAT('Deposited KES %s to %s', p_amount, v_account.account_name),
    v_net_amount
  );

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'net_deposited', v_net_amount,
    'fee_charged', v_fee,
    'new_balance', v_new_balance
  );
END;
$$;

-- Create function for withdrawing from savings accounts
CREATE OR REPLACE FUNCTION public.withdraw_from_savings_account(
  p_account_id UUID,
  p_amount NUMERIC,
  p_payment_method VARCHAR DEFAULT 'mobile_money',
  p_payment_reference VARCHAR DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_account RECORD;
  v_member RECORD;
  v_fee NUMERIC;
  v_net_amount NUMERIC;
  v_new_balance NUMERIC;
  v_transaction_id UUID;
BEGIN
  -- Get account details
  SELECT * INTO v_account
  FROM public.chama_member_savings_accounts
  WHERE id = p_account_id;

  IF v_account IS NULL THEN
    RAISE EXCEPTION 'Savings account not found';
  END IF;

  -- Check if account is active
  IF v_account.status != 'active' THEN
    RAISE EXCEPTION 'Cannot withdraw from inactive account';
  END IF;

  -- Get member details
  SELECT * INTO v_member
  FROM public.chama_members
  WHERE id = v_account.member_id AND user_id = auth.uid();

  IF v_member IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: You can only withdraw from your own account';
  END IF;

  -- Calculate withdrawal fee
  v_fee := GREATEST(v_account.withdrawal_fee, p_amount * 0.01);
  v_net_amount := p_amount - v_fee;

  -- Check sufficient balance
  IF v_account.current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance. Available: KES %', v_account.current_balance;
  END IF;

  -- Check minimum balance
  v_new_balance := v_account.current_balance - p_amount;
  IF v_new_balance < v_account.minimum_balance THEN
    RAISE EXCEPTION 'Withdrawal would breach minimum balance requirement of KES %', v_account.minimum_balance;
  END IF;

  -- Update account balance
  UPDATE public.chama_member_savings_accounts
  SET current_balance = v_new_balance,
      updated_at = NOW()
  WHERE id = p_account_id;

  -- Create transaction record
  INSERT INTO public.chama_savings_transactions (
    chama_id,
    savings_account_id,
    member_id,
    transaction_type,
    amount,
    transaction_fee,
    balance_after,
    payment_method,
    reference_number,
    description,
    status,
    processed_by
  ) VALUES (
    v_account.chama_id,
    p_account_id,
    v_account.member_id,
    'withdrawal',
    p_amount,
    v_fee,
    v_new_balance,
    p_payment_method,
    p_payment_reference,
    FORMAT('Withdrawal from %s', v_account.account_name),
    'completed',
    v_member.id
  ) RETURNING id INTO v_transaction_id;

  -- Log activity
  INSERT INTO public.chama_activities (
    chama_id,
    member_id,
    activity_type,
    description,
    amount
  ) VALUES (
    v_account.chama_id,
    v_account.member_id,
    'savings_withdrawal',
    FORMAT('Withdrew KES %s from %s', v_net_amount, v_account.account_name),
    v_net_amount
  );

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'net_withdrawn', v_net_amount,
    'fee_charged', v_fee,
    'new_balance', v_new_balance
  );
END;
$$;