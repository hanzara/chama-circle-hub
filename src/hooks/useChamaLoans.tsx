import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useChamaLoans = (chamaId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch loan applications for the chama
  const loansQuery = useQuery({
    queryKey: ['chama-loans', chamaId],
    queryFn: async () => {
      console.log('Fetching loans for chama:', chamaId);

      const { data, error } = await (supabase as any)
        .from('chama_loans')
        .select(`
          *,
          chama_members!inner(
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
      return data || [];
    },
    enabled: !!chamaId,
  });

  // Apply for a loan
  const applyForLoanMutation = useMutation({
    mutationFn: async ({ 
      amount, 
      purpose, 
      repaymentPeriodMonths,
      collateral 
    }: {
      amount: number;
      purpose: string;
      repaymentPeriodMonths: number;
      collateral?: string;
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

      // Create loan application
      const { data, error } = await (supabase as any)
        .from('chama_loans')
        .insert({
          chama_id: chamaId,
          borrower_id: memberData.id,
          amount,
          duration_months: repaymentPeriodMonths,
          status: 'pending',
          interest_rate: 12.5 // Default rate
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

  return {
    loans: loansQuery.data || [],
    isLoading: loansQuery.isLoading,
    applyForLoan: applyForLoanMutation.mutate,
    isApplying: applyForLoanMutation.isPending,
    approveLoan: approveLoanMutation.mutate,
    isApproving: approveLoanMutation.isPending,
    rejectLoan: rejectLoanMutation.mutate,
    isRejecting: rejectLoanMutation.isPending,
  };
};