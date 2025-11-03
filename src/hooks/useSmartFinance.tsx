import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FinancialProfile {
  id: string;
  user_id: string;
  monthly_income?: number;
  current_savings?: number;
  monthly_expenses?: number;
  risk_tolerance: 'low' | 'medium' | 'high';
  financial_goals: any[];
  ai_insights_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinancialTransaction {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  subcategory?: string;
  description?: string;
  transaction_type: 'income' | 'expense' | 'investment' | 'savings';
  payment_method?: string;
  auto_categorized: boolean;
  ai_confidence?: number;
  transaction_date: string;
  created_at: string;
}

export interface FinancialGoal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface AIRecommendation {
  id: string;
  user_id: string;
  type: 'investment' | 'savings' | 'budget' | 'loan' | 'expense_reduction';
  title: string;
  description: string;
  confidence_score?: number;
  expected_impact?: number;
  impact_description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'new' | 'viewed' | 'implemented' | 'dismissed';
  expires_at?: string;
  created_at: string;
}

export interface ChatMessage {
  type: 'user' | 'bot';
  message: string;
  timestamp?: Date;
}

export const useSmartFinance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Financial Profile
  const financialProfileQuery = useQuery({
    queryKey: ['financial-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_financial_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user,
  });

  // Financial Transactions
  const transactionsQuery = useQuery({
    queryKey: ['financial-transactions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('transaction_date', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Financial Goals
  const goalsQuery = useQuery({
    queryKey: ['financial-goals', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // AI Recommendations
  const recommendationsQuery = useQuery({
    queryKey: ['ai-recommendations', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Chat History
  const chatHistoryQuery = useQuery({
    queryKey: ['ai-chat-history', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_chat_history')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Update Financial Profile
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<FinancialProfile>) => {
      const { data, error } = await supabase
        .from('user_financial_profiles')
        .upsert({
          user_id: user?.id,
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-profile', user?.id] });
      toast({
        title: "Profile Updated",
        description: "Your financial profile has been updated successfully.",
      });
    },
  });

  // Add Transaction
  const addTransactionMutation = useMutation({
    mutationFn: async (transactionData: Omit<FinancialTransaction, 'id' | 'user_id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('financial_transactions')
        .insert({
          user_id: user?.id,
          ...transactionData,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-transactions', user?.id] });
      toast({
        title: "Transaction Added",
        description: "Your transaction has been recorded successfully.",
      });
    },
  });

  // Add/Update Goal
  const saveGoalMutation = useMutation({
    mutationFn: async (goalData: Omit<FinancialGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('financial_goals')
        .insert({
          user_id: user?.id,
          ...goalData,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-goals', user?.id] });
      toast({
        title: "Goal Saved",
        description: "Your financial goal has been saved successfully.",
      });
    },
  });

  // AI Chat
  const sendChatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await supabase.functions.invoke('ai-finance-chat', {
        body: {
          message,
          userId: user?.id,
          contextData: {
            timestamp: new Date().toISOString(),
          }
        }
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-chat-history', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations', user?.id] });
    },
  });

  // Dismiss Recommendation
  const dismissRecommendationMutation = useMutation({
    mutationFn: async (recommendationId: string) => {
      const { error } = await supabase
        .from('ai_recommendations')
        .update({ status: 'dismissed' })
        .eq('id', recommendationId)
        .eq('user_id', user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations', user?.id] });
    },
  });

  // Calculate Analytics
  const getAnalytics = () => {
    const transactions = transactionsQuery.data || [];
    const goals = goalsQuery.data || [];
    const profile = financialProfileQuery.data;

    const currentMonth = new Date().toISOString().substring(0, 7);
    const thisMonthTransactions = transactions.filter(t => 
      t.transaction_date.startsWith(currentMonth)
    );

    const monthlyIncome = thisMonthTransactions
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = thisMonthTransactions
      .filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlySavings = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

    const activeGoals = goals.filter(g => g.status === 'active');
    const completedGoals = goals.filter(g => g.status === 'completed');
    
    const totalGoalProgress = activeGoals.length > 0 
      ? activeGoals.reduce((sum, g) => sum + (g.current_amount / g.target_amount) * 100, 0) / activeGoals.length
      : 0;

    return {
      monthlyIncome,
      monthlyExpenses,
      monthlySavings,
      savingsRate,
      totalSavings: profile?.current_savings || 0,
      activeGoalsCount: activeGoals.length,
      completedGoalsCount: completedGoals.length,
      goalProgress: totalGoalProgress,
      totalTransactions: transactions.length,
    };
  };

  return {
    // Data
    profile: financialProfileQuery.data,
    transactions: transactionsQuery.data || [],
    goals: goalsQuery.data || [],
    recommendations: recommendationsQuery.data || [],
    chatHistory: chatHistoryQuery.data || [],
    analytics: getAnalytics(),

    // Loading states
    isLoadingProfile: financialProfileQuery.isLoading,
    isLoadingTransactions: transactionsQuery.isLoading,
    isLoadingGoals: goalsQuery.isLoading,
    isLoadingRecommendations: recommendationsQuery.isLoading,
    isLoadingChat: chatHistoryQuery.isLoading,

    // Mutations
    updateProfile: updateProfileMutation.mutate,
    addTransaction: addTransactionMutation.mutate,
    saveGoal: saveGoalMutation.mutate,
    sendChat: sendChatMutation.mutate,
    dismissRecommendation: dismissRecommendationMutation.mutate,

    // Mutation states
    isUpdatingProfile: updateProfileMutation.isPending,
    isAddingTransaction: addTransactionMutation.isPending,
    isSavingGoal: saveGoalMutation.isPending,
    isSendingChat: sendChatMutation.isPending,
    isDismissingRecommendation: dismissRecommendationMutation.isPending,

    // Refresh functions
    refreshProfile: () => queryClient.invalidateQueries({ queryKey: ['financial-profile', user?.id] }),
    refreshTransactions: () => queryClient.invalidateQueries({ queryKey: ['financial-transactions', user?.id] }),
    refreshGoals: () => queryClient.invalidateQueries({ queryKey: ['financial-goals', user?.id] }),
    refreshRecommendations: () => queryClient.invalidateQueries({ queryKey: ['ai-recommendations', user?.id] }),
    refreshChat: () => queryClient.invalidateQueries({ queryKey: ['ai-chat-history', user?.id] }),
  };
};