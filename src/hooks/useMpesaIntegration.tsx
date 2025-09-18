// @ts-nocheck
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/lib/database.types';

type MpesaTransaction = Database['public']['Tables']['mpesa_transactions']['Row'];
type PaymentPurpose = Database['public']['Enums']['payment_purpose'];

interface MpesaPaymentRequest {
  phoneNumber: string;
  amount: number;
  description?: string;
  purpose: PaymentPurpose;
  chamaId?: string;
}

export const useMpesaIntegration = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const stkPushMutation = useMutation({
    mutationFn: async ({ phoneNumber, amount, description, purpose, chamaId }: MpesaPaymentRequest) => {
      if (!user) {
        throw new Error('User must be authenticated to make payments');
      }
      console.log('=== M-Pesa STK Push Started ===');
      console.log('Phone Number:', phoneNumber);
      console.log('Amount:', amount);
      console.log('Description:', description);
      console.log('Purpose:', purpose);
      console.log('Chama ID:', chamaId);

      // Validate chamaId (must be UUID) and store transaction record
      const isValidUUID = (id?: string) => !!id && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(id);
      const safeChamaId = isValidUUID(chamaId) ? chamaId : null;
      const { data: transactionRecord, error: dbError } = await supabase
        .from('mpesa_transactions')
        .insert({
          user_id: user.id,
          phone_number: phoneNumber,
          amount,
          transaction_type: 'stk_push',
          purpose,
          chama_id: safeChamaId,
          status: 'pending'
        })
        .select()
        .single();

      if (dbError) {
        console.error('Error storing transaction record:', dbError);
        throw new Error('Failed to create transaction record');
      }

      try {
        const { data, error } = await supabase.functions.invoke('mpesa-integration', {
          body: {
            action: 'stk_push',
            phoneNumber,
            amount,
            description: description || `${purpose} payment`,
            transactionId: transactionRecord.id
          }
        });

        console.log('=== Supabase Function Response ===');
        console.log('Data:', data);
        console.log('Error:', error);

        if (error) {
          console.error('Supabase function error:', error);
          throw new Error(error.message || 'Failed to call M-Pesa service');
        }

        if (!data) {
          console.error('No data returned from function');
          throw new Error('No response from M-Pesa service');
        }

        // Check if the response indicates an error
        if (!data.success) {
          console.error('M-Pesa API error:', data.error);
          throw new Error(data.error || 'M-Pesa transaction failed');
        }

        console.log('=== M-Pesa API Response ===');
        console.log('Response Code:', data.ResponseCode);
        console.log('Response Description:', data.ResponseDescription);
        console.log('Full Response:', data);

        // Update transaction record with M-Pesa response
        if (data.CheckoutRequestID) {
          await supabase
            .from('mpesa_transactions')
            .update({
              checkout_request_id: data.CheckoutRequestID,
              merchant_request_id: data.MerchantRequestID
            })
            .eq('id', transactionRecord.id);
        }

        return { ...data, transactionId: transactionRecord.id };
      } catch (err) {
        console.error('=== M-Pesa Integration Error ===');
        console.error('Error message:', err instanceof Error ? err.message : 'Unknown error');
        console.error('Full error:', err);
        
        // Update transaction record with failure
        await supabase
          .from('mpesa_transactions')
          .update({
            status: 'failed',
            result_desc: err instanceof Error ? err.message : 'Unknown error'
          })
          .eq('id', transactionRecord.id);
        
        throw err;
      }
    },
    onSuccess: (data) => {
      console.log('=== STK Push Mutation Success ===');
      console.log('Success data:', data);
      
      if (data?.ResponseCode === '0' || data?.success) {
        toast({
          title: "Payment Request Sent! 📱",
          description: "Check your phone for the M-Pesa PIN prompt to complete the payment.",
        });
      } else {
        console.warn('Unexpected response:', data);
        toast({
          title: "Payment Request Issues",
          description: data?.ResponseDescription || data?.error || "Please check your phone and try again",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error('=== STK Push Mutation Error ===');
      console.error('Error in onError:', error);
      
      let errorMessage = "Failed to initiate payment. Please try again.";
      
      if (error?.message) {
        if (error.message.includes('credentials')) {
          errorMessage = "M-Pesa service configuration error. Please contact support.";
        } else if (error.message.includes('network') || error.message.includes('Network')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (error.message.includes('phone') || error.message.includes('Phone')) {
          errorMessage = "Invalid phone number. Please check the format and try again.";
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = "Insufficient funds in your M-Pesa account.";
        } else if (error.message.includes('timeout')) {
          errorMessage = "Request timeout. Please try again.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Payment Failed ❌",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Query to get user's M-Pesa transaction history
  const { data: transactionHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['mpesa-transactions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('mpesa_transactions')
        .select(`
          *,
          chamas(name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Query to get pending transactions
  const { data: pendingTransactions } = useQuery({
    queryKey: ['mpesa-pending', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('mpesa_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
    refetchInterval: 5000 // Poll every 5 seconds for pending transactions
  });

  // Function to check transaction status
  const checkTransactionStatus = async (transactionId: string) => {
    const { data, error } = await supabase
      .from('mpesa_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (error) throw error;
    return data;
  };

  return {
    stkPushMutation,
    isProcessingPayment: stkPushMutation.isPending,
    transactionHistory,
    isLoadingHistory,
    pendingTransactions,
    checkTransactionStatus,
  };
};
