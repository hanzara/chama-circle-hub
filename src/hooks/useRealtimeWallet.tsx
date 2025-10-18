import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export const useRealtimeWallet = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    // Initial fetch
    const fetchBalance = async () => {
      try {
        const { data, error } = await supabase
          .from('user_central_wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setBalance(data?.balance || 0);
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();

    // Set up real-time subscription
    const channel = supabase
      .channel('wallet-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_central_wallets',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Wallet balance updated:', payload);
          const newBalance = payload.new.balance;
          const oldBalance = payload.old.balance;
          
          setBalance(newBalance);
          
          // Invalidate dashboard queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
          queryClient.invalidateQueries({ queryKey: ['central-wallet'] });
          
          // Show toast notification for balance change
          if (newBalance > oldBalance) {
            const difference = newBalance - oldBalance;
            toast({
              title: "💰 Money Added",
              description: `KES ${difference.toFixed(2)} added to your wallet. New balance: KES ${newBalance.toFixed(2)}`,
              duration: 5000,
            });
          } else if (newBalance < oldBalance) {
            const difference = oldBalance - newBalance;
            toast({
              title: "📤 Money Sent",
              description: `KES ${difference.toFixed(2)} deducted. New balance: KES ${newBalance.toFixed(2)}`,
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, toast, queryClient]);

  return { balance, isLoading };
};
