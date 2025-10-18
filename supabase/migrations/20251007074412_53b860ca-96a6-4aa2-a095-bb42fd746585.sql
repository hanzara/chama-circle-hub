-- Add wallet balances to chama_members (skip if already exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chama_members' AND column_name='savings_balance') THEN
    ALTER TABLE public.chama_members ADD COLUMN savings_balance DECIMAL(15,2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chama_members' AND column_name='mgr_balance') THEN
    ALTER TABLE public.chama_members ADD COLUMN mgr_balance DECIMAL(15,2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chama_members' AND column_name='mgr_turn_order') THEN
    ALTER TABLE public.chama_members ADD COLUMN mgr_turn_order INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chama_members' AND column_name='mgr_turn_date') THEN
    ALTER TABLE public.chama_members ADD COLUMN mgr_turn_date DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chama_members' AND column_name='withdrawal_locked') THEN
    ALTER TABLE public.chama_members ADD COLUMN withdrawal_locked BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Create notifications table (skip if exists)
CREATE TABLE IF NOT EXISTS public.chama_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chama_id UUID REFERENCES public.chamas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.chama_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.chama_notifications;
CREATE POLICY "Users can view their own notifications" ON public.chama_notifications
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.chama_notifications;
CREATE POLICY "Users can update their own notifications" ON public.chama_notifications
FOR UPDATE USING (auth.uid() = user_id);

-- Create audit logs table (skip if exists)
CREATE TABLE IF NOT EXISTS public.chama_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chama_id UUID REFERENCES public.chamas(id) ON DELETE CASCADE NOT NULL,
  action VARCHAR(100) NOT NULL,
  actor_id UUID NOT NULL,
  target_id UUID,
  old_value TEXT,
  new_value TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.chama_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Chama admins can view audit logs" ON public.chama_audit_logs;
CREATE POLICY "Chama admins can view audit logs" ON public.chama_audit_logs
FOR SELECT USING (is_chama_admin_or_treasurer(chama_id));