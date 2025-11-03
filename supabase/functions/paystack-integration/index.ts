import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InitializePaymentRequest {
  email: string;
  amount: number;
  metadata?: Record<string, any>;
  channels?: string[];
}

serve(async (req) => {
  console.log('=== Paystack Integration Function Called ===');
  console.log('Request method:', req.method);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');

    if (!paystackSecretKey) {
      console.error('PAYSTACK_SECRET_KEY not configured');
      return new Response(JSON.stringify({
        success: false,
        error: 'Payment service not configured'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const requestBody = await req.json();
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const { action, email, amount, metadata, channels, reference, callback_url } = requestBody;

    if (action === 'initialize') {
      // Initialize Paystack transaction
      // Use the public Functions domain for webhooks (required for external providers)
      const functionsBase = supabaseUrl.replace('.supabase.co', '.functions.supabase.co');
      const webhookUrl = `${functionsBase}/paystack-callback`;
      
      const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: Math.round(amount * 100), // Convert to kobo/cents
          callback_url: callback_url || undefined, // User redirect URL
          metadata: metadata || {},
          channels: channels || ['card', 'bank', 'ussd', 'mobile_money', 'bank_transfer'],
        }),
      });

      const paystackData = await paystackResponse.json();
      console.log('Paystack response:', JSON.stringify(paystackData, null, 2));

      if (!paystackResponse.ok || !paystackData.status) {
        return new Response(JSON.stringify({
          success: false,
          error: paystackData.message || 'Failed to initialize payment'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Store transaction in database
      const { data: transaction, error: dbError } = await supabase
        .from('mpesa_transactions')
        .insert({
          user_id: metadata?.user_id,
          phone_number: metadata?.phone_number || email,
          amount: amount,
          transaction_type: 'paystack',
          purpose: metadata?.purpose || 'other',
          chama_id: metadata?.chama_id,
          status: 'pending',
          checkout_request_id: paystackData.data.reference,
          merchant_request_id: paystackData.data.access_code,
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        return new Response(JSON.stringify({
          success: false,
          error: 'Failed to create transaction record'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Transaction created:', transaction.id);

      return new Response(JSON.stringify({
        success: true,
        authorization_url: paystackData.data.authorization_url,
        access_code: paystackData.data.access_code,
        reference: paystackData.data.reference,
        transaction_id: transaction.id,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'verify') {
      // Verify Paystack transaction
      const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
        },
      });

      const verifyData = await verifyResponse.json();
      console.log('Verify response:', JSON.stringify(verifyData, null, 2));

      if (!verifyResponse.ok || !verifyData.status) {
        return new Response(JSON.stringify({
          success: false,
          error: verifyData.message || 'Failed to verify payment'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('✅ Paystack verification successful:', verifyData.data.status);
      
      // Update transaction in database
      const status = verifyData.data.status === 'success' ? 'success' : 'failed';
      const amountInKES = verifyData.data.amount / 100; // Convert from kobo to KES
      
      console.log(`💰 Payment amount: ${amountInKES} KES (${verifyData.data.amount} kobo)`);
      
      await supabase
        .from('mpesa_transactions')
        .update({
          status,
          result_code: verifyData.data.status === 'success' ? 0 : 1,
          result_desc: verifyData.data.gateway_response,
          mpesa_receipt_number: verifyData.data.reference,
          transaction_date: verifyData.data.paid_at,
        })
        .eq('checkout_request_id', reference);

      // If successful, credit the user's wallet (fallback in case webhook fails or is delayed)
      if (status === 'success') {
        const platformFee = amountInKES * 0.025;
        const netAmount = amountInKES - platformFee;

        console.log(`💵 Fee calculation: Gross=${amountInKES}, Fee=${platformFee}, Net=${netAmount}`);

        // Find the original transaction to get the user and purpose
        const { data: transaction, error: txError } = await supabase
          .from('mpesa_transactions')
          .select('user_id, purpose, metadata, chama_id')
          .eq('checkout_request_id', reference)
          .single();

        if (txError) {
          console.error('❌ Error fetching transaction:', txError);
        } else if (transaction?.user_id) {
          console.log(`👤 Processing for user: ${transaction.user_id}, purpose: ${transaction.purpose}`);
          
          // Get or create user central wallet
          let { data: wallet, error: walletFetchError } = await supabase
            .from('user_central_wallets')
            .select('*')
            .eq('user_id', transaction.user_id)
            .single();

          if (walletFetchError && walletFetchError.code !== 'PGRST116') {
            console.error('Verify: error fetching wallet:', walletFetchError);
          }

          if (!wallet) {
            console.log('📝 Creating new wallet for user');
            const { data: newWallet, error: createWalletError } = await supabase
              .from('user_central_wallets')
              .insert({ user_id: transaction.user_id, balance: 0 })
              .select()
              .single();

            if (createWalletError) {
              console.error('Verify: error creating wallet:', createWalletError);
            } else {
              wallet = newWallet;
              console.log('✅ Wallet created successfully');
            }
          }

          if (wallet) {
            const previousBalance = wallet.balance;
            const newBalance = previousBalance + netAmount;
            
            console.log(`💼 Wallet update: ${previousBalance} + ${netAmount} = ${newBalance}`);
            
            const { error: walletUpdateError } = await supabase
              .from('user_central_wallets')
              .update({
                balance: newBalance,
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', transaction.user_id);

            if (walletUpdateError) {
              console.error('❌ Verify: error updating wallet:', walletUpdateError);
            } else {
              console.log('✅ Wallet updated successfully');
              
              // Record wallet transaction
              await supabase
                .from('wallet_transactions')
                .insert({
                  user_id: transaction.user_id,
                  type: 'deposit',
                  amount: netAmount,
                  description: `Wallet top-up via Paystack (Fee: KES ${platformFee.toFixed(2)})`,
                  status: 'completed',
                  reference_id: reference,
                  payment_method: 'paystack',
                });

              console.log('✅ Wallet transaction recorded');

              // Collect platform fee
              const { error: feeError } = await supabase.rpc('collect_platform_fee', {
                p_user_id: transaction.user_id,
                p_fee_type: 'transaction',
                p_amount: platformFee,
                p_source_transaction_id: transaction.metadata?.transaction_id,
                p_payment_reference: reference,
              });

              if (feeError) {
                console.error('Verify: error collecting platform fee:', feeError);
              } else {
                console.log(`✅ Platform fee collected: ${platformFee}`);
              }
            }
          }
        }
      }

      return new Response(JSON.stringify({
        success: true,
        message: status === 'success' ? 'Payment verified and wallet credited' : 'Payment failed',
        data: {
          status: verifyData.data.status,
          amount: amountInKES, // Amount in KES
          reference: verifyData.data.reference,
          paid_at: verifyData.data.paid_at,
          channel: verifyData.data.channel,
          gateway_response: verifyData.data.gateway_response,
        },
        balance: status === 'success' ? { 
          added: amountInKES * 0.975, // Net amount after 2.5% fee
          fee: amountInKES * 0.025 
        } : null,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'withdraw') {
      // Withdraw using Paystack Transfer API (silent backend operation)
      const { user_id, amount, account_number, bank_code, account_name, recipient_name } = requestBody;

      if (!user_id || !amount || !account_number || !bank_code) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Missing required fields for withdrawal'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check user central wallet balance
      const { data: wallet, error: walletError } = await supabase
        .from('user_central_wallets')
        .select('balance')
        .eq('user_id', user_id)
        .single();

      if (walletError || !wallet) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Wallet not found'
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const currentBalance = wallet!.balance;

      // Convert amount to kobo (Paystack uses kobo)
      const amountInKobo = Math.round(amount * 100);

      if (currentBalance < amount) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Insufficient wallet balance'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create transfer recipient first
      const recipientResponse = await fetch('https://api.paystack.co/transferrecipient', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'nuban',
          name: recipient_name || account_name || 'User',
          account_number: account_number,
          bank_code: bank_code,
          currency: 'NGN'
        }),
      });

      const recipientData = await recipientResponse.json();
      console.log('Recipient response:', JSON.stringify(recipientData, null, 2));

      if (!recipientResponse.ok || !recipientData.status) {
        return new Response(JSON.stringify({
          success: false,
          error: recipientData.message || 'Failed to create transfer recipient'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Initiate transfer
      const transferResponse = await fetch('https://api.paystack.co/transfer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: 'balance',
          amount: amountInKobo,
          recipient: recipientData.data.recipient_code,
          reason: `Withdrawal from wallet`,
        }),
      });

      const transferData = await transferResponse.json();
      console.log('Transfer response:', JSON.stringify(transferData, null, 2));

      if (!transferResponse.ok || !transferData.status) {
        return new Response(JSON.stringify({
          success: false,
          error: transferData.message || 'Failed to process withdrawal'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Deduct from user central wallet
      await supabase
        .from('user_central_wallets')
        .update({ balance: currentBalance - amount })
        .eq('user_id', user_id);

      // Record transaction
      await supabase
        .from('wallet_transactions')
        .insert({
          user_id: user_id,
          type: 'withdrawal',
          amount: -amount,
          description: `Withdrawal to ${account_number}`,
          status: 'completed',
          currency: 'NGN'
        });

      return new Response(JSON.stringify({
        success: true,
        message: 'Withdrawal processed successfully',
        transfer_code: transferData.data.transfer_code,
        amount: amount
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid action'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('=== FUNCTION ERROR ===');
    console.error('Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
