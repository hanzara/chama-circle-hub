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

    const body = await req.json();
    console.log('Link account callback received:', body);

    // Verify Paystack webhook signature
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    const signature = req.headers.get('x-paystack-signature');
    
    if (signature && paystackSecretKey) {
      const hash = await crypto.subtle.digest(
        'SHA-512',
        new TextEncoder().encode(paystackSecretKey + JSON.stringify(body))
      );
      const computedSignature = Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      if (signature !== computedSignature) {
        console.error('Invalid webhook signature');
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Process successful payment for account linking
    if (body.event === 'charge.success' && body.data?.status === 'success') {
      const metadata = body.data?.metadata;
      
      if (metadata?.link_account === true) {
        console.log('Processing account linking...');
        
        // Extract authorization code for card tokenization
        const authorizationCode = body.data?.authorization?.authorization_code;
        const cardBin = body.data?.authorization?.bin;
        const cardLast4 = body.data?.authorization?.last4;
        const cardType = body.data?.authorization?.card_type;
        const bank = body.data?.authorization?.bank;
        
        // Create linked account record
        const { data: linkedAccount, error: linkError } = await supabaseClient
          .from('linked_accounts')
          .insert({
            user_id: metadata.user_id,
            account_type: metadata.account_type,
            provider: metadata.provider || bank || 'paystack',
            account_name: metadata.account_name || `${cardType} ****${cardLast4}`,
            account_number: cardLast4,
            authorization_code: authorizationCode,
            is_primary: false,
            is_active: true,
            metadata: {
              card_type: cardType,
              bank: bank,
              bin: cardBin,
              last4: cardLast4,
              linked_via: 'paystack',
              linked_at: new Date().toISOString(),
              authorization_code: authorizationCode,
            },
          })
          .select()
          .single();

        if (linkError) {
          console.error('Error creating linked account:', linkError);
          throw linkError;
        }

        console.log('Account linked successfully:', linkedAccount);

        // Refund the verification amount to user's wallet
        const refundAmount = body.data.amount / 100; // Convert from kobo/cents to main currency
        
        // Get current wallet balance
        const { data: wallet } = await supabaseClient
          .from('user_wallets')
          .select('balance')
          .eq('user_id', metadata.user_id)
          .single();

        if (wallet) {
          // Update wallet with refund
          await supabaseClient
            .from('user_wallets')
            .update({ balance: wallet.balance + refundAmount })
            .eq('user_id', metadata.user_id);

          // Record the refund transaction
          await supabaseClient
            .from('wallet_transactions')
            .insert({
              user_id: metadata.user_id,
              type: 'deposit',
              amount: refundAmount,
              description: 'Account verification refund',
              status: 'completed',
            });
        }

        // Send notification
        await supabaseClient
          .from('chama_notifications')
          .insert({
            user_id: metadata.user_id,
            chama_id: metadata.chama_id || null,
            type: 'system',
            title: '✅ Account Linked Successfully',
            message: `Your ${metadata.account_type} account has been connected. KES 100 verification fee refunded.`,
            body: 'You can now use this account for seamless payments.',
          });

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Account linked successfully',
            account_id: linkedAccount.id 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in link-account-callback:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
