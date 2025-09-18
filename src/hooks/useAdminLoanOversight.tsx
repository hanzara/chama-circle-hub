import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface AdminLoanData {
  id: string;
  borrower_name: string;
  borrower_email: string;
  borrower_region: string;
  loan_amount: number;
  disbursed_amount: number;
  repaid_amount: number;
  remaining_amount: number;
  interest_rate: number;
  loan_term_months: number;
  status: string;
  risk_rating: string;
  credit_score: number;
  repayment_rate: number;
  created_at: string;
  approved_at: string | null;
  funded_at: string | null;
  due_date: string | null;
  days_overdue: number;
  funding_progress: number;
  loan_purpose: string;
  employment_status: string;
  monthly_income: number;
  chama_name: string;
}

export interface LoanStatistics {
  total_loans: number;
  total_volume: number;
  active_loans: number;
  pending_loans: number;
  overdue_loans: number;
  completed_loans: number;
  avg_repayment_rate: number;
  risk_distribution: {
    low: number;
    medium: number;
    high: number;
  };
}

// Hook to fetch all loans for admin oversight
export const useAdminLoansOverview = () => {
  return useQuery({
    queryKey: ['admin-loans-overview'],
    queryFn: async () => {
      console.log('Fetching admin loans overview...');
      
      const { data, error } = await supabase.rpc('get_admin_loans_overview');
      
      if (error) {
        console.error('Error fetching admin loans:', error);
        throw error;
      }
      
      console.log('Fetched admin loans:', data);
      return data as AdminLoanData[];
    },
  });
};

// Hook to fetch loan statistics
export const useAdminLoanStatistics = () => {
  return useQuery({
    queryKey: ['admin-loan-statistics'],
    queryFn: async () => {
      console.log('Fetching admin loan statistics...');
      
      const { data, error } = await supabase.rpc('get_admin_loan_statistics');
      
      if (error) {
        console.error('Error fetching loan statistics:', error);
        throw error;
      }
      
      console.log('Fetched loan statistics:', data);
      return data?.[0] as LoanStatistics;
    },
  });
};

// Hook to update loan status (approve/reject/disburse)
export const useUpdateLoanStatus = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      loanId,
      status,
      rejectionReason,
    }: {
      loanId: string;
      status: string;
      rejectionReason?: string;
    }) => {
      console.log('Updating loan status:', { loanId, status, rejectionReason });
      
      const { data, error } = await supabase.rpc('admin_update_loan_status', {
        p_loan_id: loanId,
        p_status: status,
        p_rejection_reason: rejectionReason || null,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch loan data
      queryClient.invalidateQueries({ queryKey: ['admin-loans-overview'] });
      queryClient.invalidateQueries({ queryKey: ['admin-loan-statistics'] });
      
      toast({
        title: "Success",
        description: `Loan ${variables.status} successfully`,
      });
    },
    onError: (error: any) => {
      console.error('Error updating loan status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update loan status",
        variant: "destructive",
      });
    },
  });
};

// Hook to export loan data
export const useExportLoanData = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (filters: {
      status?: string;
      riskLevel?: string;
      region?: string;
      searchTerm?: string;
    }) => {
      // For now, we'll use the existing data and filter client-side
      // In a real implementation, you might want to create a server-side export function
      const { data, error } = await supabase.rpc('get_admin_loans_overview');
      
      if (error) throw error;
      
      // Apply filters
      let filteredData = data as AdminLoanData[];
      
      if (filters.status && filters.status !== 'all') {
        filteredData = filteredData.filter(loan => loan.status === filters.status);
      }
      
      if (filters.riskLevel && filters.riskLevel !== 'all') {
        filteredData = filteredData.filter(loan => loan.risk_rating === filters.riskLevel);
      }
      
      if (filters.region && filters.region !== 'all') {
        filteredData = filteredData.filter(loan => loan.borrower_region === filters.region);
      }
      
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filteredData = filteredData.filter(loan => 
          loan.borrower_name.toLowerCase().includes(term) ||
          loan.borrower_email.toLowerCase().includes(term) ||
          loan.chama_name.toLowerCase().includes(term) ||
          loan.id.toLowerCase().includes(term)
        );
      }
      
      return filteredData;
    },
    onSuccess: (data) => {
      // Create CSV content
      const headers = [
        'Loan ID', 'Borrower Name', 'Email', 'Region', 'Loan Amount', 
        'Disbursed Amount', 'Repaid Amount', 'Remaining Amount', 'Interest Rate',
        'Term (Months)', 'Status', 'Risk Rating', 'Credit Score', 'Repayment Rate',
        'Created Date', 'Approved Date', 'Funded Date', 'Due Date', 'Days Overdue',
        'Funding Progress', 'Purpose', 'Employment Status', 'Monthly Income', 'Chama Name'
      ];
      
      const csvContent = [
        headers.join(','),
        ...data.map(loan => [
          loan.id,
          `"${loan.borrower_name}"`,
          loan.borrower_email,
          loan.borrower_region,
          loan.loan_amount,
          loan.disbursed_amount,
          loan.repaid_amount,
          loan.remaining_amount,
          loan.interest_rate,
          loan.loan_term_months,
          loan.status,
          loan.risk_rating,
          loan.credit_score,
          loan.repayment_rate,
          loan.created_at,
          loan.approved_at || '',
          loan.funded_at || '',
          loan.due_date || '',
          loan.days_overdue,
          loan.funding_progress,
          `"${loan.loan_purpose}"`,
          loan.employment_status,
          loan.monthly_income,
          `"${loan.chama_name}"`
        ].join(','))
      ].join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `admin_loans_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export Successful",
        description: `Exported ${data.length} loan records to CSV`,
      });
    },
    onError: (error: any) => {
      console.error('Error exporting loan data:', error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export loan data",
        variant: "destructive",
      });
    },
  });
};

// Hook to get unique regions for filtering
export const useAdminLoanRegions = () => {
  return useQuery({
    queryKey: ['admin-loan-regions'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_loans_overview');
      
      if (error) throw error;
      
      // Extract unique regions
      const regions = [...new Set((data as AdminLoanData[]).map(loan => loan.borrower_region))];
      return regions.filter(region => region && region !== 'Unknown');
    },
  });
};