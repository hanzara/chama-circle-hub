import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

// Recent Activities Hook
export const useRecentActivities = (chamaId: string) => {
  return useQuery({
    queryKey: ['recent-activities', chamaId],
    queryFn: async () => {
      console.log('Fetching admin activities for chama:', chamaId);

      const { data, error } = await (supabase as any)
        .from('chama_activities')
        .select(`
          *,
          chama_members!inner(
            id,
            user_id,
            profiles(full_name, email)
          )
        `)
        .eq('chama_id', chamaId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching activities:', error);
        throw error;
      }

      console.log('Fetched activities:', data);
      return data || [];
    },
    enabled: !!chamaId,
  });
};

// Recent Transactions Hook
export const useRecentTransactions = (chamaId: string) => {
  return useQuery({
    queryKey: ['recent-transactions', chamaId],
    queryFn: async () => {
      console.log('Fetching transactions for chama:', chamaId);

      const { data, error } = await (supabase as any)
        .from('chama_wallet_transactions')
        .select('*')
        .eq('chama_id', chamaId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }

      console.log('Fetched transactions:', data);
      return data || [];
    },
    enabled: !!chamaId,
  });
};

// Pending Members Hook
export const usePendingMembers = (chamaId: string) => {
  return useQuery({
    queryKey: ['pending-members', chamaId],
    queryFn: async () => {
      console.log('Fetching pending members for chama:', chamaId);

      const { data, error } = await (supabase as any)
        .from('chama_members')
        .select(`
          *,
          profiles!inner(full_name, email)
        `)
        .eq('chama_id', chamaId)
        .eq('is_active', false)
        .order('joined_at', { ascending: true });

      if (error) {
        console.error('Error fetching pending members:', error);
        throw error;
      }

      console.log('Fetched pending members:', data);
      return data || [];
    },
    enabled: !!chamaId,
  });
};

// Monthly Contributions Hook
export const useMonthlyContributions = (chamaId: string) => {
  return useQuery({
    queryKey: ['monthly-contributions', chamaId],
    queryFn: async () => {
      console.log('Fetching monthly contributions for chama:', chamaId);

      const { data, error } = await (supabase as any)
        .from('chama_contributions_new')
        .select(`
          *,
          chama_members!inner(
            id,
            user_id,
            profiles(full_name, email)
          )
        `)
        .eq('chama_id', chamaId)
        .gte('contribution_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
        .order('contribution_date', { ascending: false });

      if (error) {
        console.error('Error fetching contributions:', error);
        throw error;
      }

      console.log('Fetched contributions:', data);
      
      // Calculate summary statistics
      const totalAmount = (data as any[])?.reduce((sum: number, contribution: any) => sum + Number(contribution.amount), 0) || 0;
      const contributorsCount = new Set((data as any[])?.map((c: any) => c.member_id)).size || 0;
      const completedContributions = (data as any[])?.filter((c: any) => c.status === 'completed').length || 0;

      return {
        contributions: data || [],
        summary: {
          totalAmount,
          contributorsCount,
          completedContributions,
          averageContribution: contributorsCount > 0 ? totalAmount / contributorsCount : 0
        }
      };
    },
    enabled: !!chamaId,
  });
};

// Active Loans Hook
export const useActiveLoans = (chamaId: string) => {
  return useQuery({
    queryKey: ['active-loans', chamaId],
    queryFn: async () => {
      console.log('Fetching active loans for chama:', chamaId);

      const { data, error } = await (supabase as any)
        .from('chama_loans')
        .select('*')
        .eq('chama_id', chamaId)
        .eq('status', 'active')
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
};

// Loan Requests Hook
export const useLoanRequests = (chamaId: string) => {
  return useQuery({
    queryKey: ['loan-requests', chamaId],
    queryFn: async () => {
      console.log('Fetching loan requests for chama:', chamaId);

      const { data, error } = await (supabase as any)
        .from('chama_loan_requests')
        .select(`
          *,
          chama_members!inner(
            id,
            user_id,
            profiles(full_name, email)
          )
        `)
        .eq('chama_id', chamaId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching loan requests:', error);
        return [];
      }

      console.log('Fetched loan requests:', data);
      return data || [];
    },
    enabled: !!chamaId,
  });
};

// Manual Deposit Hook
export const useManualDeposit = (chamaId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (depositData: {
      amount: number;
      paymentMethod: string;
      paymentReference?: string;
      description?: string;
    }) => {
      const { data, error } = await (supabase as any).rpc('record_manual_deposit', {
        p_chama_id: chamaId,
        p_amount: depositData.amount,
        p_payment_method: depositData.paymentMethod,
        p_payment_reference: depositData.paymentReference,
        p_description: depositData.description || 'Manual deposit by treasurer'
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-transactions', chamaId] });
      queryClient.invalidateQueries({ queryKey: ['recent-activities', chamaId] });
      toast({
        title: "Success",
        description: "Manual deposit recorded successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error recording deposit:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to record deposit",
        variant: "destructive",
      });
    },
  });
};

// Process Payment Hook
export const useProcessPayment = (chamaId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentData: {
      amount: number;
      paymentMethod: string;
      paymentReference?: string;
      description?: string;
    }) => {
      const { data, error } = await (supabase as any).rpc('process_payment', {
        p_chama_id: chamaId,
        p_amount: paymentData.amount,
        p_payment_method: paymentData.paymentMethod,
        p_payment_reference: paymentData.paymentReference,
        p_description: paymentData.description || 'Payment processed by treasurer'
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-transactions', chamaId] });
      queryClient.invalidateQueries({ queryKey: ['recent-activities', chamaId] });
      toast({
        title: "Success",
        description: "Payment processed successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error processing payment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    },
  });
};

// Approve Member Hook
export const useApproveMember = (chamaId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const { data, error } = await (supabase as any).rpc('approve_chama_member', {
        member_id_to_approve: memberId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-members', chamaId] });
      queryClient.invalidateQueries({ queryKey: ['recent-activities', chamaId] });
      toast({
        title: "Success",
        description: "Member approved successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error approving member:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve member",
        variant: "destructive",
      });
    },
  });
};

// Reject Member Hook
export const useRejectMember = (chamaId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const { data, error } = await (supabase as any).rpc('reject_chama_member', {
        member_id_to_reject: memberId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-members', chamaId] });
      queryClient.invalidateQueries({ queryKey: ['recent-activities', chamaId] });
      toast({
        title: "Success",
        description: "Member request rejected",
      });
    },
    onError: (error: any) => {
      console.error('Error rejecting member:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject member",
        variant: "destructive",
      });
    },
  });
};

// Main Admin Dashboard Hook
export const useAdminDashboard = (chamaId: string) => {
  return useQuery({
    queryKey: ['admin-analytics', chamaId],
    queryFn: async () => {
      console.log('Fetching admin analytics for chama:', chamaId);

      const { data, error } = await (supabase as any).rpc('get_admin_analytics', {
        p_chama_id: chamaId
      });

      if (error) {
        console.error('Error fetching admin analytics:', error);
        throw error;
      }

      console.log('Fetched admin analytics:', data);
      return data?.[0] || {
        total_members: 0,
        active_members: 0,
        pending_members: 0,
        total_contributions: 0,
        monthly_contributions: 0,
        total_loans: 0,
        active_loans: 0,
        average_contribution: 0,
        contribution_rate: 0
      };
    },
    enabled: !!chamaId,
  });
};