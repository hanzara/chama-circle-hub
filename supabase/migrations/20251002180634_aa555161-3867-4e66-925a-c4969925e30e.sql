-- Update budget_categories to track allocated and remaining amounts
ALTER TABLE budget_categories 
ADD COLUMN IF NOT EXISTS allocated_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS remaining_balance NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS alert_threshold NUMERIC DEFAULT 20;

-- Update existing records to set allocated_amount = budget_limit and remaining_balance = budget_limit - spent_amount
UPDATE budget_categories 
SET allocated_amount = budget_limit,
    remaining_balance = budget_limit - spent_amount
WHERE allocated_amount = 0;

-- Add new transaction types for budget categories
ALTER TABLE financial_transactions
ADD COLUMN IF NOT EXISTS budget_transaction_type VARCHAR(20) CHECK (budget_transaction_type IN ('spend', 'top_up', 'allocation'));

-- Add M-Pesa payment details
ALTER TABLE financial_transactions
ADD COLUMN IF NOT EXISTS mpesa_till_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS mpesa_paybill_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS mpesa_account_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS mpesa_phone_number VARCHAR(15),
ADD COLUMN IF NOT EXISTS mpesa_receipt_number VARCHAR(50);

-- Create function to update category balance after transaction
CREATE OR REPLACE FUNCTION update_category_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.budget_transaction_type = 'spend' THEN
    UPDATE budget_categories
    SET remaining_balance = remaining_balance - NEW.amount,
        spent_amount = spent_amount + NEW.amount
    WHERE id = (
      SELECT id FROM budget_categories 
      WHERE category = NEW.budget_category 
      AND budget_id = (
        SELECT id FROM user_budgets 
        WHERE user_id = NEW.user_id 
        AND month = DATE_TRUNC('month', NEW.transaction_date)::date
      )
      LIMIT 1
    );
  ELSIF NEW.budget_transaction_type = 'top_up' THEN
    UPDATE budget_categories
    SET remaining_balance = remaining_balance + NEW.amount,
        allocated_amount = allocated_amount + NEW.amount,
        budget_limit = budget_limit + NEW.amount
    WHERE id = (
      SELECT id FROM budget_categories 
      WHERE category = NEW.budget_category 
      AND budget_id = (
        SELECT id FROM user_budgets 
        WHERE user_id = NEW.user_id 
        AND month = DATE_TRUNC('month', NEW.transaction_date)::date
      )
      LIMIT 1
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for category balance updates
DROP TRIGGER IF EXISTS trigger_update_category_balance ON financial_transactions;
CREATE TRIGGER trigger_update_category_balance
AFTER INSERT ON financial_transactions
FOR EACH ROW
WHEN (NEW.budget_transaction_type IS NOT NULL)
EXECUTE FUNCTION update_category_balance();

-- Create budget alerts trigger
CREATE OR REPLACE FUNCTION check_budget_alert()
RETURNS TRIGGER AS $$
DECLARE
  category_record RECORD;
  alert_percentage NUMERIC;
BEGIN
  -- Get category details
  SELECT bc.*, ub.user_id INTO category_record
  FROM budget_categories bc
  JOIN user_budgets ub ON bc.budget_id = ub.id
  WHERE bc.id = (
    SELECT id FROM budget_categories 
    WHERE category = NEW.budget_category 
    AND budget_id = (
      SELECT id FROM user_budgets 
      WHERE user_id = NEW.user_id 
      AND month = DATE_TRUNC('month', NEW.transaction_date)::date
    )
    LIMIT 1
  );

  IF category_record.allocated_amount > 0 THEN
    alert_percentage := (category_record.remaining_balance / category_record.allocated_amount) * 100;
    
    -- Create low balance alert
    IF alert_percentage <= category_record.alert_threshold AND alert_percentage > 0 THEN
      INSERT INTO budget_alerts (user_id, budget_id, category, alert_type, message, percentage_used)
      VALUES (
        NEW.user_id,
        category_record.budget_id,
        NEW.budget_category,
        'low_balance',
        format('%s budget running low: KES %s remaining (%s%% left)', 
          NEW.budget_category, 
          category_record.remaining_balance::text,
          ROUND(alert_percentage, 1)::text
        ),
        ROUND(100 - alert_percentage, 1)
      );
    END IF;

    -- Create depleted alert
    IF category_record.remaining_balance <= 0 THEN
      INSERT INTO budget_alerts (user_id, budget_id, category, alert_type, message, percentage_used)
      VALUES (
        NEW.user_id,
        category_record.budget_id,
        NEW.budget_category,
        'depleted',
        format('%s budget depleted. Please top-up to continue spending.', NEW.budget_category),
        100
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for budget alerts
DROP TRIGGER IF EXISTS trigger_check_budget_alert ON financial_transactions;
CREATE TRIGGER trigger_check_budget_alert
AFTER INSERT ON financial_transactions
FOR EACH ROW
WHEN (NEW.budget_transaction_type = 'spend')
EXECUTE FUNCTION check_budget_alert();