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

    const { loanId, chamaId } = await req.json();

    console.log('Disbursing loan:', { loanId, chamaId });

    // Verify user has permission (admin, chairman, or treasurer)
    const { data: adminMember } = await supabase
      .from('chama_members')
      .select('role, id')
      .eq('user_id', user.id)
      .eq('chama_id', chamaId)
      .single();

    if (!adminMember || !['admin', 'treasurer', 'chairman'].includes(adminMember.role)) {
      throw new Error('Only admins, chairmen, and treasurers can disburse loans');
    }

    // Get loan details
    const { data: loan } = await supabase
      .from('chama_loan_requests')
      .select('*, chama_members!inner(user_id)')
      .eq('id', loanId)
      .single();

    if (!loan) throw new Error('Loan not found');

    // Update loan to disbursed status
    await supabase
      .from('chama_loan_requests')
      .update({
        disbursement_status: true,
        status: 'approved'
      })
      .eq('id', loanId);

    // Send notification to borrower
    await supabase
      .from('chama_notifications')
      .insert({
        chama_id: chamaId,
        user_id: loan.chama_members.user_id,
        type: 'loan',
        title: 'Loan Disbursed',
        message: 'Your loan has been disbursed. Please provide your payment details to receive the funds.',
        metadata: { loan_id: loanId }
      });

    // Log activity
    await supabase
      .from('chama_activities')
      .insert({
        chama_id: chamaId,
        activity_type: 'loan_disbursed',
        description: `Loan of KES ${loan.amount} disbursed by ${adminMember.role}`,
        amount: loan.amount
      });

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Loan disbursed successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Loan disbursement error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to disburse loan' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});