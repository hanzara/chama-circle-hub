import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface AirtelMoneyPaymentRequest {
  phoneNumber: string;
  amount: number;
  purpose?: string;
  description?: string;
}

export const useAirtelMoney = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const initiatePayment = useMutation({
    mutationFn: async ({ phoneNumber, amount, purpose, description }: AirtelMoneyPaymentRequest) => {
      if (!user) {
        throw new Error('User must be authenticated');
      }

      console.log('=== Initiating Airtel Money Payment ===');
      console.log('Phone:', phoneNumber);
      console.log('Amount:', amount);
      console.log('Purpose:', purpose);

      const { data, error } = await supabase.functions.invoke('airtel-money-payment', {
        body: {
          phoneNumber,
          amount,
          purpose: purpose || 'wallet_topup',
          description: description || 'Wallet top-up via Airtel Money',
        },
      });

      if (error) {
        console.error('Airtel Money error:', error);
        throw new Error(error.message || 'Failed to initiate payment');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to initiate payment');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['central-wallet'] });
      
      toast({
        title: '📱 Payment Request Sent',
        description: 'Check your phone to complete the Airtel Money payment.',
      });
    },
    onError: (error: any) => {
      console.error('Airtel Money payment error:', error);
      
      toast({
        title: '❌ Payment Failed',
        description: error.message || 'Failed to initiate Airtel Money payment',
        variant: 'destructive',
      });
    },
  });

  return {
    initiatePayment,
    isProcessingPayment: initiatePayment.isPending,
  };
};
