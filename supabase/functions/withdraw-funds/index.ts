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

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { amount, paymentMethod, destinationDetails } = await req.json();

    console.log('Withdrawal request:', { userId: user.id, amount, paymentMethod, destinationDetails });

    // Validate input
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Please enter a valid withdrawal amount',
          success: false,
          code: 'invalid_amount' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!destinationDetails) {
      return new Response(
        JSON.stringify({ error: 'Destination details required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate specific fields based on payment method
    if (paymentMethod === 'bank') {
      if (!destinationDetails.account_number || !destinationDetails.bank_name || !destinationDetails.account_name) {
        return new Response(
          JSON.stringify({ error: 'Bank account details incomplete' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      if (!destinationDetails.phone_number) {
        return new Response(
          JSON.stringify({ error: 'Phone number required for mobile money withdrawal' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get user's central wallet
    const { data: wallet, error: walletError } = await supabaseClient
      .from('user_central_wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if (walletError || !wallet) {
      console.error('Wallet error:', walletError);
      return new Response(
        JSON.stringify({ error: 'Wallet not found', success: false }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (wallet.balance < amount) {
      return new Response(
        JSON.stringify({ error: 'Insufficient balance', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Paystack Transfer API for withdrawal
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!paystackSecretKey) {
      console.error('PAYSTACK_SECRET_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Payment service not configured', success: false }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate fee based on payment method (backend calculation)
    const calculateFee = (amt: number, method: string): number => {
      switch (method) {
        case 'mpesa':
          if (amt <= 100) return 0;
          if (amt <= 2500) return 15;
          if (amt <= 3500) return 25;
          if (amt <= 5000) return 30;
          if (amt <= 7500) return 45;
          if (amt <= 10000) return 50;
          return Math.max(50, Math.floor(amt * 0.005));
        case 'airtel':
          if (amt <= 100) return 0;
          if (amt <= 2500) return 15;
          if (amt <= 5000) return 30;
          return Math.max(50, Math.floor(amt * 0.005));
        case 'bank':
          return Math.max(25, Math.floor(amt * 0.001));
        default:
          return 0;
      }
    };

    const fee = calculateFee(amount, paymentMethod);
    const netAmount = amount - fee;
    
    // Validate that net amount is positive
    if (netAmount <= 0) {
      return new Response(
        JSON.stringify({ 
          error: `Withdrawal amount too low. Minimum amount after fees: KES ${fee + 1}`,
          success: false,
          code: 'amount_too_low',
          fee
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Starting Paystack transfer:', {
      paymentMethod,
      amount,
      fee,
      netAmount,
      phone: destinationDetails.phone_number
    });

    // Check Paystack balance before attempting transfer
    console.log('Checking Paystack balance...');
    try {
      const balanceResponse = await fetch('https://api.paystack.co/balance', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        if (balanceData.status && balanceData.data) {
          const paystackBalance = balanceData.data[0]?.balance || 0; // Balance in kobo
          const paystackBalanceKES = paystackBalance / 100; // Convert to KES
          const requiredAmount = netAmount;
          
          console.log('Paystack balance check:', { 
            paystackBalanceKES, 
            requiredAmount,
            sufficient: paystackBalanceKES >= requiredAmount 
          });

          if (paystackBalanceKES < requiredAmount) {
            return new Response(
              JSON.stringify({ 
                error: 'Withdrawal service temporarily unavailable. Our team has been notified. Please try again later or contact support.',
                success: false,
                code: 'service_unavailable'
              }),
              { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      } else {
        console.warn('Could not check Paystack balance, proceeding with transfer');
      }
    } catch (balanceError) {
      console.error('Balance check error:', balanceError);
      // Continue with transfer if balance check fails (don't block user unnecessarily)
    }
    
    // Create/get transfer recipient first
    let recipientCode;
    
    if (paymentMethod === 'mpesa' || paymentMethod === 'airtel') {
      // First, fetch the list of mobile money providers to get the correct bank code
      const banksResponse = await fetch('https://api.paystack.co/bank?currency=KES&type=mobile_money', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
        },
      });

      let banksData;
      try {
        banksData = await banksResponse.json();
      } catch (parseError) {
        console.error('Failed to parse banks response:', parseError);
        return new Response(
          JSON.stringify({ 
            error: 'Payment service error',
            success: false 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (!banksResponse.ok || !banksData.status) {
        console.error('Failed to fetch banks:', { 
          status: banksResponse.status, 
          data: banksData 
        });
        return new Response(
          JSON.stringify({ 
            error: banksData.message || 'Failed to fetch mobile money providers',
            success: false 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Find the correct provider based on payment method (robust matching)
      const provider = banksData.data.find((bank: any) => {
        const name = (bank.name || '').toLowerCase();
        const slug = (bank.slug || '').toLowerCase();
        const code = (bank.code || '').toUpperCase();
        if (paymentMethod === 'mpesa') {
          return code === 'MPESA' || name.includes('m-pesa') || name.includes('mpesa') || slug.includes('m-pesa') || slug.includes('mpesa');
        }
        if (paymentMethod === 'airtel') {
          return code === 'ATL_KE' || name.includes('airtel') || slug.includes('airtel');
        }
        return false;
      });

      if (!provider) {
        console.error('Provider not found:', { paymentMethod, providers: banksData.data });
        return new Response(
          JSON.stringify({ 
            error: `${paymentMethod.toUpperCase()} provider not available`,
            success: false 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Using provider:', provider);

      // Normalize phone formats
      let rawPhone = String(destinationDetails.phone_number || '').trim();
      let phoneNoSpaces = rawPhone.replace(/\s+/g, '').replace(/-/g, '');
      let intlPhone = phoneNoSpaces.replace(/^\+/, '');
      if (intlPhone.startsWith('0')) {
        intlPhone = '254' + intlPhone.slice(1);
      } else if (!intlPhone.startsWith('254')) {
        intlPhone = '254' + intlPhone;
      }
      const localPhone = intlPhone.startsWith('254') ? '0' + intlPhone.slice(3) : phoneNoSpaces;

      console.log('Prepared phones:', { intlPhone, localPhone });

      async function createRecipientWithPhone(phone: string) {
        console.log('Creating recipient with phone:', phone);
        try {
          const resp = await fetch('https://api.paystack.co/transferrecipient', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${paystackSecretKey}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              type: 'mobile_money',
              name: user.email || 'User',
              account_number: phone,
              bank_code: provider.code,
              currency: 'KES',
              metadata: { provider: paymentMethod },
            }),
          });
          
          let data;
          try {
            data = await resp.json();
          } catch (parseError) {
            console.error('Failed to parse recipient response:', parseError);
            return { ok: false, data: null, message: 'Payment service error' };
          }
          
          console.log('Recipient creation response:', {
            ok: resp.ok,
            status: resp.status,
            dataStatus: data?.status,
            message: data?.message
          });
          
          return { ok: resp.ok && data?.status, data, message: data?.message as string };
        } catch (error) {
          console.error('Recipient creation error:', error);
          return { ok: false, data: null, message: error instanceof Error ? error.message : 'Network error' };
        }
      }

      // Try international format first, then fallback to local format if needed
      let recipientResp = await createRecipientWithPhone(intlPhone);
      if (!recipientResp.ok && typeof recipientResp.message === 'string' && recipientResp.message.toLowerCase().includes('account number is invalid')) {
        console.warn('Intl format rejected, retrying with local format');
        recipientResp = await createRecipientWithPhone(localPhone);
      }

      if (!recipientResp.ok) {
        console.error('Recipient creation failed:', recipientResp.data);
        return new Response(
          JSON.stringify({
            error: recipientResp.message || 'Failed to create recipient',
            success: false
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      recipientCode = recipientResp.data.data.recipient_code;
    } else {
      // Create bank recipient
      const recipientResponse = await fetch('https://api.paystack.co/transferrecipient', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'nuban',
          name: destinationDetails.account_name,
          account_number: destinationDetails.account_number,
          bank_code: destinationDetails.bank_name,
          currency: 'KES',
        }),
      });

      const recipientData = await recipientResponse.json();
      
      if (!recipientResponse.ok || !recipientData.status) {
        console.error('Recipient creation failed:', recipientData);
        return new Response(
          JSON.stringify({ 
            error: recipientData.message || 'Failed to create bank recipient',
            success: false 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      recipientCode = recipientData.data.recipient_code;
    }

    // Initialize transfer
    console.log('Initiating Paystack transfer:', {
      recipientCode,
      netAmount,
      amountInKobo: Math.round(netAmount * 100)
    });
    
    let transferResponse;
    try {
      transferResponse = await fetch('https://api.paystack.co/transfer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: 'balance',
          amount: Math.round(netAmount * 100), // Convert to kobo/cents (net amount after fee)
          recipient: recipientCode,
          reason: `Wallet withdrawal via ${paymentMethod}`,
          reference: `WD${Date.now()}${user.id.substring(0, 8)}`,
        }),
      });
    } catch (fetchError) {
      console.error('Transfer fetch error:', fetchError);
      return new Response(
        JSON.stringify({ 
          error: 'Network error. Please try again.',
          success: false
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let transferData;
    try {
      transferData = await transferResponse.json();
    } catch (parseError) {
      console.error('Failed to parse transfer response:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Payment service error',
          success: false
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Transfer response:', {
      ok: transferResponse.ok,
      status: transferResponse.status,
      dataStatus: transferData?.status,
      message: transferData?.message,
      code: transferData?.code
    });

    if (!transferResponse.ok || !transferData.status) {
      console.error('Transfer failed:', transferData);
      
      // Handle specific Paystack errors with user-friendly messages
      let errorMessage = transferData.message || 'Transfer failed';
      let errorCode = transferData.code;
      
      if (transferData.code === 'insufficient_balance' || errorMessage.toLowerCase().includes('balance is not enough')) {
        errorMessage = 'Withdrawal service temporarily unavailable. Our team has been notified. Please try again later or contact support.';
        errorCode = 'service_unavailable';
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          success: false,
          code: errorCode
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Deduct from wallet
    const { error: updateError } = await supabaseClient
      .from('user_central_wallets')
      .update({ 
        balance: wallet.balance - amount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Wallet update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update wallet', success: false }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Record transaction
    const destination = paymentMethod === 'bank' 
      ? `${destinationDetails.bank_name} - ${destinationDetails.account_number}`
      : destinationDetails.phone_number;

    await supabaseClient
      .from('wallet_transactions')
      .insert({
        user_id: user.id,
        type: 'withdrawal',
        amount: -amount,
        description: `Withdrawal to ${destination} (Fee: KES ${fee})`,
        status: 'completed',
        reference_id: transferData.data?.reference || `WD${Date.now()}`,
        metadata: {
          payment_method: paymentMethod,
          destination_details: destinationDetails,
          fee,
          net_amount: amount - fee,
        }
      });

    console.log('Withdrawal successful:', { 
      userId: user.id, 
      amount, 
      fee,
      netAmount: amount - fee,
      newBalance: wallet.balance - amount 
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Withdrawal successful',
        amount,
        fee,
        netAmount: amount - fee,
        destination,
        paymentMethod,
        reference: transferData.data?.reference,
        newBalance: wallet.balance - amount
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Withdrawal error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
