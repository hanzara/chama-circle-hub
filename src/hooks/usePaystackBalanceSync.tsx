import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const usePaystackBalanceSync = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const syncBalance = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error('User must be authenticated to sync balance');
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const { data, error } = await supabase.functions.invoke('sync-paystack-balance', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: { user_id: user.id }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to sync balance');

      return data;
    },
    onSuccess: (data) => {
      // Invalidate all wallet-related queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['user-central-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['realtime-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      toast({
        title: "✅ Balance Synced",
        description: `Your Paystack balance of ${data.currency} ${data.balance.toLocaleString()} has been synced successfully.`,
      });
    },
    onError: (error: any) => {
      console.error('Balance sync error:', error);
      
      toast({
        title: "Sync Failed",
        description: error.message || 'Failed to sync Paystack balance. Please try again.',
        variant: "destructive",
      });
    },
  });

  return {
    syncBalance: syncBalance.mutate,
    isSyncing: syncBalance.isPending,
    syncError: syncBalance.error,
  };
};
