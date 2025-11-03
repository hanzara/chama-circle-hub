-- Reset all user wallet balances to 0
UPDATE public.user_wallets 
SET balance = 0;

-- Reset all user central wallet balances to 0
UPDATE public.user_central_wallets 
SET balance = 0;