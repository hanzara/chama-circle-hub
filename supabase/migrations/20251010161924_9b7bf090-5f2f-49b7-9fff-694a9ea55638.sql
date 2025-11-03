-- Verify user_pins table structure and add helper function
-- Check if user has PIN set up
CREATE OR REPLACE FUNCTION public.has_pin_setup(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_pins WHERE user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Improved PIN verification with better error handling
CREATE OR REPLACE FUNCTION public.verify_user_pin_v2(p_user_id UUID, p_pin TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  stored_hash TEXT;
  stored_salt TEXT;
  computed_hash TEXT;
BEGIN
  -- Get stored PIN hash and salt
  SELECT pin_hash, salt INTO stored_hash, stored_salt
  FROM public.user_pins
  WHERE user_id = p_user_id;
  
  -- If no PIN found, return false
  IF stored_hash IS NULL THEN
    RAISE NOTICE 'No PIN found for user %', p_user_id;
    RETURN FALSE;
  END IF;
  
  -- Compute hash with provided PIN
  computed_hash := encode(digest(stored_salt || p_pin, 'sha256'), 'hex');
  
  -- Log for debugging (remove in production)
  RAISE NOTICE 'Comparing hashes for user %: % vs %', p_user_id, computed_hash, stored_hash;
  
  -- Return comparison result
  RETURN computed_hash = stored_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;