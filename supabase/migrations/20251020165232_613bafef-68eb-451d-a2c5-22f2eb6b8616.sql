-- Update the newly created chamas to be marketplace chamas with purchase amounts
UPDATE public.chamas
SET 
  is_marketplace_chama = true,
  purchase_amount = CASE 
    WHEN max_members <= 5 THEN 5000
    WHEN max_members <= 10 THEN 10000
    WHEN max_members <= 15 THEN 15000
    WHEN max_members <= 20 THEN 20000
    ELSE 25000
  END
WHERE name LIKE 'Chama Group %-%'
  AND created_at > NOW() - INTERVAL '1 hour';