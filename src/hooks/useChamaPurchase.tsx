import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { usePaystackIntegration } from './usePaystackIntegration';

export const useChamaPurchase = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { initializePayment } = usePaystackIntegration();

  // Create pending purchase and initiate payment
  const purchaseChamaMutation = useMutation({
    mutationFn: async ({ 
      chamaId, 
      expectedAmount, 
      email 
    }: { 
      chamaId: string; 
      expectedAmount: number; 
      email?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      console.log('🛒 Creating pending purchase:', { chamaId, expectedAmount });

      // Create pending purchase record
      const { data: pendingPurchase, error: purchaseError } = await supabase
        .from('pending_chama_purchases')
        .insert({
          chama_id: chamaId,
          buyer_user_id: user.id,
          expected_amount: expectedAmount,
          payment_status: 'pending'
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      console.log('✅ Pending purchase created:', pendingPurchase.id);

      // Initiate Paystack payment
      const paymentResult = await initializePayment.mutateAsync({
        email: email || user.email || undefined,
        amount: expectedAmount,
        description: `Chama Purchase`,
        purpose: 'chama_purchase' as any,
        chamaId: chamaId,
        metadata: {
          pending_purchase_id: pendingPurchase.id
        }
      });

      // Update pending purchase with Paystack reference
      if (paymentResult.reference) {
        await supabase
          .from('pending_chama_purchases')
          .update({
            paystack_reference: paymentResult.reference,
            payment_status: 'processing'
          })
          .eq('id', pendingPurchase.id);
      }

      return { pendingPurchase, paymentResult };
    },
    onSuccess: () => {
      toast({
        title: "Payment Initiated 💳",
        description: "Complete your payment to own the chama. We'll verify the payment amount.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to initiate purchase",
        variant: "destructive",
      });
    }
  });

  // Query to check pending purchase status
  const usePendingPurchaseStatus = (chamaId?: string) => {
    return useQuery({
      queryKey: ['pending-purchase-status', user?.id, chamaId],
      queryFn: async () => {
        if (!user || !chamaId) return null;
        
        const { data, error } = await supabase
          .from('pending_chama_purchases')
          .select('*')
          .eq('chama_id', chamaId)
          .eq('buyer_user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        return data;
      },
      enabled: !!user && !!chamaId,
      refetchInterval: (query) => {
        // Poll every 3 seconds if payment is processing
        const data = query.state.data;
        if (data?.payment_status === 'processing' || data?.payment_status === 'pending') {
          return 3000;
        }
        return false;
      }
    });
  };

  return {
    purchaseChama: purchaseChamaMutation.mutate,
    isPurchasing: purchaseChamaMutation.isPending || initializePayment.isPending,
    usePendingPurchaseStatus
  };
};