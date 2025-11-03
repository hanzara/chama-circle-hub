import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { reference, transaction_id } = await req.json();
    
    console.log('Manually crediting payment for reference:', reference, 'or ID:', transaction_id);

    // Get transaction details - try by ID first, then by checkout_request_id (latest if multiple)
    let transaction: any | null = null;
    let txError: any = null;
    
    if (transaction_id) {
      const result = await supabase
        .from('mpesa_transactions')
        .select('*')
        .eq('id', transaction_id)
        .single();
      transaction = result.data;
      txError = result.error;
    } else if (reference) {
      const result = await supabase
        .from('mpesa_transactions')
        .select('*')
        .eq('checkout_request_id', reference)
        .order('created_at', { ascending: false })
        .limit(1);
      transaction = (result.data && Array.isArray(result.data)) ? result.data[0] : null;
      txError = result.error;
    }

    if (txError || !transaction) {
      throw new Error('Transaction not found');
    }

    // Only credit wallet topups or 'other' (which includes wallet topups from Paystack)
    const validPurposes = ['wallet_topup', 'other', 'topup'];
    if (!validPurposes.includes(transaction.purpose)) {
      return new Response(
        JSON.stringify({ success: false, error: `Not a wallet top-up transaction. Purpose: ${transaction.purpose}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Prevent double-crediting
    if (transaction.status === 'success') {
      return new Response(
        JSON.stringify({ success: true, message: 'Payment already processed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const amount = transaction.amount;
    const platformFee = amount * 0.025;
    const netAmount = amount - platformFee;

    // Get or create user wallet
    let { data: wallet, error: walletFetchError } = await supabase
      .from('user_central_wallets')
      .select('*')
      .eq('user_id', transaction.user_id)
      .single();

    if (walletFetchError && walletFetchError.code !== 'PGRST116') {
      console.error('Error fetching wallet:', walletFetchError);
    }

    if (!wallet) {
      const { data: newWallet, error: createWalletError } = await supabase
        .from('user_central_wallets')
        .insert({ user_id: transaction.user_id, balance: 0 })
        .select()
        .single();

      if (createWalletError) {
        throw createWalletError;
      }
      wallet = newWallet;
    }

    // Add money to wallet
    const { error: walletUpdateError } = await supabase
      .from('user_central_wallets')
      .update({ 
        balance: wallet.balance + netAmount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', transaction.user_id);

    if (walletUpdateError) {
      throw walletUpdateError;
    }

    // Determine payment method and reference
    const paymentMethod = transaction.transaction_type === 'airtel_money' ? 'airtel_money' : 'paystack';
    const paymentReference = reference || transaction_id || transaction.id;

    // Record wallet transaction
    await supabase
      .from('wallet_transactions')
      .insert({
        user_id: transaction.user_id,
        type: 'deposit',
        amount: netAmount,
        description: `Wallet top-up via ${paymentMethod === 'airtel_money' ? 'Airtel Money' : 'Paystack'} (Fee: KES ${platformFee.toFixed(2)})`,
        status: 'completed',
        reference_id: paymentReference,
        payment_method: paymentMethod,
        currency: 'KES'
      });

    // Update transaction status by ID
    await supabase
      .from('mpesa_transactions')
      .update({
        status: 'success',
        result_code: 0,
        result_desc: 'Payment verified and credited manually',
        mpesa_receipt_number: paymentReference,
        transaction_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', transaction.id);

    console.log('Payment credited successfully:', {
      userId: transaction.user_id,
      netAmount,
      newBalance: wallet.balance + netAmount
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment credited successfully',
        amount: netAmount,
        newBalance: wallet.balance + netAmount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error crediting payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
