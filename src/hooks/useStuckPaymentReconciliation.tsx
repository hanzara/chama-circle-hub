import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useStuckPaymentReconciliation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check for stuck payments (Paystack & Airtel Money - pending for >5 minutes)
  const { data: stuckPayments } = useQuery({
    queryKey: ['stuck-payments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('mpesa_transactions')
        .select('*')
        .eq('user_id', user.id)
        .in('transaction_type', ['paystack', 'airtel_money'])
        .eq('status', 'pending')
        .is('chama_id', null)
        .lt('created_at', fiveMinutesAgo);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Auto-credit stuck payments
  useEffect(() => {
    if (!stuckPayments || stuckPayments.length === 0) return;

    const creditStuckPayments = async () => {
      for (const payment of stuckPayments) {
        try {
          // For Airtel Money, use transaction_id; for Paystack, use checkout_request_id
          const requestBody = payment.transaction_type === 'airtel_money' 
            ? { transaction_id: payment.id }
            : { reference: payment.checkout_request_id };

          const { data, error } = await supabase.functions.invoke('manual-credit-payment', {
            body: requestBody
          });

          if (error) {
            console.error('Failed to credit payment:', payment.id, error);
            continue;
          }

          if (data?.success) {
            toast({
              title: "Payment Credited ✅",
              description: `KES ${((typeof data?.amount === 'number' ? data.amount : Number(data?.amount)) || Number(data?.netAmount) || Number(data?.balance?.added) || 0).toFixed(2)} has been added to your wallet`,
            });
            
            // Invalidate queries to refresh wallet balance
            await queryClient.invalidateQueries({ queryKey: ['user-wallets'] });
            await queryClient.invalidateQueries({ queryKey: ['stuck-payments'] });
            await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            await queryClient.invalidateQueries({ queryKey: ['central-wallet'] });
          }
        } catch (err) {
          console.error('Error crediting stuck payment:', err);
        }
      }
    };

    creditStuckPayments();
  }, [stuckPayments, toast, queryClient]);

  return { stuckPayments };
};
