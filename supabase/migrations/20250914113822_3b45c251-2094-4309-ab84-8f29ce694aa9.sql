-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  phone TEXT,
  balance INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  total_earnings INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  premium_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create game categories table
CREATE TABLE public.game_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  entry_fee INTEGER NOT NULL,
  max_winnings INTEGER NOT NULL,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scheduled games table
CREATE TABLE public.scheduled_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.game_categories(id),
  title TEXT NOT NULL,
  description TEXT,
  scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
  scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
  registration_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  max_players INTEGER DEFAULT 100,
  min_players INTEGER DEFAULT 2,
  entry_fee INTEGER NOT NULL,
  max_winnings INTEGER NOT NULL,
  prize_pool INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'registering', 'running', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create game registrations table
CREATE TABLE public.game_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.scheduled_games(id),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  entry_fee_paid INTEGER NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(game_id, user_id)
);

-- Create game sessions table (for actual gameplay)
CREATE TABLE public.game_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.scheduled_games(id),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  score INTEGER DEFAULT 0,
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  completion_time INTEGER, -- in seconds
  final_rank INTEGER,
  earnings INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(game_id, user_id)
);

-- Create wallet transactions table
CREATE TABLE public.wallet_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'game_entry', 'game_winnings', 'subscription')),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  game_id UUID REFERENCES public.scheduled_games(id),
  reference_id TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  plan_type TEXT NOT NULL DEFAULT 'premium',
  amount_paid INTEGER NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for game categories (public read)
CREATE POLICY "Anyone can view game categories" ON public.game_categories
  FOR SELECT USING (true);

-- Create RLS policies for scheduled games (public read)
CREATE POLICY "Anyone can view scheduled games" ON public.scheduled_games
  FOR SELECT USING (true);

-- Create RLS policies for game registrations
CREATE POLICY "Users can view their own registrations" ON public.game_registrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can register for games" ON public.game_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for game sessions
CREATE POLICY "Users can view their own game sessions" ON public.game_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own game sessions" ON public.game_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own game sessions" ON public.game_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for wallet transactions
CREATE POLICY "Users can view their own transactions" ON public.wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" ON public.wallet_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scheduled_games_updated_at
  BEFORE UPDATE ON public.scheduled_games
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default game categories
INSERT INTO public.game_categories (name, description, entry_fee, max_winnings, is_premium) VALUES
  ('Finance', 'Test your knowledge of personal finance, investing, and money management', 20, 80, false),
  ('Business', 'Entrepreneurship, startups, and business strategy questions', 50, 200, false),
  ('Technology', 'Latest tech trends, programming, and digital innovation', 15, 60, false),
  ('General', 'Mixed topics for casual players', 10, 35, false),
  ('Premium Finance', 'Advanced financial concepts and investment strategies', 100, 350, true),
  ('Premium Business', 'High-level business strategy and market analysis', 150, 500, true);

-- Create function to check for scheduling conflicts
CREATE OR REPLACE FUNCTION public.check_game_scheduling_conflict(
  p_user_id UUID,
  p_game_start TIMESTAMP WITH TIME ZONE,
  p_game_end TIMESTAMP WITH TIME ZONE,
  p_exclude_game_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO conflict_count
  FROM public.game_registrations gr
  JOIN public.scheduled_games sg ON gr.game_id = sg.id
  WHERE gr.user_id = p_user_id
    AND sg.id != COALESCE(p_exclude_game_id, '00000000-0000-0000-0000-000000000000'::UUID)
    AND (
      (sg.scheduled_start <= p_game_start AND sg.scheduled_end > p_game_start) OR
      (sg.scheduled_start < p_game_end AND sg.scheduled_end >= p_game_end) OR
      (sg.scheduled_start >= p_game_start AND sg.scheduled_end <= p_game_end)
    );
  
  RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;