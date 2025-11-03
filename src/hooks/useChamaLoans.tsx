import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface ChamaLoan {
  id: string;
  chama_id: string;
  borrower_id: string;
  amount: number;
  duration_months: number;
  interest_rate: number;
  status: 'pending' | 'approved' | 'active' | 'completed' | 'rejected';
  purpose?: string;
  approved_by?: string;
  approved_at?: string;
  due_date?: string;
  repaid_amount: number;
  amount_paid?: number;
  disbursement_status?: boolean;
  reward_status?: boolean;
  member_payment_number?: string;
  report?: string;
  funds_sent_at?: string;
  repayment_schedule?: any;
  created_at: string;
  updated_at?: string;
  chama_members?: {
    user_id: string;
  };
}

export interface CreditScore {
  id: string;
  user_id: string;
  chama_id: string;
  credit_score: number;
  total_amount_borrowed: number;
  total_amount_repaid: number;
  on_time_repayments: number;
  late_repayments: number;
  missed_repayments: number;
  last_calculated_at: string;
}

export const useChamaLoans = (chamaId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch loan applications for the chama with credit scores
  const loansQuery = useQuery({
    queryKey: ['chama-loans', chamaId],
    queryFn: async () => {
      console.log('Fetching loans for chama:', chamaId);

      const { data, error } = await (supabase as any)
        .from('chama_loans')
        .select(`
          *,
          chama_members!chama_loans_borrower_id_fkey(
            id,
            user_id
          )
        `)
        .eq('chama_id', chamaId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching loans:', error);
        throw error;
      }

      console.log('Fetched loans:', data);
      return data as ChamaLoan[] || [];
    },
    enabled: !!chamaId,
  });

  // Fetch credit score for current user
  const creditScoreQuery = useQuery({
    queryKey: ['credit-score', chamaId, user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await (supabase as any)
        .from('member_credit_scores')
        .select('*')
        .eq('user_id', user.id)
        .eq('chama_id', chamaId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching credit score:', error);
        throw error;
      }

      return data as CreditScore | null;
    },
    enabled: !!user && !!chamaId,
  });

  // Apply for a loan with credit score calculation
  const applyForLoanMutation = useMutation({
    mutationFn: async ({ 
      amount, 
      purpose, 
      repaymentPeriodMonths
    }: {
      amount: number;
      purpose: string;
      repaymentPeriodMonths: number;
    }) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Applying for loan:', { amount, purpose, repaymentPeriodMonths });

      // Get current user's member ID
      const { data: memberData, error: memberError } = await (supabase as any)
        .from('chama_members')
        .select('id')
        .eq('chama_id', chamaId)
        .eq('user_id', user.id)
        .single();

      if (memberError || !memberData) {
        console.error('Error getting member data:', memberError);
        throw new Error('You must be a member to apply for loans');
      }

      // Get chama settings for interest rate
      const { data: settings } = await (supabase as any)
        .from('chama_settings')
        .select('loan_interest_rate, max_loan_amount')
        .eq('chama_id', chamaId)
        .maybeSingle();

      const interestRate = settings?.loan_interest_rate || 10.0;
      const maxLoan = settings?.max_loan_amount || 1000000;

      if (amount > maxLoan) {
        throw new Error(`Maximum loan amount is KES ${maxLoan.toLocaleString()}`);
      }

      // Create loan application
      const { data, error } = await (supabase as any)
        .from('chama_loans')
        .insert({
          chama_id: chamaId,
          borrower_id: memberData.id,
          amount,
          purpose,
          duration_months: repaymentPeriodMonths,
          status: 'pending',
          interest_rate: interestRate,
          repaid_amount: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating loan application:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chama-loans'] });
      queryClient.invalidateQueries({ queryKey: ['credit-score'] });
      toast({
        title: "Loan Application Submitted! 📋",
        description: "Your loan application has been submitted for review by administrators",
      });
    },
    onError: (error: any) => {
      console.error('Loan application failed:', error);
      toast({
        title: "Application Failed",
        description: error.message || "Failed to submit loan application",
        variant: "destructive",
      });
    },
  });

  // Approve loan (admin only)
  const approveLoanMutation = useMutation({
    mutationFn: async ({ loanId }: { loanId: string }) => {
      console.log('Approving loan:', loanId);

      const { data, error } = await (supabase as any)
        .from('chama_loans')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', loanId)
        .select()
        .single();

      if (error) {
        console.error('Error approving loan:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chama-loans'] });
      toast({
        title: "Loan Approved! ✅",
        description: "The loan application has been approved",
      });
    },
    onError: (error: any) => {
      console.error('Loan approval failed:', error);
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve loan",
        variant: "destructive",
      });
    },
  });

  // Reject loan (admin only)
  const rejectLoanMutation = useMutation({
    mutationFn: async ({ loanId, reason }: { loanId: string; reason: string }) => {
      console.log('Rejecting loan:', loanId, reason);

      const { data, error } = await (supabase as any)
        .from('chama_loans')
        .update({ 
          status: 'rejected'
        })
        .eq('id', loanId)
        .select()
        .single();

      if (error) {
        console.error('Error rejecting loan:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chama-loans'] });
      toast({
        title: "Loan Rejected",
        description: "The loan application has been rejected",
      });
    },
    onError: (error: any) => {
      console.error('Loan rejection failed:', error);
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject loan",
        variant: "destructive",
      });
    },
  });

  // Repay loan mutation
  const repayLoanMutation = useMutation({
    mutationFn: async ({ loanId, amount }: { loanId: string; amount: number }) => {
      const { data, error } = await (supabase as any)
        .from('chama_loan_repayments')
        .insert({
          loan_id: loanId,
          amount,
          payment_method: 'contribution',
          status: 'completed'
        })
        .select()
        .single();

      if (error) throw error;

      // Update loan repaid amount
      const { data: loan } = await (supabase as any)
        .from('chama_loans')
        .select('repaid_amount')
        .eq('id', loanId)
        .single();

      const newRepaidAmount = (loan?.repaid_amount || 0) + amount;

      await (supabase as any)
        .from('chama_loans')
        .update({ 
          repaid_amount: newRepaidAmount,
          status: newRepaidAmount >= amount ? 'completed' : 'active'
        })
        .eq('id', loanId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chama-loans'] });
      queryClient.invalidateQueries({ queryKey: ['credit-score'] });
      toast({
        title: "Repayment Successful! ✅",
        description: "Your loan repayment has been recorded",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Repayment Failed",
        description: error.message || "Failed to process repayment",
        variant: "destructive",
      });
    },
  });

  // Calculate credit score
  const calculateCreditScoreMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await (supabase as any)
        .rpc('calculate_member_credit_score', {
          p_user_id: user.id,
          p_chama_id: chamaId
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-score'] });
    },
  });

  return {
    loans: loansQuery.data || [],
    isLoading: loansQuery.isLoading,
    creditScore: creditScoreQuery.data,
    isCreditScoreLoading: creditScoreQuery.isLoading,
    applyForLoan: applyForLoanMutation.mutate,
    isApplying: applyForLoanMutation.isPending,
    approveLoan: approveLoanMutation.mutate,
    isApproving: approveLoanMutation.isPending,
    rejectLoan: rejectLoanMutation.mutate,
    isRejecting: rejectLoanMutation.isPending,
    repayLoan: repayLoanMutation.mutate,
    isRepaying: repayLoanMutation.isPending,
    calculateCreditScore: calculateCreditScoreMutation.mutate,
  };
};