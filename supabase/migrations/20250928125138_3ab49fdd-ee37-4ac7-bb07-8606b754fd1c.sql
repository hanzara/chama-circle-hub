-- Create monthly_maintenance_fees table
CREATE TABLE IF NOT EXISTS public.monthly_maintenance_fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  fee_amount NUMERIC NOT NULL DEFAULT 10.0,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'deducted', 'waived')),
  deducted_at TIMESTAMP WITH TIME ZONE NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, due_date)
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_monthly_fees_user_status ON public.monthly_maintenance_fees(user_id, status);
CREATE INDEX IF NOT EXISTS idx_monthly_fees_due_date ON public.monthly_maintenance_fees(due_date);

-- Enable RLS
ALTER TABLE public.monthly_maintenance_fees ENABLE ROW LEVEL SECURITY;

-- RLS policies for monthly maintenance fees
CREATE POLICY "Users can view their own maintenance fees" 
ON public.monthly_maintenance_fees 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage maintenance fees" 
ON public.monthly_maintenance_fees 
FOR ALL
USING (true)
WITH CHECK (true);

-- Create function to process monthly maintenance fees
CREATE OR REPLACE FUNCTION public.process_monthly_maintenance_fees()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  processed_count INTEGER := 0;
  user_record RECORD;
  wallet_balance NUMERIC;
  fee_amount NUMERIC := 10.0;
BEGIN
  -- Process all pending maintenance fees for current month
  FOR user_record IN 
    SELECT DISTINCT mmf.user_id, mmf.id as fee_id, mmf.fee_amount
    FROM public.monthly_maintenance_fees mmf
    WHERE mmf.status = 'pending' 
    AND mmf.due_date <= CURRENT_DATE
    AND mmf.attempts < 3
  LOOP
    -- Get user's total wallet balance across all wallets
    SELECT COALESCE(SUM(uw.balance), 0) INTO wallet_balance
    FROM public.user_wallets uw
    WHERE uw.user_id = user_record.user_id;
    
    -- If sufficient balance, deduct the fee
    IF wallet_balance >= user_record.fee_amount THEN
      -- Deduct from the primary wallet (or first available wallet)
      UPDATE public.user_wallets
      SET balance = balance - user_record.fee_amount
      WHERE user_id = user_record.user_id
      AND balance >= user_record.fee_amount
      AND id = (
        SELECT id FROM public.user_wallets 
        WHERE user_id = user_record.user_id 
        AND balance >= user_record.fee_amount
        ORDER BY balance DESC 
        LIMIT 1
      );
      
      -- Mark fee as deducted
      UPDATE public.monthly_maintenance_fees
      SET status = 'deducted',
          deducted_at = now(),
          updated_at = now()
      WHERE id = user_record.fee_id;
      
      -- Create transaction record
      INSERT INTO public.wallet_transactions (
        user_id, type, amount, description, status
      ) VALUES (
        user_record.user_id,
        'maintenance_fee',
        user_record.fee_amount,
        FORMAT('Monthly maintenance fee for %s', TO_CHAR(CURRENT_DATE, 'Month YYYY')),
        'completed'
      );
      
      -- Record the fee in transaction_fees table
      INSERT INTO public.transaction_fees (
        transaction_type, amount, fee_amount, user_id
      ) VALUES (
        'monthly_maintenance',
        0, -- No base amount, this is the fee itself
        user_record.fee_amount,
        user_record.user_id
      );
      
      processed_count := processed_count + 1;
    ELSE
      -- Update attempt count for insufficient balance
      UPDATE public.monthly_maintenance_fees
      SET attempts = attempts + 1,
          last_attempt_at = now(),
          updated_at = now()
      WHERE id = user_record.fee_id;
    END IF;
  END LOOP;
  
  RETURN processed_count;
END;
$$;

-- Create function to generate monthly fees for all users
CREATE OR REPLACE FUNCTION public.generate_monthly_maintenance_fees()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  generated_count INTEGER := 0;
  user_record RECORD;
  due_date DATE;
BEGIN
  -- Set due date to 1st of current month
  due_date := DATE_TRUNC('month', CURRENT_DATE)::DATE;
  
  -- Generate fees for all users who don't have a fee for this month
  FOR user_record IN 
    SELECT DISTINCT uw.user_id
    FROM public.user_wallets uw
    WHERE NOT EXISTS (
      SELECT 1 FROM public.monthly_maintenance_fees mmf
      WHERE mmf.user_id = uw.user_id
      AND mmf.due_date = due_date
    )
  LOOP
    INSERT INTO public.monthly_maintenance_fees (
      user_id, fee_amount, due_date, status
    ) VALUES (
      user_record.user_id, 10.0, due_date, 'pending'
    );
    
    generated_count := generated_count + 1;
  END LOOP;
  
  RETURN generated_count;
END;
$$;

-- Create trigger function to automatically settle pending fees when wallet is topped up
CREATE OR REPLACE FUNCTION public.settle_pending_maintenance_fees()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  pending_fee RECORD;
  wallet_balance NUMERIC;
BEGIN
  -- Only process on wallet balance increases (deposits)
  IF TG_OP = 'UPDATE' AND NEW.balance > OLD.balance THEN
    
    -- Get current total wallet balance for user
    SELECT COALESCE(SUM(uw.balance), 0) INTO wallet_balance
    FROM public.user_wallets uw
    WHERE uw.user_id = NEW.user_id;
    
    -- Process pending maintenance fees
    FOR pending_fee IN 
      SELECT * FROM public.monthly_maintenance_fees
      WHERE user_id = NEW.user_id 
      AND status = 'pending'
      AND fee_amount <= wallet_balance
      ORDER BY due_date ASC
    LOOP
      -- Deduct the fee
      UPDATE public.user_wallets
      SET balance = balance - pending_fee.fee_amount
      WHERE user_id = NEW.user_id
      AND balance >= pending_fee.fee_amount
      AND id = (
        SELECT id FROM public.user_wallets 
        WHERE user_id = NEW.user_id 
        AND balance >= pending_fee.fee_amount
        ORDER BY balance DESC 
        LIMIT 1
      );
      
      -- Mark fee as deducted
      UPDATE public.monthly_maintenance_fees
      SET status = 'deducted',
          deducted_at = now(),
          updated_at = now()
      WHERE id = pending_fee.id;
      
      -- Create transaction record
      INSERT INTO public.wallet_transactions (
        user_id, type, amount, description, status
      ) VALUES (
        NEW.user_id,
        'maintenance_fee',
        pending_fee.fee_amount,
        FORMAT('Monthly maintenance fee for %s (auto-settled)', TO_CHAR(pending_fee.due_date, 'Month YYYY')),
        'completed'
      );
      
      -- Record the fee in transaction_fees table
      INSERT INTO public.transaction_fees (
        transaction_type, amount, fee_amount, user_id
      ) VALUES (
        'monthly_maintenance',
        0,
        pending_fee.fee_amount,
        NEW.user_id
      );
      
      -- Update wallet balance for next iteration
      wallet_balance := wallet_balance - pending_fee.fee_amount;
      
      -- Exit if balance is insufficient for more fees
      IF wallet_balance < 10.0 THEN
        EXIT;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic fee settlement
DROP TRIGGER IF EXISTS trigger_settle_pending_fees ON public.user_wallets;
CREATE TRIGGER trigger_settle_pending_fees
AFTER UPDATE ON public.user_wallets
FOR EACH ROW
EXECUTE FUNCTION public.settle_pending_maintenance_fees();

-- Create trigger for updated_at timestamp
DROP TRIGGER IF EXISTS trigger_monthly_fees_updated_at ON public.monthly_maintenance_fees;
CREATE TRIGGER trigger_monthly_fees_updated_at
BEFORE UPDATE ON public.monthly_maintenance_fees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add unique constraint to fee_configurations if it doesn't exist
ALTER TABLE public.fee_configurations 
ADD CONSTRAINT fee_configurations_transaction_type_key 
UNIQUE (transaction_type);

-- Update fee_configurations to include monthly maintenance fee
INSERT INTO public.fee_configurations (
  transaction_type, fee_type, minimum_fee, maximum_fee, percentage_rate, is_active
) VALUES (
  'monthly_maintenance', 'fixed', 10.0, 10.0, 0, true
) ON CONFLICT (transaction_type) DO UPDATE SET
  fee_type = EXCLUDED.fee_type,
  minimum_fee = EXCLUDED.minimum_fee,
  maximum_fee = EXCLUDED.maximum_fee,
  is_active = EXCLUDED.is_active;