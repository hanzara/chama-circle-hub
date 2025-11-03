
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useChamaMetrics = (chamaId: string) => {
  return useQuery({
    queryKey: ['chama-metrics', chamaId],
    queryFn: async () => {
      console.log('Fetching chama metrics for:', chamaId);

      const { data, error } = await (supabase as any)
        .from('chama_metrics')
        .select('*')
        .eq('chama_id', chamaId)
        .single();

      if (error) {
        console.error('Error fetching chama metrics:', error);
        // Return default metrics if none exist
        return {
          net_worth: 0,
          upcoming_contributions_count: 0,
          pending_votes_count: 0,
          average_repayment_performance: 100,
          roi_percentage: 0
        };
      }
      
      console.log('Fetched chama metrics:', data);
      return data;
    },
    enabled: !!chamaId,
  });
};
