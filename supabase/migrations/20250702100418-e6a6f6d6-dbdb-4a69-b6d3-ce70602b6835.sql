
-- Create member invitations table
CREATE TABLE IF NOT EXISTS public.member_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chama_id UUID REFERENCES public.chamas(id) ON DELETE CASCADE NOT NULL,
  invited_by UUID NOT NULL,
  email TEXT,
  phone_number TEXT,
  invitation_token UUID NOT NULL DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(chama_id, email),
  UNIQUE(chama_id, phone_number)
);

-- Enable RLS on member_invitations
ALTER TABLE public.member_invitations ENABLE ROW LEVEL SECURITY;

-- Policy for chama members to create invitations
CREATE POLICY "Chama members can create invitations" ON public.member_invitations
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chama_members 
    WHERE chama_id = member_invitations.chama_id 
    AND user_id = auth.uid() 
    AND is_active = true
  )
);

-- Policy for chama members to view invitations
CREATE POLICY "Chama members can view invitations" ON public.member_invitations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.chama_members 
    WHERE chama_id = member_invitations.chama_id 
    AND user_id = auth.uid() 
    AND is_active = true
  )
);

-- Policy for updating invitation status
CREATE POLICY "Users can accept invitations" ON public.member_invitations
FOR UPDATE USING (true);

-- Create function to accept invitation and join chama
CREATE OR REPLACE FUNCTION public.accept_chama_invitation(invitation_token UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_record RECORD;
  new_member_id UUID;
  result JSONB;
BEGIN
  -- Get invitation details
  SELECT * INTO invitation_record
  FROM public.member_invitations
  WHERE invitation_token = accept_chama_invitation.invitation_token
  AND status = 'pending'
  AND expires_at > NOW();
  
  IF invitation_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid or expired invitation');
  END IF;
  
  -- Check if user is already a member
  IF EXISTS (
    SELECT 1 FROM public.chama_members 
    WHERE chama_id = invitation_record.chama_id 
    AND user_id = auth.uid()
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'You are already a member of this chama');
  END IF;
  
  -- Add user to chama
  INSERT INTO public.chama_members (chama_id, user_id, role, is_active)
  VALUES (invitation_record.chama_id, auth.uid(), 'member', true)
  RETURNING id INTO new_member_id;
  
  -- Update invitation status
  UPDATE public.member_invitations
  SET status = 'accepted', accepted_at = NOW()
  WHERE id = invitation_record.id;
  
  -- Update chama member count
  UPDATE public.chamas
  SET current_members = current_members + 1
  WHERE id = invitation_record.chama_id;
  
  -- Log activity
  INSERT INTO public.chama_activities (chama_id, member_id, activity_type, description)
  VALUES (
    invitation_record.chama_id,
    new_member_id,
    'member_joined',
    'New member joined via invitation'
  );
  
  RETURN jsonb_build_object('success', true, 'message', 'Successfully joined the chama');
END;
$$;

-- Update M-Pesa callbacks table to handle real payments
ALTER TABLE IF EXISTS public.mpesa_callbacks ADD COLUMN IF NOT EXISTS chama_id UUID REFERENCES public.chamas(id);
ALTER TABLE IF EXISTS public.mpesa_callbacks ADD COLUMN IF NOT EXISTS contribution_id UUID;
