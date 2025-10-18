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

    const { reference } = await req.json();
    
    console.log('Manually crediting payment for reference:', reference);

    // Get transaction details
    const { data: transaction, error: txError } = await supabase
      .from('mpesa_transactions')
      .select('*')
      .eq('checkout_request_id', reference)
      .single();

    if (txError || !transaction) {
      throw new Error('Transaction not found');
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
        payment_method: 'paystack'
      });

    // Update transaction status
    await supabase
      .from('mpesa_transactions')
      .update({
        status: 'success',
        result_code: 0,
        result_desc: 'Payment verified and credited manually',
        mpesa_receipt_number: reference,
        transaction_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('checkout_request_id', reference);

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
