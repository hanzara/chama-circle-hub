-- Add updated_at column to member_invitations table
ALTER TABLE public.member_invitations 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create or replace trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_member_invitation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS set_member_invitations_updated_at ON public.member_invitations;

CREATE TRIGGER set_member_invitations_updated_at
  BEFORE UPDATE ON public.member_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_member_invitation_updated_at();