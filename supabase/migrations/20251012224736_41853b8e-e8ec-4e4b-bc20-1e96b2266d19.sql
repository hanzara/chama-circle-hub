-- =====================================================
-- CRITICAL SECURITY FIXES - Part 1
-- =====================================================

-- Fix 1: Enable RLS on tables that have it disabled

-- Enable RLS on audit_logs (has policies but RLS disabled)
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on chama_contributions (old table, has policies)
ALTER TABLE IF EXISTS public.chama_contributions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on chama_votes (has policies but RLS disabled)
ALTER TABLE IF EXISTS public.chama_votes ENABLE ROW LEVEL SECURITY;

-- Enable RLS on chama_categories (reference table)
ALTER TABLE IF EXISTS public.chama_categories ENABLE ROW LEVEL SECURITY;

-- Fix 2: Add search_path to critical security functions (preserves dependencies)

-- Fix has_role function - keep existing parameter names
CREATE OR REPLACE FUNCTION public.has_role(user_id_param uuid, role_param text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = user_id_param AND role = role_param
  );
$$;

-- Fix is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- Fix is_chama_member function
CREATE OR REPLACE FUNCTION public.is_chama_member(chama_id_to_check uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chama_members
    WHERE user_id = auth.uid() AND chama_id = chama_id_to_check AND is_active = true
  );
$$;

-- Fix is_chama_admin function
CREATE OR REPLACE FUNCTION public.is_chama_admin(chama_id_to_check uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chama_members
    WHERE user_id = auth.uid() AND chama_id = chama_id_to_check AND role = 'admin' AND is_active = true
  );
$$;

-- Fix is_chama_admin_or_treasurer function
CREATE OR REPLACE FUNCTION public.is_chama_admin_or_treasurer(chama_id_to_check uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chama_members
    WHERE user_id = auth.uid() AND chama_id = chama_id_to_check AND role IN ('admin', 'treasurer') AND is_active = true
  );
$$;

-- Fix 3: Add RLS policies for newly enabled tables (only if not exists)

DO $$ 
BEGIN
    -- Policies for chama_categories
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' 
        AND tablename = 'chama_categories' AND policyname = 'Anyone can view chama categories'
    ) THEN
        CREATE POLICY "Anyone can view chama categories"
        ON public.chama_categories FOR SELECT USING (true);
    END IF;

    -- Policies for chama_votes
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' 
        AND tablename = 'chama_votes' AND policyname = 'Members can view votes in their chamas'
    ) THEN
        CREATE POLICY "Members can view votes in their chamas"
        ON public.chama_votes FOR SELECT USING (is_chama_member(chama_id));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' 
        AND tablename = 'chama_votes' AND policyname = 'Admins can create votes in their chamas'
    ) THEN
        CREATE POLICY "Admins can create votes in their chamas"
        ON public.chama_votes FOR INSERT WITH CHECK (is_chama_admin_or_treasurer(chama_id));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' 
        AND tablename = 'chama_votes' AND policyname = 'Admins can update votes in their chamas'
    ) THEN
        CREATE POLICY "Admins can update votes in their chamas"
        ON public.chama_votes FOR UPDATE USING (is_chama_admin_or_treasurer(chama_id));
    END IF;

    -- Policies for audit_logs
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' 
        AND tablename = 'audit_logs' AND policyname = 'Admins can view all audit logs'
    ) THEN
        CREATE POLICY "Admins can view all audit logs"
        ON public.audit_logs FOR SELECT USING (is_admin());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' 
        AND tablename = 'audit_logs' AND policyname = 'System can insert audit logs'
    ) THEN
        CREATE POLICY "System can insert audit logs"
        ON public.audit_logs FOR INSERT WITH CHECK (true);
    END IF;

    -- Policies for chama_contributions
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' 
        AND tablename = 'chama_contributions' AND policyname = 'Members can view contributions in their chama'
    ) THEN
        CREATE POLICY "Members can view contributions in their chama"
        ON public.chama_contributions FOR SELECT USING (is_chama_member(chama_id));
    END IF;
END $$;