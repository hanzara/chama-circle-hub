import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WalletOperationParams {
  operation: 'topup' | 'withdraw' | 'send' | 'unlock' | 'lock';
  chamaId: string;
  amount?: number;
  recipientMemberId?: string;
  payoutMethod?: 'mpesa' | 'airtel' | 'bank' | 'internal';
  payoutDetails?: {
    phoneNumber?: string;
    accountNumber?: string;
    bankName?: string;
  };
  targetMemberId?: string;
}

export const useWalletOperations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: WalletOperationParams) => {
      const { data, error } = await supabase.functions.invoke('chama-wallet-operations', {
        body: params
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['chama-members', variables.chamaId] });
      queryClient.invalidateQueries({ queryKey: ['central-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['chama-audit-trail', variables.chamaId] });
      
      toast({
        title: "Success",
        description: data.message || "Operation completed successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Operation failed",
        variant: "destructive"
      });
    }
  });
};

// Hook for fetching central wallet balance
export const useCentralWallet = () => {
  return useQuery({
    queryKey: ['central-wallet'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('user_central_wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });
};
