import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  wallet_id: string;
  amount: number;
  fee_amount: number;
  net_amount: number;
  withdrawal_method: string;
  destination_details: any;
  status: string;
  currency: string;
  created_at: string;
  processed_at?: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
}

export interface WithdrawalLimits {
  daily: { used: number; limit: number };
  weekly: { used: number; limit: number };
  monthly: { used: number; limit: number };
}

export const useWithdrawals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch withdrawal requests
  const withdrawalsQuery = useQuery({
    queryKey: ['withdrawal-requests', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as WithdrawalRequest[];
    },
    enabled: !!user,
  });

  // Calculate withdrawal limits
  const getLimits = (): WithdrawalLimits => {
    const withdrawals = withdrawalsQuery.data || [];
    const now = new Date();
    
    // Calculate daily usage (last 24 hours)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const dailyWithdrawals = withdrawals.filter(w => 
      new Date(w.created_at) > oneDayAgo && 
      (w.status === 'completed' || w.status === 'pending')
    );
    const dailyUsed = dailyWithdrawals.reduce((sum, w) => sum + w.amount, 0);

    // Calculate weekly usage (last 7 days)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyWithdrawals = withdrawals.filter(w => 
      new Date(w.created_at) > oneWeekAgo && 
      (w.status === 'completed' || w.status === 'pending')
    );
    const weeklyUsed = weeklyWithdrawals.reduce((sum, w) => sum + w.amount, 0);

    // Calculate monthly usage (last 30 days)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const monthlyWithdrawals = withdrawals.filter(w => 
      new Date(w.created_at) > oneMonthAgo && 
      (w.status === 'completed' || w.status === 'pending')
    );
    const monthlyUsed = monthlyWithdrawals.reduce((sum, w) => sum + w.amount, 0);

    return {
      daily: { used: dailyUsed, limit: 100000 },
      weekly: { used: weeklyUsed, limit: 300000 },
      monthly: { used: monthlyUsed, limit: 1000000 }
    };
  };

  // Calculate withdrawal fee
  const calculateFee = (amount: number, method: string): number => {
    switch (method) {
      case 'mpesa':
        if (amount <= 100) return 0;
        if (amount <= 2500) return 15;
        if (amount <= 3500) return 25;
        if (amount <= 5000) return 30;
        if (amount <= 7500) return 45;
        if (amount <= 10000) return 50;
        return Math.max(50, Math.floor(amount * 0.005));
      case 'bank':
        return Math.max(25, Math.floor(amount * 0.001));
      case 'airtel':
        if (amount <= 100) return 0;
        if (amount <= 2500) return 15;
        if (amount <= 5000) return 30;
        return Math.max(50, Math.floor(amount * 0.005));
      default:
        return 0;
    }
  };

  // Create withdrawal request
  const createWithdrawalMutation = useMutation({
    mutationFn: async ({
      walletId,
      amount,
      method,
      destinationDetails,
      currency = 'KES'
    }: {
      walletId: string;
      amount: number;
      method: string;
      destinationDetails: any;
      currency?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const fee = calculateFee(amount, method);
      const netAmount = amount - fee;

      const { data, error } = await supabase
        .from('withdrawal_requests')
        .insert({
          user_id: user.id,
          wallet_id: walletId,
          amount,
          fee_amount: fee,
          net_amount: netAmount,
          withdrawal_method: method,
          destination_details: destinationDetails,
          currency,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['withdrawal-requests'] });
      queryClient.invalidateQueries({ queryKey: ['user-wallets'] });
      toast({
        title: "Withdrawal Request Submitted",
        description: `Your withdrawal of KES ${data.amount.toLocaleString()} is being processed.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to create withdrawal request",
        variant: "destructive",
      });
    },
  });

  // Cancel pending withdrawal
  const cancelWithdrawalMutation = useMutation({
    mutationFn: async (withdrawalId: string) => {
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({ status: 'cancelled' })
        .eq('id', withdrawalId)
        .eq('user_id', user?.id)
        .eq('status', 'pending');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawal-requests'] });
      toast({
        title: "Withdrawal Cancelled",
        description: "Your withdrawal request has been cancelled.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Cancel",
        description: error.message || "Could not cancel withdrawal request",
        variant: "destructive",
      });
    },
  });

  return {
    // Data
    withdrawals: withdrawalsQuery.data || [],
    limits: getLimits(),
    isLoading: withdrawalsQuery.isLoading,
    
    // Functions
    calculateFee,
    createWithdrawal: createWithdrawalMutation.mutate,
    cancelWithdrawal: cancelWithdrawalMutation.mutate,
    
    // States
    isCreating: createWithdrawalMutation.isPending,
    isCancelling: cancelWithdrawalMutation.isPending,
  };
};
