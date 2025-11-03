
import { supabase as baseSupabase } from '@/integrations/supabase/client';

// Re-export the generated, fully-typed Supabase client
export const supabase = baseSupabase;

// Test connection function using the unified client
export const testSupabaseConnection = async () => {
  try {
    const { error } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });
    return { connected: !error, error };
  } catch (err) {
    return { connected: false, error: err };
  }
};
