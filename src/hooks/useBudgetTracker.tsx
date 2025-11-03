import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { Database } from '@/integrations/supabase/types';

type Budget = Database['public']['Tables']['user_budgets']['Row'];
type BudgetCategory = Database['public']['Tables']['budget_categories']['Row'];

export type BudgetAlert = Database['public']['Tables']['budget_alerts']['Row'];
export type Transaction = Database['public']['Tables']['financial_transactions']['Row'];

export const useBudgetTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7) + '-01');

  // Fetch current month's budget
  const budgetQuery = useQuery({
    queryKey: ['budget', user?.id, currentMonth],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch budget categories
  const categoriesQuery = useQuery({
    queryKey: ['budget-categories', budgetQuery.data?.id],
    queryFn: async () => {
      if (!budgetQuery.data?.id) return [];
      
      const { data, error } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('budget_id', budgetQuery.data.id)
        .order('category');

      if (error) throw error;
      return data || [];
    },
    enabled: !!budgetQuery.data?.id,
  });

  // Fetch transactions for current month
  const transactionsQuery = useQuery({
    queryKey: ['transactions', user?.id, currentMonth],
    queryFn: async () => {
      if (!user) return [];
      
      const startDate = new Date(currentMonth);
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
      
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('transaction_date', startDate.toISOString().split('T')[0])
        .lte('transaction_date', endDate.toISOString().split('T')[0])
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch budget alerts
  const alertsQuery = useQuery({
    queryKey: ['budget-alerts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('budget_alerts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Create budget mutation
  const createBudgetMutation = useMutation({
    mutationFn: async (budgetData: {
      totalBudget: number;
      totalIncome?: number;
      categories: { category: string; limit: number }[];
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Create budget
      const { data: budget, error: budgetError } = await supabase
        .from('user_budgets')
        .insert({
          user_id: user.id,
          month: currentMonth,
          total_budget: budgetData.totalBudget,
          total_income: budgetData.totalIncome || 0,
        })
        .select()
        .single();

      if (budgetError) throw budgetError;

      // Create categories
      const categories = budgetData.categories.map(cat => ({
        budget_id: budget.id,
        category: cat.category,
        budget_limit: cat.limit,
      }));

      const { error: categoriesError } = await supabase
        .from('budget_categories')
        .insert(categories);

      if (categoriesError) throw categoriesError;

      return budget;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget'] });
      queryClient.invalidateQueries({ queryKey: ['budget-categories'] });
      toast({
        title: "Budget Created! 📊",
        description: "Your monthly budget has been set up successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create budget",
        variant: "destructive",
      });
    },
  });

  // Add transaction mutation
  const addTransactionMutation = useMutation({
    mutationFn: async (transactionData: {
      amount: number;
      transaction_type: string;
      category: string;
      description?: string;
      merchant_name?: string;
      payment_method?: string;
      location?: string;
      notes?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('financial_transactions')
        .insert({
          user_id: user.id,
          amount: transactionData.amount,
          transaction_type: transactionData.transaction_type,
          category: transactionData.category,
          description: transactionData.description,
          merchant_name: transactionData.merchant_name,
          payment_method: transactionData.payment_method,
          location: transactionData.location,
          notes: transactionData.notes,
          transaction_date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budget-categories'] });
      toast({
        title: "Transaction Added! 💳",
        description: "Your transaction has been recorded.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add transaction",
        variant: "destructive",
      });
    },
  });

  // Spend from budget category
  const spendFromCategoryMutation = useMutation({
    mutationFn: async (spendData: {
      category: string;
      amount: number;
      payment_method: string;
      paybill_number?: string;
      account_number?: string;
      till_number?: string;
      phone_number?: string;
      notes?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('financial_transactions')
        .insert({
          user_id: user.id,
          amount: spendData.amount,
          transaction_type: 'expense',
          budget_category: spendData.category,
          category: spendData.category,
          budget_transaction_type: 'spend',
          payment_method: spendData.payment_method,
          mpesa_paybill_number: spendData.paybill_number,
          mpesa_account_number: spendData.account_number,
          mpesa_till_number: spendData.till_number,
          mpesa_phone_number: spendData.phone_number,
          notes: spendData.notes,
          description: `Spent from ${spendData.category} budget`,
          transaction_date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budget-categories'] });
      queryClient.invalidateQueries({ queryKey: ['budget-alerts'] });
      toast({
        title: "✅ Payment Processed!",
        description: `KES ${variables.amount.toLocaleString()} spent from ${variables.category} budget via ${variables.payment_method.replace('_', ' ')}.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    },
  });

  // Top-up budget category
  const topUpCategoryMutation = useMutation({
    mutationFn: async (topUpData: {
      category: string;
      amount: number;
      payment_method: string;
      paybill_number?: string;
      account_number?: string;
      till_number?: string;
      phone_number?: string;
      notes?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('financial_transactions')
        .insert({
          user_id: user.id,
          amount: topUpData.amount,
          transaction_type: 'income',
          budget_category: topUpData.category,
          category: topUpData.category,
          budget_transaction_type: 'top_up',
          payment_method: topUpData.payment_method,
          mpesa_paybill_number: topUpData.paybill_number,
          mpesa_account_number: topUpData.account_number,
          mpesa_till_number: topUpData.till_number,
          mpesa_phone_number: topUpData.phone_number,
          notes: topUpData.notes,
          description: `Top-up for ${topUpData.category} budget`,
          transaction_date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budget-categories'] });
      toast({
        title: "✅ Top-Up Successful!",
        description: `${variables.category} budget topped up with KES ${variables.amount.toLocaleString()} via ${variables.payment_method.replace('_', ' ')}.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Top-Up Failed",
        description: error.message || "Failed to process top-up",
        variant: "destructive",
      });
    },
  });

  // Update transaction category mutation
  const updateTransactionMutation = useMutation({
    mutationFn: async ({ id, budget_category }: { id: string; budget_category: string }) => {
      const { data, error } = await supabase
        .from('financial_transactions')
        .update({ budget_category, auto_categorized: false })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budget-categories'] });
      toast({
        title: "Category Updated! 📝",
        description: "Transaction category has been updated.",
      });
    },
  });

  // Mark alert as read mutation
  const markAlertReadMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('budget_alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-alerts'] });
    },
  });

  // Calculate spending by category
  const getSpendingByCategory = () => {
    const transactions = transactionsQuery.data || [];
    const expenses = transactions.filter(t => t.transaction_type === 'expense');
    
    const categorySpending: Record<string, number> = {};
    expenses.forEach(transaction => {
      const category = transaction.budget_category || transaction.category || 'Other';
      categorySpending[category] = (categorySpending[category] || 0) + transaction.amount;
    });
    
    return categorySpending;
  };

  // Calculate remaining budget
  const getRemainingBudget = () => {
    const categories = categoriesQuery.data || [];
    const spending = getSpendingByCategory();
    
    return categories.map(category => ({
      ...category,
      spent_amount: spending[category.category] || 0,
      remaining: category.budget_limit - (spending[category.category] || 0),
      percentage: ((spending[category.category] || 0) / category.budget_limit) * 100,
    }));
  };

  return {
    // Data
    budget: budgetQuery.data,
    categories: categoriesQuery.data || [],
    transactions: transactionsQuery.data || [],
    alerts: alertsQuery.data || [],
    currentMonth,
    
    // Computed data
    spendingByCategory: getSpendingByCategory(),
    remainingBudget: getRemainingBudget(),
    
    // Loading states
    isLoading: budgetQuery.isLoading || categoriesQuery.isLoading || transactionsQuery.isLoading,
    
    // Actions
    createBudget: createBudgetMutation.mutate,
    addTransaction: addTransactionMutation.mutate,
    updateTransactionCategory: updateTransactionMutation.mutate,
    markAlertAsRead: markAlertReadMutation.mutate,
    spendFromCategory: spendFromCategoryMutation.mutateAsync,
    topUpCategory: topUpCategoryMutation.mutateAsync,
    setCurrentMonth,
    
    // Mutation states
    isCreatingBudget: createBudgetMutation.isPending,
    isAddingTransaction: addTransactionMutation.isPending,
    isUpdatingTransaction: updateTransactionMutation.isPending,
    isSpending: spendFromCategoryMutation.isPending,
    isToppingUp: topUpCategoryMutation.isPending,
  };
};