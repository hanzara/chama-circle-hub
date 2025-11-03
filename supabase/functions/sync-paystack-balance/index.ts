import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';

    console.log('Sync balance request received');
    console.log('Auth header present:', !!authHeader);

    // Parse request body
    let body: any = null;
    try {
      body = await req.json();
    } catch (_) {
      // no body provided
    }

    console.log('Body user_id:', body?.user_id);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Try to get user from auth
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    console.log('Auth user:', user?.id);
    console.log('Auth error:', userError);

    // Helper to extract user ID from JWT
    const getUserIdFromJWT = (header: string): string | null => {
      try {
        const token = header?.startsWith('Bearer ') ? header.split(' ')[1] : header;
        if (!token) return null;
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub || payload.user_id || null;
      } catch (e) {
        console.error('JWT decode error:', e);
        return null;
      }
    };

    const userId = user?.id ?? getUserIdFromJWT(authHeader) ?? body?.user_id;

    console.log('Final userId:', userId);

    if (!userId) {
      throw new Error('Unauthorized: No user ID found');
    }

    // Create service role client for database operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch current wallet balance from database
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from('user_central_wallets')
      .select('balance, updated_at')
      .eq('user_id', userId)
      .single();

    if (walletError) {
      console.error('Error fetching wallet:', walletError);
      throw new Error('Failed to fetch wallet balance');
    }

    if (!wallet) {
      // Create wallet if it doesn't exist
      const { data: newWallet, error: createError } = await supabaseAdmin
        .from('user_central_wallets')
        .insert({ user_id: userId, balance: 0 })
        .select()
        .single();

      if (createError) {
        console.error('Error creating wallet:', createError);
        throw new Error('Failed to create wallet');
      }

      console.log('Created new wallet for user:', userId);
      
      return new Response(
        JSON.stringify({
          success: true,
          balance: 0,
          currency: 'KES',
          synced_at: new Date().toISOString(),
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    let currentBalance = wallet.balance || 0;
    console.log('Current wallet balance:', currentBalance);
    console.log('Last updated:', wallet.updated_at);

    // Reconcile from successful Paystack/Airtel payments if wallet seems out of date
    try {
      const { data: successfulTxs, error: txError } = await supabaseAdmin
        .from('mpesa_transactions')
        .select('amount, transaction_type, purpose, chama_id, status')
        .eq('user_id', userId)
        .eq('status', 'success')
        .is('chama_id', null)
        .in('transaction_type', ['paystack','airtel_money']);

      if (txError) {
        console.error('Error fetching successful transactions for reconciliation:', txError);
      } else if (successfulTxs && successfulTxs.length > 0) {
        const reconciled = successfulTxs.reduce((sum: number, tx: any) => {
          const amt = typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount || '0');
          const net = amt - (amt * 0.025);
          return sum + (isFinite(net) ? net : 0);
        }, 0);

        // Only update if discrepancy is significant (> 0.5 KES)
        if (Math.abs((currentBalance || 0) - reconciled) > 0.5) {
          console.log('Reconciling wallet balance from transactions:', { previous: currentBalance, reconciled });
          const { error: updateErr } = await supabaseAdmin
            .from('user_central_wallets')
            .update({ balance: reconciled, updated_at: new Date().toISOString() })
            .eq('user_id', userId);

          if (updateErr) {
            console.error('Failed to reconcile wallet balance:', updateErr);
          } else {
            currentBalance = reconciled;
          }
        }
      }
    } catch (e) {
      console.error('Reconciliation error:', e);
    }

    // Log the sync for audit trail
    await supabaseAdmin.from('audit_logs').insert({
      user_id: userId,
      action: 'wallet_balance_sync',
      resource_type: 'wallet',
      resource_id: userId,
      new_values: { 
        balance: currentBalance,
        synced_at: new Date().toISOString()
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        balance: currentBalance,
        currency: 'KES',
        synced_at: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Paystack balance sync error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
