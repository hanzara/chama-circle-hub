-- Seed chamas with varying member counts (2-25)
-- For N members, create N chamas with N members each

DO $$
DECLARE
  member_count INT;
  chama_count INT;
  j INT;
  new_chama_id UUID;
  sample_user_id UUID;
  creator_user_id UUID;
  user_ids UUID[];
  selected_users UUID[];
BEGIN
  -- Get a sample user ID to use as creator (first user in the system)
  SELECT id INTO creator_user_id FROM auth.users LIMIT 1;
  
  IF creator_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found in the system. Please create users first.';
  END IF;

  -- Get all user IDs for distribution
  SELECT ARRAY_AGG(id) INTO user_ids FROM auth.users;

  -- Loop through member counts from 2 to 25
  FOR member_count IN 2..25 LOOP
    -- For each member count, create that many chamas
    FOR chama_count IN 1..member_count LOOP
      -- Create the chama
      INSERT INTO public.chamas (
        name,
        description,
        contribution_amount,
        contribution_frequency,
        max_members,
        created_by,
        status,
        current_members,
        total_savings
      ) VALUES (
        FORMAT('Chama Group %s-%s', member_count, chama_count),
        FORMAT('A community savings group with %s members focused on mutual financial growth and support', member_count),
        CASE 
          WHEN member_count <= 5 THEN 500
          WHEN member_count <= 10 THEN 1000
          WHEN member_count <= 15 THEN 1500
          ELSE 2000
        END,
        'monthly',
        member_count,
        creator_user_id,
        'active',
        member_count,
        member_count * CASE 
          WHEN member_count <= 5 THEN 500
          WHEN member_count <= 10 THEN 1000
          WHEN member_count <= 15 THEN 1500
          ELSE 2000
        END
      ) RETURNING id INTO new_chama_id;

      -- Reset selected users array for this chama
      selected_users := ARRAY[creator_user_id];

      -- Add the creator as admin
      INSERT INTO public.chama_members (
        chama_id,
        user_id,
        role,
        is_active,
        total_contributed,
        last_contribution_date
      ) VALUES (
        new_chama_id,
        creator_user_id,
        'admin',
        true,
        CASE 
          WHEN member_count <= 5 THEN 500
          WHEN member_count <= 10 THEN 1000
          WHEN member_count <= 15 THEN 1500
          ELSE 2000
        END,
        NOW() - INTERVAL '1 day'
      );

      -- Add additional members (member_count - 1 more members)
      FOR j IN 2..member_count LOOP
        -- Get a random user ID that hasn't been added to this chama yet
        SELECT id INTO sample_user_id 
        FROM auth.users 
        WHERE id != ALL(selected_users)
        ORDER BY RANDOM() 
        LIMIT 1;
        
        -- If not enough unique users exist, reuse the creator
        IF sample_user_id IS NULL THEN
          sample_user_id := creator_user_id;
        ELSE
          selected_users := array_append(selected_users, sample_user_id);
        END IF;

        -- Check if this user is already a member before inserting
        IF NOT EXISTS (
          SELECT 1 FROM public.chama_members 
          WHERE chama_id = new_chama_id AND user_id = sample_user_id
        ) THEN
          INSERT INTO public.chama_members (
            chama_id,
            user_id,
            role,
            is_active,
            total_contributed,
            last_contribution_date
          ) VALUES (
            new_chama_id,
            sample_user_id,
            CASE 
              WHEN j = 2 THEN 'treasurer'
              WHEN j = 3 THEN 'secretary'
              ELSE 'member'
            END,
            true,
            CASE 
              WHEN member_count <= 5 THEN 500
              WHEN member_count <= 10 THEN 1000
              WHEN member_count <= 15 THEN 1500
              ELSE 2000
            END,
            NOW() - INTERVAL '1 day'
          );
        END IF;
      END LOOP;

      -- Create some sample contributions for the chama
      INSERT INTO public.chama_contributions_new (
        chama_id,
        member_id,
        amount,
        status,
        payment_method,
        notes
      )
      SELECT 
        new_chama_id,
        cm.id,
        CASE 
          WHEN member_count <= 5 THEN 500
          WHEN member_count <= 10 THEN 1000
          WHEN member_count <= 15 THEN 1500
          ELSE 2000
        END,
        'completed',
        'mobile_money',
        'Initial contribution'
      FROM public.chama_members cm
      WHERE cm.chama_id = new_chama_id
      LIMIT 1;

    END LOOP;
  END LOOP;

  RAISE NOTICE 'Successfully created chamas with member counts 2-25 (total: % chamas)', (2+3+4+5+6+7+8+9+10+11+12+13+14+15+16+17+18+19+20+21+22+23+24+25);
END $$;