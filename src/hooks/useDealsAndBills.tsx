import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { Database } from '@/integrations/supabase/types';

export type Deal = Database['public']['Tables']['deals']['Row'] & {
  merchants?: Merchant;
};
export type Merchant = Database['public']['Tables']['merchants']['Row'];
export type BillProvider = Database['public']['Tables']['bill_providers']['Row'];
type UserBillPayment = Database['public']['Tables']['user_bill_payments']['Row'] & {
  bill_providers?: BillProvider;
};
type UserDealUsage = Database['public']['Tables']['user_deal_usage']['Row'];

export const useDealsAndBills = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch active deals
  const dealsQuery = useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          merchants (*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch merchants
  const merchantsQuery = useQuery({
    queryKey: ['merchants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch bill providers
  const billProvidersQuery = useQuery({
    queryKey: ['bill-providers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bill_providers')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch user's bill payments
  const billPaymentsQuery = useQuery({
    queryKey: ['bill-payments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_bill_payments')
        .select(`
          *,
          bill_providers (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch user's deal usage
  const dealUsageQuery = useQuery({
    queryKey: ['deal-usage', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_deal_usage')
        .select(`
          *,
          deals (*),
          merchants (*)
        `)
        .eq('user_id', user.id)
        .order('used_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Use deal mutation
  const useDealMutation = useMutation({
    mutationFn: async ({
      dealId,
      originalAmount,
      merchantId,
    }: {
      dealId: string;
      originalAmount: number;
      merchantId: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Get deal details
      const { data: deal, error: dealError } = await supabase
        .from('deals')
        .select('*')
        .eq('id', dealId)
        .single();

      if (dealError) throw dealError;

      // Check if deal is valid
      if (!deal.is_active) {
        throw new Error('This deal is no longer active');
      }

      if (deal.valid_until && new Date(deal.valid_until) < new Date()) {
        throw new Error('This deal has expired');
      }

      if (originalAmount < deal.minimum_spend) {
        throw new Error(`Minimum spend is KES ${deal.minimum_spend}`);
      }

      if (deal.usage_limit && deal.current_usage >= deal.usage_limit) {
        throw new Error('This deal has reached its usage limit');
      }

      // Calculate discount
      let discountAmount = 0;
      if (deal.discount_percentage) {
        discountAmount = (originalAmount * deal.discount_percentage) / 100;
        if (deal.maximum_discount) {
          discountAmount = Math.min(discountAmount, deal.maximum_discount);
        }
      } else if (deal.discount_amount) {
        discountAmount = deal.discount_amount;
      }

      const finalAmount = originalAmount - discountAmount;

      // Get merchant details
      const { data: merchant, error: merchantError } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', merchantId)
        .single();

      if (merchantError) throw merchantError;

      // Record deal usage
      const { data, error } = await supabase
        .from('user_deal_usage')
        .insert({
          user_id: user.id,
          deal_id: dealId,
          merchant_id: merchantId,
          discount_amount: discountAmount,
          final_amount: finalAmount,
        })
        .select()
        .single();

      if (error) throw error;

      // Update deal usage count
      await supabase
        .from('deals')
        .update({ current_usage: deal.current_usage + 1 })
        .eq('id', dealId);

      return { ...data, discountAmount, finalAmount };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deal-usage'] });
      toast({
        title: "Deal Applied! 🎉",
        description: `You saved KES ${data.discountAmount}! Pay only KES ${data.finalAmount}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to apply deal",
        variant: "destructive",
      });
    },
  });

  // Pay bill mutation
  const payBillMutation = useMutation({
    mutationFn: async ({
      providerId,
      accountNumber,
      amount,
      paymentMethod = 'mobile_money',
    }: {
      providerId: string;
      accountNumber: string;
      amount: number;
      paymentMethod?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Calculate fee (2% of amount with minimum of KES 5)
      const feeAmount = Math.max(amount * 0.02, 5);
      const totalAmount = amount + feeAmount;

      const { data, error } = await supabase
        .from('user_bill_payments')
        .insert({
          user_id: user.id,
          bill_provider_id: providerId,
          account_number: accountNumber,
          amount: amount,
          service_fee: feeAmount,
          total_amount: totalAmount,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      // In a real implementation, you would integrate with M-Pesa or other payment providers here
      // For now, we'll simulate processing
      setTimeout(async () => {
        await supabase
          .from('user_bill_payments')
          .update({
            status: 'completed',
            reference_number: `TXN${Date.now()}`,
          })
          .eq('id', data.id);
        
        queryClient.invalidateQueries({ queryKey: ['bill-payments'] });
      }, 3000);

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bill-payments'] });
      toast({
        title: "Bill Payment Initiated! 💳",
        description: `Payment of KES ${data.total_amount} is being processed`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process bill payment",
        variant: "destructive",
      });
    },
  });

  // Get deals by category
  const getDealsByCategory = () => {
    const deals = dealsQuery.data || [];
    const categories: Record<string, Deal[]> = {};
    
    deals.forEach(deal => {
      const category = deal.merchants?.category || 'Other';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(deal);
    });
    
    return categories;
  };

  // Get bill providers by category
  const getBillProvidersByCategory = () => {
    const providers = billProvidersQuery.data || [];
    const categories: Record<string, BillProvider[]> = {};
    
    providers.forEach(provider => {
      const category = provider.category;
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(provider);
    });
    
    return categories;
  };

  return {
    // Data
    deals: dealsQuery.data || [],
    merchants: merchantsQuery.data || [],
    billProviders: billProvidersQuery.data || [],
    billPayments: billPaymentsQuery.data || [],
    dealUsage: dealUsageQuery.data || [],
    
    // Computed data
    dealsByCategory: getDealsByCategory(),
    billProvidersByCategory: getBillProvidersByCategory(),
    
    // Loading states
    isLoading: dealsQuery.isLoading || merchantsQuery.isLoading || billProvidersQuery.isLoading,
    
    // Actions
    useDeal: useDealMutation.mutate,
    payBill: payBillMutation.mutate,
    
    // Mutation states
    isUsingDeal: useDealMutation.isPending,
    isPayingBill: payBillMutation.isPending,
  };
};