import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface MarketplaceLoan {
  id: string;
  lender_id: string;
  loan_application_id?: string;
  is_platform_offer: boolean;
  amount_available: number;
  offered_amount: number;
  offered_interest_rate: number;
  min_term_months: number;
  max_term_months: number;
  filled_amount: number;
  status: string;
  terms_conditions?: string;
  created_at: string;
  expires_at?: string;
  lender_profile?: {
    display_name?: string;
    avatar_url?: string;
  };
}

export const useLoanMarketplace = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available loan offers in marketplace
  const marketplaceQuery = useQuery({
    queryKey: ['loan-marketplace'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loan_offers')
        .select('*')
        .eq('status', 'active')
        .order('offered_interest_rate', { ascending: true });

      if (error) throw error;
      return data as any[];
    },
  });

  // Fetch user's own loan offers (as a lender)
  const myOffersQuery = useQuery({
    queryKey: ['my-loan-offers', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('loan_offers')
        .select('*')
        .eq('investor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  // Create loan offer (as lender)
  const createOfferMutation = useMutation({
    mutationFn: async (offerData: {
      offered_amount: number;
      offered_interest_rate: number;
      loan_application_id?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('loan_offers')
        .insert([{
          investor_id: user.id,
          offered_amount: offerData.offered_amount,
          offered_interest_rate: offerData.offered_interest_rate,
          loan_application_id: offerData.loan_application_id || null,
          status: 'pending',
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loan-marketplace'] });
      queryClient.invalidateQueries({ queryKey: ['my-loan-offers'] });
      toast({
        title: "Offer Created! 💼",
        description: "Your loan offer has been published to the marketplace.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create loan offer",
        variant: "destructive",
      });
    },
  });

  // Accept loan offer (as borrower)
  const acceptOfferMutation = useMutation({
    mutationFn: async ({
      offerId,
      requestedAmount,
      requestedTermMonths
    }: {
      offerId: string;
      requestedAmount: number;
      requestedTermMonths: number;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Create a loan application based on the accepted offer
      const { data: offer, error: offerError } = await supabase
        .from('loan_offers')
        .select('*')
        .eq('id', offerId)
        .single();

      if (offerError) throw offerError;

      // Basic validation - simplified for existing schema
      if (requestedAmount > offer.offered_amount) {
        throw new Error('Requested amount exceeds available amount');
      }

      // Create loan application
      const monthlyRate = offer.offered_interest_rate / 100 / 12;
      const monthlyPayment = requestedAmount * (monthlyRate * Math.pow(1 + monthlyRate, requestedTermMonths)) / 
                            (Math.pow(1 + monthlyRate, requestedTermMonths) - 1);

      const { data: application, error: appError } = await supabase
        .from('loan_applications')
        .insert({
          borrower_id: user.id,
          amount: requestedAmount,
          duration_months: requestedTermMonths,
          interest_rate: offer.offered_interest_rate,
        })
        .select()
        .single();

      if (appError) throw appError;

      // Update the offer to link it to this application
      const { error: updateError } = await supabase
        .from('loan_offers')
        .update({
          loan_application_id: application.id,
          status: 'accepted'
        })
        .eq('id', offerId);

      if (updateError) throw updateError;

      return { application, offer };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loan-marketplace'] });
      queryClient.invalidateQueries({ queryKey: ['loan-applications'] });
      toast({
        title: "Offer Accepted! 🤝",
        description: "Your loan application has been created from the accepted offer.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to accept loan offer",
        variant: "destructive",
      });
    },
  });

  // Update loan offer
  const updateOfferMutation = useMutation({
    mutationFn: async ({ 
      offerId, 
      updates 
    }: { 
      offerId: string; 
      updates: Partial<MarketplaceLoan> 
    }) => {
      const { data, error } = await supabase
        .from('loan_offers')
        .update(updates)
        .eq('id', offerId)
        .eq('investor_id', user?.id) // Ensure user owns the offer
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loan-marketplace'] });
      queryClient.invalidateQueries({ queryKey: ['my-loan-offers'] });
      toast({
        title: "Offer Updated! ✅",
        description: "Your loan offer has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update loan offer",
        variant: "destructive",
      });
    },
  });

  // Cancel loan offer
  const cancelOfferMutation = useMutation({
    mutationFn: async (offerId: string) => {
      const { error } = await supabase
        .from('loan_offers')
        .update({ status: 'cancelled' })
        .eq('id', offerId)
        .eq('investor_id', user?.id); // Ensure user owns the offer

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loan-marketplace'] });
      queryClient.invalidateQueries({ queryKey: ['my-loan-offers'] });
      toast({
        title: "Offer Cancelled",
        description: "Your loan offer has been cancelled.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel loan offer",
        variant: "destructive",
      });
    },
  });

  return {
    // Data
    availableOffers: marketplaceQuery.data || [],
    myOffers: myOffersQuery.data || [],
    isLoading: marketplaceQuery.isLoading || myOffersQuery.isLoading,
    
    // Actions
    createOffer: createOfferMutation.mutate,
    acceptOffer: acceptOfferMutation.mutate,
    updateOffer: updateOfferMutation.mutate,
    cancelOffer: cancelOfferMutation.mutate,
    
    // States
    isCreating: createOfferMutation.isPending,
    isAccepting: acceptOfferMutation.isPending,
    isUpdating: updateOfferMutation.isPending,
    isCancelling: cancelOfferMutation.isPending,
  };
};