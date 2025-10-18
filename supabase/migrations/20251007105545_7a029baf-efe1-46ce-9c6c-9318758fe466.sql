-- Fix the trigger to properly use ON CONFLICT with the specific constraint
CREATE OR REPLACE FUNCTION public.create_user_wallets_on_chama_join_v2()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Create personal wallet if doesn't exist
  INSERT INTO public.user_wallets_v2 (user_id, chama_id, wallet_type, withdrawal_locked)
  VALUES (NEW.user_id, NULL, 'personal', false)
  ON CONFLICT ON CONSTRAINT unique_user_chama_wallet DO NOTHING;
  
  -- Create chama-view-only wallet
  INSERT INTO public.user_wallets_v2 (user_id, chama_id, wallet_type, withdrawal_locked)
  VALUES (NEW.user_id, NEW.chama_id, 'chama_view_only', true)
  ON CONFLICT ON CONSTRAINT unique_user_chama_wallet DO NOTHING;
  
  -- Create MGR wallet
  INSERT INTO public.user_wallets_v2 (user_id, chama_id, wallet_type, withdrawal_locked)
  VALUES (NEW.user_id, NEW.chama_id, 'mgr', false)
  ON CONFLICT ON CONSTRAINT unique_user_chama_wallet DO NOTHING;
  
  RETURN NEW;
END;
$function$;