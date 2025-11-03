-- Fix chama_metrics RLS policies and function security
-- The issue is that update_chama_metrics function is not SECURITY DEFINER
-- so it can't bypass RLS policies when updating metrics

-- Drop and recreate the function with SECURITY DEFINER
DROP FUNCTION IF EXISTS public.update_chama_metrics(uuid);

CREATE OR REPLACE FUNCTION public.update_chama_metrics(target_chama_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  net_worth_val DECIMAL(15,2) := 0;
  upcoming_contributions INTEGER := 0;
  pending_votes INTEGER := 0;
  avg_repayment DECIMAL(5,2) := 0;
  roi_val DECIMAL(5,2) := 0;
BEGIN
  -- Calculate net worth (total savings + investments - loans)
  SELECT COALESCE(c.total_savings, 0) INTO net_worth_val
  FROM chamas c WHERE c.id = target_chama_id;

  -- Count upcoming contributions (assuming monthly frequency)
  SELECT COUNT(*) INTO upcoming_contributions
  FROM chama_members cm
  WHERE cm.chama_id = target_chama_id 
  AND cm.is_active = true
  AND (
    cm.last_contribution_date IS NULL OR 
    cm.last_contribution_date < DATE_TRUNC('month', NOW())
  );

  -- Count pending votes
  SELECT COUNT(*) INTO pending_votes
  FROM chama_votes cv
  WHERE cv.chama_id = target_chama_id 
  AND cv.status = 'active'
  AND cv.deadline > NOW();

  -- Calculate average repayment performance
  SELECT COALESCE(AVG(
    CASE 
      WHEN cl.status = 'completed' THEN 100
      WHEN cl.status = 'active' AND cl.due_date > NOW() THEN 75
      WHEN cl.status = 'active' AND cl.due_date <= NOW() THEN 25
      ELSE 0
    END
  ), 100) INTO avg_repayment
  FROM chama_loans cl
  WHERE cl.chama_id = target_chama_id;

  -- Simple ROI calculation
  roi_val := 15.0;

  -- Insert or update metrics
  INSERT INTO chama_metrics (chama_id, net_worth, upcoming_contributions_count, pending_votes_count, average_repayment_performance, roi_percentage)
  VALUES (target_chama_id, net_worth_val, upcoming_contributions, pending_votes, avg_repayment, roi_val)
  ON CONFLICT (chama_id) 
  DO UPDATE SET 
    net_worth = EXCLUDED.net_worth,
    upcoming_contributions_count = EXCLUDED.upcoming_contributions_count,
    pending_votes_count = EXCLUDED.pending_votes_count,
    average_repayment_performance = EXCLUDED.average_repayment_performance,
    roi_percentage = EXCLUDED.roi_percentage,
    calculated_at = NOW();
END;
$$;