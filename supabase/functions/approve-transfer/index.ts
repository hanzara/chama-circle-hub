import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Paystack Transfer Approval Webhook Received ===');
    
    // Parse the incoming webhook payload
    const payload = await req.json();
    console.log('Received payload:', JSON.stringify(payload, null, 2));

    const event = payload.event;
    console.log('Event type:', event);

    // Check if this is a transfer pending approval event
    if (event === 'transfer.pending_approval') {
      const transferData = payload.data;
      const transferId = transferData?.id;

      if (!transferId) {
        console.error('No transfer ID found in payload');
        return new Response(
          JSON.stringify({ success: false, error: 'No transfer ID found' }),
          {
            status: 200, // Return 200 to avoid Paystack retries
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      console.log('Transfer ID to approve:', transferId);

      // Get Paystack secret key from environment
      const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
      
      if (!paystackSecretKey) {
        console.error('PAYSTACK_SECRET_KEY not configured');
        return new Response(
          JSON.stringify({ success: false, error: 'Paystack secret key not configured' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Approve the transfer
      console.log('Attempting to approve transfer...');
      
      const approvalResponse = await fetch('https://api.paystack.co/transfer/approve', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transfer_id: transferId,
        }),
      });

      const approvalData = await approvalResponse.json();
      console.log('Approval response:', JSON.stringify(approvalData, null, 2));

      if (!approvalResponse.ok) {
        console.error('Failed to approve transfer:', approvalData);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to approve transfer',
            details: approvalData 
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      console.log('Transfer approved successfully!');
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Transfer approved successfully',
          transfer_id: transferId,
          approval_data: approvalData
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // For other events, just acknowledge receipt
    console.log('Event acknowledged (not a pending approval)');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Event received',
        event_type: event 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
