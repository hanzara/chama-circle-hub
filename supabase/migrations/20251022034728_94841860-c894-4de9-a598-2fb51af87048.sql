-- Fix infinite recursion in chama_members RLS policies

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Users can view chama members" ON chama_members;

-- Create a security definer function to check if user is a paid member of a chama
CREATE OR REPLACE FUNCTION public.is_paid_chama_member(p_chama_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM chama_members
    WHERE chama_id = p_chama_id
      AND user_id = auth.uid()
      AND is_active = true
      AND payment_status = 'paid'
  );
$$;

-- Recreate the policy using the security definer function
CREATE POLICY "Users can view chama members"
ON chama_members
FOR SELECT
USING (
  is_paid_chama_member(chama_id) OR is_active = true
);