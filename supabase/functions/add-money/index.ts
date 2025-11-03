import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { userId, amount, paymentMethod, phoneNumber } = await req.json();

    console.log('Add money request:', { userId, amount, paymentMethod });

    // Validate input
    if (!userId || !amount || !paymentMethod) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (amount <= 0 || amount > 100000) {
      return new Response(
        JSON.stringify({ error: 'Amount must be between 1 and 100,000' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get current user session
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Simulate payment processing based on method
    let paymentReference = '';
    let status = 'completed';

    switch (paymentMethod) {
      case 'mpesa':
        if (!phoneNumber) {
          return new Response(
            JSON.stringify({ error: 'Phone number required for M-Pesa' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        // Simulate M-Pesa transaction
        paymentReference = `MP${Date.now()}${Math.floor(Math.random() * 1000)}`;
        break;
      case 'card':
        paymentReference = `CARD${Date.now()}${Math.floor(Math.random() * 1000)}`;
        break;
      case 'bank':
        paymentReference = `BANK${Date.now()}${Math.floor(Math.random() * 1000)}`;
        break;
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid payment method' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }

    // Get or create user central wallet
    let { data: wallet, error: walletError } = await supabaseClient
      .from('user_central_wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (walletError && walletError.code !== 'PGRST116') {
      console.error('Wallet fetch error:', walletError);
      return new Response(
        JSON.stringify({ error: 'Failed to access wallet' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!wallet) {
      // Create wallet if it doesn't exist
      const { data: newWallet, error: createError } = await supabaseClient
        .from('user_central_wallets')
        .insert([{ user_id: userId, balance: 0 }])
        .select()
        .single();

      if (createError) {
        console.error('Wallet creation error:', createError);
        return new Response(
          JSON.stringify({ error: 'Failed to create wallet' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      wallet = newWallet;
    }

    // Update wallet balance
    const newBalance = wallet.balance + amount;
    const { error: updateError } = await supabaseClient
      .from('user_central_wallets')
      .update({ 
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Wallet update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update wallet' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Record the transaction
    const { error: transactionError } = await supabaseClient
      .from('wallet_transactions')
      .insert([{
        user_id: userId,
        type: 'deposit',
        amount: amount,
        description: `Add money via ${paymentMethod}`,
        status: status,
        reference_id: paymentReference,
        payment_method: paymentMethod
      }]);

    if (transactionError) {
      console.error('Transaction record error:', transactionError);
      // Don't return error here as money was already added
    }

    console.log('Add money completed:', { userId, amount, newBalance });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Money added successfully',
        amount: amount,
        newBalance: newBalance,
        paymentReference
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Add money error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});