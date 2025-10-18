import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { usePaystackIntegration } from './usePaystackIntegration';

export const useUserWalletOperations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { initializePayment, verifyPayment } = usePaystackIntegration();

  // Manual credit function for stuck payments
  const manualCreditMutation = useMutation({
    mutationFn: async (reference: string) => {
      const { data, error } = await supabase.functions.invoke('manual-credit-payment', {
        body: { reference }
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to credit payment');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-wallets'] });
      toast({
        title: "Payment Credited ✅",
        description: "Your wallet has been updated",
      });
    }
  });

  // Deposit to wallet (uses Paystack)
  const depositMutation = useMutation({
    mutationFn: async ({ amount, email, phoneNumber }: { 
      amount: number; 
      email?: string;
      phoneNumber?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Use Paystack for external deposits
      return initializePayment.mutateAsync({
        amount,
        email,
        phoneNumber,
        purpose: 'other',
        description: 'Wallet Top-up',
      });
    },
    onSuccess: async (data) => {
      toast({
        title: "Deposit Initiated 💳",
        description: "Complete your payment to add funds to your wallet",
      });

      // Fallback verification to ensure wallet updates even if webhook is delayed
      try {
        const reference = (data as any)?.reference;
        if (reference) {
          const result = await verifyPayment.mutateAsync(reference);
          if (result?.success) {
            await queryClient.invalidateQueries({ queryKey: ['user-wallets'] });
            toast({
              title: "Payment Verified ✅",
              description: "Your wallet has been updated.",
            });
          }
        }
      } catch (e) {
        console.warn('Verification fallback failed (will rely on webhook):', e);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Deposit Failed ❌",
        description: error.message || 'Failed to initiate deposit',
        variant: "destructive",
      });
    },
  });

  // Withdraw from wallet (uses Paystack Transfer API - silent)
  const withdrawMutation = useMutation({
    mutationFn: async ({ 
      amount, 
      accountNumber, 
      bankCode, 
      accountName 
    }: { 
      amount: number; 
      accountNumber: string; 
      bankCode: string; 
      accountName: string; 
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('paystack-integration', {
        body: {
          action: 'withdraw',
          user_id: user.id,
          amount,
          account_number: accountNumber,
          bank_code: bankCode,
          account_name: accountName,
          recipient_name: accountName,
        }
      });

      if (error) throw new Error(error.message || 'Withdrawal failed');
      if (!data?.success) throw new Error(data?.error || 'Withdrawal failed');

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-wallets'] });
      toast({
        title: "Withdrawal Successful ✅",
        description: `${data.amount} sent to your account`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal Failed ❌",
        description: error.message || 'Failed to process withdrawal',
        variant: "destructive",
      });
    },
  });

  // Internal transfer to savings (NO Paystack)
  const transferToSavingsMutation = useMutation({
    mutationFn: async ({ 
      amount, 
      goalId, 
      goalName 
    }: { 
      amount: number; 
      goalId?: string; 
      goalName?: string; 
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Check wallet balance
      const { data: wallet, error: walletError } = await supabase
        .from('user_wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (walletError) throw walletError;
      if (!wallet || wallet.balance < amount) {
        throw new Error('Insufficient wallet balance');
      }

      // Internal transfer - deduct from wallet
      const { error: deductError } = await supabase
        .from('user_wallets')
        .update({ balance: wallet.balance - amount })
        .eq('user_id', user.id);

      if (deductError) throw deductError;

      // Add to savings goal
      const { data, error } = await supabase.functions.invoke('personal-savings-ops', {
        body: {
          action: 'deposit',
          amount,
          goal_name: goalName,
          goal_id: goalId,
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-wallets'] });
      queryClient.invalidateQueries({ queryKey: ['personal-savings'] });
      toast({
        title: "Saved Successfully ✅",
        description: "Funds moved to your savings goal",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Transfer Failed ❌",
        description: error.message || 'Failed to save',
        variant: "destructive",
      });
    },
  });

  // Internal transfer to chama (NO Paystack)
  const transferToChamaMutation = useMutation({
    mutationFn: async ({ 
      chamaId, 
      amount, 
      description 
    }: { 
      chamaId: string; 
      amount: number; 
      description?: string; 
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Check wallet balance
      const { data: wallet, error: walletError } = await supabase
        .from('user_wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (walletError) throw walletError;
      if (!wallet || wallet.balance < amount) {
        throw new Error('Insufficient wallet balance');
      }

      // Use existing make-contribution edge function
      const { data, error } = await supabase.functions.invoke('make-contribution', {
        body: {
          chama_id: chamaId,
          amount,
          payment_method: 'wallet',
          description: description || 'Contribution from wallet',
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-wallets'] });
      queryClient.invalidateQueries({ queryKey: ['chama-contributions'] });
      toast({
        title: "Contribution Successful ✅",
        description: "Funds transferred to chama",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Transfer Failed ❌",
        description: error.message || 'Failed to contribute',
        variant: "destructive",
      });
    },
  });

  // Wallet-to-wallet transfer (NO Paystack)
  const p2pTransferMutation = useMutation({
    mutationFn: async ({ 
      recipientId, 
      amount, 
      description 
    }: { 
      recipientId: string; 
      amount: number; 
      description?: string; 
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Check wallet balance
      const { data: wallet, error: walletError } = await supabase
        .from('user_wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (walletError) throw walletError;
      if (!wallet || wallet.balance < amount) {
        throw new Error('Insufficient wallet balance');
      }

      // Deduct from sender
      await supabase
        .from('user_wallets')
        .update({ balance: wallet.balance - amount })
        .eq('user_id', user.id);

      // Add to recipient
      const { data: recipientWallet } = await supabase
        .from('user_wallets')
        .select('balance')
        .eq('user_id', recipientId)
        .single();

      await supabase
        .from('user_wallets')
        .update({ balance: (recipientWallet?.balance || 0) + amount })
        .eq('user_id', recipientId);

      // Record transactions
      await supabase.from('wallet_transactions').insert([
        {
          user_id: user.id,
          type: 'transfer_out',
          amount: -amount,
          description: description || 'Transfer to user',
          status: 'completed',
        },
        {
          user_id: recipientId,
          type: 'transfer_in',
          amount: amount,
          description: description || 'Transfer from user',
          status: 'completed',
        },
      ]);

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-wallets'] });
      toast({
        title: "Transfer Successful ✅",
        description: "Funds sent successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Transfer Failed ❌",
        description: error.message || 'Failed to transfer funds',
        variant: "destructive",
      });
    },
  });

  return {
    // Deposits (uses Paystack)
    depositMutation,
    isDepositing: depositMutation.isPending,
    
    // Withdrawals (uses Paystack Transfer API silently)
    withdrawMutation,
    isWithdrawing: withdrawMutation.isPending,
    
    // Internal transfers (NO Paystack)
    transferToSavingsMutation,
    transferToChamaMutation,
    p2pTransferMutation,
    isTransferring: transferToSavingsMutation.isPending || 
                    transferToChamaMutation.isPending || 
                    p2pTransferMutation.isPending,
    
    // Manual credit
    manualCreditMutation,
  };
};
