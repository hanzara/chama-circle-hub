import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useChamaTransactions = (chamaId: string) => {
  return useQuery({
    queryKey: ['chama-transactions', chamaId],
    queryFn: async () => {
      console.log('Fetching transactions for chama:', chamaId);

      const { data, error } = await supabase
        .from('chama_wallet_transactions')
        .select('*')
        .eq('chama_id', chamaId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching chama transactions:', error);
        throw error;
      }

      console.log('Fetched chama transactions:', data);
      return data || [];
    },
    enabled: !!chamaId,
  });
};