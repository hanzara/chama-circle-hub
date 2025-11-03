import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { phoneNumber, amount, purpose, description } = await req.json();

    console.log('=== Airtel Money Payment Request ===');
    console.log('User:', user.id);
    console.log('Phone:', phoneNumber);
    console.log('Amount:', amount);
    console.log('Purpose:', purpose);

    // Validate inputs
    if (!phoneNumber || !amount) {
      throw new Error('Phone number and amount are required');
    }

    // Africa's Talking credentials
    const AT_API_KEY = Deno.env.get('AFRICASTALKING_API_KEY');
    const AT_USERNAME = Deno.env.get('AFRICASTALKING_USERNAME');

    if (!AT_API_KEY || !AT_USERNAME) {
      throw new Error('Africa\'s Talking credentials not configured');
    }

    // Create transaction record first
    const { data: transaction, error: txError } = await supabaseClient
      .from('mpesa_transactions')
      .insert({
        user_id: user.id,
        phone_number: phoneNumber,
        amount,
        transaction_type: 'airtel_money',
        purpose: purpose || 'wallet_topup',
        status: 'pending',
      })
      .select()
      .single();

    if (txError) {
      console.error('Error creating transaction:', txError);
      throw new Error('Failed to create transaction record');
    }

    console.log('Transaction created:', transaction.id);

    // Initialize Airtel Money payment via Africa's Talking
    const atPaymentUrl = 'https://payments.africastalking.com/mobile/checkout/request';
    
    const paymentData = {
      username: AT_USERNAME,
      productName: 'Chama Hub Wallet',
      phoneNumber: phoneNumber,
      currencyCode: 'KES',
      amount: amount,
      metadata: {
        transactionId: transaction.id,
        userId: user.id,
        purpose: purpose || 'wallet_topup',
      },
      providerChannel: 'ATHM_KE', // Airtel Money Kenya channel
    };

    console.log('Initiating Airtel Money payment...');

    const atResponse = await fetch(atPaymentUrl, {
      method: 'POST',
      headers: {
        'apiKey': AT_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    // Check if response is ok first
    if (!atResponse.ok) {
      const errorText = await atResponse.text();
      console.error('Africa\'s Talking error response:', errorText);
      
      // Update transaction as failed
      await supabaseClient
        .from('mpesa_transactions')
        .update({
          status: 'failed',
          result_desc: `API error: ${errorText.substring(0, 200)}`,
        })
        .eq('id', transaction.id);
      
      throw new Error('Airtel Money service is currently unavailable. Please try M-Pesa or Paystack instead.');
    }

    let atResult;
    try {
      atResult = await atResponse.json();
      console.log('Africa\'s Talking response:', atResult);
    } catch (parseError) {
      console.error('Failed to parse AT response:', parseError);
      const errorText = await atResponse.text();
      console.error('Response text:', errorText);
      
      // Update transaction as failed
      await supabaseClient
        .from('mpesa_transactions')
        .update({
          status: 'failed',
          result_desc: 'Invalid response from payment provider',
        })
        .eq('id', transaction.id);
      
      throw new Error('Airtel Money service returned an invalid response. Please try M-Pesa or Paystack instead.');
    }

    if (atResult.status === 'PendingConfirmation') {
      // Update transaction with Africa's Talking reference
      await supabaseClient
        .from('mpesa_transactions')
        .update({
          checkout_request_id: atResult.transactionId,
          merchant_request_id: atResult.providerChannel,
          callback_data: atResult,
        })
        .eq('id', transaction.id);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Payment request sent. Please check your phone to complete the payment.',
          transactionId: transaction.id,
          reference: atResult.transactionId,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Payment request failed
      await supabaseClient
        .from('mpesa_transactions')
        .update({
          status: 'failed',
          result_desc: atResult.description || 'Payment request failed',
          callback_data: atResult,
        })
        .eq('id', transaction.id);

      throw new Error(atResult.description || 'Payment request failed');
    }

  } catch (error: unknown) {
    console.error('Airtel Money payment error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
