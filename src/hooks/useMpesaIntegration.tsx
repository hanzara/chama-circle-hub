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
      console.log('=== Paystack Payment Started ===');
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
          transaction_type: 'paystack',
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
        const userEmail = user.email || `${phoneNumber}@temp.paystack.com`;
        
        const { data, error } = await supabase.functions.invoke('paystack-integration', {
          body: {
            action: 'initialize',
            email: userEmail,
            amount,
            metadata: {
              user_id: user.id,
              purpose,
              chama_id: safeChamaId,
              description: description || `${purpose} payment`,
              phone_number: phoneNumber
            },
            channels: ['card', 'bank', 'ussd', 'mobile_money', 'bank_transfer']
          }
        });

        console.log('=== Supabase Function Response ===');
        console.log('Data:', data);
        console.log('Error:', error);

        if (error) {
          console.error('Supabase function error:', error);
          throw new Error(error.message || 'Failed to call payment service');
        }

        if (!data) {
          console.error('No data returned from function');
          throw new Error('No response from payment service');
        }

        // Check if the response indicates an error
        if (!data.success) {
          console.error('Paystack API error:', data.error);
          throw new Error(data.error || 'Payment transaction failed');
        }

        console.log('=== Paystack API Response ===');
        console.log('Authorization URL:', data.authorization_url);
        console.log('Reference:', data.reference);
        console.log('Full Response:', data);

        // Update transaction record with Paystack response
        if (data.reference) {
          await supabase
            .from('mpesa_transactions')
            .update({
              checkout_request_id: data.reference,
              merchant_request_id: data.access_code
            })
            .eq('id', transactionRecord.id);
        }

        // Open Paystack payment page
        if (data.authorization_url) {
          window.open(data.authorization_url, '_blank');
        }

        return { ...data, transactionId: transactionRecord.id };
      } catch (err) {
        console.error('=== Payment Integration Error ===');
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
      console.log('=== Payment Mutation Success ===');
      console.log('Success data:', data);
      
      if (data?.success) {
        toast({
          title: "Payment Page Opened 💳",
          description: "Complete your payment in the new window. Supports cards, mobile money, bank transfers, and USSD.",
        });
      } else {
        console.warn('Unexpected response:', data);
        toast({
          title: "Payment Request Issues",
          description: data?.error || "Please try again",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error('=== Payment Mutation Error ===');
      console.error('Error in onError:', error);
      
      let errorMessage = "Failed to initiate payment. Please try again.";
      
      if (error?.message) {
        if (error.message.includes('credentials') || error.message.includes('not configured')) {
          errorMessage = "Payment service configuration error. Please contact support.";
        } else if (error.message.includes('network') || error.message.includes('Network')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (error.message.includes('email') || error.message.includes('Email')) {
          errorMessage = "Invalid email. Please check and try again.";
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
