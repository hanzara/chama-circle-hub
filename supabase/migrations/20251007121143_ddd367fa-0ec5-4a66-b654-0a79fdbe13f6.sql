-- Create or replace trigger function to update chama member count
CREATE OR REPLACE FUNCTION public.update_chama_member_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.is_active = true THEN
    -- Increment member count
    UPDATE public.chamas 
    SET current_members = current_members + 1
    WHERE id = NEW.chama_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle activation/deactivation
    IF OLD.is_active = false AND NEW.is_active = true THEN
      UPDATE public.chamas 
      SET current_members = current_members + 1
      WHERE id = NEW.chama_id;
    ELSIF OLD.is_active = true AND NEW.is_active = false THEN
      UPDATE public.chamas 
      SET current_members = current_members - 1
      WHERE id = NEW.chama_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.is_active = true THEN
    -- Decrement member count
    UPDATE public.chamas 
    SET current_members = current_members - 1
    WHERE id = OLD.chama_id;
    RETURN OLD;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_chama_member_count ON public.chama_members;

-- Create trigger on chama_members table
CREATE TRIGGER trigger_update_chama_member_count
  AFTER INSERT OR UPDATE OR DELETE ON public.chama_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_chama_member_count();