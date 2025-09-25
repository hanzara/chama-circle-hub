import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('=== M-Pesa Callback Received ===');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const callbackData = await req.json();
    console.log('Callback data:', JSON.stringify(callbackData, null, 2));

    const { Body } = callbackData;
    const { stkCallback } = Body || {};
    
    if (!stkCallback) {
      return new Response('OK', { status: 200 });
    }

    const { CheckoutRequestID, ResultCode, ResultDesc } = stkCallback;

    // Update transaction status
    const { error: updateError } = await supabase
      .from('mpesa_transactions')
      .update({
        result_code: ResultCode,
        result_desc: ResultDesc,
        status: ResultCode === 0 ? 'success' : 'failed',
        callback_data: callbackData,
        updated_at: new Date().toISOString()
      })
      .eq('checkout_request_id', CheckoutRequestID);

    if (updateError) {
      console.error('Error updating transaction:', updateError);
    }

    return new Response('OK', { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Callback error:', error);
    return new Response('OK', { status: 200, headers: corsHeaders });
  }
});