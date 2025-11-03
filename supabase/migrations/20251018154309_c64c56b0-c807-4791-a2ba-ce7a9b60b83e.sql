-- Check if member_invitations table exists and has the right structure
-- If it doesn't have all needed columns, alter it

-- First, ensure the table has all necessary columns
DO $$ 
BEGIN
  -- Add columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'member_invitations' 
                 AND column_name = 'full_name') THEN
    ALTER TABLE public.member_invitations ADD COLUMN full_name TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'member_invitations' 
                 AND column_name = 'user_id') THEN
    ALTER TABLE public.member_invitations ADD COLUMN user_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Update the status enum to include 'pending_approval' if not already there
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'invitation_status' AND e.enumlabel = 'pending_approval'
  ) THEN
    -- If the enum type exists, add the new value
    ALTER TYPE invitation_status ADD VALUE IF NOT EXISTS 'pending_approval';
  END IF;
EXCEPTION
  WHEN undefined_object THEN
    -- If enum doesn't exist, we'll handle status as text
    NULL;
END $$;

-- Create or replace function to handle guest join request
CREATE OR REPLACE FUNCTION public.submit_join_request(
  p_invitation_token TEXT,
  p_full_name TEXT,
  p_email TEXT,
  p_phone_number TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation RECORD;
  v_chama_name TEXT;
BEGIN
  -- Get the invitation
  SELECT * INTO v_invitation
  FROM public.member_invitations
  WHERE invitation_token = p_invitation_token
    AND status = 'pending';

  IF v_invitation IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid or expired invitation'
    );
  END IF;

  -- Check if invitation already has details submitted
  IF v_invitation.status = 'pending_approval' THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'This invitation has already been used'
    );
  END IF;

  -- Get chama name for notification
  SELECT name INTO v_chama_name
  FROM public.chamas
  WHERE id = v_invitation.chama_id;

  -- Update the invitation with user details
  UPDATE public.member_invitations
  SET 
    full_name = p_full_name,
    email = p_email,
    phone_number = p_phone_number,
    status = 'pending_approval',
    updated_at = now()
  WHERE id = v_invitation.id;

  -- Log activity for admin to see
  INSERT INTO public.chama_activities (
    chama_id,
    activity_type,
    description
  ) VALUES (
    v_invitation.chama_id,
    'join_request',
    FORMAT('%s (%s) has requested to join %s', p_full_name, p_email, v_chama_name)
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Your request has been submitted to the admin for approval'
  );
END;
$$;

-- Create or replace function to approve join request
CREATE OR REPLACE FUNCTION public.approve_join_request(
  p_invitation_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation RECORD;
  v_new_member_id UUID;
  v_chama_name TEXT;
BEGIN
  -- Get the invitation
  SELECT * INTO v_invitation
  FROM public.member_invitations
  WHERE id = p_invitation_id;

  IF v_invitation IS NULL OR v_invitation.status != 'pending_approval' THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid invitation or already processed'
    );
  END IF;

  -- Check if current user is admin of the chama
  IF NOT is_chama_admin(v_invitation.chama_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Only admins can approve join requests'
    );
  END IF;

  -- If the person already has an account (user_id exists), add them directly
  IF v_invitation.user_id IS NOT NULL THEN
    -- Check if they're already a member
    IF EXISTS (
      SELECT 1 FROM public.chama_members
      WHERE chama_id = v_invitation.chama_id
        AND user_id = v_invitation.user_id
    ) THEN
      UPDATE public.member_invitations
      SET status = 'accepted', updated_at = now()
      WHERE id = p_invitation_id;
      
      RETURN jsonb_build_object(
        'success', false,
        'message', 'User is already a member of this chama'
      );
    END IF;

    -- Add them as a member
    INSERT INTO public.chama_members (
      chama_id,
      user_id,
      role,
      is_active
    ) VALUES (
      v_invitation.chama_id,
      v_invitation.user_id,
      COALESCE(v_invitation.role, 'member'),
      true
    ) RETURNING id INTO v_new_member_id;

    -- Update chama member count
    UPDATE public.chamas
    SET current_members = current_members + 1
    WHERE id = v_invitation.chama_id;
  END IF;

  -- Mark invitation as accepted
  UPDATE public.member_invitations
  SET status = 'accepted', updated_at = now()
  WHERE id = p_invitation_id;

  -- Get chama name for activity
  SELECT name INTO v_chama_name
  FROM public.chamas
  WHERE id = v_invitation.chama_id;

  -- Log activity
  INSERT INTO public.chama_activities (
    chama_id,
    member_id,
    activity_type,
    description
  ) VALUES (
    v_invitation.chama_id,
    v_new_member_id,
    'member_approved',
    FORMAT('%s has been approved to join %s', 
      COALESCE(v_invitation.full_name, v_invitation.email), 
      v_chama_name
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Join request approved successfully',
    'member_id', v_new_member_id
  );
END;
$$;

-- Create or replace function to reject join request
CREATE OR REPLACE FUNCTION public.reject_join_request(
  p_invitation_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation RECORD;
BEGIN
  -- Get the invitation
  SELECT * INTO v_invitation
  FROM public.member_invitations
  WHERE id = p_invitation_id;

  IF v_invitation IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid invitation'
    );
  END IF;

  -- Check if current user is admin of the chama
  IF NOT is_chama_admin(v_invitation.chama_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Only admins can reject join requests'
    );
  END IF;

  -- Mark invitation as rejected
  UPDATE public.member_invitations
  SET status = 'rejected', updated_at = now()
  WHERE id = p_invitation_id;

  -- Log activity
  INSERT INTO public.chama_activities (
    chama_id,
    activity_type,
    description
  ) VALUES (
    v_invitation.chama_id,
    'join_request_rejected',
    FORMAT('Join request from %s was rejected', 
      COALESCE(v_invitation.full_name, v_invitation.email, v_invitation.phone_number)
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Join request rejected'
  );
END;
$$;

-- Update RLS policies for member_invitations
DROP POLICY IF EXISTS "Admins can view invitations" ON public.member_invitations;
CREATE POLICY "Admins can view invitations" 
ON public.member_invitations
FOR SELECT
USING (is_chama_admin(chama_id));

DROP POLICY IF EXISTS "Anyone can view invitation by token" ON public.member_invitations;
CREATE POLICY "Anyone can view invitation by token"
ON public.member_invitations
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Anyone can update invitation by token" ON public.member_invitations;
CREATE POLICY "Anyone can update invitation by token"
ON public.member_invitations
FOR UPDATE
USING (status = 'pending')
WITH CHECK (status IN ('pending', 'pending_approval'));