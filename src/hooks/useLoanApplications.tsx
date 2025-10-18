import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface LoanApplication {
  id: string;
  borrower_id: string;
  amount: number;
  duration_months: number;
  eligibility_score?: number;
  funding_progress?: number;
  interest_rate?: number;
  status: string;
  disbursed_at?: string;
  created_at: string;
  updated_at: string;
  collateral?: string;
  documents?: any;
}

export interface LoanOffer {
  id: string;
  investor_id: string;
  loan_application_id: string;
  offered_amount: number;
  offered_interest_rate: number;
  status: string;
  message?: string;
  created_at: string;
  updated_at: string;
}

export interface LoanRepayment {
  id: string;
  loan_application_id: string;
  payment_number: number;
  due_date: string;
  payment_amount: number;
  principal_amount: number;
  interest_amount: number;
  penalty_amount: number;
  amount_paid: number;
  payment_date?: string;
  payment_method?: string;
  payment_reference?: string;
  status: string;
  remaining_balance: number;
  created_at: string;
  updated_at: string;
}

export const useLoanApplications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's loan applications
  const applicationsQuery = useQuery({
    queryKey: ['loan-applications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('loan_applications')
        .select('*')
        .eq('borrower_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  // Fetch loan offers
  const offersQuery = useQuery({
    queryKey: ['loan-offers', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('loan_offers')
        .select(`
          *,
          loan_applications!inner(borrower_id)
        `)
        .eq('loan_applications.borrower_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  // Fetch loan repayments
  const repaymentsQuery = useQuery({
    queryKey: ['loan-repayments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('loan_repayments')
        .select(`
          *,
          loan_applications!inner(borrower_id)
        `)
        .eq('loan_applications.borrower_id', user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  // Create loan application
  const createApplicationMutation = useMutation({
    mutationFn: async (applicationData: Partial<LoanApplication>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('loan_applications')
        .insert([{
          borrower_id: user.id,
          amount: applicationData.amount || 10000,
          duration_months: applicationData.duration_months || 12,
          interest_rate: 15.0, // Default interest rate
          ...applicationData,
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Try auto-approval
      const { data: autoApproved } = await supabase.rpc('auto_approve_loan', {
        application_id: data.id
      });

      return { ...data, auto_approved: autoApproved };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['loan-applications'] });
      toast({
        title: data.auto_approved ? "Application Auto-Approved! 🎉" : "Application Submitted! 📋",
        description: data.auto_approved 
          ? "Your loan has been automatically approved and is ready for disbursement."
          : "Your loan application has been submitted for review.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit loan application",
        variant: "destructive",
      });
    },
  });

  // Process loan repayment
  const makeRepaymentMutation = useMutation({
    mutationFn: async ({
      repaymentId,
      amount,
      paymentMethod = 'mobile_money',
      paymentReference
    }: {
      repaymentId: string;
      amount: number;
      paymentMethod?: string;
      paymentReference?: string;
    }) => {
      const { data, error } = await supabase.rpc('process_loan_repayment', {
        repayment_id: repaymentId,
        payment_amount: amount,
        payment_method: paymentMethod,
        payment_reference: paymentReference
      });

      if (error) throw error;
      if (typeof data === 'object' && data && 'success' in data && !data.success) {
        throw new Error((data as any).message);
      }
      
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['loan-repayments'] });
      queryClient.invalidateQueries({ queryKey: ['loan-applications'] });
      toast({
        title: "Payment Successful! 💳",
        description: `Payment of KES ${variables.amount} processed successfully.`,
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

  // Calculate credit score
  const calculateCreditScoreMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('calculate_credit_score', {
        user_id_param: user.id
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (score) => {
      toast({
        title: "Credit Score Updated! 📊",
        description: `Your credit score is ${score}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to calculate credit score",
        variant: "destructive",
      });
    },
  });

  return {
    // Data
    applications: applicationsQuery.data || [],
    offers: offersQuery.data || [],
    repayments: repaymentsQuery.data || [],
    isLoading: applicationsQuery.isLoading || offersQuery.isLoading || repaymentsQuery.isLoading,
    
    // Actions
    createApplication: createApplicationMutation.mutate,
    makeRepayment: makeRepaymentMutation.mutate,
    calculateCreditScore: calculateCreditScoreMutation.mutate,
    
    // States
    isCreating: createApplicationMutation.isPending,
    isProcessingPayment: makeRepaymentMutation.isPending,
    isCalculatingScore: calculateCreditScoreMutation.isPending,
  };
};