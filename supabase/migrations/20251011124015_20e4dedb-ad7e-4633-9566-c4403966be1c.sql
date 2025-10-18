-- Add RLS policies for chama_loans table

-- Allow members to insert their own loan applications
CREATE POLICY "Members can create loan applications in their chama"
ON public.chama_loans
FOR INSERT
TO authenticated
WITH CHECK (
  borrower_id IN (
    SELECT id FROM public.chama_members
    WHERE user_id = auth.uid() AND chama_id = chama_loans.chama_id AND is_active = true
  )
);

-- Allow members to view loans in their chama
CREATE POLICY "Members can view loans in their chama"
ON public.chama_loans
FOR SELECT
TO authenticated
USING (
  chama_id IN (
    SELECT chama_id FROM public.chama_members
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Allow admins/treasurers to update loan status
CREATE POLICY "Admins can update loan status"
ON public.chama_loans
FOR UPDATE
TO authenticated
USING (
  is_chama_admin_or_treasurer(chama_id)
);