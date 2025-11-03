import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

/**
 * Hook to monitor payment transaction status and show notifications
 * Polls for pending transactions and notifies user of success/failure
 */
export const usePaymentStatusMonitor = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Poll for pending transactions every 5 seconds
  const { data: pendingTransactions } = useQuery({
    queryKey: ['payment-status-monitor', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('mpesa_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .gte('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString()) // Last 30 minutes
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending transactions:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user,
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Subscribe to real-time updates for transaction status changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('payment-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'mpesa_transactions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          const transaction = payload.new;
          console.log('Payment status changed:', transaction);

          // Show notification based on status
          if (transaction.status === 'success') {
            // Extract amount properly from the transaction
            const rawAmount = typeof transaction.amount === 'number' ? transaction.amount : parseFloat(transaction.amount || '0');
            const fee = rawAmount * 0.025;
            const netAmount = rawAmount - fee;

            console.log('Payment success notification:', { rawAmount, fee, netAmount });

            toast({
              title: "✅ Payment Successful!",
              description: `KES ${netAmount.toFixed(2)} added to your wallet (Fee: KES ${fee.toFixed(2)})`,
              duration: 8000,
            });

            // Refresh wallet balance and transactions
            queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
            queryClient.invalidateQueries({ queryKey: ['central-wallet'] });
            queryClient.invalidateQueries({ queryKey: ['user-central-wallet'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
          } else if (transaction.status === 'failed') {
            const errorMessage = transaction.result_desc || 'Payment failed. Please try again.';
            
            // Parse for balance information
            const balanceMatch = errorMessage.match(/balance:\s+KES\s+([0-9,.]+)/i);
            const availableBalance = balanceMatch ? balanceMatch[1] : null;

            let description = errorMessage;
            if (availableBalance) {
              description = `💳 Insufficient balance\n💼 Available: KES ${availableBalance}\n🔁 Try a smaller amount`;
            }

            toast({
              title: "❌ Payment Failed",
              description,
              variant: "destructive",
              duration: 10000,
            });
          }

          // Remove from pending list
          queryClient.invalidateQueries({ queryKey: ['payment-status-monitor'] });
          queryClient.invalidateQueries({ queryKey: ['payment-transactions'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast, queryClient]);

  return {
    pendingTransactions: pendingTransactions || [],
    hasPendingPayments: (pendingTransactions?.length || 0) > 0,
  };
};
