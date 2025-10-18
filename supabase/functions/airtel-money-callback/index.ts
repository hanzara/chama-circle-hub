import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== Airtel Money Callback Received ===');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const callbackData = await req.json();
    console.log('Callback data:', JSON.stringify(callbackData, null, 2));

    const {
      transactionId,
      status,
      description,
      providerMetadata,
    } = callbackData;

    console.log('Transaction ID:', transactionId);
    console.log('Status:', status);

    // Find transaction by Africa's Talking transaction ID
    const { data: transaction, error: txError } = await supabase
      .from('mpesa_transactions')
      .select('*')
      .eq('checkout_request_id', transactionId)
      .single();

    if (txError || !transaction) {
      console.error('Transaction not found:', txError);
      return new Response('Transaction not found', { status: 404, headers: corsHeaders });
    }

    if (status === 'Success') {
      const amount = transaction.amount;
      const platformFee = amount * 0.025; // 2.5% platform fee
      const netAmount = amount - platformFee;

      console.log('Processing successful payment:', {
        transactionId,
        amount,
        platformFee,
        netAmount,
      });

      // Get or create user central wallet
      let { data: centralWallet, error: centralWalletFetchError } = await supabase
        .from('user_central_wallets')
        .select('*')
        .eq('user_id', transaction.user_id)
        .single();

      if (centralWalletFetchError && centralWalletFetchError.code !== 'PGRST116') {
        console.error('Error fetching central wallet:', centralWalletFetchError);
      }

      if (!centralWallet) {
        const { data: newWallet, error: createWalletError } = await supabase
          .from('user_central_wallets')
          .insert({ user_id: transaction.user_id, balance: 0 })
          .select()
          .single();

        if (createWalletError) {
          console.error('Error creating central wallet:', createWalletError);
          throw createWalletError;
        }
        centralWallet = newWallet;
      }

      // Credit user wallet
      const { error: walletUpdateError } = await supabase
        .from('user_central_wallets')
        .update({ 
          balance: centralWallet.balance + netAmount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', transaction.user_id);

      if (walletUpdateError) {
        console.error('Error updating central wallet:', walletUpdateError);
        throw walletUpdateError;
      }

      console.log('Wallet updated successfully:', { 
        userId: transaction.user_id, 
        previousBalance: centralWallet.balance,
        amountAdded: netAmount,
        newBalance: centralWallet.balance + netAmount,
      });

      // Record wallet transaction
      await supabase
        .from('wallet_transactions')
        .insert({
          user_id: transaction.user_id,
          type: 'deposit',
          amount: netAmount,
          description: `Airtel Money deposit (Fee: KES ${platformFee.toFixed(2)})`,
          status: 'completed',
          reference_id: transactionId,
          payment_method: 'airtel_money',
          currency: 'KES',
        });

      // Update transaction status
      await supabase
        .from('mpesa_transactions')
        .update({
          status: 'success',
          result_code: 0,
          result_desc: description || 'Payment via Airtel Money successful',
          mpesa_receipt_number: providerMetadata?.transactionId || transactionId,
          transaction_date: new Date().toISOString(),
          callback_data: callbackData,
          updated_at: new Date().toISOString()
        })
        .eq('checkout_request_id', transactionId);

      // Send notification to user
      await supabase
        .from('chama_notifications')
        .insert({
          user_id: transaction.user_id,
          chama_id: transaction.chama_id || null,
          type: 'payment_success',
          title: '💰 Airtel Money Payment Successful',
          message: `KES ${netAmount.toFixed(2)} added to your wallet`,
          data: {
            amount: netAmount,
            channel: 'airtel_money',
            reference: transactionId,
          },
        });

      console.log('Payment processed successfully - wallet credited');
    } else {
      // Payment failed
      console.log('Payment failed:', description);
      
      await supabase
        .from('mpesa_transactions')
        .update({
          status: 'failed',
          result_code: 1,
          result_desc: description || 'Payment failed',
          callback_data: callbackData,
          updated_at: new Date().toISOString()
        })
        .eq('checkout_request_id', transactionId);
    }

    return new Response('OK', { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Callback error:', error);
    return new Response('OK', { status: 200, headers: corsHeaders });
  }
});
