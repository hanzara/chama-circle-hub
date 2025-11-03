-- Fix critical security issues for admin loan oversight

-- Create user_roles table if it doesn't exist for admin role checking
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_roles') THEN
    CREATE TABLE public.user_roles (
      id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      role text NOT NULL,
      assigned_at timestamp with time zone DEFAULT now(),
      assigned_by uuid REFERENCES auth.users(id),
      is_active boolean DEFAULT true,
      UNIQUE(user_id, role)
    );
    
    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
    
    -- RLS policies for user_roles
    CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Admins can manage all roles" ON public.user_roles
    FOR ALL USING (
      EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true)
    );
  END IF;
END $$;

-- Update the admin loan functions to use proper security
CREATE OR REPLACE FUNCTION public.get_admin_loans_overview()
RETURNS TABLE(
  id uuid,
  borrower_name text,
  borrower_email text,
  borrower_region text,
  loan_amount numeric,
  disbursed_amount numeric,
  repaid_amount numeric,
  remaining_amount numeric,
  interest_rate numeric,
  loan_term_months integer,
  status text,
  risk_rating text,
  credit_score integer,
  repayment_rate numeric,
  created_at timestamp with time zone,
  approved_at timestamp with time zone,
  funded_at timestamp with time zone,
  due_date date,
  days_overdue integer,
  funding_progress numeric,
  loan_purpose text,
  employment_status text,
  monthly_income numeric,
  chama_name text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user has admin role
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  RETURN QUERY
  SELECT 
    la.id,
    la.full_name as borrower_name,
    la.email_address as borrower_email,
    COALESCE(p.region, 'Unknown') as borrower_region,
    la.loan_amount,
    COALESCE(la.disbursed_amount, 0) as disbursed_amount,
    COALESCE(la.repaid_amount, 0) as repaid_amount,
    (COALESCE(la.disbursed_amount, 0) - COALESCE(la.repaid_amount, 0)) as remaining_amount,
    COALESCE(la.interest_rate, 0) as interest_rate,
    la.loan_term_months,
    la.status,
    COALESCE(la.risk_rating, 'medium') as risk_rating,
    COALESCE(p.credit_score, 650) as credit_score,
    COALESCE(la.repayment_rate, 0) as repayment_rate,
    la.created_at,
    la.approved_at,
    la.funded_at,
    la.due_date,
    CASE 
      WHEN la.due_date IS NOT NULL AND la.due_date < CURRENT_DATE AND la.status IN ('active', 'funded')
      THEN EXTRACT(days FROM CURRENT_DATE - la.due_date)::integer
      ELSE 0
    END as days_overdue,
    COALESCE(la.funding_progress, 0) as funding_progress,
    COALESCE(la.loan_purpose, 'General') as loan_purpose,
    COALESCE(la.employment_status, 'Unknown') as employment_status,
    COALESCE(la.monthly_income, 0) as monthly_income,
    'Individual Loan' as chama_name
  FROM public.loan_applications_new la
  LEFT JOIN public.profiles p ON la.borrower_id = p.user_id
  
  UNION ALL
  
  SELECT 
    cl.id,
    COALESCE(p.full_name, au.email) as borrower_name,
    au.email as borrower_email,
    COALESCE(p.region, 'Unknown') as borrower_region,
    cl.amount as loan_amount,
    cl.amount as disbursed_amount,
    COALESCE(cl.repaid_amount, 0) as repaid_amount,
    (cl.amount - COALESCE(cl.repaid_amount, 0)) as remaining_amount,
    COALESCE(cl.interest_rate, 0) as interest_rate,
    cl.duration_months as loan_term_months,
    cl.status,
    'medium' as risk_rating,
    COALESCE(p.credit_score, 650) as credit_score,
    CASE 
      WHEN cl.amount > 0 THEN (COALESCE(cl.repaid_amount, 0) / cl.amount * 100)
      ELSE 0
    END as repayment_rate,
    cl.created_at,
    cl.approved_at,
    cl.approved_at as funded_at,
    cl.due_date,
    CASE 
      WHEN cl.due_date IS NOT NULL AND cl.due_date < CURRENT_DATE AND cl.status IN ('active', 'funded')
      THEN EXTRACT(days FROM CURRENT_DATE - cl.due_date)::integer
      ELSE 0
    END as days_overdue,
    100.0 as funding_progress,
    'Chama Loan' as loan_purpose,
    'Group Member' as employment_status,
    0 as monthly_income,
    COALESCE(c.name, 'Unknown Chama') as chama_name
  FROM public.chama_loans cl
  LEFT JOIN public.chama_members cm ON cl.borrower_id = cm.id
  LEFT JOIN public.chamas c ON cm.chama_id = c.id
  LEFT JOIN auth.users au ON cm.user_id = au.id
  LEFT JOIN public.profiles p ON cm.user_id = p.user_id
  
  ORDER BY created_at DESC;
END;
$$;

-- Update the loan statistics function with proper security
CREATE OR REPLACE FUNCTION public.get_admin_loan_statistics()
RETURNS TABLE(
  total_loans bigint,
  total_volume numeric,
  active_loans bigint,
  pending_loans bigint,
  overdue_loans bigint,
  completed_loans bigint,
  avg_repayment_rate numeric,
  risk_distribution jsonb
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  individual_stats RECORD;
  chama_stats RECORD;
BEGIN
  -- Check if user has admin role
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Get individual loan statistics
  SELECT 
    COUNT(*) as total_count,
    COALESCE(SUM(loan_amount), 0) as total_amount,
    COUNT(CASE WHEN status IN ('active', 'funded') THEN 1 END) as active_count,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN status IN ('active', 'funded') AND due_date < CURRENT_DATE THEN 1 END) as overdue_count,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
    COALESCE(AVG(COALESCE(repayment_rate, 0)), 0) as avg_rate
  INTO individual_stats
  FROM public.loan_applications_new;
  
  -- Get chama loan statistics
  SELECT 
    COUNT(*) as total_count,
    COALESCE(SUM(amount), 0) as total_amount,
    COUNT(CASE WHEN status IN ('active', 'funded') THEN 1 END) as active_count,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN status IN ('active', 'funded') AND due_date < CURRENT_DATE THEN 1 END) as overdue_count,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
    COALESCE(AVG(CASE WHEN amount > 0 THEN (COALESCE(repaid_amount, 0) / amount * 100) ELSE 0 END), 0) as avg_rate
  INTO chama_stats
  FROM public.chama_loans;
  
  -- Return combined statistics
  RETURN QUERY
  SELECT 
    (individual_stats.total_count + chama_stats.total_count) as total_loans,
    (individual_stats.total_amount + chama_stats.total_amount) as total_volume,
    (individual_stats.active_count + chama_stats.active_count) as active_loans,
    (individual_stats.pending_count + chama_stats.pending_count) as pending_loans,
    (individual_stats.overdue_count + chama_stats.overdue_count) as overdue_loans,
    (individual_stats.completed_count + chama_stats.completed_count) as completed_loans,
    CASE 
      WHEN (individual_stats.total_count + chama_stats.total_count) > 0 
      THEN ((individual_stats.avg_rate * individual_stats.total_count + chama_stats.avg_rate * chama_stats.total_count) / (individual_stats.total_count + chama_stats.total_count))
      ELSE 0
    END as avg_repayment_rate,
    jsonb_build_object(
      'low', COALESCE((SELECT COUNT(*) FROM loan_applications_new WHERE risk_rating = 'low'), 0),
      'medium', COALESCE((SELECT COUNT(*) FROM loan_applications_new WHERE risk_rating = 'medium'), 0),
      'high', COALESCE((SELECT COUNT(*) FROM loan_applications_new WHERE risk_rating = 'high'), 0)
    ) as risk_distribution;
END;
$$;

-- Update the admin update loan status function
CREATE OR REPLACE FUNCTION public.admin_update_loan_status(
  p_loan_id uuid,
  p_status text,
  p_rejection_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  loan_record RECORD;
BEGIN
  -- Check if user has admin role
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Unauthorized: Admin access required');
  END IF;
  
  -- Update loan status
  UPDATE public.loan_applications_new 
  SET 
    status = p_status,
    rejection_reason = CASE WHEN p_status = 'rejected' THEN p_rejection_reason ELSE rejection_reason END,
    approved_at = CASE WHEN p_status = 'approved' THEN now() ELSE approved_at END,
    funded_at = CASE WHEN p_status = 'funded' THEN now() ELSE funded_at END,
    disbursed_amount = CASE WHEN p_status = 'funded' THEN loan_amount ELSE disbursed_amount END,
    due_date = CASE WHEN p_status = 'funded' THEN CURRENT_DATE + INTERVAL '1 month' * loan_term_months ELSE due_date END,
    updated_at = now()
  WHERE id = p_loan_id
  RETURNING * INTO loan_record;
  
  IF loan_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Loan not found');
  END IF;
  
  -- Create notification for borrower
  INSERT INTO public.loan_notifications (
    user_id, loan_application_id, notification_type, title, message
  ) VALUES (
    loan_record.borrower_id,
    p_loan_id,
    'status_update',
    FORMAT('Loan Application %s', CASE 
      WHEN p_status = 'approved' THEN 'Approved'
      WHEN p_status = 'rejected' THEN 'Rejected'
      WHEN p_status = 'funded' THEN 'Funded'
      ELSE 'Updated'
    END),
    FORMAT('Your loan application for KES %s has been %s.%s', 
      loan_record.loan_amount::text, 
      p_status,
      CASE WHEN p_rejection_reason IS NOT NULL THEN ' Reason: ' || p_rejection_reason ELSE '' END
    )
  );
  
  RETURN jsonb_build_object('success', true, 'message', 'Loan status updated successfully');
END;
$$;

-- Create a function to make someone an admin (can only be called by existing admins)
CREATE OR REPLACE FUNCTION public.assign_admin_role(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Only admins can assign admin roles');
  END IF;
  
  -- Insert admin role for target user
  INSERT INTO public.user_roles (user_id, role, assigned_by)
  VALUES (target_user_id, 'admin', auth.uid())
  ON CONFLICT (user_id, role) DO UPDATE SET
    is_active = true,
    assigned_at = now(),
    assigned_by = auth.uid();
    
  RETURN jsonb_build_object('success', true, 'message', 'Admin role assigned successfully');
END;
$$;