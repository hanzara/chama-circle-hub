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
    // User client for authenticated operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Admin client for user lookup
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { senderId, recipientEmail, amount, description } = await req.json();

    console.log('Send money request:', { senderId, recipientEmail, amount });

    // Validate input
    if (!senderId || !recipientEmail || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Amount must be greater than 0' }),
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

    // Find recipient by email using admin client
    const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return new Response(
        JSON.stringify({ error: 'Failed to find recipient' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const matchingUser = authUsers.users?.find(user => user.email?.toLowerCase() === recipientEmail.toLowerCase());
    
    if (!matchingUser) {
      return new Response(
        JSON.stringify({ error: 'Recipient not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const recipientId = matchingUser.id;

    if (senderId === recipientId) {
      return new Response(
        JSON.stringify({ error: 'Cannot send money to yourself' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get sender's wallet
    const { data: senderWallet, error: senderWalletError } = await supabaseClient
      .from('user_wallets')
      .select('*')
      .eq('user_id', senderId)
      .single();

    if (senderWalletError || !senderWallet) {
      return new Response(
        JSON.stringify({ error: 'Sender wallet not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (senderWallet.balance < amount) {
      return new Response(
        JSON.stringify({ error: 'Insufficient balance' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get or create recipient's wallet
    let { data: recipientWallet, error: recipientWalletError } = await supabaseClient
      .from('user_wallets')
      .select('*')
      .eq('user_id', recipientId)
      .single();

    if (recipientWalletError && recipientWalletError.code !== 'PGRST116') {
      console.error('Recipient wallet fetch error:', recipientWalletError);
      return new Response(
        JSON.stringify({ error: 'Failed to access recipient wallet' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!recipientWallet) {
      // Create recipient wallet if it doesn't exist using admin client
      const { data: newWallet, error: createError } = await supabaseAdmin
        .from('user_wallets')
        .insert([{ user_id: recipientId, balance: 0 }])
        .select()
        .single();

      if (createError) {
        console.error('Recipient wallet creation error:', createError);
        return new Response(
          JSON.stringify({ error: 'Failed to create recipient wallet' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      recipientWallet = newWallet;
    }

    const transactionRef = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Update sender's wallet (deduct amount)
    const { error: senderUpdateError } = await supabaseClient
      .from('user_wallets')
      .update({ 
        balance: senderWallet.balance - amount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', senderId);

    if (senderUpdateError) {
      console.error('Sender wallet update error:', senderUpdateError);
      return new Response(
        JSON.stringify({ error: 'Failed to process payment' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Update recipient's wallet (add amount)
    const { error: recipientUpdateError } = await supabaseClient
      .from('user_wallets')
      .update({ 
        balance: recipientWallet.balance + amount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', recipientId);

    if (recipientUpdateError) {
      console.error('Recipient wallet update error:', recipientUpdateError);
      
      // Rollback sender's wallet
      await supabaseClient
        .from('user_wallets')
        .update({ 
          balance: senderWallet.balance,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', senderId);

      return new Response(
        JSON.stringify({ error: 'Failed to complete transfer' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Record sender's transaction
    const { error: senderTransactionError } = await supabaseClient
      .from('wallet_transactions')
      .insert([{
        user_id: senderId,
        type: 'transfer_out',
        amount: -amount,
        description: description || `Sent to ${recipientEmail}`,
        status: 'completed',
        reference_id: transactionRef,
        recipient_id: recipientId
      }]);

    // Record recipient's transaction
    const { error: recipientTransactionError } = await supabaseClient
      .from('wallet_transactions')
      .insert([{
        user_id: recipientId,
        type: 'transfer_in',
        amount: amount,
        description: description || `Received from ${user.email}`,
        status: 'completed',
        reference_id: transactionRef,
        sender_id: senderId
      }]);

    if (senderTransactionError || recipientTransactionError) {
      console.error('Transaction record error:', { senderTransactionError, recipientTransactionError });
      // Don't return error here as money was already transferred
    }

    console.log('Send money completed:', { 
      senderId, 
      recipientId, 
      amount, 
      senderNewBalance: senderWallet.balance - amount,
      recipientNewBalance: recipientWallet.balance + amount
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Money sent successfully',
        amount: amount,
        recipientEmail,
        transactionReference: transactionRef,
        newBalance: senderWallet.balance - amount
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Send money error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});