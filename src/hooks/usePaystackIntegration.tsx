// @ts-nocheck
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/lib/database.types';

type PaymentTransaction = Database['public']['Tables']['mpesa_transactions']['Row'];
type PaymentPurpose = Database['public']['Enums']['payment_purpose'];

interface PaystackPaymentRequest {
  email?: string;
  amount: number;
  description?: string;
  metadata?: Record<string, any>;
  purpose: PaymentPurpose;
  chamaId?: string;
  channels?: string[];
  phoneNumber?: string;
}

export const usePaystackIntegration = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const initializePayment = useMutation({
    mutationFn: async ({ 
      email, 
      amount, 
      description, 
      metadata, 
      purpose, 
      chamaId, 
      channels, 
      phoneNumber 
    }: PaystackPaymentRequest) => {
      if (!user) {
        throw new Error('User must be authenticated to make payments');
      }

      console.log('=== Initializing Paystack Payment ===');
      console.log('Amount:', amount);
      console.log('Purpose:', purpose);
      console.log('Description:', description);

      // Use user's email or create temporary one from phone
      const userEmail = email || user.email || (phoneNumber ? `${phoneNumber}@temp.paystack.com` : undefined);
      
      if (!userEmail) {
        throw new Error('Email or phone number is required for payment');
      }

      // Validate chamaId if provided
      const isValidUUID = (id?: string) => !!id && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(id);
      const safeChamaId = isValidUUID(chamaId) ? chamaId : null;

      // Store transaction record in database first
      const { data: transactionRecord, error: dbError } = await supabase
        .from('mpesa_transactions')
        .insert({
          user_id: user.id,
          phone_number: phoneNumber || userEmail,
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
        const { data, error } = await supabase.functions.invoke('paystack-integration', {
          body: {
            action: 'initialize',
            email: userEmail,
            amount,
            metadata: {
              user_id: user.id,
              purpose,
              chama_id: safeChamaId,
              transaction_id: transactionRecord.id,
              description: description || `${purpose} payment`,
              phone_number: phoneNumber,
              ...metadata,
            },
            channels: channels || ['card', 'bank', 'ussd', 'mobile_money', 'bank_transfer'],
          }
        });

        console.log('Paystack response:', data);

        if (error) {
          console.error('Error:', error);
          // Update transaction as failed
          await supabase
            .from('mpesa_transactions')
            .update({
              status: 'failed',
              result_desc: error.message || 'Payment initialization failed'
            })
            .eq('id', transactionRecord.id);
          throw new Error(error.message || 'Failed to initialize payment');
        }

        if (!data?.success) {
          // Update transaction as failed
          await supabase
            .from('mpesa_transactions')
            .update({
              status: 'failed',
              result_desc: data?.error || 'Payment initialization failed'
            })
            .eq('id', transactionRecord.id);
          throw new Error(data?.error || 'Failed to initialize payment');
        }

        // Update transaction with Paystack reference
        if (data.reference) {
          await supabase
            .from('mpesa_transactions')
            .update({
              checkout_request_id: data.reference,
              merchant_request_id: data.access_code
            })
            .eq('id', transactionRecord.id);
        }

        return { ...data, transactionId: transactionRecord.id };
      } catch (err) {
        // Update transaction as failed
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
      console.log('Payment initialized:', data);
      
      // Open Paystack payment page
      if (data.authorization_url) {
        window.open(data.authorization_url, '_blank');
        
        toast({
          title: "Payment Page Opened 💳",
          description: "Complete your payment in the new window. Supports cards, mobile money, bank transfers, and USSD.",
        });
      }
    },
    onError: (error: any) => {
      console.error('Payment initialization error:', error);
      
      toast({
        title: "Payment Failed ❌",
        description: error.message || 'Failed to initialize payment',
        variant: "destructive",
      });
    },
  });

  const verifyPayment = useMutation({
    mutationFn: async (reference: string) => {
      const { data, error } = await supabase.functions.invoke('paystack-integration', {
        body: {
          action: 'verify',
          reference,
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to verify payment');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to verify payment');
      }

      return data;
    },
  });

  // Query to get user's payment transaction history
  const { data: transactionHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['payment-transactions', user?.id],
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
    queryKey: ['payment-pending', user?.id],
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
    refetchInterval: 5000
  });

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
    initializePayment,
    verifyPayment,
    isProcessingPayment: initializePayment.isPending,
    transactionHistory,
    isLoadingHistory,
    pendingTransactions,
    checkTransactionStatus,
  };
};
