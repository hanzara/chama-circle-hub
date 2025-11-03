-- Keep only Acqua Avengers for the current user, convert others to marketplace chamas
-- Handle foreign key constraints properly

-- First, update Acqua Avengers to not be a marketplace chama
UPDATE chamas 
SET is_marketplace_chama = false, 
    purchased_by = '3b6534ba-9d44-4092-b766-c7f8f8fa63ea',
    purchased_at = NOW()
WHERE name = 'Acqua Avengers';

-- Remove user from all other chamas except Acqua Avengers
DELETE FROM chama_members 
WHERE user_id = '3b6534ba-9d44-4092-b766-c7f8f8fa63ea' 
AND chama_id != (SELECT id FROM chamas WHERE name = 'Acqua Avengers' LIMIT 1);

-- Convert all test chamas (except Acqua Avengers and the ones to delete) to marketplace chamas
UPDATE chamas 
SET is_marketplace_chama = true,
    purchased_by = NULL,
    purchased_at = NULL,
    purchase_amount = CASE 
      WHEN max_members <= 5 THEN 500
      WHEN max_members <= 10 THEN 1000
      WHEN max_members <= 15 THEN 2000
      ELSE 5000
    END,
    status = 'active',
    description = COALESCE(description, 'Join this thriving chama community. Save together, grow together!')
WHERE name != 'Acqua Avengers' 
AND name NOT LIKE '%STUDENT%'
AND name NOT LIKE '%VERDIO%'
AND name NOT LIKE '%chama hub%';

-- Delete transactions related to chamas we want to remove
DELETE FROM mpesa_transactions WHERE chama_id IN (
  SELECT id FROM chamas WHERE name LIKE '%STUDENT%' OR name LIKE '%VERDIO%' OR name LIKE '%chama hub%'
);

-- Delete members of chamas we want to remove
DELETE FROM chama_members WHERE chama_id IN (
  SELECT id FROM chamas WHERE name LIKE '%STUDENT%' OR name LIKE '%VERDIO%' OR name LIKE '%chama hub%'
);

-- Now delete the chamas themselves
DELETE FROM chamas WHERE name LIKE '%STUDENT%' OR name LIKE '%VERDIO%' OR name LIKE '%chama hub%';