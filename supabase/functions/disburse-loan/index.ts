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
    const { data: adminMember, error: memberError } = await supabase
      .from('chama_members')
      .select('role, id')
      .eq('user_id', user.id)
      .eq('chama_id', chamaId)
      .single();

    if (memberError || !adminMember || !['admin', 'treasurer', 'chairman'].includes(adminMember.role)) {
      throw new Error('Only admins, chairmen, and treasurers can disburse loans');
    }

    // Get loan details from chama_loans table
    const { data: loan, error: loanError } = await supabase
      .from('chama_loans')
      .select(`
        *,
        chama_members!chama_loans_borrower_id_fkey(
          id,
          user_id
        )
      `)
      .eq('id', loanId)
      .single();

    if (loanError) {
      console.error('Loan fetch error:', loanError);
      throw new Error(`Failed to fetch loan: ${loanError.message}`);
    }

    if (!loan) {
      throw new Error('Loan not found');
    }

    console.log('Loan data:', { loan, borrower: loan.chama_members });

    // Verify loan belongs to this chama
    if (loan.chama_id !== chamaId) {
      throw new Error('Loan does not belong to this chama');
    }

    // Check if already disbursed
    if (loan.disbursement_status) {
      throw new Error('Loan has already been disbursed');
    }

    // Get borrower user_id safely
    const borrowerUserId = loan.chama_members?.user_id;
    if (!borrowerUserId) {
      console.error('Borrower data missing:', loan.chama_members);
      throw new Error('Unable to identify loan borrower');
    }

    console.log('Updating loan status for loan:', loanId);

    // Calculate loan details for the report
    const interestRate = loan.interest_rate || 5.0;
    const durationMonths = loan.duration_months || 12;
    const loanAmount = loan.amount;
    const monthlyInterest = (loanAmount * (interestRate / 100)) / 12;
    const monthlyPayment = (loanAmount / durationMonths) + monthlyInterest;
    const totalRepayment = monthlyPayment * durationMonths;
    const totalInterest = totalRepayment - loanAmount;

    // Generate repayment schedule
    const repaymentSchedule = [];
    let remainingBalance = loanAmount;
    const disbursementDate = new Date();
    
    for (let i = 1; i <= durationMonths; i++) {
      const dueDate = new Date(disbursementDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      const principalPortion = loanAmount / durationMonths;
      const interestPortion = monthlyInterest;
      remainingBalance -= principalPortion;
      
      repaymentSchedule.push({
        month: i,
        dueDate: dueDate.toISOString().split('T')[0],
        principalAmount: Math.round(principalPortion),
        interestAmount: Math.round(interestPortion),
        totalPayment: Math.round(monthlyPayment),
        remainingBalance: Math.max(0, Math.round(remainingBalance))
      });
    }

    // Create comprehensive loan report
    const loanReport = {
      loan_id: loanId,
      borrower_id: borrowerUserId,
      disbursed_at: new Date().toISOString(),
      loan_details: {
        principal_amount: loanAmount,
        interest_rate: interestRate,
        duration_months: durationMonths,
        monthly_payment: Math.round(monthlyPayment),
        total_repayment: Math.round(totalRepayment),
        total_interest: Math.round(totalInterest),
        loan_purpose: loan.purpose
      },
      repayment_schedule: repaymentSchedule,
      disbursement_conditions: {
        requires_payment_details: true,
        funds_to_be_sent_to: 'member_payment_number'
      }
    };

    // Update loan to disbursed status
    const { error: updateError } = await supabase
      .from('chama_loans')
      .update({
        disbursement_status: true,
        status: 'approved',
        metadata: {
          ...loan.metadata,
          loan_report: loanReport,
          disbursed_at: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', loanId);

    if (updateError) {
      console.error('Update loan error:', updateError);
      throw new Error(`Failed to update loan: ${updateError.message}`);
    }

    console.log('Sending notification to borrower:', borrowerUserId);

    // Send notification with detailed report to borrower
    const { error: notificationError } = await supabase
      .from('chama_notifications')
      .insert({
        chama_id: chamaId,
        user_id: borrowerUserId,
        type: 'loan',
        title: '🎉 Loan Disbursed - Report Available',
        message: `Your loan of KES ${loanAmount.toLocaleString()} has been approved and disbursed! Monthly payment: KES ${Math.round(monthlyPayment).toLocaleString()} for ${durationMonths} months. Please provide your payment details to receive the funds.`,
        metadata: { 
          loan_id: loanId,
          loan_report: loanReport,
          action_required: 'provide_payment_details'
        }
      });

    if (notificationError) {
      console.error('Notification error:', notificationError);
      // Don't fail the whole operation if notification fails
    }

    console.log('Logging activity');

    // Log activity
    const { error: activityError } = await supabase
      .from('chama_activities')
      .insert({
        chama_id: chamaId,
        member_id: adminMember.id,
        activity_type: 'loan_disbursed',
        description: `Loan of KES ${loan.amount.toLocaleString()} disbursed by ${adminMember.role}`,
        amount: loan.amount
      });

    if (activityError) {
      console.error('Activity log error:', activityError);
      // Don't fail the operation if activity logging fails
    }

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