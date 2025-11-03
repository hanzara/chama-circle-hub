-- Create linked_accounts table for storing user's connected payment methods
CREATE TABLE IF NOT EXISTS public.linked_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_type TEXT NOT NULL CHECK (account_type IN ('mobile_money', 'card', 'bank')),
  provider TEXT NOT NULL,
  account_name TEXT,
  account_number TEXT,
  phone_number TEXT,
  authorization_code TEXT,
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, account_type, account_number)
);

-- Enable RLS
ALTER TABLE public.linked_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own linked accounts"
  ON public.linked_accounts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own linked accounts"
  ON public.linked_accounts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own linked accounts"
  ON public.linked_accounts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own linked accounts"
  ON public.linked_accounts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_linked_accounts_user_id ON public.linked_accounts(user_id);
CREATE INDEX idx_linked_accounts_active ON public.linked_accounts(user_id, is_active) WHERE is_active = true;

-- Add trigger for updated_at
CREATE TRIGGER update_linked_accounts_updated_at
  BEFORE UPDATE ON public.linked_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();