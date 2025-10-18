import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExtendRequest {
  session_id: string;
  extension_minutes?: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header found');
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { session_id, extension_minutes }: ExtendRequest = await req.json();

    console.log('Processing session extension:', { session_id, extension_minutes, user_id: user.id });

    // Get current session
    const { data: session, error: sessionError } = await supabaseClient
      .from('wifi_sessions')
      .select('*, wifi_packages(*), wifi_hotspots(*)')
      .eq('id', session_id)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      throw new Error('Session not found');
    }

    if (session.status !== 'active') {
      throw new Error('Session is not active');
    }

    if (!session.can_extend) {
      throw new Error('Session cannot be extended');
    }

    // Determine extension duration (use same package duration if not specified)
    const extendMinutes = extension_minutes || session.wifi_packages.duration_minutes;
    
    // Check if package supports stacking
    if (!session.wifi_packages.is_stackable && new Date(session.end_time) > new Date()) {
      // For non-stackable packages, can only extend if session has expired
      throw new Error('This package type cannot be extended while active');
    }

    // Calculate extension cost (same as original package price)
    const extensionCost = Number(session.wifi_packages.price);
    const commissionRate = Number(session.wifi_packages.commission_rate) / 100;
    const commissionAmount = extensionCost * commissionRate;
    const sellerAmount = extensionCost - commissionAmount;

    // Check buyer wallet balance
    const { data: wallet } = await supabaseClient
      .from('buyer_wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!wallet || wallet.balance < extensionCost) {
      throw new Error('Insufficient wallet balance for extension');
    }

    // Calculate new end time
    const currentEndTime = new Date(session.end_time);
    const now = new Date();
    const baseTime = currentEndTime > now ? currentEndTime : now; // Start from current end time or now if expired
    const newEndTime = new Date(baseTime.getTime() + (extendMinutes * 60 * 1000));

    // Update session
    const { error: updateError } = await supabaseClient
      .from('wifi_sessions')
      .update({
        end_time: newEndTime.toISOString(),
        status: 'extended',
        updated_at: new Date().toISOString()
      })
      .eq('id', session_id);

    if (updateError) {
      throw new Error(`Session update failed: ${updateError.message}`);
    }

    // Create extension purchase record
    const { data: purchase, error: purchaseError } = await supabaseClient
      .from('package_purchases')
      .insert([{
        user_id: user.id,
        package_id: session.package_id,
        hotspot_id: session.hotspot_id,
        session_id: session_id,
        amount: extensionCost,
        commission_amount: commissionAmount,
        seller_amount: sellerAmount,
        platform_fee: commissionAmount * 0.1,
        payment_method: 'wallet',
        idempotency_key: `extend_${session_id}_${Date.now()}`,
        status: 'completed',
        metadata: { 
          type: 'extension', 
          extended_minutes: extendMinutes,
          original_session: session_id 
        }
      }])
      .select()
      .single();

    if (purchaseError) {
      throw new Error(`Extension purchase failed: ${purchaseError.message}`);
    }

    // Update buyer wallet
    const { error: walletError } = await supabaseClient
      .from('buyer_wallets')
      .update({
        balance: wallet.balance - extensionCost,
        total_spent: (wallet.total_spent || 0) + extensionCost
      })
      .eq('user_id', user.id);

    if (walletError) {
      throw new Error(`Wallet update failed: ${walletError.message}`);
    }

    // Record wallet transaction
    const { error: transactionError } = await supabaseClient
      .from('wifi_wallet_transactions')
      .insert([{
        user_id: user.id,
        wallet_id: wallet.id,
        transaction_type: 'purchase',
        amount: -extensionCost,
        description: `Session extension: ${extendMinutes} minutes at ${session.wifi_hotspots.name}`,
        reference_id: purchase.id,
        payment_method: 'wallet'
      }]);

    if (transactionError) {
      console.error('Transaction recording failed:', transactionError);
    }

    console.log('Session extension completed successfully:', { session_id, extended_minutes: extendMinutes, new_end_time: newEndTime });

    return new Response(JSON.stringify({
      success: true,
      session_id: session_id,
      extended_minutes: extendMinutes,
      new_end_time: newEndTime.toISOString(),
      extension_cost: extensionCost,
      message: `Session extended by ${extendMinutes} minutes`
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error in wifi-extend-session:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);