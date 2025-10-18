// @ts-nocheck
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useMemberReputation = (chamaId: string) => {
  return useQuery({
    queryKey: ['member-reputation', chamaId],
    queryFn: async () => {
      console.log('Fetching member reputation for chama:', chamaId);

      const { data, error } = await supabase
        .from('member_reputation')
        .select(`
          *,
          chama_members!inner(
            user_id,
            profiles(full_name)
          )
        `)
        .eq('chama_id', chamaId);

      if (error) {
        console.error('Error fetching member reputation:', error);
        throw error;
      }
      
      console.log('Fetched member reputation:', data);
      return data || [];
    },
    enabled: !!chamaId,
  });
};
