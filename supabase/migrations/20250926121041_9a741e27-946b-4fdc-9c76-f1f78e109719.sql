-- Create user_profile_photos table to track profile photos (if not exists)
CREATE TABLE IF NOT EXISTS public.user_profile_photos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_profile_photos
ALTER TABLE public.user_profile_photos ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profile_photos (with IF NOT EXISTS-like behavior)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profile_photos' AND policyname = 'Users can view all profile photos') THEN
    CREATE POLICY "Users can view all profile photos" 
    ON public.user_profile_photos 
    FOR SELECT 
    USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profile_photos' AND policyname = 'Users can insert their own profile photo') THEN
    CREATE POLICY "Users can insert their own profile photo" 
    ON public.user_profile_photos 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profile_photos' AND policyname = 'Users can update their own profile photo') THEN
    CREATE POLICY "Users can update their own profile photo" 
    ON public.user_profile_photos 
    FOR UPDATE 
    USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profile_photos' AND policyname = 'Users can delete their own profile photo') THEN
    CREATE POLICY "Users can delete their own profile photo" 
    ON public.user_profile_photos 
    FOR DELETE 
    USING (auth.uid() = user_id);
  END IF;
END
$$;