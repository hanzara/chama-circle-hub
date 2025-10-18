-- Set up comprehensive fee structure with explicit column handling

-- HOME TAB FEES
-- Add Money: 1.5% (min 5, max 50)
INSERT INTO fee_configurations (transaction_type, fee_type, percentage_rate, minimum_fee, maximum_fee, is_active)
VALUES ('add_money', 'percentage', 1.5, 5, 50, true)
ON CONFLICT (transaction_type) 
DO UPDATE SET fee_type = 'percentage', percentage_rate = 1.5, minimum_fee = 5, maximum_fee = 50, is_active = true;

-- Make Contribution: Tiered like M-Pesa (5-25)
INSERT INTO fee_configurations (transaction_type, fee_type, minimum_fee, maximum_fee, tiers, is_active, percentage_rate)
VALUES ('make_contribution', 'tiered', 5, 25, 
  '[{"min": 0, "max": 100, "fee": 5},{"min": 101, "max": 500, "fee": 10},{"min": 501, "max": 1000, "fee": 15},{"min": 1001, "max": 5000, "fee": 20},{"min": 5001, "fee": 25}]'::jsonb, 
  true, 0)
ON CONFLICT (transaction_type)
DO UPDATE SET fee_type = 'tiered', minimum_fee = 5, maximum_fee = 25, percentage_rate = 0,
  tiers = '[{"min": 0, "max": 100, "fee": 5},{"min": 101, "max": 500, "fee": 10},{"min": 501, "max": 1000, "fee": 15},{"min": 1001, "max": 5000, "fee": 20},{"min": 5001, "fee": 25}]'::jsonb, 
  is_active = true;

-- Send Money: KES 10 flat
INSERT INTO fee_configurations (transaction_type, fee_type, minimum_fee, maximum_fee, is_active, percentage_rate)
VALUES ('send_money', 'fixed', 10, 10, true, 0)
ON CONFLICT (transaction_type)
DO UPDATE SET fee_type = 'fixed', minimum_fee = 10, maximum_fee = 10, percentage_rate = 0, is_active = true;

-- Create Chama: KES 20
INSERT INTO fee_configurations (transaction_type, fee_type, minimum_fee, maximum_fee, is_active, percentage_rate)
VALUES ('create_chama', 'fixed', 20, 20, true, 0)
ON CONFLICT (transaction_type)
DO UPDATE SET fee_type = 'fixed', minimum_fee = 20, maximum_fee = 20, percentage_rate = 0, is_active = true;

-- CHAMA TAB FEES
-- Chama Contribution: Tiered (5-25)
INSERT INTO fee_configurations (transaction_type, fee_type, minimum_fee, maximum_fee, tiers, is_active, percentage_rate)
VALUES ('chama_contribution', 'tiered', 5, 25, 
  '[{"min": 0, "max": 100, "fee": 5},{"min": 101, "max": 500, "fee": 10},{"min": 501, "max": 1000, "fee": 15},{"min": 1001, "max": 5000, "fee": 20},{"min": 5001, "fee": 25}]'::jsonb, 
  true, 0)
ON CONFLICT (transaction_type)
DO UPDATE SET fee_type = 'tiered', minimum_fee = 5, maximum_fee = 25, percentage_rate = 0,
  tiers = '[{"min": 0, "max": 100, "fee": 5},{"min": 101, "max": 500, "fee": 10},{"min": 501, "max": 1000, "fee": 15},{"min": 1001, "max": 5000, "fee": 20},{"min": 5001, "fee": 25}]'::jsonb,
  is_active = true;

-- Chama Withdraw: 1.5%
INSERT INTO fee_configurations (transaction_type, fee_type, percentage_rate, minimum_fee, maximum_fee, is_active)
VALUES ('chama_withdraw', 'percentage', 1.5, 5, 50, true)
ON CONFLICT (transaction_type)
DO UPDATE SET fee_type = 'percentage', percentage_rate = 1.5, minimum_fee = 5, maximum_fee = 50, is_active = true;

-- Send to Members: KES 10 flat
INSERT INTO fee_configurations (transaction_type, fee_type, minimum_fee, maximum_fee, is_active, percentage_rate)
VALUES ('send_to_members', 'fixed', 10, 10, true, 0)
ON CONFLICT (transaction_type)
DO UPDATE SET fee_type = 'fixed', minimum_fee = 10, maximum_fee = 10, percentage_rate = 0, is_active = true;

-- Chama Top Up: 1.5%
INSERT INTO fee_configurations (transaction_type, fee_type, percentage_rate, minimum_fee, maximum_fee, is_active)
VALUES ('chama_topup', 'percentage', 1.5, 5, 50, true)
ON CONFLICT (transaction_type)
DO UPDATE SET fee_type = 'percentage', percentage_rate = 1.5, minimum_fee = 5, maximum_fee = 50, is_active = true;

-- Personal Savings Withdraw: 1%
INSERT INTO fee_configurations (transaction_type, fee_type, percentage_rate, minimum_fee, is_active)
VALUES ('personal_savings_withdraw', 'percentage', 1.0, 5, true)
ON CONFLICT (transaction_type)
DO UPDATE SET fee_type = 'percentage', percentage_rate = 1.0, minimum_fee = 5, maximum_fee = NULL, is_active = true;

-- Loan Disbursement: 3%
INSERT INTO fee_configurations (transaction_type, fee_type, percentage_rate, minimum_fee, is_active)
VALUES ('loan_disbursement', 'percentage', 3.0, 10, true)
ON CONFLICT (transaction_type)
DO UPDATE SET fee_type = 'percentage', percentage_rate = 3.0, minimum_fee = 10, maximum_fee = NULL, is_active = true;

-- Loan Withdrawal: 1%
INSERT INTO fee_configurations (transaction_type, fee_type, percentage_rate, minimum_fee, is_active)
VALUES ('loan_withdrawal', 'percentage', 1.0, 5, true)
ON CONFLICT (transaction_type)
DO UPDATE SET fee_type = 'percentage', percentage_rate = 1.0, minimum_fee = 5, maximum_fee = NULL, is_active = true;

-- WALLET TAB FEES
-- Wallet Withdraw Mobile: Tiered (15-50)
INSERT INTO fee_configurations (transaction_type, fee_type, minimum_fee, maximum_fee, tiers, is_active, percentage_rate)
VALUES ('wallet_withdraw_mobile', 'tiered', 15, 50, 
  '[{"min": 0, "max": 500, "fee": 15},{"min": 501, "max": 1000, "fee": 20},{"min": 1001, "max": 2500, "fee": 25},{"min": 2501, "max": 5000, "fee": 35},{"min": 5001, "fee": 50}]'::jsonb, 
  true, 0)
ON CONFLICT (transaction_type)
DO UPDATE SET fee_type = 'tiered', minimum_fee = 15, maximum_fee = 50, percentage_rate = 0,
  tiers = '[{"min": 0, "max": 500, "fee": 15},{"min": 501, "max": 1000, "fee": 20},{"min": 1001, "max": 2500, "fee": 25},{"min": 2501, "max": 5000, "fee": 35},{"min": 5001, "fee": 50}]'::jsonb,
  is_active = true;

-- Wallet Send: Tiered (5-15)
INSERT INTO fee_configurations (transaction_type, fee_type, minimum_fee, maximum_fee, tiers, is_active, percentage_rate)
VALUES ('wallet_send', 'tiered', 5, 15, 
  '[{"min": 0, "max": 500, "fee": 5},{"min": 501, "max": 2000, "fee": 10},{"min": 2001, "fee": 15}]'::jsonb, 
  true, 0)
ON CONFLICT (transaction_type)
DO UPDATE SET fee_type = 'tiered', minimum_fee = 5, maximum_fee = 15, percentage_rate = 0,
  tiers = '[{"min": 0, "max": 500, "fee": 5},{"min": 501, "max": 2000, "fee": 10},{"min": 2001, "fee": 15}]'::jsonb,
  is_active = true;

-- Chat Transaction: KES 2 flat
INSERT INTO fee_configurations (transaction_type, fee_type, minimum_fee, maximum_fee, is_active, percentage_rate)
VALUES ('chat_transaction', 'fixed', 2, 2, true, 0)
ON CONFLICT (transaction_type)
DO UPDATE SET fee_type = 'fixed', minimum_fee = 2, maximum_fee = 2, percentage_rate = 0, is_active = true;

-- PERSONAL SAVINGS TAB FEES
-- Savings Deposit: 1%
INSERT INTO fee_configurations (transaction_type, fee_type, percentage_rate, minimum_fee, is_active)
VALUES ('savings_deposit', 'percentage', 1.0, 5, true)
ON CONFLICT (transaction_type)
DO UPDATE SET fee_type = 'percentage', percentage_rate = 1.0, minimum_fee = 5, maximum_fee = NULL, is_active = true;

-- Peer Lending: 2%
INSERT INTO fee_configurations (transaction_type, fee_type, percentage_rate, minimum_fee, is_active)
VALUES ('peer_lending', 'percentage', 2.0, 5, true)
ON CONFLICT (transaction_type)
DO UPDATE SET fee_type = 'percentage', percentage_rate = 2.0, minimum_fee = 5, maximum_fee = NULL, is_active = true;

-- Budget Expense: Tiered (2-10)
INSERT INTO fee_configurations (transaction_type, fee_type, minimum_fee, maximum_fee, tiers, is_active, percentage_rate)
VALUES ('budget_expense', 'tiered', 2, 10, 
  '[{"min": 0, "max": 100, "fee": 2},{"min": 101, "max": 500, "fee": 5},{"min": 501, "fee": 10}]'::jsonb, 
  true, 0)
ON CONFLICT (transaction_type)
DO UPDATE SET fee_type = 'tiered', minimum_fee = 2, maximum_fee = 10, percentage_rate = 0,
  tiers = '[{"min": 0, "max": 100, "fee": 2},{"min": 101, "max": 500, "fee": 5},{"min": 501, "fee": 10}]'::jsonb,
  is_active = true;

-- DEALS & BILLS TAB FEES
-- Bill Payment: Tiered (5-15)
INSERT INTO fee_configurations (transaction_type, fee_type, minimum_fee, maximum_fee, tiers, is_active, percentage_rate)
VALUES ('bill_payment', 'tiered', 5, 15, 
  '[{"min": 0, "max": 500, "fee": 5},{"min": 501, "max": 1000, "fee": 10},{"min": 1001, "fee": 15}]'::jsonb, 
  true, 0)
ON CONFLICT (transaction_type)
DO UPDATE SET fee_type = 'tiered', minimum_fee = 5, maximum_fee = 15, percentage_rate = 0,
  tiers = '[{"min": 0, "max": 500, "fee": 5},{"min": 501, "max": 1000, "fee": 10},{"min": 1001, "fee": 15}]'::jsonb,
  is_active = true;

-- WI-FI ACCESS FEES
-- WiFi Purchase: 10%
INSERT INTO fee_configurations (transaction_type, fee_type, percentage_rate, minimum_fee, is_active)
VALUES ('wifi_purchase', 'percentage', 10.0, 2, true)
ON CONFLICT (transaction_type)
DO UPDATE SET fee_type = 'percentage', percentage_rate = 10.0, minimum_fee = 2, maximum_fee = NULL, is_active = true;

-- WiFi Top Up: 1.5%
INSERT INTO fee_configurations (transaction_type, fee_type, percentage_rate, minimum_fee, maximum_fee, is_active)
VALUES ('wifi_topup', 'percentage', 1.5, 5, 50, true)
ON CONFLICT (transaction_type)
DO UPDATE SET fee_type = 'percentage', percentage_rate = 1.5, minimum_fee = 5, maximum_fee = 50, is_active = true;

-- TRIVIA FUN TAB FEES
-- Game Deposit: 2%
INSERT INTO fee_configurations (transaction_type, fee_type, percentage_rate, minimum_fee, is_active)
VALUES ('game_deposit', 'percentage', 2.0, 5, true)
ON CONFLICT (transaction_type)
DO UPDATE SET fee_type = 'percentage', percentage_rate = 2.0, minimum_fee = 5, maximum_fee = NULL, is_active = true;

-- Game Withdraw: 1.5%
INSERT INTO fee_configurations (transaction_type, fee_type, percentage_rate, minimum_fee, is_active)
VALUES ('game_withdraw', 'percentage', 1.5, 5, true)
ON CONFLICT (transaction_type)
DO UPDATE SET fee_type = 'percentage', percentage_rate = 1.5, minimum_fee = 5, maximum_fee = NULL, is_active = true;