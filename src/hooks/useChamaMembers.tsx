import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useChamaMembers = (chamaId: string) => {
  return useQuery({
    queryKey: ['chama-members', chamaId],
    queryFn: async () => {
      console.log('Fetching members for chama:', chamaId);

      const { data, error } = await supabase
        .from('chama_members')
        .select(`
          *,
          profiles:user_id (full_name, email, phone_number)
        `)
        .eq('chama_id', chamaId)
        .eq('is_active', true)
        .order('joined_at', { ascending: false });

      if (error) {
        console.error('Error fetching chama members:', error);
        throw error;
      }

      console.log('Fetched chama members:', data);
      return data || [];
    },
    enabled: !!chamaId,
  });
};