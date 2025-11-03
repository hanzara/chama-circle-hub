-- Create tournaments table
CREATE TABLE public.game_tournaments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  game_type VARCHAR NOT NULL, -- 'trivia', 'prediction', 'simulation'
  tournament_type VARCHAR DEFAULT 'bracket', -- 'bracket', 'league', 'time_trial'
  entry_fee NUMERIC NOT NULL DEFAULT 0,
  prize_pool NUMERIC DEFAULT 0,
  max_participants INTEGER DEFAULT 100,
  current_participants INTEGER DEFAULT 0,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  registration_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR DEFAULT 'upcoming', -- 'upcoming', 'active', 'completed', 'cancelled'
  rules JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tournament participants table
CREATE TABLE public.tournament_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES public.game_tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  registration_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  entry_fee_paid NUMERIC DEFAULT 0,
  current_score INTEGER DEFAULT 0,
  ranking INTEGER,
  eliminated_at TIMESTAMP WITH TIME ZONE,
  prize_amount NUMERIC DEFAULT 0,
  status VARCHAR DEFAULT 'registered' -- 'registered', 'active', 'eliminated', 'winner'
);

-- Create prediction games table
CREATE TABLE public.prediction_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  category VARCHAR NOT NULL, -- 'sports', 'crypto', 'stocks', 'politics', 'events'
  prediction_type VARCHAR NOT NULL, -- 'binary', 'multiple_choice', 'numeric'
  options JSONB NOT NULL, -- Array of prediction options
  correct_answer JSONB,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  resolution_time TIMESTAMP WITH TIME ZONE,
  minimum_bet NUMERIC DEFAULT 10,
  maximum_bet NUMERIC DEFAULT 10000,
  total_pool NUMERIC DEFAULT 0,
  house_edge NUMERIC DEFAULT 0.15, -- 15% house edge
  status VARCHAR DEFAULT 'active', -- 'active', 'closed', 'resolved', 'cancelled'
  source_url TEXT, -- For verification of results
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create prediction bets table
CREATE TABLE public.prediction_bets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prediction_id UUID REFERENCES public.prediction_games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  bet_amount NUMERIC NOT NULL,
  predicted_option JSONB NOT NULL,
  potential_payout NUMERIC,
  actual_payout NUMERIC DEFAULT 0,
  placed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status VARCHAR DEFAULT 'pending' -- 'pending', 'won', 'lost', 'refunded'
);

-- Create financial learning challenges
CREATE TABLE public.learning_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  category VARCHAR NOT NULL, -- 'budgeting', 'investing', 'crypto', 'loans', 'insurance'
  difficulty VARCHAR DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
  questions JSONB NOT NULL, -- Array of questions with options and correct answers
  time_limit INTEGER DEFAULT 300, -- seconds
  reward_points INTEGER DEFAULT 10,
  reward_amount NUMERIC DEFAULT 0, -- actual money reward for completion
  completion_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user challenge completions
CREATE TABLE public.user_challenge_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES public.learning_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  score INTEGER NOT NULL,
  time_taken INTEGER, -- seconds
  answers JSONB, -- User's answers
  points_earned INTEGER DEFAULT 0,
  reward_earned NUMERIC DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- Create live competitions table
CREATE TABLE public.live_competitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  competition_type VARCHAR NOT NULL, -- 'speed_trivia', 'live_prediction', 'simulation_battle'
  entry_fee NUMERIC DEFAULT 0,
  max_players INTEGER DEFAULT 50,
  current_players INTEGER DEFAULT 0,
  game_state JSONB DEFAULT '{}', -- Current game state, questions, etc.
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  status VARCHAR DEFAULT 'waiting', -- 'waiting', 'starting', 'active', 'completed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create live competition players
CREATE TABLE public.live_competition_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id UUID REFERENCES public.live_competitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  current_score INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  final_position INTEGER
);

-- Enable RLS on all tables
ALTER TABLE public.game_tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_competition_players ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Tournaments
CREATE POLICY "Anyone can view active tournaments" ON public.game_tournaments FOR SELECT USING (status IN ('upcoming', 'active'));
CREATE POLICY "Authenticated users can create tournaments" ON public.game_tournaments FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Tournament participants
CREATE POLICY "Anyone can view tournament participants" ON public.tournament_participants FOR SELECT USING (true);
CREATE POLICY "Users can join tournaments" ON public.tournament_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their participation" ON public.tournament_participants FOR UPDATE USING (auth.uid() = user_id);

-- Prediction games
CREATE POLICY "Anyone can view active predictions" ON public.prediction_games FOR SELECT USING (status = 'active');
CREATE POLICY "Admins can manage predictions" ON public.prediction_games FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Prediction bets
CREATE POLICY "Users can view their own bets" ON public.prediction_bets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can place bets" ON public.prediction_bets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Learning challenges
CREATE POLICY "Anyone can view active challenges" ON public.learning_challenges FOR SELECT USING (is_active = true);

-- Challenge completions
CREATE POLICY "Users can view their completions" ON public.user_challenge_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can complete challenges" ON public.user_challenge_completions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Live competitions
CREATE POLICY "Anyone can view live competitions" ON public.live_competitions FOR SELECT USING (true);
CREATE POLICY "Admins can manage live competitions" ON public.live_competitions FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Live competition players
CREATE POLICY "Anyone can view competition players" ON public.live_competition_players FOR SELECT USING (true);
CREATE POLICY "Users can join competitions" ON public.live_competition_players FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON public.game_tournaments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample tournaments
INSERT INTO public.game_tournaments (name, description, game_type, entry_fee, prize_pool, max_participants, start_time, end_time, registration_deadline) VALUES
('Weekly Finance Quiz Championship', 'Test your financial knowledge and win cash prizes!', 'trivia', 50, 2000, 50, now() + interval '2 days', now() + interval '3 days', now() + interval '1 day'),
('Crypto Prediction Challenge', 'Predict Bitcoin price movements for the week', 'prediction', 100, 4000, 100, now() + interval '1 day', now() + interval '8 days', now() + interval '23 hours'),
('Investment Simulation Battle', 'Virtual trading competition with real rewards', 'simulation', 75, 3000, 75, now() + interval '3 days', now() + interval '10 days', now() + interval '2 days');

-- Insert sample prediction games
INSERT INTO public.prediction_games (title, description, category, prediction_type, options, deadline, minimum_bet, maximum_bet, house_edge) VALUES
('Arsenal vs Manchester United Result', 'Predict the outcome of this weekend Premier League match', 'sports', 'multiple_choice', 
 '["Arsenal Win", "Draw", "Manchester United Win"]', now() + interval '3 days', 20, 5000, 0.15),
('Bitcoin Price Next Week', 'Will Bitcoin be above or below $45,000 next Friday?', 'crypto', 'binary', 
 '["Above $45,000", "Below $45,000"]', now() + interval '7 days', 10, 2000, 0.12),
('Kenya GDP Growth This Quarter', 'Predict Kenya GDP growth rate for Q4 2024', 'economy', 'numeric', 
 '{"type": "range", "min": 0, "max": 10, "step": 0.1, "unit": "%"}', now() + interval '30 days', 50, 10000, 0.18);

-- Insert sample learning challenges
INSERT INTO public.learning_challenges (title, description, category, difficulty, questions, time_limit, reward_points, reward_amount) VALUES
('Basic Budgeting Mastery', 'Learn the fundamentals of personal budgeting', 'budgeting', 'beginner', 
 '[{"question": "What percentage of income should go to savings?", "options": ["5%", "10%", "20%", "50%"], "correct": 2}, 
   {"question": "Which expense category should be prioritized?", "options": ["Entertainment", "Food", "Rent", "Shopping"], "correct": 2}]', 
 300, 15, 25),
('Cryptocurrency Basics', 'Understanding digital currencies and blockchain', 'crypto', 'intermediate', 
 '[{"question": "What does HODL mean in crypto?", "options": ["Hold On for Dear Life", "High Order Digital Ledger", "Hash Output Data Link", "None of the above"], "correct": 0},
   {"question": "What is a blockchain?", "options": ["A type of cryptocurrency", "A distributed ledger", "A mining tool", "A wallet"], "correct": 1}]', 
 600, 25, 50),
('Investment Strategies Advanced', 'Advanced concepts in portfolio management', 'investing', 'advanced', 
 '[{"question": "What is dollar-cost averaging?", "options": ["Buying all at once", "Regular fixed investments", "Selling high buying low", "Currency exchange"], "correct": 1},
   {"question": "What is portfolio diversification?", "options": ["Buying one stock", "Spreading investments", "Day trading", "Saving money"], "correct": 1}]', 
 900, 40, 100);