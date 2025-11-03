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

    const { accountId, phoneNumber, provider } = await req.json();

    console.log('Syncing mobile money balance for user:', user.id, 'phone:', phoneNumber, 'provider:', provider);

    // Africa's Talking credentials
    const AT_API_KEY = Deno.env.get('AFRICASTALKING_API_KEY');
    const AT_USERNAME = Deno.env.get('AFRICASTALKING_USERNAME');
    
    let balance = 0;

    // Note: Africa's Talking doesn't provide direct balance checking API
    // You need direct M-Pesa/Airtel Money API credentials for real balance
    // This implementation is ready for when you have those credentials
    
    if (AT_API_KEY && AT_USERNAME) {
      console.log('Africa\'s Talking credentials found');
      
      // TODO: Implement direct M-Pesa/Airtel API integration
      // For M-Pesa: Use Safaricom Daraja API with Business Account
      // For Airtel: Use Airtel Money API with proper credentials
      
      // For now, using enhanced simulation based on provider
      if (provider === 'mpesa') {
        balance = Math.floor(Math.random() * 15000) + 2000; // KES 2,000 - 17,000
      } else if (provider === 'airtel_money') {
        balance = Math.floor(Math.random() * 12000) + 1500; // KES 1,500 - 13,500
      } else {
        balance = Math.floor(Math.random() * 10000) + 1000; // KES 1,000 - 11,000
      }
    } else {
      console.warn('Africa\'s Talking credentials not configured');
      balance = Math.floor(Math.random() * 10000) + 1000;
    }
    
    console.log('Balance retrieved:', balance, 'for provider:', provider);

    // Update linked account metadata with balance
    const { error: updateError } = await supabaseClient
      .from('linked_accounts')
      .update({
        metadata: {
          balance: balance,
          last_synced: new Date().toISOString(),
          sync_type: AT_API_KEY ? 'api_ready' : 'simulated',
          provider: provider,
        }
      })
      .eq('id', accountId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating account metadata:', updateError);
      throw updateError;
    }

    // Update user's central wallet balance
    const { data: wallet, error: walletError } = await supabaseClient
      .from('user_central_wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if (!walletError && wallet) {
      await supabaseClient
        .from('user_central_wallets')
        .update({ balance: balance })
        .eq('user_id', user.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        balance: balance,
        message: AT_API_KEY 
          ? 'Balance synced (simulated - need direct provider API for real balance)' 
          : 'Balance synced (simulated)',
        provider: provider,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error syncing M-Pesa balance:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
