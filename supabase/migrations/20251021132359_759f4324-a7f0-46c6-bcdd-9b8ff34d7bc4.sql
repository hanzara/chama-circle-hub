-- Create test chamas with varying member counts (2-20 members)
-- Uses existing users from profiles table

DO $$
DECLARE
  member_count INT;
  chama_num INT;
  chama_id_var UUID;
  creator_id UUID := '3b6534ba-9d44-4092-b766-c7f8f8fa63ea';
  user_ids UUID[];
  member_idx INT;
  selected_user_id UUID;
BEGIN
  -- Get all existing user IDs from profiles
  SELECT ARRAY_AGG(user_id) INTO user_ids FROM profiles LIMIT 100;
  
  -- If we don't have enough users, we'll just reuse them
  IF array_length(user_ids, 1) IS NULL OR array_length(user_ids, 1) = 0 THEN
    user_ids := ARRAY[creator_id];
  END IF;

  -- Loop through member counts from 2 to 20
  FOR member_count IN 2..20 LOOP
    -- Create member_count number of chamas with member_count members each
    FOR chama_num IN 1..member_count LOOP
      -- Generate a unique chama ID
      chama_id_var := gen_random_uuid();
      
      -- Create the chama
      INSERT INTO chamas (
        id,
        name,
        description,
        created_by,
        contribution_frequency,
        contribution_amount,
        max_members,
        current_members,
        total_savings,
        status,
        is_marketplace_chama,
        joining_fee,
        require_payment,
        funds_locked
      ) VALUES (
        chama_id_var,
        member_count || '-Member Chama #' || chama_num,
        'Test chama with ' || member_count || ' members - Group ' || chama_num || '. Join to save and borrow together!',
        creator_id,
        CASE (chama_num % 4)
          WHEN 0 THEN 'weekly'
          WHEN 1 THEN 'monthly'
          WHEN 2 THEN 'bi-weekly'
          ELSE 'daily'
        END,
        CASE 
          WHEN member_count <= 5 THEN 50.00
          WHEN member_count <= 10 THEN 100.00
          WHEN member_count <= 15 THEN 200.00
          ELSE 500.00
        END,
        member_count + 5,
        member_count,
        RANDOM() * member_count * 500,
        'active',
        false,
        0.00,
        false,
        false
      );
      
      -- Add members to chama using existing users (cycling through available users)
      FOR member_idx IN 1..member_count LOOP
        -- Select a user ID (cycle through available users)
        selected_user_id := user_ids[((member_count * chama_num + member_idx - 1) % array_length(user_ids, 1)) + 1];
        
        -- Add member to chama (ignore if already exists)
        INSERT INTO chama_members (
          id,
          chama_id,
          user_id,
          role,
          total_contributed,
          joined_at,
          is_active,
          savings_balance,
          mgr_balance,
          merry_balance,
          auto_debit_enabled,
          withdrawal_locked,
          payment_status
        ) VALUES (
          gen_random_uuid(),
          chama_id_var,
          selected_user_id,
          CASE 
            WHEN member_idx = 1 THEN 'admin'
            WHEN member_idx = 2 AND member_count > 3 THEN 'treasurer'
            WHEN member_idx = 3 AND member_count > 5 THEN 'secretary'
            ELSE 'member'
          END,
          RANDOM() * 1000,
          NOW() - (member_idx || ' days')::INTERVAL,
          true,
          RANDOM() * 500,
          0.00,
          0.00,
          false,
          false,
          'paid'
        ) ON CONFLICT DO NOTHING;
      END LOOP;
      
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Created % test chamas successfully!', (2+3+4+5+6+7+8+9+10+11+12+13+14+15+16+17+18+19+20);
END $$;