import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PurchaseRequest {
  package_id: string;
  hotspot_id: string;
  payment_method: string;
  payment_reference?: string;
  idempotency_key: string;
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

    const { package_id, hotspot_id, payment_method, payment_reference, idempotency_key }: PurchaseRequest = await req.json();

    console.log('Processing package purchase:', { package_id, hotspot_id, user_id: user.id });

    // Check if purchase already exists (idempotency)
    const { data: existingPurchase } = await supabaseClient
      .from('package_purchases')
      .select('*')
      .eq('idempotency_key', idempotency_key)
      .single();

    if (existingPurchase) {
      return new Response(JSON.stringify({
        success: true,
        purchase: existingPurchase,
        message: 'Purchase already processed'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get package details
    const { data: packageData, error: packageError } = await supabaseClient
      .from('wifi_packages')
      .select('*, wifi_hotspots(*)')
      .eq('id', package_id)
      .single();

    if (packageError || !packageData) {
      throw new Error('Package not found');
    }

    // Calculate amounts
    const baseAmount = Number(packageData.price);
    const commissionRate = Number(packageData.commission_rate) / 100;
    const commissionAmount = baseAmount * commissionRate;
    const sellerAmount = baseAmount - commissionAmount;
    const platformFee = commissionAmount * 0.1; // 10% of commission as platform fee

    // Check buyer wallet balance
    const { data: wallet } = await supabaseClient
      .from('buyer_wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!wallet || wallet.balance < baseAmount) {
      throw new Error('Insufficient wallet balance');
    }

    // Generate session token and voucher code
    const sessionToken = crypto.randomUUID();
    const voucherCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const qrCodeData = JSON.stringify({
      session_token: sessionToken,
      voucher_code: voucherCode,
      hotspot_id: hotspot_id,
      package_id: package_id
    });

    // Calculate session end time
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + (packageData.duration_minutes * 60 * 1000));

    // Start transaction
    const { data: purchase, error: purchaseError } = await supabaseClient
      .from('package_purchases')
      .insert([{
        user_id: user.id,
        package_id: package_id,
        hotspot_id: hotspot_id,
        amount: baseAmount,
        commission_amount: commissionAmount,
        seller_amount: sellerAmount,
        platform_fee: platformFee,
        payment_method: payment_method,
        payment_reference: payment_reference,
        idempotency_key: idempotency_key,
        status: 'completed'
      }])
      .select()
      .single();

    if (purchaseError) {
      throw new Error(`Purchase creation failed: ${purchaseError.message}`);
    }

    // Create WiFi session
    const { data: session, error: sessionError } = await supabaseClient
      .from('wifi_sessions')
      .insert([{
        user_id: user.id,
        hotspot_id: hotspot_id,
        package_id: package_id,
        session_token: sessionToken,
        voucher_code: voucherCode,
        qr_code_data: qrCodeData,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        data_limit_mb: packageData.data_limit_mb,
        amount_paid: baseAmount,
        commission_amount: commissionAmount,
        seller_amount: sellerAmount,
        status: 'active'
      }])
      .select()
      .single();

    if (sessionError) {
      throw new Error(`Session creation failed: ${sessionError.message}`);
    }

    // Update buyer wallet
    const { error: walletError } = await supabaseClient
      .from('buyer_wallets')
      .update({
        balance: wallet.balance - baseAmount,
        total_spent: (wallet.total_spent || 0) + baseAmount
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
        amount: -baseAmount,
        description: `WiFi package purchase: ${packageData.name} at ${packageData.wifi_hotspots.name}`,
        reference_id: purchase.id,
        payment_method: payment_method,
        payment_reference: payment_reference
      }]);

    if (transactionError) {
      console.error('Transaction recording failed:', transactionError);
    }

    console.log('Package purchase completed successfully:', { purchase_id: purchase.id, session_id: session.id });

    return new Response(JSON.stringify({
      success: true,
      purchase,
      session,
      voucher_code: voucherCode,
      session_token: sessionToken,
      qr_code_data: qrCodeData,
      message: 'Package purchased successfully'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error in wifi-purchase-package:', error);
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