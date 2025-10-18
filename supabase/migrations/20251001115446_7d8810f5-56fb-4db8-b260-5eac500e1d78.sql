-- Fix the trigger to only create chama-specific wallets
CREATE OR REPLACE FUNCTION public.initialize_chama_on_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_member_id UUID;
BEGIN
  -- Add creator as admin member
  INSERT INTO public.chama_members (chama_id, user_id, role, is_active)
  VALUES (NEW.id, NEW.created_by, 'admin', true)
  RETURNING id INTO v_member_id;
  
  -- Create chama central wallet (chama-specific, locked)
  INSERT INTO public.user_wallets_v2 (user_id, chama_id, wallet_type, withdrawal_locked)
  VALUES (NEW.created_by, NEW.id, 'chama_central', true)
  ON CONFLICT (user_id, chama_id, wallet_type) DO NOTHING;
  
  -- Create MGR wallet (chama-specific, unlocked)
  INSERT INTO public.user_wallets_v2 (user_id, chama_id, wallet_type, withdrawal_locked)
  VALUES (NEW.created_by, NEW.id, 'mgr', false)
  ON CONFLICT (user_id, chama_id, wallet_type) DO NOTHING;
  
  -- Create chama-view-only wallet (chama-specific, locked)
  INSERT INTO public.user_wallets_v2 (user_id, chama_id, wallet_type, withdrawal_locked)
  VALUES (NEW.created_by, NEW.id, 'chama_view_only', true)
  ON CONFLICT (user_id, chama_id, wallet_type) DO NOTHING;
  
  -- Create default chama settings
  INSERT INTO public.chama_settings (chama_id, loan_interest_rate, late_payment_penalty, voting_threshold)
  VALUES (NEW.id, 10.0, 5.0, 50.0)
  ON CONFLICT (chama_id) DO NOTHING;
  
  -- Initialize chama metrics
  INSERT INTO public.chama_metrics (chama_id, net_worth, upcoming_contributions_count, pending_votes_count, average_repayment_performance, roi_percentage)
  VALUES (NEW.id, 0, 0, 0, 100.0, 0)
  ON CONFLICT (chama_id) DO NOTHING;
  
  -- Log the creation activity
  INSERT INTO public.chama_activities (chama_id, member_id, activity_type, description)
  VALUES (NEW.id, v_member_id, 'chama_created', FORMAT('Chama "%s" was created', NEW.name));
  
  -- Update member count to 1
  UPDATE public.chamas
  SET current_members = 1
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;