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

    const { loanId, chamaId, amount } = await req.json();

    console.log('Repaying loan:', { loanId, chamaId, amount });

    // Get member and loan details
    const { data: member } = await supabase
      .from('chama_members')
      .select('id')
      .eq('user_id', user.id)
      .eq('chama_id', chamaId)
      .single();

    if (!member) throw new Error('You are not a member of this chama');

    const { data: loan } = await supabase
      .from('chama_loan_requests')
      .select('*')
      .eq('id', loanId)
      .single();

    if (!loan) throw new Error('Loan not found');

    // Get member wallet
    const { data: memberWallet } = await supabase
      .from('member_wallets')
      .select('balance')
      .eq('member_id', member.id)
      .eq('chama_id', chamaId)
      .single();

    if (!memberWallet || memberWallet.balance < amount) {
      throw new Error('Insufficient wallet balance');
    }

    // Deduct from member wallet
    await supabase
      .from('member_wallets')
      .update({ balance: memberWallet.balance - amount })
      .eq('member_id', member.id)
      .eq('chama_id', chamaId);

    // Add to chama central wallet
    const { data: centralWallet } = await supabase
      .from('chama_central_wallets')
      .select('balance')
      .eq('chama_id', chamaId)
      .single();

    await supabase
      .from('chama_central_wallets')
      .update({ balance: (centralWallet?.balance || 0) + amount })
      .eq('chama_id', chamaId);

    // Update loan repayment
    const newAmountPaid = (loan.amount_paid || 0) + amount;
    const status = newAmountPaid >= loan.amount ? 'completed' : 'active';
    const rewardStatus = newAmountPaid >= loan.amount;

    await supabase
      .from('chama_loan_requests')
      .update({
        amount_paid: newAmountPaid,
        status,
        reward_status: rewardStatus
      })
      .eq('id', loanId);

    // Record repayment
    await supabase
      .from('chama_loan_repayments')
      .insert({
        loan_id: loanId,
        amount,
        payment_method: 'wallet',
        status: 'completed'
      });

    // Log activity
    await supabase
      .from('chama_activities')
      .insert({
        chama_id: chamaId,
        activity_type: 'loan_repayment',
        description: `Loan repayment of KES ${amount} made`,
        amount
      });

    // If fully paid, award badge
    let badgeMessage = '';
    if (rewardStatus) {
      badgeMessage = ' 🏅 Loan fully repaid! Reward badge earned.';
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Repayment of KES ${amount} successful${badgeMessage}`,
      rewardEarned: rewardStatus
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Loan repayment error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to repay loan' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});