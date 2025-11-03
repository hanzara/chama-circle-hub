-- Create function to find user by email (needed for wallet transfers)
CREATE OR REPLACE FUNCTION public.find_user_by_email(p_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Find user by email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = LOWER(TRIM(p_email))
  LIMIT 1;
  
  RETURN v_user_id;
END;
$$;