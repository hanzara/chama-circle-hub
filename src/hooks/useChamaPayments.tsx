import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTransactionNotification } from '@/hooks/useTransactionNotification';

export const useChamaPayments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { showTransactionNotification } = useTransactionNotification();
  const queryClient = useQueryClient();

  // M-Pesa STK Push for chama contributions
  const mpesaContributionMutation = useMutation({
    mutationFn: async ({ chamaId, phoneNumber, amount, description }: {
      chamaId: string;
      phoneNumber: string;
      amount: number;
      description?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Calculate transaction fee
      const { data: feeData, error: feeError } = await supabase.rpc('calculate_transaction_fee', {
        p_transaction_type: 'chama_contribution',
        p_amount: amount
      });

      if (feeError) {
        console.warn('Failed to calculate fee:', feeError);
      }

      const transactionFee = Number(feeData || 0);
      const totalAmount = amount + transactionFee;

      const { data, error } = await supabase.functions.invoke('mpesa-integration', {
        body: {
          action: 'stk_push',
          phoneNumber,
          amount: totalAmount, // Include fee in M-Pesa charge
          description: description || 'Chama contribution',
          transactionId: `chama_${chamaId}_${Date.now()}`
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      // Record the payment attempt in our system
      const { error: recordError } = await supabase
        .from('mpesa_transactions')
        .insert({
          user_id: user.id,
          chama_id: chamaId,
          phone_number: phoneNumber,
          amount: totalAmount,
          transaction_type: 'stk_push',
          purpose: 'contribution',
          checkout_request_id: data.CheckoutRequestID,
          merchant_request_id: data.MerchantRequestID,
          status: 'pending'
        });

      if (recordError) {
        console.warn('Failed to record M-Pesa transaction:', recordError);
      }

      // Record the fee separately
      if (transactionFee > 0) {
        await supabase
          .from('transaction_fees')
          .insert({
            transaction_type: 'chama_contribution',
            amount,
            fee_amount: transactionFee,
            user_id: user.id
          });
      }

      return { ...data, fee: transactionFee, totalAmount };
    },
    onSuccess: async (data, variables) => {
      // Get chama details
      const { data: chamaData } = await supabase
        .from('chamas')
        .select('name')
        .eq('id', variables.chamaId)
        .single();

      // Get wallet balance
      const { data: walletData } = await supabase
        .from('user_wallets')
        .select('balance')
        .eq('user_id', user?.id)
        .single();

      showTransactionNotification({
        type: 'chama_contribution',
        amount: variables.amount,
        chamaName: chamaData?.name || 'Group',
        newBalance: (walletData?.balance || 0) - data.totalAmount,
      });

      queryClient.invalidateQueries({ queryKey: ['mpesa-transactions'] });
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed ❌",
        description: error.message || "Failed to initiate M-Pesa payment",
        variant: "destructive"
      });
    }
  });

  // Wallet top-up via M-Pesa
  const walletTopUpMutation = useMutation({
    mutationFn: async ({ phoneNumber, amount, description }: {
      phoneNumber: string;
      amount: number;
      description?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Calculate transaction fee
      const { data: feeData, error: feeError } = await supabase.rpc('calculate_transaction_fee', {
        p_transaction_type: 'wallet_topup',
        p_amount: amount
      });

      if (feeError) {
        console.warn('Failed to calculate fee:', feeError);
      }

      const transactionFee = Number(feeData || 0);
      const totalAmount = amount + transactionFee;

      const { data, error } = await supabase.functions.invoke('mpesa-integration', {
        body: {
          action: 'stk_push',
          phoneNumber,
          amount: totalAmount, // Include fee in M-Pesa charge
          description: description || 'Wallet top-up',
          transactionId: `topup_${user.id}_${Date.now()}`
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      // Record the fee separately
      if (transactionFee > 0) {
        await supabase
          .from('transaction_fees')
          .insert({
            transaction_type: 'wallet_topup',
            amount,
            fee_amount: transactionFee,
            user_id: user.id
          });
      }

      return { ...data, fee: transactionFee, totalAmount };
    },
    onSuccess: async (data, variables) => {
      // Get updated wallet balance
      const { data: walletData } = await supabase
        .from('user_wallets')
        .select('balance')
        .eq('user_id', user?.id)
        .single();

      showTransactionNotification({
        type: 'deposit',
        amount: variables.amount,
        newBalance: walletData?.balance || variables.amount,
      });

      queryClient.invalidateQueries({ queryKey: ['user-wallets'] });
    },
    onError: (error: any) => {
      toast({
        title: "Top-up Failed ❌",
        description: error.message || "Failed to initiate wallet top-up",
        variant: "destructive"
      });
    }
  });

  // Get M-Pesa transaction history
  const { data: mpesaTransactions, isLoading: mpesaLoading } = useQuery({
    queryKey: ['mpesa-transactions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('mpesa_transactions')
        .select(`
          *,
          chamas(name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Get pending M-Pesa transactions
  const { data: pendingTransactions } = useQuery({
    queryKey: ['mpesa-pending', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('mpesa_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
    refetchInterval: 5000 // Poll every 5 seconds for pending transactions
  });

  // Check transaction status
  const checkTransactionStatus = async (transactionId: string) => {
    const { data, error } = await supabase
      .from('mpesa_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (error) throw error;
    return data;
  };

  // Get payment statistics
  const { data: paymentStats } = useQuery({
    queryKey: ['payment-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data: transactions, error } = await supabase
        .from('mpesa_transactions')
        .select('amount, status, purpose, created_at')
        .eq('user_id', user.id);

      if (error) throw error;

      const totalTransactions = transactions.length;
      const successfulTransactions = transactions.filter(t => t.status === 'success').length;
      const totalAmount = transactions
        .filter(t => t.status === 'success')
        .reduce((sum, t) => sum + t.amount, 0);
      const contributionsAmount = transactions
        .filter(t => t.status === 'success' && t.purpose === 'contribution')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        totalTransactions,
        successfulTransactions,
        totalAmount,
        contributionsAmount,
        successRate: totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0
      };
    },
    enabled: !!user
  });

  return {
    // Mutations
    mpesaContributionMutation,
    walletTopUpMutation,
    
    // Data
    mpesaTransactions,
    pendingTransactions,
    paymentStats,
    
    // Loading states
    mpesaLoading,
    isProcessingContribution: mpesaContributionMutation.isPending,
    isProcessingTopUp: walletTopUpMutation.isPending,
    
    // Functions
    checkTransactionStatus,
    
    // Shorthand methods
    contributeViaM_Pesa: mpesaContributionMutation.mutateAsync,
    topUpWallet: walletTopUpMutation.mutateAsync
  };
};