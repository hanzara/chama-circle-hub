-- Fix function search path security warnings
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  -- Create default routing preferences
  INSERT INTO public.routing_preferences (user_id)
  VALUES (NEW.id);
  
  -- Create default wallet entries for major currencies
  INSERT INTO public.wallets (user_id, currency_code) VALUES
    (NEW.id, 'USD'),
    (NEW.id, 'EUR'),
    (NEW.id, 'GBP'),
    (NEW.id, 'BTC'),
    (NEW.id, 'ETH');
  
  RETURN NEW;
END;
$$;

-- Fix the update function search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;