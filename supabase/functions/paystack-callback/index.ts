import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
}

serve(async (req) => {
  console.log('=== Paystack Callback Received ===');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');

    if (!paystackSecretKey) {
      console.error('PAYSTACK_SECRET_KEY not configured');
      return new Response('Configuration error', { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verify webhook signature for security
    const signature = req.headers.get('x-paystack-signature');
    const body = await req.text();
    
    const hash = createHmac('sha512', paystackSecretKey)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      console.error('Invalid signature - possible security breach attempt');
      return new Response('Invalid signature', { status: 401 });
    }

    const callbackData = JSON.parse(body);
    console.log('Webhook event:', callbackData.event);
    console.log('Callback data:', JSON.stringify(callbackData, null, 2));

    const { event, data } = callbackData;
    
    if (event === 'charge.success') {
      const {
        reference,
        amount,
        customer,
        channel,
        paid_at,
        metadata,
      } = data;

      const amountPaid = amount / 100; // Paystack amount is in kobo/cents
      const platformFee = amountPaid * 0.025; // 2.5% platform fee
      const netAmount = amountPaid - platformFee;

      console.log('Processing successful payment:', reference);
      console.log('Amount (KES):', amountPaid);
      console.log('Channel:', channel); // Will show 'mobile_money' for M-Pesa
      console.log('Customer:', customer.email);
      
      const { data: transaction, error: txError } = await supabase
        .from('mpesa_transactions')
        .select('user_id, purpose, metadata, chama_id')
        .eq('checkout_request_id', reference)
        .single();

      if (txError) {
        console.error('Error fetching transaction:', txError);
      }

      // Update transaction status
      const { error: updateError } = await supabase
        .from('mpesa_transactions')
        .update({
          status: 'success',
          result_code: 0,
          result_desc: `Payment via ${channel} successful`,
          mpesa_receipt_number: reference,
          transaction_date: paid_at,
          callback_data: callbackData,
          updated_at: new Date().toISOString()
        })
        .eq('checkout_request_id', reference);

      if (updateError) {
        console.error('Error updating transaction:', updateError);
      }

      if (transaction) {
        console.log('Processing payment:', { amountPaid, platformFee, netAmount, purpose: transaction.purpose, channel });

        // Update user wallet based on payment purpose
        if (transaction.purpose === 'other' || transaction.purpose === 'wallet_topup') {
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
            // Create central wallet if it doesn't exist
            const { data: newWallet, error: createWalletError } = await supabase
              .from('user_central_wallets')
              .insert({ user_id: transaction.user_id, balance: 0 })
              .select()
              .single();

            if (createWalletError) {
              console.error('Error creating central wallet:', createWalletError);
            } else {
              centralWallet = newWallet;
            }
          }

          if (centralWallet) {
            // Add money to central wallet (net amount after platform fee)
            const { error: walletUpdateError } = await supabase
              .from('user_central_wallets')
              .update({ 
                balance: centralWallet.balance + netAmount,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', transaction.user_id);

            if (walletUpdateError) {
              console.error('Error updating central wallet:', walletUpdateError);
            } else {
              console.log('Central wallet updated successfully:', { 
                userId: transaction.user_id, 
                previousBalance: centralWallet.balance,
                amountAdded: netAmount,
                newBalance: centralWallet.balance + netAmount,
                paymentChannel: channel
              });

              // Record wallet transaction
              await supabase
                .from('wallet_transactions')
                .insert({
                  user_id: transaction.user_id,
                  type: 'deposit',
                  amount: netAmount,
                  description: `${channel === 'mobile_money' ? 'M-Pesa' : channel === 'bank' ? 'Bank Transfer' : channel === 'card' ? 'Card' : 'Paystack'} deposit (Fee: KES ${platformFee.toFixed(2)})`,
                  status: 'completed',
                  reference_id: reference,
                  payment_method: channel,
                  currency: 'KES',
                });

              // Send notification to user
              await supabase
                .from('chama_notifications')
                .insert({
                  user_id: transaction.user_id,
                  chama_id: transaction.chama_id || null,
                  type: 'payment_success',
                  title: '💰 Payment Successful',
                  message: `KES ${netAmount.toFixed(2)} added via ${channel === 'mobile_money' ? 'M-Pesa/Airtel Money' : channel === 'bank' ? 'Bank Transfer' : channel === 'card' ? 'Card Payment' : 'Paystack'}`,
                  data: {
                    amount: netAmount,
                    channel,
                    reference,
                    timestamp: paid_at,
                  },
                });

              console.log('Payment processed successfully - central wallet credited');
            }
          }
        }

        // Collect platform fee separately
        const { error: feeError } = await supabase.rpc('collect_platform_fee', {
          p_user_id: transaction.user_id,
          p_fee_type: 'transaction',
          p_amount: platformFee,
          p_source_transaction_id: transaction.metadata?.transaction_id,
          p_payment_reference: reference
        });

        if (feeError) {
          console.error('Error collecting platform fee:', feeError);
        } else {
          console.log('Platform fee collected:', platformFee);
        }
      }
    } else if (event === 'charge.failed') {
      const {
        reference,
        gateway_response,
        channel,
        customer,
        metadata,
      } = data;

      console.log('Processing failed payment:', reference);
      console.log('Failure reason:', gateway_response);
      console.log('Channel:', channel);
      
      // Parse gateway response for balance info and other details
      let parsedMessage = gateway_response || 'Payment failed';
      let availableBalance = null;
      
      // Extract balance from gateway response if present
      // Example: "Your Airtel Money balance is Ksh 35.00"
      const balanceMatch = parsedMessage.match(/balance is\s+(?:Ksh|KES|Ksh\s+)([0-9,.]+)/i);
      if (balanceMatch && balanceMatch[1]) {
        availableBalance = parseFloat(balanceMatch[1].replace(/,/g, ''));
      }

      // Create user-friendly error message
      let userMessage = parsedMessage;
      if (availableBalance !== null) {
        userMessage = `💳 Payment failed: Insufficient ${channel === 'mobile_money' ? 'mobile money' : 'account'} balance\n💼 Available balance: KES ${availableBalance.toFixed(2)}\n🔁 Please top up your account or try a smaller amount.`;
      } else if (channel === 'mobile_money') {
        userMessage = `💳 ${channel === 'mobile_money' ? 'Mobile Money' : 'Payment'} transaction failed\n${parsedMessage}\n🔁 Please try again or contact your provider.`;
      }

      await supabase
        .from('mpesa_transactions')
        .update({
          status: 'failed',
          result_code: 1,
          result_desc: userMessage,
          callback_data: {
            ...callbackData,
            available_balance: availableBalance,
            original_message: gateway_response,
          },
          updated_at: new Date().toISOString()
        })
        .eq('checkout_request_id', reference);

      // Fetch user from transaction
      const { data: transaction } = await supabase
        .from('mpesa_transactions')
        .select('user_id, chama_id, amount')
        .eq('checkout_request_id', reference)
        .single();

      // Send notification to user about the failure
      if (transaction?.user_id) {
        await supabase
          .from('chama_notifications')
          .insert({
            user_id: transaction.user_id,
            chama_id: transaction.chama_id || null,
            type: 'payment_failed',
            title: '❌ Payment Failed',
            message: userMessage,
            data: {
              amount: transaction.amount,
              channel,
              reference,
              available_balance: availableBalance,
              reason: gateway_response,
            },
          });
      }

      console.log('Failed payment recorded with user-friendly message');
    }

    return new Response('OK', { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Callback error:', error);
    return new Response('OK', { status: 200, headers: corsHeaders });
  }
});
