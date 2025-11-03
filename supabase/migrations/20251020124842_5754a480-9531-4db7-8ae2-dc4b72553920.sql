-- Create table for announcement likes
CREATE TABLE IF NOT EXISTS public.chama_announcement_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES public.chama_notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(announcement_id, user_id)
);

-- Create table for announcement comments
CREATE TABLE IF NOT EXISTS public.chama_announcement_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES public.chama_notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for announcement shares
CREATE TABLE IF NOT EXISTS public.chama_announcement_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES public.chama_notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_type TEXT NOT NULL CHECK (share_type IN ('internal', 'external', 'copy_link')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for email subscriptions
CREATE TABLE IF NOT EXISTS public.chama_email_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chama_id UUID NOT NULL REFERENCES public.chamas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_address TEXT NOT NULL,
  subscribed_to_announcements BOOLEAN DEFAULT true,
  subscribed_to_contributions BOOLEAN DEFAULT false,
  subscribed_to_loans BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(chama_id, user_id)
);

-- Enable RLS
ALTER TABLE public.chama_announcement_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chama_announcement_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chama_announcement_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chama_email_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for likes
CREATE POLICY "Users can view likes on announcements in their chamas"
ON public.chama_announcement_likes FOR SELECT
USING (
  announcement_id IN (
    SELECT id FROM public.chama_notifications 
    WHERE chama_id IN (
      SELECT chama_id FROM public.chama_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  )
);

CREATE POLICY "Users can manage their own likes"
ON public.chama_announcement_likes FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for comments
CREATE POLICY "Users can view comments on announcements in their chamas"
ON public.chama_announcement_comments FOR SELECT
USING (
  announcement_id IN (
    SELECT id FROM public.chama_notifications 
    WHERE chama_id IN (
      SELECT chama_id FROM public.chama_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  )
);

CREATE POLICY "Users can create comments on announcements in their chamas"
ON public.chama_announcement_comments FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  announcement_id IN (
    SELECT id FROM public.chama_notifications 
    WHERE chama_id IN (
      SELECT chama_id FROM public.chama_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  )
);

CREATE POLICY "Users can update their own comments"
ON public.chama_announcement_comments FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.chama_announcement_comments FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for shares
CREATE POLICY "Users can view shares on announcements in their chamas"
ON public.chama_announcement_shares FOR SELECT
USING (
  announcement_id IN (
    SELECT id FROM public.chama_notifications 
    WHERE chama_id IN (
      SELECT chama_id FROM public.chama_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  )
);

CREATE POLICY "Users can create shares"
ON public.chama_announcement_shares FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for email subscriptions
CREATE POLICY "Users can view their own email subscriptions"
ON public.chama_email_subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own email subscriptions"
ON public.chama_email_subscriptions FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_announcement_likes_announcement ON public.chama_announcement_likes(announcement_id);
CREATE INDEX idx_announcement_comments_announcement ON public.chama_announcement_comments(announcement_id);
CREATE INDEX idx_announcement_shares_announcement ON public.chama_announcement_shares(announcement_id);
CREATE INDEX idx_email_subscriptions_chama ON public.chama_email_subscriptions(chama_id, user_id);

-- Add trigger for updating comment updated_at
CREATE OR REPLACE FUNCTION update_announcement_comment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_announcement_comment_updated_at
BEFORE UPDATE ON public.chama_announcement_comments
FOR EACH ROW
EXECUTE FUNCTION update_announcement_comment_updated_at();