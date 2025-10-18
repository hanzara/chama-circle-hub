-- Update game entry fees to be more user-friendly
UPDATE fee_configurations 
SET 
  percentage_rate = 5.0,
  minimum_fee = 2.0,
  maximum_fee = 20.0,
  updated_at = now()
WHERE transaction_type = 'game_entry';

-- Update existing tournaments to have lower entry fees
UPDATE game_tournaments 
SET 
  entry_fee = CASE 
    WHEN entry_fee >= 100 THEN 25
    WHEN entry_fee >= 75 THEN 20
    WHEN entry_fee >= 50 THEN 15
    ELSE 10
  END,
  updated_at = now()
WHERE status = 'upcoming';