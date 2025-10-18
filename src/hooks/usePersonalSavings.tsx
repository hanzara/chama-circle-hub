// @ts-nocheck
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SavingsGoal {
  id: string;
  user_id: string;
  goal_name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface SavingsTransaction {
  id: string;
  user_id: string;
  savings_goal_id?: string;
  amount: number;
  transaction_type: string;
  frequency: string;
  payment_method: string;
  notes?: string;
  created_at: string;
}

interface PersonalWallet {
  balance: number;
  totalSavings: number;
  monthlyTarget: number;
  dailyTarget: number;
  currentStreak: number;
}

export const usePersonalSavings = () => {
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [savingsTransactions, setSavingsTransactions] = useState<SavingsTransaction[]>([]);
  const [walletData, setWalletData] = useState<PersonalWallet>({
    balance: 0,
    totalSavings: 0,
    monthlyTarget: 15000,
    dailyTarget: 500,
    currentStreak: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addSavings = async (
    amount: number, 
    goalName: string, 
    frequency: string, 
    source: string,
    pin: string
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('personal-savings-ops', {
        body: {
          operation: 'add',
          amount,
          goalName,
          frequency,
          source,
          pin
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      toast({
        title: "Savings Added! 💰",
        description: data.message,
      });

      // Refresh data
      await refreshData();
      
      return data.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add savings",
        variant: "destructive",
      });
      return null;
    }
  };

  const withdrawSavings = async (amount: number, goalId: string, pin: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('personal-savings-ops', {
        body: {
          operation: 'withdraw',
          amount,
          goalId,
          pin
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      toast({
        title: "Withdrawal Successful! 💸",
        description: data.message,
      });

      // Refresh data
      await refreshData();
      
      return data.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to withdraw savings",
        variant: "destructive",
      });
      return null;
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: goals } = await supabase
        .from('personal_savings_goals')
        .select('*')
        .eq('user_id', user.id);
      
      if (goals) setSavingsGoals(goals);
    }
    setIsLoading(false);
  };

  const getSavingsBreakdown = () => {
    return [];
  };

  const getSavingsData = () => {
    return [];
  };

  return {
    savingsGoals,
    savingsTransactions,
    walletData,
    isLoading,
    addSavings,
    withdrawSavings,
    getSavingsBreakdown,
    getSavingsData,
    refreshData
  };
};