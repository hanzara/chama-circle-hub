import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

// Mock implementation since chama loan tables are not available in current schema
export const useLoanData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['loan-data', user?.id],
    queryFn: async () => {
      return {
        loanApplications: [] as Array<{
          id: string;
          amount: number;
          interest_rate: number;
          duration_months: number;
          repaid_amount?: number;
          due_date?: string | null;
          status: 'active' | 'completed' | 'pending' | 'overdue';
          chamas?: { name: string } | null;
          created_at: string;
        }>,
        repayments: [] as Array<{
          id: string;
          loan_id: string;
          amount: number;
          payment_date: string;
          payment_method: string;
          status: string;
        }>,
        statistics: {
          totalBorrowed: 0,
          totalRepaid: 0,
          activeLoans: 0,
          overdueLoans: 0,
          outstandingBalance: 0,
        },
        loanHistory: [] as Array<{
          month: string;
          amount: number;
          status: string;
          chamaName: string;
        }>,
        recentActivities: [] as Array<{
          type: 'loan_application' | 'loan_repayment';
          description: string;
          amount: number;
          date: string;
          status: string;
        }>,
      };
    },
    enabled: !!user,
  });
};
