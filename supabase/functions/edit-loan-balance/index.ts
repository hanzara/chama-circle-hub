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

    const { loanId, chamaId, repaymentAmount, notes, action } = await req.json();

    console.log('Editing loan:', { loanId, chamaId, repaymentAmount, action });

    // Verify user has permission (admin, chairman, or treasurer)
    const { data: editorMember } = await supabase
      .from('chama_members')
      .select('role, id')
      .eq('user_id', user.id)
      .eq('chama_id', chamaId)
      .single();

    if (!editorMember || !['admin', 'treasurer', 'chairman'].includes(editorMember.role)) {
      throw new Error('Only admins, chairmen, and treasurers can edit loans');
    }

    // Get loan details
    const { data: loan } = await supabase
      .from('chama_loan_requests')
      .select('*, chama_members!inner(user_id)')
      .eq('id', loanId)
      .single();

    if (!loan) throw new Error('Loan not found');

    let result;

    if (action === 'add_repayment') {
      // Record repayment
      const { error: repaymentError } = await supabase
        .from('chama_loan_repayments')
        .insert({
          loan_id: loanId,
          amount: repaymentAmount,
          payment_method: 'contribution',
          status: 'completed'
        });

      if (repaymentError) throw repaymentError;

      // Calculate new outstanding balance
      const { data: repayments } = await supabase
        .from('chama_loan_repayments')
        .select('amount')
        .eq('loan_id', loanId)
        .eq('status', 'completed');

      const totalRepaid = repayments?.reduce((sum, r) => sum + r.amount, 0) || 0;
      const outstanding = (loan.total_repayment || loan.amount) - totalRepaid;

      // Update loan status if fully repaid
      if (outstanding <= 0) {
        await supabase
          .from('chama_loan_requests')
          .update({ status: 'completed' })
          .eq('id', loanId);
      }

      result = { totalRepaid, outstanding };

    } else if (action === 'adjust_balance') {
      // Direct balance adjustment (admin only)
      if (editorMember.role !== 'admin' && editorMember.role !== 'chairman') {
        throw new Error('Only admins and chairmen can adjust loan balances');
      }

      const { error: updateError } = await supabase
        .from('chama_loan_requests')
        .update({
          total_repayment: repaymentAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', loanId);

      if (updateError) throw updateError;

      result = { adjustedBalance: repaymentAmount };
    }

    // Create audit log
    await supabase
      .from('chama_audit_logs')
      .insert({
        chama_id: chamaId,
        action: `loan_${action}`,
        actor_id: user.id,
        target_id: loan.borrower_id,
        old_value: loan.total_repayment?.toString(),
        new_value: repaymentAmount?.toString(),
        details: { loan_id: loanId, amount: repaymentAmount, notes, action }
      });

    // Notify borrower
    await supabase
      .from('chama_notifications')
      .insert({
        chama_id: chamaId,
        user_id: loan.chama_members.user_id,
        type: 'loan',
        title: 'Loan Update',
        message: action === 'add_repayment'
          ? `Repayment of KES ${repaymentAmount} recorded for your loan`
          : `Your loan balance has been adjusted`,
        metadata: { loan_id: loanId, action }
      });

    // Log activity
    await supabase
      .from('chama_activities')
      .insert({
        chama_id: chamaId,
        activity_type: 'loan_edited',
        description: `Loan edited by ${editorMember.role}: ${action}`,
        amount: repaymentAmount
      });

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Loan updated successfully',
      result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Loan edit error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to edit loan' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
