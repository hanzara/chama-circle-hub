
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MpesaAccessToken {
  access_token: string;
  expires_in: string;
}

interface STKPushRequest {
  BusinessShortCode: string;
  Password: string;
  Timestamp: string;
  TransactionType: string;
  Amount: number;
  PartyA: string;
  PartyB: string;
  PhoneNumber: string;
  CallBackURL: string;
  AccountReference: string;
  TransactionDesc: string;
}

async function getAccessToken(consumerKey: string, consumerSecret: string): Promise<string> {
  console.log('=== Getting M-Pesa Access Token ===');
  
  const auth = btoa(`${consumerKey}:${consumerSecret}`);
  
  try {
    const response = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token request failed:', response.status, response.statusText, errorText);
      throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`);
    }

    const data: MpesaAccessToken = await response.json();
    console.log('Access token obtained successfully');
    return data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

async function initiateSTKPush(accessToken: string, phoneNumber: string, amount: number, description: string, transactionId: string) {
  console.log('=== Initiating STK Push ===');
  
  const businessShortCode = '174379';
  const passkey = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const password = btoa(`${businessShortCode}${passkey}${timestamp}`);
  
  // Format phone number to start with 254
  let formattedPhone = phoneNumber.replace(/\s+/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '254' + formattedPhone.slice(1);
  } else if (formattedPhone.startsWith('+254')) {
    formattedPhone = formattedPhone.slice(1);
  } else if (!formattedPhone.startsWith('254')) {
    formattedPhone = '254' + formattedPhone;
  }

  const stkPushRequest: STKPushRequest = {
    BusinessShortCode: businessShortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: formattedPhone,
    PartyB: businessShortCode,
    PhoneNumber: formattedPhone,
    CallBackURL: 'https://yrywjbxqlqpdzrudfupm.supabase.co/functions/v1/mpesa-callback',
    AccountReference: transactionId || 'Payment',
    TransactionDesc: description || 'Chama transaction'
  };

  console.log('STK Push Request:', JSON.stringify(stkPushRequest, null, 2));

  try {
    const response = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stkPushRequest),
    });

    const responseData = await response.json();
    console.log('STK Push Response:', JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      console.error('STK Push failed:', response.status, responseData);
      return {
        success: false,
        error: responseData.errorMessage || `STK Push failed: ${response.status}`,
        ...responseData
      };
    }

    return {
      success: true,
      ...responseData
    };
  } catch (error) {
    console.error('Error initiating STK Push:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred'
    };
  }
}

serve(async (req) => {
  console.log('=== M-Pesa Integration Function Called ===');
  console.log('Request method:', req.method);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const { action, phoneNumber, amount, description, transactionId } = requestBody;

    console.log('=== Processing M-Pesa Action ===');
    console.log('Action:', action);
    console.log('Phone Number:', phoneNumber);
    console.log('Amount:', amount);

    // Get M-Pesa credentials from environment variables
    const consumerKey = Deno.env.get('MPESA_CONSUMER_KEY');
    const consumerSecret = Deno.env.get('MPESA_CONSUMER_SECRET');

    console.log('=== Checking Credentials ===');
    console.log('Consumer Key exists:', !!consumerKey);
    console.log('Consumer Secret exists:', !!consumerSecret);

    if (!consumerKey || !consumerSecret) {
      console.error('=== MISSING CREDENTIALS ===');
      
      return new Response(JSON.stringify({ 
        success: false,
        error: 'M-Pesa credentials not configured',
        details: 'MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET must be set in Edge Function secrets'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate input for STK Push
    if (action === 'stk_push') {
      if (!phoneNumber || !amount) {
        console.error('Missing required parameters for STK Push');
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Missing parameters',
          details: 'phoneNumber and amount are required for STK Push'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (amount < 1) {
        console.error('Invalid amount:', amount);
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Invalid amount',
          details: 'Amount must be at least 1 KES'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get access token and initiate STK Push
      const accessToken = await getAccessToken(consumerKey, consumerSecret);
      const stkResponse = await initiateSTKPush(accessToken, phoneNumber, amount, description, transactionId);
      
      return new Response(JSON.stringify(stkResponse), {
        status: stkResponse.success ? 200 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.error('Invalid action:', action);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Invalid action',
      details: `Supported actions: stk_push. Received: ${action}`
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('=== FUNCTION ERROR ===');
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Full error:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      details: 'Please check the function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
