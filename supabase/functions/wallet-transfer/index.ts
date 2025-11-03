import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
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

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { recipientEmail, amount, description } = await req.json();

    console.log('Wallet transfer request:', { senderId: user.id, recipientEmail, amount });

    if (!recipientEmail || !amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid input parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate transaction fee (1% of amount, min KES 10, max KES 100)
    const feePercentage = 0.01;
    const transactionFee = Math.min(Math.max(amount * feePercentage, 10), 100);

    // Find recipient by email
    const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return new Response(
        JSON.stringify({ error: 'Failed to find recipient' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const matchingUser = authUsers.users?.find(u => u.email?.toLowerCase() === recipientEmail.toLowerCase());
    
    if (!matchingUser) {
      return new Response(
        JSON.stringify({ error: 'Recipient not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (user.id === matchingUser.id) {
      return new Response(
        JSON.stringify({ error: 'Cannot send money to yourself' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check sender balance
    const { data: senderWallet, error: walletError } = await supabaseAdmin
      .from('user_central_wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if (walletError || !senderWallet) {
      return new Response(
        JSON.stringify({ error: 'Sender wallet not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const totalAmount = amount + transactionFee;
    if (senderWallet.balance < totalAmount) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Insufficient balance',
          balance: senderWallet.balance 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Deduct from sender
    const { error: deductError } = await supabaseAdmin
      .from('user_central_wallets')
      .update({ balance: senderWallet.balance - totalAmount })
      .eq('user_id', user.id);

    if (deductError) {
      console.error('Deduct error:', deductError);
      return new Response(
        JSON.stringify({ error: 'Failed to deduct from sender', details: deductError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Add to recipient
    const { data: recipientWallet } = await supabaseAdmin
      .from('user_central_wallets')
      .select('balance')
      .eq('user_id', matchingUser.id)
      .single();

    const recipientNewBalance = (recipientWallet?.balance || 0) + amount;

    const { error: addError } = await supabaseAdmin
      .from('user_central_wallets')
      .update({ balance: recipientNewBalance })
      .eq('user_id', matchingUser.id);

    if (addError) {
      console.error('Add to recipient error:', addError);
      // Rollback sender deduction
      await supabaseAdmin
        .from('user_central_wallets')
        .update({ balance: senderWallet.balance })
        .eq('user_id', user.id);
      
      return new Response(
        JSON.stringify({ error: 'Failed to credit recipient', details: addError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Record transactions (use 'transfer' type which is valid)
    const { error: txError } = await supabaseAdmin.from('wallet_transactions').insert([
      {
        user_id: user.id,
        type: 'transfer',
        amount: -(amount + transactionFee),
        description: `Transfer to ${recipientEmail} (Fee: KES ${transactionFee.toFixed(2)})`,
        status: 'completed',
      },
      {
        user_id: matchingUser.id,
        type: 'transfer',
        amount: amount,
        description: `Transfer from ${user.email || 'user'}`,
        status: 'completed',
      },
    ]);

    if (txError) {
      console.error('Transaction record error:', txError);
      // Don't fail the transfer if just recording failed
    }

    const remainingBalance = senderWallet.balance - totalAmount;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Transfer successful',
        remaining_balance: remainingBalance,
        amount_sent: amount,
        fee: transactionFee,
        recipient: recipientEmail
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Wallet transfer error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
