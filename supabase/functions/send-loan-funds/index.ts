import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) throw new Error('Not authenticated');

    const { loanId, chamaId, amount, memberPaymentNumber } = await req.json();

    console.log('Sending loan funds:', { loanId, chamaId, amount, memberPaymentNumber });

    // Verify user has permission
    const { data: adminMember } = await supabase
      .from('chama_members')
      .select('role, id')
      .eq('user_id', user.id)
      .eq('chama_id', chamaId)
      .single();

    if (!adminMember || !['admin', 'treasurer', 'chairman'].includes(adminMember.role)) {
      throw new Error('Only admins, chairmen, and treasurers can send loan funds');
    }

    // Get loan and member details
    const { data: loan } = await supabase
      .from('chama_loan_requests')
      .select('*, chama_members!inner(id, user_id)')
      .eq('id', loanId)
      .single();

    if (!loan) throw new Error('Loan not found');

    // Get chama central wallet
    const { data: centralWallet } = await supabase
      .from('chama_central_wallets')
      .select('balance')
      .eq('chama_id', chamaId)
      .single();

    if (!centralWallet || centralWallet.balance < amount) {
      throw new Error('Insufficient chama central wallet balance');
    }

    // Deduct from chama central wallet
    await supabase
      .from('chama_central_wallets')
      .update({ balance: centralWallet.balance - amount })
      .eq('chama_id', chamaId);

    // Add to member wallet
    const { data: memberWallet } = await supabase
      .from('member_wallets')
      .select('balance')
      .eq('member_id', loan.chama_members.id)
      .eq('chama_id', chamaId)
      .single();

    await supabase
      .from('member_wallets')
      .update({ balance: (memberWallet?.balance || 0) + amount })
      .eq('member_id', loan.chama_members.id)
      .eq('chama_id', chamaId);

    // Update loan status
    await supabase
      .from('chama_loan_requests')
      .update({
        status: 'active',
        funds_sent_at: new Date().toISOString()
      })
      .eq('id', loanId);

    // Create disbursement record
    await supabase
      .from('loan_disbursements')
      .insert({
        loan_id: loanId,
        chama_id: chamaId,
        amount,
        member_payment_number: memberPaymentNumber,
        disbursed_by: user.id,
        status: 'sent',
        sent_at: new Date().toISOString()
      });

    // Log activity
    await supabase
      .from('chama_activities')
      .insert({
        chama_id: chamaId,
        activity_type: 'loan_funds_sent',
        description: `Loan funds of KES ${amount} sent to member`,
        amount
      });

    // Notify borrower
    await supabase
      .from('chama_notifications')
      .insert({
        chama_id: chamaId,
        user_id: loan.chama_members.user_id,
        type: 'loan',
        title: 'Loan Funds Sent',
        message: `KES ${amount} has been sent to your wallet. Start repaying when ready.`,
        metadata: { loan_id: loanId, amount }
      });

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Loan funds sent successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Send loan funds error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to send loan funds' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});