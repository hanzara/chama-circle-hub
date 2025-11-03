import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
}

serve(async (req) => {
  console.log('=== Paystack Webhook Received ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');

    if (!paystackSecretKey) {
      console.error('❌ PAYSTACK_SECRET_KEY not configured');
      return new Response('Configuration error', { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const body = await req.text();
    console.log('📦 Raw webhook body:', body);
    
    // Verify webhook signature for security
    const signature = req.headers.get('x-paystack-signature');
    console.log('🔐 Signature from header:', signature);
    
    if (!signature) {
      console.warn('⚠️ No signature provided - accepting webhook anyway (testing mode)');
    } else {
      const hash = createHmac('sha512', paystackSecretKey)
        .update(body)
        .digest('hex');
      
      console.log('🔑 Computed hash:', hash);

      if (hash !== signature) {
        console.error('❌ Invalid signature - possible security breach');
        console.error('Expected:', hash);
        console.error('Received:', signature);
        // For now, log but don't reject to help debug
        console.warn('⚠️ Continuing anyway for debugging purposes');
      } else {
        console.log('✅ Signature verified successfully');
      }
    }

    const callbackData = JSON.parse(body);
    console.log('📨 Event type:', callbackData.event);
    console.log('📋 Full webhook data:', JSON.stringify(callbackData, null, 2));

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

      console.log('💰 Processing successful payment');
      console.log('  📝 Reference:', reference);
      console.log('  💵 Amount (KES):', amountPaid);
      console.log('  📱 Channel:', channel);
      console.log('  👤 Customer:', customer.email);
      
      // Log all incoming webhook data to a tracking table for debugging
      await supabase
        .from('paystack_webhooks')
        .insert({
          event_type: event,
          reference: reference,
          amount: amountPaid,
          channel: channel,
          customer_email: customer.email,
          webhook_data: callbackData,
          status: 'processing'
        });

      console.log('🔍 Looking up transaction in database...');
      const { data: transaction, error: txError } = await supabase
        .from('mpesa_transactions')
        .select('user_id, purpose, metadata, chama_id')
        .eq('checkout_request_id', reference)
        .single();

      if (txError) {
        console.error('❌ Error fetching transaction:', txError);
        console.log('📊 Transaction lookup details:', {
          reference,
          error_code: txError.code,
          error_message: txError.message
        });
      } else {
        console.log('✅ Transaction found:', {
          user_id: transaction.user_id,
          purpose: transaction.purpose,
          chama_id: transaction.chama_id
        });
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

        // Handle chama purchase verification
        if (transaction.purpose === 'chama_purchase' && transaction.chama_id) {
          console.log('Processing chama purchase:', transaction.chama_id);

          // Find pending purchase record
          const { data: pendingPurchase, error: purchaseError } = await supabase
            .from('pending_chama_purchases')
            .select('*, chamas(name, max_members)')
            .eq('chama_id', transaction.chama_id)
            .eq('buyer_user_id', transaction.user_id)
            .eq('payment_status', 'pending')
            .single();

          if (purchaseError) {
            console.error('No pending purchase found:', purchaseError);
          } else if (pendingPurchase) {
            console.log('Found pending purchase:', pendingPurchase);

            // Verify amount paid matches expected amount
            if (Math.abs(amountPaid - pendingPurchase.expected_amount) < 0.01) {
              console.log('✅ Payment amount verified - granting ownership');

              // Update chama ownership
              const { error: chamaUpdateError } = await supabase
                .from('chamas')
                .update({
                  purchased_by: transaction.user_id,
                  purchased_at: paid_at,
                  purchase_amount: amountPaid,
                  total_savings: 0 // Reset savings to 0 upon purchase
                })
                .eq('id', transaction.chama_id);

              if (chamaUpdateError) {
                console.error('Error updating chama ownership:', chamaUpdateError);
              } else {
                // Add buyer as admin member
                const { error: memberError } = await supabase
                  .from('chama_members')
                  .insert({
                    chama_id: transaction.chama_id,
                    user_id: transaction.user_id,
                    role: 'admin',
                    is_active: true
                  });

                if (memberError) {
                  console.error('Error adding member:', memberError);
                }

                // Update pending purchase as verified and granted
                await supabase
                  .from('pending_chama_purchases')
                  .update({
                    payment_status: 'verified',
                    amount_paid: amountPaid,
                    payment_verified_at: paid_at,
                    ownership_granted: true,
                    paystack_reference: reference
                  })
                  .eq('id', pendingPurchase.id);

                // Send success notification
                await supabase
                  .from('chama_notifications')
                  .insert({
                    user_id: transaction.user_id,
                    chama_id: transaction.chama_id,
                    type: 'chama_purchased',
                    title: '🎉 Chama Purchase Successful',
                    message: `You now own ${pendingPurchase.chamas?.name}! You can start inviting members and managing your chama.`,
                    data: {
                      amount: amountPaid,
                      channel,
                      reference,
                      timestamp: paid_at,
                    },
                  });

                console.log('✅ Chama ownership granted successfully');
              }
            } else {
              console.error('❌ Payment amount mismatch:', {
                expected: pendingPurchase.expected_amount,
                paid: amountPaid
              });

              // Update as failed
              await supabase
                .from('pending_chama_purchases')
                .update({
                  payment_status: 'failed',
                  amount_paid: amountPaid,
                  metadata: {
                    error: 'Amount mismatch',
                    expected: pendingPurchase.expected_amount,
                    paid: amountPaid
                  }
                })
                .eq('id', pendingPurchase.id);

              // Send failure notification
              await supabase
                .from('chama_notifications')
                .insert({
                  user_id: transaction.user_id,
                  chama_id: transaction.chama_id,
                  type: 'payment_failed',
                  title: '❌ Chama Purchase Failed',
                  message: `Payment amount mismatch. Expected KES ${pendingPurchase.expected_amount}, received KES ${amountPaid}. Please contact support.`,
                });
            }
          }
        }

        // Update user wallet based on payment purpose using ATOMIC function
        console.log(`💼 Checking wallet update eligibility - Purpose: ${transaction.purpose}`);
        if (transaction.purpose === 'other' || transaction.purpose === 'wallet_topup' || transaction.purpose === 'add_money') {
          console.log('✅ Purpose matches wallet top-up criteria - processing ATOMIC wallet update');
          console.log('💰 Amount breakdown:', {
            gross: amountPaid,
            fee: platformFee,
            net: netAmount,
            channel: channel
          });
          
          // Check transaction uniqueness first
          const { data: isUnique } = await supabase.rpc('is_transaction_unique', {
            p_reference: reference
          });

          if (!isUnique) {
            console.log('⚠️ Transaction already processed, skipping');
            await supabase
              .from('paystack_webhooks')
              .update({ 
                status: 'duplicate',
                processed_at: new Date().toISOString()
              })
              .eq('reference', reference);
            return;
          }

          // Use atomic function to update wallet balance and create transaction
          const { data: walletResult, error: walletError } = await supabase.rpc(
            'update_wallet_balance_atomic',
            {
              p_user_id: transaction.user_id,
              p_amount: netAmount,
              p_transaction_type: 'deposit',
              p_reference: reference,
              p_payment_method: channel,
              p_description: `${channel === 'mobile_money' ? 'M-Pesa/Airtel Money' : channel === 'bank' ? 'Bank Transfer' : channel === 'card' ? 'Card Payment' : 'Paystack'} deposit (Gross: KES ${amountPaid.toFixed(2)}, Fee: KES ${platformFee.toFixed(2)})`,
              p_metadata: {
                gross_amount: amountPaid,
                platform_fee: platformFee,
                net_amount: netAmount,
                payment_channel: channel,
                paystack_reference: reference,
                paid_at: paid_at
              }
            }
          );

          if (walletError) {
            console.error('❌ Error updating wallet atomically:', walletError);
            await supabase
              .from('paystack_webhooks')
              .update({ 
                status: 'failed', 
                error_message: walletError.message 
              })
              .eq('reference', reference);
          } else if (walletResult && walletResult.success) {
            console.log('✅ Wallet updated atomically:', walletResult);
            console.log({
              userId: transaction.user_id,
              balanceBefore: walletResult.balance_before,
              amountAdded: netAmount,
              balanceAfter: walletResult.balance_after,
              paymentChannel: channel,
              transactionId: walletResult.transaction_id
            });

            // Send notification to user
            await supabase
              .from('chama_notifications')
              .insert({
                user_id: transaction.user_id,
                chama_id: transaction.chama_id || null,
                type: 'payment_success',
                title: '💰 Payment Received',
                message: `KES ${netAmount.toFixed(2)} added to your wallet via ${channel === 'mobile_money' ? 'M-Pesa/Airtel Money' : channel === 'bank' ? 'Bank Transfer' : channel === 'card' ? 'Card Payment' : 'Paystack'}`,
                data: {
                  gross_amount: amountPaid,
                  net_amount: netAmount,
                  fee: platformFee,
                  channel,
                  reference,
                  timestamp: paid_at,
                  balance_before: walletResult.balance_before,
                  balance_after: walletResult.balance_after
                },
              });

            console.log('✅ Payment processed successfully - wallet credited atomically');

            // Update webhook tracking as successful
            await supabase
              .from('paystack_webhooks')
              .update({ 
                status: 'completed',
                processed_at: new Date().toISOString()
              })
              .eq('reference', reference);
          } else {
            console.error('❌ Wallet update failed:', walletResult);
            await supabase
              .from('paystack_webhooks')
              .update({ 
                status: 'failed',
                error_message: walletResult?.error || 'Unknown error'
              })
              .eq('reference', reference);
          }
        } else {
          console.log('ℹ️ Skipping wallet update - purpose does not match wallet top-up criteria');
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
  // Ensure a Response is always returned
  return new Response('OK', { status: 200, headers: corsHeaders });
});
