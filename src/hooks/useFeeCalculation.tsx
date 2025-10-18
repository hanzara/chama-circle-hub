import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface FeeConfiguration {
  id: string;
  transaction_type: string;
  fee_type: 'fixed' | 'percentage' | 'tiered';
  minimum_fee: number;
  maximum_fee: number | null;
  percentage_rate: number;
  tiers: any; // Using any for JSON compatibility
  is_active: boolean;
}

export interface TransactionFee {
  id: string;
  transaction_id: string | null;
  transaction_type: string;
  amount: number;
  fee_amount: number;
  user_id: string;
  created_at: string;
}

export const useFeeCalculation = () => {
  const { user } = useAuth();

  // Fetch all active fee configurations
  const { data: feeConfigurations = [], isLoading: isLoadingConfigurations } = useQuery({
    queryKey: ['fee-configurations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fee_configurations')
        .select('*')
        .eq('is_active', true)
        .order('transaction_type');
      
      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        tiers: Array.isArray(item.tiers) ? item.tiers : []
      })) as FeeConfiguration[];
    }
  });

  // Fetch user's transaction fees
  const { data: userTransactionFees = [], isLoading: isLoadingFees } = useQuery({
    queryKey: ['transaction-fees', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('transaction_fees')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as TransactionFee[];
    },
    enabled: !!user
  });

  // Calculate fee for a transaction
  const calculateFee = async (transactionType: string, amount: number): Promise<number> => {
    const { data, error } = await supabase.rpc('calculate_transaction_fee', {
      p_transaction_type: transactionType,
      p_amount: amount
    });

    if (error) {
      console.error('Error calculating fee:', error);
      return 0;
    }

    return Number(data || 0);
  };

  // Get fee configuration for a transaction type
  const getFeeConfiguration = (transactionType: string): FeeConfiguration | null => {
    return feeConfigurations.find(config => config.transaction_type === transactionType) || null;
  };

  // Client-side fee calculation (for preview purposes)
  const calculateFeeLocally = (transactionType: string, amount: number): number => {
    const config = getFeeConfiguration(transactionType);
    if (!config) return 0;

    let calculatedFee = 0;

    switch (config.fee_type) {
      case 'fixed':
        calculatedFee = config.minimum_fee;
        break;
      
      case 'percentage':
        calculatedFee = amount * (config.percentage_rate / 100);
        calculatedFee = Math.max(calculatedFee, config.minimum_fee);
        if (config.maximum_fee) {
          calculatedFee = Math.min(calculatedFee, config.maximum_fee);
        }
        break;
      
      case 'tiered':
        const tiers = Array.isArray(config.tiers) ? config.tiers : [];
        const tier = tiers.find((t: any) => 
          amount >= t.min && (t.max === undefined || amount <= t.max)
        );
        calculatedFee = tier ? tier.fee : 0;
        break;
    }

    return Math.round(calculatedFee * 100) / 100; // Round to 2 decimal places
  };

  // Get fee breakdown for display
  const getFeeBreakdown = (transactionType: string, amount: number) => {
    const config = getFeeConfiguration(transactionType);
    const fee = calculateFeeLocally(transactionType, amount);
    
    return {
      transactionType,
      amount,
      fee,
      netAmount: amount - fee,
      configuration: config,
      feePercentage: amount > 0 ? (fee / amount) * 100 : 0
    };
  };

  // Get user-friendly transaction type labels
  const getTransactionTypeLabel = (transactionType: string): string => {
    const labels: Record<string, string> = {
      'wallet_topup': 'Wallet Top-up',
      'chama_contribution': 'Chama Contribution',
      'loan_processing': 'Loan Processing',
      'withdrawal': 'Withdrawal',
      'send_money': 'Send Money',
      'investment_advisory_ai': 'AI Investment Advisory',
      'investment_advisory_expert': 'Expert Consultation',
      'investment_advisory_portfolio': 'Portfolio Review',
      'premium_subscription': 'Premium Subscription',
      'game_entry': 'Game Entry',
      'monthly_maintenance': 'Monthly Maintenance Fee'
    };
    
    return labels[transactionType] || transactionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get total fees paid by user this month
  const getMonthlyFeesTotal = (): number => {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    return userTransactionFees
      .filter(fee => new Date(fee.created_at) >= currentMonth)
      .reduce((total, fee) => total + fee.fee_amount, 0);
  };

  // Get fee statistics
  const getFeeStatistics = () => {
    const totalFees = userTransactionFees.reduce((total, fee) => total + fee.fee_amount, 0);
    const averageFee = userTransactionFees.length > 0 ? totalFees / userTransactionFees.length : 0;
    const monthlyFees = getMonthlyFeesTotal();
    
    const feesByType = userTransactionFees.reduce((acc, fee) => {
      acc[fee.transaction_type] = (acc[fee.transaction_type] || 0) + fee.fee_amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalFees,
      averageFee,
      monthlyFees,
      feesByType,
      transactionCount: userTransactionFees.length
    };
  };

  return {
    // Data
    feeConfigurations,
    userTransactionFees,
    
    // Loading states
    isLoadingConfigurations,
    isLoadingFees,
    
    // Functions
    calculateFee,
    calculateFeeLocally,
    getFeeConfiguration,
    getFeeBreakdown,
    getTransactionTypeLabel,
    getMonthlyFeesTotal,
    getFeeStatistics
  };
};