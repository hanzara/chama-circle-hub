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

  useEffect(() => {
    refreshData();
  }, []);

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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Fetch savings goals
      const { data: goals } = await supabase
        .from('personal_savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (goals) {
        setSavingsGoals(goals);
        
        // Calculate total savings from goals
        const totalSavings = goals.reduce((sum, goal) => sum + (goal.current_amount || 0), 0);
        
        setWalletData(prev => ({
          ...prev,
          totalSavings
        }));
      }

      // Fetch recent transactions
      const { data: transactions } = await supabase
        .from('personal_savings_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (transactions) {
        setSavingsTransactions(transactions);
        
        // Calculate streak (days with consecutive deposits)
        const today = new Date();
        let streak = 0;
        const sortedTransactions = [...transactions].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        for (const txn of sortedTransactions) {
          const txnDate = new Date(txn.created_at);
          const daysDiff = Math.floor((today.getTime() - txnDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysDiff <= streak + 1 && txn.transaction_type === 'deposit') {
            streak++;
          } else {
            break;
          }
        }
        
        setWalletData(prev => ({
          ...prev,
          currentStreak: streak
        }));
      }
    } catch (error) {
      console.error('Error refreshing savings data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSavingsBreakdown = () => {
    if (!savingsGoals || savingsGoals.length === 0) return [];
    
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    
    return savingsGoals.map((goal, index) => ({
      name: goal.goal_name || 'Unnamed Goal',
      value: goal.current_amount || 0,
      color: colors[index % colors.length]
    })).filter(item => item.value > 0);
  };

  const getSavingsData = () => {
    return savingsTransactions;
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