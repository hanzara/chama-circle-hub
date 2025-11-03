-- Fix security warnings by setting proper search paths for functions

-- Update handle_new_user function with proper search path
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update update_updated_at_column function with proper search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Update check_game_scheduling_conflict function with proper search path
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;