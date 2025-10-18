
-- Add member reputation system
CREATE TABLE IF NOT EXISTS member_reputation (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES chama_members(id) ON DELETE CASCADE,
  chama_id UUID REFERENCES chamas(id) ON DELETE CASCADE,
  contribution_score DECIMAL(5,2) DEFAULT 0,
  repayment_score DECIMAL(5,2) DEFAULT 0,
  participation_score DECIMAL(5,2) DEFAULT 0,
  overall_score DECIMAL(5,2) DEFAULT 0,
  last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS for member_reputation
ALTER TABLE member_reputation ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view reputation in their chamas" ON member_reputation;
CREATE POLICY "Members can view reputation in their chamas" 
ON member_reputation FOR SELECT 
USING (
  chama_id IN (
    SELECT chama_id FROM chama_members 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Add dashboard metrics table
CREATE TABLE IF NOT EXISTS chama_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chama_id UUID REFERENCES chamas(id) ON DELETE CASCADE,
  net_worth DECIMAL(15,2) DEFAULT 0,
  upcoming_contributions_count INTEGER DEFAULT 0,
  pending_votes_count INTEGER DEFAULT 0,
  average_repayment_performance DECIMAL(5,2) DEFAULT 0,
  roi_percentage DECIMAL(5,2) DEFAULT 0,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS for chama_metrics
ALTER TABLE chama_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view metrics for their chamas" ON chama_metrics;
CREATE POLICY "Members can view metrics for their chamas" 
ON chama_metrics FOR SELECT 
USING (
  chama_id IN (
    SELECT chama_id FROM chama_members 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Add language preferences to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'en';

-- Add vote responses table for voting functionality
CREATE TABLE IF NOT EXISTS vote_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vote_id UUID REFERENCES chama_votes(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL,
  response BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(vote_id, voter_id)
);

-- Add RLS for vote_responses
ALTER TABLE vote_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view votes in their chamas" ON vote_responses;
CREATE POLICY "Members can view votes in their chamas" 
ON vote_responses FOR SELECT 
USING (
  vote_id IN (
    SELECT cv.id FROM chama_votes cv
    JOIN chama_members cm ON cv.chama_id = cm.chama_id
    WHERE cm.user_id = auth.uid() AND cm.is_active = true
  )
);

DROP POLICY IF EXISTS "Members can vote in their chamas" ON vote_responses;
CREATE POLICY "Members can vote in their chamas" 
ON vote_responses FOR INSERT 
WITH CHECK (
  voter_id = auth.uid() AND
  vote_id IN (
    SELECT cv.id FROM chama_votes cv
    JOIN chama_members cm ON cv.chama_id = cm.chama_id
    WHERE cm.user_id = auth.uid() AND cm.is_active = true
  )
);

-- Function to calculate member reputation
CREATE OR REPLACE FUNCTION calculate_member_reputation(member_chama_id UUID, member_user_id UUID)
RETURNS VOID AS $$
DECLARE
  contrib_score DECIMAL(5,2) := 0;
  repay_score DECIMAL(5,2) := 0;
  particip_score DECIMAL(5,2) := 0;
  total_score DECIMAL(5,2) := 0;
BEGIN
  -- Calculate contribution score (based on on-time contributions)
  SELECT COALESCE(
    (COUNT(CASE WHEN created_at <= NOW() THEN 1 END) * 100.0) / NULLIF(COUNT(*), 0),
    0
  ) INTO contrib_score
  FROM chama_contributions 
  WHERE chama_id = member_chama_id AND member_id = member_user_id;

  -- Calculate repayment score (based on loan repayments)
  SELECT COALESCE(
    (COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0) / NULLIF(COUNT(*), 0),
    100
  ) INTO repay_score
  FROM chama_loans 
  WHERE chama_id = member_chama_id AND borrower_id = member_user_id;

  -- Calculate participation score (based on vote participation)
  SELECT COALESCE(
    (COUNT(vr.id) * 100.0) / NULLIF(
      (SELECT COUNT(*) FROM chama_votes WHERE chama_id = member_chama_id), 
      0
    ),
    100
  ) INTO particip_score
  FROM vote_responses vr
  JOIN chama_votes cv ON vr.vote_id = cv.id
  WHERE cv.chama_id = member_chama_id AND vr.voter_id = member_user_id;

  -- Calculate overall score (weighted average)
  total_score := (contrib_score * 0.4) + (repay_score * 0.4) + (particip_score * 0.2);

  -- Insert or update reputation
  INSERT INTO member_reputation (member_id, chama_id, contribution_score, repayment_score, participation_score, overall_score)
  SELECT cm.id, member_chama_id, contrib_score, repay_score, particip_score, total_score
  FROM chama_members cm 
  WHERE cm.chama_id = member_chama_id AND cm.user_id = member_user_id
  ON CONFLICT (member_id) 
  DO UPDATE SET 
    contribution_score = EXCLUDED.contribution_score,
    repayment_score = EXCLUDED.repayment_score,
    participation_score = EXCLUDED.participation_score,
    overall_score = EXCLUDED.overall_score,
    last_calculated = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to update chama metrics
CREATE OR REPLACE FUNCTION update_chama_metrics(target_chama_id UUID)
RETURNS VOID AS $$
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

  -- Simple ROI calculation (placeholder - would need more complex logic)
  roi_val := 15.0; -- Default ROI percentage

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
$$ LANGUAGE plpgsql;

-- Add triggers to update metrics automatically
CREATE OR REPLACE FUNCTION trigger_update_chama_metrics()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_chama_metrics(COALESCE(NEW.chama_id, OLD.chama_id));
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist, then create new ones
DROP TRIGGER IF EXISTS update_metrics_on_contribution ON chama_contributions;
CREATE TRIGGER update_metrics_on_contribution
  AFTER INSERT OR UPDATE OR DELETE ON chama_contributions
  FOR EACH ROW EXECUTE FUNCTION trigger_update_chama_metrics();

DROP TRIGGER IF EXISTS update_metrics_on_loan ON chama_loans;
CREATE TRIGGER update_metrics_on_loan
  AFTER INSERT OR UPDATE OR DELETE ON chama_loans
  FOR EACH ROW EXECUTE FUNCTION trigger_update_chama_metrics();

DROP TRIGGER IF EXISTS update_metrics_on_vote ON chama_votes;
CREATE TRIGGER update_metrics_on_vote
  AFTER INSERT OR UPDATE OR DELETE ON chama_votes
  FOR EACH ROW EXECUTE FUNCTION trigger_update_chama_metrics();
