-- Create user roles if not exists and add admin role checking
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
    CREATE TABLE public.user_roles (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
      is_primary BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      UNIQUE(user_id, role)
    );
    
    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view their own roles" ON public.user_roles
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Only admins can manage roles" ON public.user_roles
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.user_roles 
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

-- Create function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(user_id_param UUID, role_param TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = user_id_param AND role = role_param
  );
$$;

-- Create function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- Trigger to create default user role on profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.user_id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();