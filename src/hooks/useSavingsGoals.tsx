import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface SavingsGoal {
  id: string;
  user_id: string;
  goal_name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  auto_debit_enabled: boolean;
  auto_debit_amount: number;
  auto_debit_frequency: 'weekly' | 'monthly';
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavingsTransaction {
  id: string;
  user_id: string;
  savings_goal_id?: string;
  amount: number;
  transaction_type: 'deposit' | 'withdrawal' | 'interest' | 'penalty';
  frequency: 'one_time' | 'weekly' | 'monthly';
  payment_method: string;
  reference_number?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
}

export const useSavingsGoals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch savings goals
  const goalsQuery = useQuery({
    queryKey: ['savings-goals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('personal_savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SavingsGoal[];
    },
    enabled: !!user,
  });

  // Fetch savings transactions
  const transactionsQuery = useQuery({
    queryKey: ['savings-transactions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('personal_savings_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SavingsTransaction[];
    },
    enabled: !!user,
  });

  // Create savings goal
  const createGoalMutation = useMutation({
    mutationFn: async (goalData: {
      goal_name: string;
      target_amount: number;
      target_date?: string;
      auto_debit_enabled?: boolean;
      auto_debit_amount?: number;
      auto_debit_frequency?: 'weekly' | 'monthly';
      is_public?: boolean;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('personal_savings_goals')
        .insert({
          user_id: user.id,
          ...goalData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
      toast({
        title: "Goal Created! 🎯",
        description: "Your savings goal has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create savings goal",
        variant: "destructive",
      });
    },
  });

  // Add savings (deposit)
  const addSavingsMutation = useMutation({
    mutationFn: async (savingsData: {
      amount: number;
      savings_goal_id?: string;
      frequency?: 'one_time' | 'weekly' | 'monthly';
      payment_method?: string;
      notes?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('add_personal_savings', {
        p_amount: savingsData.amount,
        p_goal_name: savingsData.savings_goal_id ? undefined : 'General Savings',
        p_frequency: savingsData.frequency || 'one_time',
        p_notes: savingsData.notes
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
      queryClient.invalidateQueries({ queryKey: ['savings-transactions'] });
      toast({
        title: "Savings Added! 💰",
        description: "Your savings has been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add savings",
        variant: "destructive",
      });
    },
  });

  // Update savings goal
  const updateGoalMutation = useMutation({
    mutationFn: async ({ goalId, updates }: { goalId: string; updates: Partial<SavingsGoal> }) => {
      const { data, error } = await supabase
        .from('personal_savings_goals')
        .update(updates)
        .eq('id', goalId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
      toast({
        title: "Goal Updated! ✅",
        description: "Your savings goal has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update savings goal",
        variant: "destructive",
      });
    },
  });

  // Delete savings goal
  const deleteGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      const { error } = await supabase
        .from('personal_savings_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
      toast({
        title: "Goal Deleted",
        description: "Your savings goal has been deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete savings goal",
        variant: "destructive",
      });
    },
  });

  return {
    // Data
    goals: goalsQuery.data || [],
    transactions: transactionsQuery.data || [],
    isLoading: goalsQuery.isLoading || transactionsQuery.isLoading,
    
    // Actions
    createGoal: createGoalMutation.mutate,
    addSavings: addSavingsMutation.mutate,
    updateGoal: updateGoalMutation.mutate,
    deleteGoal: deleteGoalMutation.mutate,
    
    // States
    isCreating: createGoalMutation.isPending,
    isUpdating: updateGoalMutation.isPending,
    isDeleting: deleteGoalMutation.isPending,
    isAddingSavings: addSavingsMutation.isPending,
  };
};