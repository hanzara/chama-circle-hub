import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ComprehensiveAnalyticsData {
  overview: {
    totalSavings: number;
    totalInvestments: number;
    totalLoans: number;
    netWorth: number;
    monthlyGrowth: number;
    activeChamasCount: number;
  };
  chamaAnalytics: {
    name: string;
    totalContributed: number;
    currentBalance: number;
    memberCount: number;
    growthRate: number;
  }[];
  personalSavings: {
    totalSaved: number;
    goalProgress: {
      goalName: string;
      current: number;
      target: number;
      progress: number;
    }[];
  };
  contributionTrends: {
    month: string;
    chamaContributions: number;
    personalSavings: number;
    total: number;
  }[];
  investmentPerformance: {
    month: string;
    invested: number;
    returns: number;
    netGain: number;
  }[];
  loanSummary: {
    totalBorrowed: number;
    totalRepaid: number;
    activeLoans: number;
    repaymentRate: number;
  };
  recentActivities: {
    type: 'contribution' | 'savings' | 'loan' | 'investment';
    description: string;
    amount: number;
    date: string;
    chamaName?: string;
  }[];
  financialHealth: {
    score: number;
    factors: {
      savings: number;
      diversification: number;
      consistency: number;
      debt: number;
    };
  };
}

export const useComprehensiveAnalytics = () => {
  const { user } = useAuth();

  return useQuery<ComprehensiveAnalyticsData>({
    queryKey: ['comprehensive-analytics', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const userId = user.id;
      console.log('Fetching comprehensive analytics for user:', userId);

      // Get user's chamas and contributions
      const { data: chamaMembers, error: chamaError } = await supabase
        .from('chama_members')
        .select(`
          chama_id,
          total_contributed,
          chamas!inner(
            id,
            name,
            total_savings,
            current_members
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true);

      if (chamaError) {
        console.error('Error fetching chama data:', chamaError);
      }

      // Get member IDs for contributions query
      const memberIds: string[] = [];
      if (chamaMembers && chamaMembers.length > 0) {
        const { data: memberIdData } = await supabase
          .from('chama_members')
          .select('id')
          .eq('user_id', userId)
          .eq('is_active', true);
        
        if (memberIdData) {
          memberIds.push(...memberIdData.map(m => m.id));
        }
      }

      // Get user's contributions with dates
      const { data: contributions, error: contributionsError } = await supabase
        .from('chama_contributions_new')
        .select(`
          amount,
          contribution_date,
          chama_id,
          chamas!inner(name)
        `)
        .in('member_id', memberIds)
        .order('contribution_date', { ascending: false })
        .limit(50);

      if (contributionsError) {
        console.error('Error fetching contributions:', contributionsError);
      }

      // Get personal savings goals
      const { data: savingsGoals, error: savingsError } = await supabase
        .from('personal_savings_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (savingsError) {
        console.error('Error fetching savings goals:', savingsError);
      }

      // Get personal savings transactions
      const { data: savingsTransactions, error: savingsTransactionsError } = await supabase
        .from('personal_savings_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (savingsTransactionsError) {
        console.error('Error fetching savings transactions:', savingsTransactionsError);
      }

      // Get investment data
      const { data: investments, error: investmentError } = await supabase
        .from('user_investments')
        .select('*')
        .eq('investor_id', userId);

      if (investmentError) {
        console.error('Error fetching investments:', investmentError);
      }

      // Get loan data
      const { data: loans, error: loansError } = await supabase
        .from('loan_applications')
        .select('*')
        .eq('borrower_id', userId);

      if (loansError) {
        console.error('Error fetching loans:', loansError);
      }

      // Get wallet balance
      const { data: walletData, error: walletError } = await supabase
        .from('user_wallets')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (walletError) {
        console.error('Error fetching wallet data:', walletError);
      }

      // Process the data
      const totalChamaContributions = chamaMembers?.reduce((sum, cm) => sum + (cm.total_contributed || 0), 0) || 0;
      const totalPersonalSavings = savingsGoals?.reduce((sum, goal) => sum + (goal.current_amount || 0), 0) || 0;
      const totalInvestments = investments?.reduce((sum, inv) => sum + (inv.amount_invested || 0), 0) || 0;
      const totalLoans = loans?.filter(loan => loan.status === 'active').reduce((sum, loan) => sum + (loan.amount || 0), 0) || 0;
      const walletBalance = walletData?.balance || 0;

      const totalSavings = totalChamaContributions + totalPersonalSavings + walletBalance;
      const netWorth = totalSavings + totalInvestments - totalLoans;

      // Calculate monthly growth (compare last 30 days vs previous 30 days)
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const recentContributions = contributions?.filter(c => new Date(c.contribution_date) >= thirtyDaysAgo) || [];
      const previousContributions = contributions?.filter(c => 
        new Date(c.contribution_date) >= sixtyDaysAgo && 
        new Date(c.contribution_date) < thirtyDaysAgo
      ) || [];

      const recentAmount = recentContributions.reduce((sum, c) => sum + Number(c.amount), 0);
      const previousAmount = previousContributions.reduce((sum, c) => sum + Number(c.amount), 0);
      const monthlyGrowth = previousAmount > 0 ? ((recentAmount - previousAmount) / previousAmount) * 100 : 0;

      // Process chama analytics
      const chamaAnalytics = chamaMembers?.map(cm => {
        const chamaContributions = contributions?.filter(c => c.chama_id === cm.chama_id) || [];
        const recentChamaContributions = chamaContributions.filter(c => new Date(c.contribution_date) >= thirtyDaysAgo);
        const previousChamaContributions = chamaContributions.filter(c => 
          new Date(c.contribution_date) >= sixtyDaysAgo && 
          new Date(c.contribution_date) < thirtyDaysAgo
        );

        const recentChamaAmount = recentChamaContributions.reduce((sum, c) => sum + Number(c.amount), 0);
        const previousChamaAmount = previousChamaContributions.reduce((sum, c) => sum + Number(c.amount), 0);
        const growthRate = previousChamaAmount > 0 ? ((recentChamaAmount - previousChamaAmount) / previousChamaAmount) * 100 : 0;

        return {
          name: cm.chamas?.name || 'Unknown Chama',
          totalContributed: cm.total_contributed || 0,
          currentBalance: cm.chamas?.total_savings || 0,
          memberCount: cm.chamas?.current_members || 0,
          growthRate
        };
      }) || [];

      // Process personal savings goals
      const goalProgress = savingsGoals?.map(goal => ({
        goalName: goal.goal_name,
        current: goal.current_amount || 0,
        target: goal.target_amount || 0,
        progress: goal.target_amount > 0 ? ((goal.current_amount || 0) / goal.target_amount) * 100 : 0
      })) || [];

      // Process contribution trends (last 12 months)
      const contributionTrends: ComprehensiveAnalyticsData['contributionTrends'] = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthYear = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const monthChamaContributions = contributions?.filter(c => {
          const contribDate = new Date(c.contribution_date);
          return contribDate >= monthStart && contribDate <= monthEnd;
        }).reduce((sum, c) => sum + Number(c.amount), 0) || 0;

        const monthPersonalSavings = savingsTransactions?.filter(t => {
          const transDate = new Date(t.created_at);
          return transDate >= monthStart && transDate <= monthEnd && t.transaction_type === 'deposit';
        }).reduce((sum, t) => sum + Number(t.amount), 0) || 0;

        contributionTrends.push({
          month: monthYear,
          chamaContributions: monthChamaContributions,
          personalSavings: monthPersonalSavings,
          total: monthChamaContributions + monthPersonalSavings
        });
      }

      // Process loan summary
      const activeLoans = loans?.filter(loan => loan.status === 'active') || [];
      const completedLoans = loans?.filter(loan => loan.status === 'completed') || [];
      const totalBorrowed = loans?.reduce((sum, loan) => sum + (loan.amount || 0), 0) || 0;
      const totalRepaid = completedLoans?.reduce((sum, loan) => sum + (loan.amount || 0), 0) || 0;
      const repaymentRate = totalBorrowed > 0 ? (totalRepaid / totalBorrowed) * 100 : 100;

      // Process recent activities
      const recentActivities: ComprehensiveAnalyticsData['recentActivities'] = [];

      // Add recent contributions
      recentContributions.slice(0, 10).forEach(contribution => {
        recentActivities.push({
          type: 'contribution',
          description: `Contributed to ${contribution.chamas?.name || 'chama'}`,
          amount: Number(contribution.amount),
          date: contribution.contribution_date,
          chamaName: contribution.chamas?.name
        });
      });

      // Add recent personal savings
      const recentSavings = savingsTransactions?.slice(0, 5) || [];
      recentSavings.forEach(saving => {
        if (saving.transaction_type === 'deposit') {
          recentActivities.push({
            type: 'savings',
            description: 'Personal savings deposit',
            amount: Number(saving.amount),
            date: saving.created_at
          });
        }
      });

      // Sort by date
      recentActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Calculate financial health score
      const savingsScore = Math.min((totalSavings / 100000) * 25, 25); // Max 25 points for 100k savings
      const diversificationScore = (chamaAnalytics.length > 0 ? 10 : 0) + (goalProgress.length > 0 ? 10 : 0) + (totalInvestments > 0 ? 5 : 0); // Max 25 points
      const consistencyScore = recentContributions.length > 0 ? Math.min(recentContributions.length * 2, 25) : 0; // Max 25 points
      const debtScore = totalLoans > 0 ? Math.max(25 - (totalLoans / totalSavings) * 25, 0) : 25; // Max 25 points

      const financialHealthScore = Math.round(savingsScore + diversificationScore + consistencyScore + debtScore);

      return {
        overview: {
          totalSavings,
          totalInvestments,
          totalLoans,
          netWorth,
          monthlyGrowth,
          activeChamasCount: chamaAnalytics.length
        },
        chamaAnalytics,
        personalSavings: {
          totalSaved: totalPersonalSavings,
          goalProgress
        },
        contributionTrends,
        investmentPerformance: [], // To be implemented when investment tracking is added
        loanSummary: {
          totalBorrowed,
          totalRepaid,
          activeLoans: activeLoans.length,
          repaymentRate
        },
        recentActivities: recentActivities.slice(0, 10),
        financialHealth: {
          score: financialHealthScore,
          factors: {
            savings: Math.round(savingsScore),
            diversification: Math.round(diversificationScore),
            consistency: Math.round(consistencyScore),
            debt: Math.round(debtScore)
          }
        }
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
};