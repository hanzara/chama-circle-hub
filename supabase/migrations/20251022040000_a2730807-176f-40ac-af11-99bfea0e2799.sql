-- Fix infinite recursion by replacing functions without dropping them
-- Drop the redundant policy that causes recursion
DROP POLICY IF EXISTS "Users can view members of their chamas" ON chama_members;

-- Replace functions using CREATE OR REPLACE (no need to drop)
-- Change from SQL to PL/pgSQL to ensure proper RLS bypass with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_chama_member(chama_id_to_check uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.chama_members
    WHERE user_id = auth.uid() 
      AND chama_id = chama_id_to_check 
      AND is_active = true
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_chama_admin(chama_id_to_check uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.chama_members
    WHERE user_id = auth.uid() 
      AND chama_id = chama_id_to_check 
      AND role = 'admin' 
      AND is_active = true
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_chama_admin_or_treasurer(chama_id_to_check uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.chama_members
    WHERE user_id = auth.uid() 
      AND chama_id = chama_id_to_check 
      AND role IN ('admin', 'treasurer') 
      AND is_active = true
  );
END;
$$;