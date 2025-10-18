import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface SavingsAccount {
  id: string;
  chama_id: string;
  member_id: string;
  account_name: string;
  account_type: 'regular' | 'emergency' | 'goal-based' | 'premium';
  target_amount: number;
  current_balance: number;
  interest_rate: number;
  minimum_balance: number;
  withdrawal_fee: number;
  monthly_target: number;
  auto_save_enabled: boolean;
  auto_save_amount: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface SavingsTransaction {
  id: string;
  savings_account_id: string;
  chama_id: string;
  member_id: string;
  transaction_type: 'deposit' | 'withdrawal' | 'interest' | 'fee';
  amount: number;
  balance_after: number;
  transaction_fee: number;
  description: string;
  reference_number: string;
  payment_method: string;
  status: string;
  created_at: string;
}

export const useMultipleSavingsAccounts = (chamaId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's savings accounts in a chama
  const {
    data: savingsAccounts = [],
    isLoading: isLoadingAccounts,
    error: accountsError
  } = useQuery({
    queryKey: ['chama-savings-accounts', chamaId, user?.id],
    queryFn: async () => {
      if (!chamaId || !user) return [];
      
      const { data, error } = await supabase
        .from('chama_member_savings_accounts')
        .select('*')
        .eq('chama_id', chamaId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SavingsAccount[];
    },
    enabled: !!chamaId && !!user,
  });

  // Fetch savings transactions
  const {
    data: savingsTransactions = [],
    isLoading: isLoadingTransactions
  } = useQuery({
    queryKey: ['chama-savings-transactions', chamaId, user?.id],
    queryFn: async () => {
      if (!chamaId || !user) return [];
      
      const { data, error } = await supabase
        .from('chama_savings_transactions')
        .select('*')
        .eq('chama_id', chamaId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SavingsTransaction[];
    },
    enabled: !!chamaId && !!user,
  });

  // Create new savings account
  const createAccountMutation = useMutation({
    mutationFn: async (accountData: {
      account_name: string;
      account_type: string;
      target_amount?: number;
      monthly_target?: number;
    }) => {
      if (!chamaId || !user) throw new Error('Missing required data');

      // Get member ID
      const { data: memberData, error: memberError } = await supabase
        .from('chama_members')
        .select('id')
        .eq('chama_id', chamaId)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (memberError) throw memberError;

      const { data, error } = await supabase
        .from('chama_member_savings_accounts')
        .insert({
          chama_id: chamaId,
          member_id: memberData.id,
          ...accountData,
          interest_rate: accountData.account_type === 'premium' ? 8.0 : 5.0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chama-savings-accounts'] });
      toast({
        title: "Success",
        description: "Savings account created successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create savings account",
        variant: "destructive",
      });
    },
  });

  // Deposit to savings account
  const depositMutation = useMutation({
    mutationFn: async ({
      accountId,
      amount,
      paymentMethod = 'mobile_money',
      reference
    }: {
      accountId: string;
      amount: number;
      paymentMethod?: string;
      reference?: string;
    }) => {
      const { data, error } = await supabase.rpc('deposit_to_savings_account', {
        p_account_id: accountId,
        p_amount: amount,
        p_payment_method: paymentMethod,
        p_reference: reference,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['chama-savings-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['chama-savings-transactions'] });
      
      toast({
        title: "Deposit Successful",
        description: `Deposited KES ${data?.net_deposited || 0}. Fee: KES ${data?.fee_charged || 0}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Deposit Failed",
        description: error.message || "Failed to process deposit",
        variant: "destructive",
      });
    },
  });

  // Update account settings
  const updateAccountMutation = useMutation({
    mutationFn: async ({
      accountId,
      updates
    }: {
      accountId: string;
      updates: Partial<SavingsAccount>;
    }) => {
      const { data, error } = await supabase
        .from('chama_member_savings_accounts')
        .update(updates)
        .eq('id', accountId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chama-savings-accounts'] });
      toast({
        title: "Account Updated",
        description: "Savings account settings updated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update account",
        variant: "destructive",
      });
    },
  });

  return {
    // Data
    savingsAccounts,
    savingsTransactions,
    
    // Loading states
    isLoadingAccounts,
    isLoadingTransactions,
    
    // Mutations
    createAccount: createAccountMutation.mutate,
    isCreatingAccount: createAccountMutation.isPending,
    
    deposit: depositMutation.mutate,
    isDepositing: depositMutation.isPending,
    
    updateAccount: updateAccountMutation.mutate,
    isUpdating: updateAccountMutation.isPending,

    // Helper functions
    getTotalBalance: () => 
      savingsAccounts.reduce((total, account) => total + account.current_balance, 0),
    
    getAccountByType: (type: string) => 
      savingsAccounts.filter(account => account.account_type === type),
    
    getMonthlyEarnings: () => {
      const today = new Date();
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      return savingsTransactions
        .filter(t => 
          t.transaction_type === 'interest' && 
          new Date(t.created_at) >= thisMonth
        )
        .reduce((total, t) => total + t.amount, 0);
    }
  };
};