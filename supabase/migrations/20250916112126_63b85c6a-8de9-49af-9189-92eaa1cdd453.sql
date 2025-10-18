-- Add missing tables for community networking functionality

-- Add chama_connections table if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'chama_connections') THEN
    CREATE TABLE public.chama_connections (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      initiator_chama_id UUID NOT NULL,
      target_chama_id UUID NOT NULL,
      connection_type TEXT NOT NULL DEFAULT 'follow',
      status TEXT NOT NULL DEFAULT 'pending',
      message TEXT,
      created_by UUID,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      UNIQUE(initiator_chama_id, target_chama_id, connection_type)
    );
    
    -- Enable RLS
    ALTER TABLE public.chama_connections ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Update event_rsvps table if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'event_rsvps') THEN
    CREATE TABLE public.event_rsvps (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      event_id UUID NOT NULL,
      user_id UUID NOT NULL,
      status TEXT NOT NULL DEFAULT 'attending',
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      UNIQUE(event_id, user_id)
    );
    
    -- Enable RLS
    ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create chama_follows table for following functionality
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'chama_follows') THEN
    CREATE TABLE public.chama_follows (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      follower_id UUID NOT NULL,
      chama_id UUID NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      UNIQUE(follower_id, chama_id)
    );
    
    -- Enable RLS
    ALTER TABLE public.chama_follows ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Add RLS policies for chama_connections
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'chama_connections' AND policyname = 'Chama members can view connections involving their chama'
  ) THEN
    CREATE POLICY "Chama members can view connections involving their chama" 
    ON public.chama_connections 
    FOR SELECT 
    USING (
      initiator_chama_id IN (SELECT chama_id FROM chama_members WHERE user_id = auth.uid()) OR
      target_chama_id IN (SELECT chama_id FROM chama_members WHERE user_id = auth.uid())
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'chama_connections' AND policyname = 'Chama admins can create connections'
  ) THEN
    CREATE POLICY "Chama admins can create connections" 
    ON public.chama_connections 
    FOR INSERT 
    WITH CHECK (
      initiator_chama_id IN (
        SELECT chama_id FROM chama_members 
        WHERE user_id = auth.uid() AND role IN ('admin', 'treasurer')
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'chama_connections' AND policyname = 'Target chama admins can update connection status'
  ) THEN
    CREATE POLICY "Target chama admins can update connection status" 
    ON public.chama_connections 
    FOR UPDATE 
    USING (
      target_chama_id IN (
        SELECT chama_id FROM chama_members 
        WHERE user_id = auth.uid() AND role IN ('admin', 'treasurer')
      )
    );
  END IF;
END $$;

-- Add RLS policies for event_rsvps
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'event_rsvps' AND policyname = 'Users can manage their own RSVPs'
  ) THEN
    CREATE POLICY "Users can manage their own RSVPs" 
    ON public.event_rsvps 
    FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'event_rsvps' AND policyname = 'Event creators can view RSVPs for their events'
  ) THEN
    CREATE POLICY "Event creators can view RSVPs for their events" 
    ON public.event_rsvps 
    FOR SELECT 
    USING (
      event_id IN (
        SELECT id FROM community_events WHERE created_by = auth.uid()
      )
    );
  END IF;
END $$;

-- Add RLS policies for chama_follows
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'chama_follows' AND policyname = 'Users can manage their own follows'
  ) THEN
    CREATE POLICY "Users can manage their own follows" 
    ON public.chama_follows 
    FOR ALL 
    USING (auth.uid() = follower_id)
    WITH CHECK (auth.uid() = follower_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'chama_follows' AND policyname = 'Anyone can view follows'
  ) THEN
    CREATE POLICY "Anyone can view follows" 
    ON public.chama_follows 
    FOR SELECT 
    USING (true);
  END IF;
END $$;