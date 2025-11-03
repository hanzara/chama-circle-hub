import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface MonthlyMaintenanceFee {
  id: string;
  user_id: string;
  fee_amount: number;
  due_date: string;
  status: 'pending' | 'deducted' | 'waived';
  deducted_at: string | null;
  attempts: number;
  last_attempt_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useMonthlyMaintenanceFees = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's maintenance fees
  const { data: maintenanceFees = [], isLoading: feesLoading } = useQuery({
    queryKey: ['monthly-maintenance-fees', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('monthly_maintenance_fees')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: false })
        .limit(12); // Last 12 months

      if (error) throw error;
      return data as MonthlyMaintenanceFee[];
    },
    enabled: !!user
  });

  // Get current fee status
  const getCurrentFeeStatus = () => {
    const currentMonth = new Date();
    currentMonth.setDate(1); // First day of current month
    const currentMonthStr = currentMonth.toISOString().split('T')[0];
    
    const currentFee = maintenanceFees.find(fee => 
      fee.due_date === currentMonthStr
    );
    
    return {
      currentFee,
      hasPendingFee: currentFee?.status === 'pending',
      hasCurrentMonthFee: !!currentFee,
      nextDueDate: getNextDueDate()
    };
  };

  // Get next due date (1st of next month)
  const getNextDueDate = () => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    return nextMonth;
  };

  // Get fee statistics
  const getFeeStatistics = () => {
    const totalPaid = maintenanceFees
      .filter(fee => fee.status === 'deducted')
      .reduce((sum, fee) => sum + fee.fee_amount, 0);
    
    const pendingFees = maintenanceFees.filter(fee => fee.status === 'pending');
    const totalPending = pendingFees.reduce((sum, fee) => sum + fee.fee_amount, 0);
    
    return {
      totalPaid,
      totalPending,
      pendingCount: pendingFees.length,
      paidCount: maintenanceFees.filter(fee => fee.status === 'deducted').length,
      lastPaymentDate: maintenanceFees.find(fee => fee.status === 'deducted')?.deducted_at || null
    };
  };

  // Process pending fees manually (for testing/admin purposes)
  const processMaintenanceFeeMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('process_monthly_maintenance_fees');
      if (error) throw error;
      return data;
    },
    onSuccess: (processedCount) => {
      toast({
        title: "Fees Processed",
        description: `${processedCount} maintenance fees were processed successfully.`
      });
      queryClient.invalidateQueries({ queryKey: ['monthly-maintenance-fees'] });
      queryClient.invalidateQueries({ queryKey: ['user-wallets'] });
    },
    onError: (error: any) => {
      toast({
        title: "Processing Failed",
        description: error.message || "Failed to process maintenance fees",
        variant: "destructive"
      });
    }
  });

  // Generate fees for current month (for testing/admin purposes)
  const generateMaintenanceFeeMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('generate_monthly_maintenance_fees');
      if (error) throw error;
      return data;
    },
    onSuccess: (generatedCount) => {
      toast({
        title: "Fees Generated",
        description: `${generatedCount} maintenance fees were generated for this month.`
      });
      queryClient.invalidateQueries({ queryKey: ['monthly-maintenance-fees'] });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate maintenance fees",
        variant: "destructive"
      });
    }
  });

  // Get user-friendly status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending Payment';
      case 'deducted': return 'Paid';
      case 'waived': return 'Waived';
      default: return status;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-amber-600 bg-amber-50';
      case 'deducted': return 'text-green-600 bg-green-50';
      case 'waived': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  return {
    // Data
    maintenanceFees,
    
    // Loading states
    feesLoading,
    isProcessingFees: processMaintenanceFeeMutation.isPending,
    isGeneratingFees: generateMaintenanceFeeMutation.isPending,
    
    // Functions
    getCurrentFeeStatus,
    getNextDueDate,
    getFeeStatistics,
    getStatusText,
    getStatusColor,
    formatCurrency,
    
    // Mutations
    processMaintenanceFees: processMaintenanceFeeMutation.mutate,
    generateMaintenanceFees: generateMaintenanceFeeMutation.mutate
  };
};