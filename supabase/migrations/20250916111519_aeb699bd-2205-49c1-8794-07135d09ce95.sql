-- Add username column to profiles table
ALTER TABLE public.profiles ADD COLUMN username TEXT;

-- Create profile-photos storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for profile-photos bucket
INSERT INTO storage.objects (bucket_id, name, owner, metadata) VALUES ('profile-photos', '.emptyFolderPlaceholder', NULL, '{}'::jsonb) ON CONFLICT DO NOTHING;

-- Create policies for profile photos storage
DO $$ BEGIN
  -- Users can view their own profile photos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can view their own profile photos'
  ) THEN
    CREATE POLICY "Users can view their own profile photos" 
    ON storage.objects 
    FOR SELECT 
    USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  -- Users can upload their own profile photos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can upload their own profile photos'
  ) THEN
    CREATE POLICY "Users can upload their own profile photos" 
    ON storage.objects 
    FOR INSERT 
    WITH CHECK (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  -- Users can update their own profile photos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can update their own profile photos'
  ) THEN
    CREATE POLICY "Users can update their own profile photos" 
    ON storage.objects 
    FOR UPDATE 
    USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  -- Users can delete their own profile photos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can delete their own profile photos'
  ) THEN
    CREATE POLICY "Users can delete their own profile photos" 
    ON storage.objects 
    FOR DELETE 
    USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  -- Allow public access to profile photos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Profile photos are publicly accessible'
  ) THEN
    CREATE POLICY "Profile photos are publicly accessible" 
    ON storage.objects 
    FOR SELECT 
    USING (bucket_id = 'profile-photos');
  END IF;
END $$;