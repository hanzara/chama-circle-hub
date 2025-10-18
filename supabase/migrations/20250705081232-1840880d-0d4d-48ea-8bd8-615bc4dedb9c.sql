
-- Create a function to handle voting
CREATE OR REPLACE FUNCTION cast_vote(vote_id UUID, voter_choice BOOLEAN)
RETURNS VOID AS $$
DECLARE
  vote_record RECORD;
  voter_member_id UUID;
BEGIN
  -- Get the vote record
  SELECT * INTO vote_record FROM chama_votes WHERE id = vote_id;
  
  IF vote_record IS NULL THEN
    RAISE EXCEPTION 'Vote not found';
  END IF;
  
  -- Check if vote is still active
  IF vote_record.status != 'active' OR vote_record.deadline < NOW() THEN
    RAISE EXCEPTION 'Vote is no longer active';
  END IF;
  
  -- Get the voter's member ID
  SELECT cm.id INTO voter_member_id
  FROM chama_members cm
  WHERE cm.user_id = auth.uid() 
    AND cm.chama_id = vote_record.chama_id 
    AND cm.is_active = true;
  
  IF voter_member_id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this chama';
  END IF;
  
  -- Insert or update the vote response
  INSERT INTO vote_responses (vote_id, voter_id, response)
  VALUES (vote_id, auth.uid(), voter_choice)
  ON CONFLICT (vote_id, voter_id)
  DO UPDATE SET response = EXCLUDED.response;
  
  -- Update vote counts
  IF voter_choice THEN
    UPDATE chama_votes 
    SET yes_votes = (
      SELECT COUNT(*) FROM vote_responses 
      WHERE vote_id = cast_vote.vote_id AND response = true
    )
    WHERE id = vote_id;
  ELSE
    UPDATE chama_votes 
    SET no_votes = (
      SELECT COUNT(*) FROM vote_responses 
      WHERE vote_id = cast_vote.vote_id AND response = false
    )
    WHERE id = vote_id;
  END IF;
  
  -- Update both counts to be safe
  UPDATE chama_votes 
  SET 
    yes_votes = (
      SELECT COUNT(*) FROM vote_responses 
      WHERE vote_id = cast_vote.vote_id AND response = true
    ),
    no_votes = (
      SELECT COUNT(*) FROM vote_responses 
      WHERE vote_id = cast_vote.vote_id AND response = false
    )
  WHERE id = vote_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies for vote_responses if they don't exist
CREATE POLICY IF NOT EXISTS "Members can insert their own votes" 
ON vote_responses FOR INSERT 
WITH CHECK (
  voter_id = auth.uid() AND
  vote_id IN (
    SELECT cv.id FROM chama_votes cv
    JOIN chama_members cm ON cv.chama_id = cm.chama_id
    WHERE cm.user_id = auth.uid() AND cm.is_active = true
  )
);

CREATE POLICY IF NOT EXISTS "Members can update their own votes" 
ON vote_responses FOR UPDATE 
USING (voter_id = auth.uid());

-- Add policies for chama_votes
ALTER TABLE chama_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Members can view votes in their chamas" 
ON chama_votes FOR SELECT 
USING (
  chama_id IN (
    SELECT chama_id FROM chama_members 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY IF NOT EXISTS "Members can create votes in their chamas" 
ON chama_votes FOR INSERT 
WITH CHECK (
  initiated_by IN (
    SELECT id FROM chama_members 
    WHERE user_id = auth.uid() AND chama_id = chama_votes.chama_id AND is_active = true
  )
);
