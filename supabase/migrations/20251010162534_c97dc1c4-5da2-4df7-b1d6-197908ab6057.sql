-- Fix audit_logs_enhanced RLS policies
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs_enhanced;

CREATE POLICY "Admins can view audit logs"
ON public.audit_logs_enhanced
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Allow system to insert audit logs
CREATE POLICY "System can insert audit logs"
ON public.audit_logs_enhanced
FOR INSERT
WITH CHECK (true);

-- Allow users to insert their own audit logs
CREATE POLICY "Users can insert their own audit logs"
ON public.audit_logs_enhanced
FOR INSERT
WITH CHECK (auth.uid() = user_id OR auth.uid() = admin_id);