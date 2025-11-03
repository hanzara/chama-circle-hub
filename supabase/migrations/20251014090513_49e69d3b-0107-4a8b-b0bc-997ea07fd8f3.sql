-- Add missing columns to chamas table
ALTER TABLE public.chamas 
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS rules text,
ADD COLUMN IF NOT EXISTS funds_locked boolean DEFAULT false;

-- Create function to check if funds are locked for a chama
CREATE OR REPLACE FUNCTION public.are_funds_locked(p_chama_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(funds_locked, false)
  FROM public.chamas
  WHERE id = p_chama_id;
$$;

-- Update RLS policy for chama_wallet_transactions to check fund lock status
DROP POLICY IF EXISTS "Members can create deposits to their savings accounts" ON public.chama_savings_transactions;
CREATE POLICY "Members can create deposits to their savings accounts"
ON public.chama_savings_transactions
FOR INSERT
TO authenticated
WITH CHECK (
  (member_id IN (
    SELECT chama_members.id
    FROM chama_members
    WHERE chama_members.user_id = auth.uid() 
    AND chama_members.chama_id = chama_savings_transactions.chama_id
  )) AND (
    transaction_type = 'deposit' OR 
    (transaction_type = 'withdrawal' AND NOT are_funds_locked(chama_id))
  )
);

-- Function to toggle fund lock (admin only)
CREATE OR REPLACE FUNCTION public.toggle_chama_fund_lock(p_chama_id uuid, p_lock_status boolean)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT public.is_chama_admin(p_chama_id) THEN
    RAISE EXCEPTION 'Only admins can change fund lock status';
  END IF;
  
  -- Update fund lock status
  UPDATE public.chamas
  SET funds_locked = p_lock_status,
      updated_at = now()
  WHERE id = p_chama_id;
  
  -- Log activity
  INSERT INTO public.chama_activities (chama_id, activity_type, description)
  VALUES (
    p_chama_id,
    'fund_lock_changed',
    FORMAT('Funds %s by admin', CASE WHEN p_lock_status THEN 'locked' ELSE 'unlocked' END)
  );
  
  RETURN jsonb_build_object('success', true, 'locked', p_lock_status);
END;
$$;