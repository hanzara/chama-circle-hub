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

    // Calculate transaction fee (1% of amount, minimum KES 10, maximum KES 100)
    const feePercentage = 0.01; // 1%
    const transactionFee = Math.min(Math.max(amount * feePercentage, 10), 100);
    const totalAmount = amount + transactionFee;

    console.log('Transaction details:', { amount, transactionFee, totalAmount });

    // Use secure RPC to perform the atomic transfer with admin privileges (bypasses RLS safely)
    const { data: transferResult, error: transferError } = await supabaseAdmin.rpc('transfer_funds', {
      p_sender_id: user.id,
      p_receiver_id: recipientId,
      p_amount: amount,
      p_fee: transactionFee
    });

    if (transferError) {
      console.error('Transfer RPC error:', transferError);
      return new Response(
        JSON.stringify({ error: 'Transfer failed', details: transferError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!transferResult?.success) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: transferResult?.error || 'Transfer failed',
          balance: transferResult?.balance 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const transactionRef = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Record sender's transaction (best-effort)
    const { error: senderTransactionError } = await supabaseClient
      .from('wallet_transactions')
      .insert([{
        user_id: user.id,
        type: 'transfer_out',
        amount: -amount,
        description: description || `Sent to ${recipientEmail}`,
        status: 'completed',
        reference_id: transactionRef,
        recipient_id: recipientId
      }]);

    if (senderTransactionError) {
      console.error('Sender transaction record error:', senderTransactionError);
    }

    // Record recipient's transaction (best-effort; may fail due to RLS, which is acceptable)
    const { error: recipientTransactionError } = await supabaseClient
      .from('wallet_transactions')
      .insert([{
        user_id: recipientId,
        type: 'transfer_in',
        amount: amount,
        description: description || `Received from ${user.email}`,
        status: 'completed',
        reference_id: transactionRef,
        sender_id: user.id
      }]);

    if (recipientTransactionError) {
      console.error('Recipient transaction record error:', recipientTransactionError);
    }

    console.log('Send money completed (RPC):', { 
      senderId: user.id, 
      recipientId, 
      amount,
      transactionFee,
      totalAmount,
      remaining_balance: transferResult.remaining_balance
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Money sent successfully',
        amount: amount,
        fee: transactionFee,
        totalAmount: totalAmount,
        recipientEmail,
        transactionReference: transactionRef,
        newBalance: transferResult.remaining_balance
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