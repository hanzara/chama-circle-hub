import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ChamaWalletParams {
  action: string;
  [key: string]: any;
}

export const useChamaWallet = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Generic mutation for wallet operations
  const walletMutation = useMutation({
    mutationFn: async (params: ChamaWalletParams) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('chama-wallet-api', {
        body: params
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries based on action
      if (variables.action.includes('wallet') || variables.action.includes('contribution')) {
        queryClient.invalidateQueries({ queryKey: ['user-wallets'] });
      }
      if (variables.action.includes('chama')) {
        queryClient.invalidateQueries({ queryKey: ['user-chamas'] });
        queryClient.invalidateQueries({ queryKey: ['chama-details'] });
      }
      if (variables.action.includes('transaction')) {
        queryClient.invalidateQueries({ queryKey: ['transaction-history'] });
      }
      if (variables.action === 'update_leaderboard') {
        queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      }
    }
  });

  // Get user's wallets
  const { data: userWallets, isLoading: walletsLoading } = useQuery({
    queryKey: ['user-wallets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase.functions.invoke('chama-wallet-api', {
        body: { action: 'get_user_wallets' }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      
      return data.data;
    },
    enabled: !!user
  });

  // Get user's chamas
  const { data: userChamas, isLoading: chamasLoading } = useQuery({
    queryKey: ['user-chamas', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('chama_members')
        .select(`
          *,
          chamas(*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Create chama
  const createChama = async (chamaData: {
    name: string;
    description?: string;
    contribution_amount: number;
    contribution_frequency?: string;
    meeting_day?: string;
    max_members?: number;
  }) => {
    const result = await walletMutation.mutateAsync({
      action: 'create_chama',
      ...chamaData
    });

    toast({
      title: "Chama Created! 🎉",
      description: `${chamaData.name} has been created successfully.`
    });

    return result;
  };

  // Join chama
  const joinChama = async (chamaId: string, role: string = 'member') => {
    const result = await walletMutation.mutateAsync({
      action: 'join_chama',
      chama_id: chamaId,
      role
    });

    toast({
      title: "Joined Chama! 👥",
      description: "You have successfully joined the chama."
    });

    return result;
  };

  // Create savings account
  const createSavingsAccount = async (savingsData: {
    wallet_id: string;
    name: string;
    target_amount?: number;
    target_date?: string;
  }) => {
    const result = await walletMutation.mutateAsync({
      action: 'create_savings_account',
      ...savingsData
    });

    toast({
      title: "Savings Account Created! 💰",
      description: `${savingsData.name} savings account has been created.`
    });

    return result;
  };

  // Contribute to chama
  const contributeToChama = async (contributionData: {
    chama_id: string;
    amount: number;
    description?: string;
  }) => {
    const result = await walletMutation.mutateAsync({
      action: 'contribute_to_chama',
      ...contributionData
    });

    toast({
      title: "Contribution Successful! 💸",
      description: `KES ${contributionData.amount} contributed to chama.`
    });

    return result;
  };

  // Send to member
  const sendToMember = async (transferData: {
    recipient_phone: string;
    amount: number;
    description?: string;
    pin: string;
  }) => {
    const result = await walletMutation.mutateAsync({
      action: 'send_to_member',
      ...transferData
    });

    toast({
      title: "Transfer Successful! 📤",
      description: `KES ${transferData.amount} sent to member.`
    });

    return result;
  };

  // Withdraw funds
  const withdrawFunds = async (withdrawalData: {
    wallet_id: string;
    amount: number;
    payment_method: string;
    phone_number: string;
  }) => {
    const result = await walletMutation.mutateAsync({
      action: 'withdraw_funds',
      ...withdrawalData
    });

    toast({
      title: "Withdrawal Submitted! 🏦",
      description: "Your withdrawal request is being processed."
    });

    return result;
  };

  return {
    // Data
    userWallets,
    userChamas,
    walletsLoading,
    chamasLoading,
    
    // Actions
    createChama,
    joinChama,
    createSavingsAccount,
    contributeToChama,
    sendToMember,
    withdrawFunds,
    
    // Generic mutation for custom operations
    walletMutation,
    isProcessing: walletMutation.isPending
  };
};

// Hook for chama details
export const useChamaDetails = (chamaId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['chama-details', chamaId],
    queryFn: async () => {
      if (!user || !chamaId) return null;
      
      const { data, error } = await supabase.functions.invoke('chama-wallet-api', {
        body: { action: 'get_chama_details', chama_id: chamaId }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      
      return data.data;
    },
    enabled: !!user && !!chamaId
  });
};

// Hook for transaction history
export const useTransactionHistory = (chamaId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['transaction-history', user?.id, chamaId],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase.functions.invoke('chama-wallet-api', {
        body: { 
          action: 'get_transaction_history',
          chama_id: chamaId,
          limit: 100
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      
      return data.data;
    },
    enabled: !!user
  });
};

// Hook for leaderboard
export const useLeaderboard = (chamaId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['leaderboard', chamaId],
    queryFn: async () => {
      if (!user || !chamaId) return [];
      
      const { data, error } = await supabase.functions.invoke('chama-wallet-api', {
        body: { action: 'get_leaderboard', chama_id: chamaId }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      
      return data.data;
    },
    enabled: !!user && !!chamaId
  });
};