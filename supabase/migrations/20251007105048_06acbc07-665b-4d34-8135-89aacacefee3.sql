-- Fix the trigger function that creates wallets on chama join
-- Remove the ON CONFLICT constraint references that don't exist

CREATE OR REPLACE FUNCTION public.create_user_wallets_on_chama_join_v2()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Create personal wallet if doesn't exist (check first)
  IF NOT EXISTS (
    SELECT 1 FROM public.user_wallets_v2 
    WHERE user_id = NEW.user_id 
    AND wallet_type = 'personal' 
    AND chama_id IS NULL
  ) THEN
    INSERT INTO public.user_wallets_v2 (user_id, wallet_type, withdrawal_locked)
    VALUES (NEW.user_id, 'personal', false);
  END IF;
  
  -- Create chama-view-only wallet (check first)
  IF NOT EXISTS (
    SELECT 1 FROM public.user_wallets_v2 
    WHERE user_id = NEW.user_id 
    AND chama_id = NEW.chama_id 
    AND wallet_type = 'chama_view_only'
  ) THEN
    INSERT INTO public.user_wallets_v2 (user_id, chama_id, wallet_type, withdrawal_locked)
    VALUES (NEW.user_id, NEW.chama_id, 'chama_view_only', true);
  END IF;
  
  -- Create MGR wallet (check first)
  IF NOT EXISTS (
    SELECT 1 FROM public.user_wallets_v2 
    WHERE user_id = NEW.user_id 
    AND chama_id = NEW.chama_id 
    AND wallet_type = 'mgr'
  ) THEN
    INSERT INTO public.user_wallets_v2 (user_id, chama_id, wallet_type, withdrawal_locked)
    VALUES (NEW.user_id, NEW.chama_id, 'mgr', false);
  END IF;
  
  RETURN NEW;
END;
$function$;