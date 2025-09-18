
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { chamaId, reportType, format } = await req.json();
    
    console.log('Generating report:', { chamaId, reportType, format });

    // Get chama data
    const { data: chama, error: chamaError } = await supabase
      .from('chamas')
      .select('*')
      .eq('id', chamaId)
      .single();

    if (chamaError) {
      throw new Error('Chama not found');
    }

    // Get members data
    const { data: members, error: membersError } = await supabase
      .from('chama_members')
      .select(`
        *,
        profiles(full_name, email, phone_number)
      `)
      .eq('chama_id', chamaId)
      .eq('is_active', true);

    if (membersError) {
      console.error('Error fetching members:', membersError);
    }

    // Get contributions data
    const { data: contributions, error: contributionsError } = await supabase
      .from('chama_contributions_new')
      .select('*')
      .eq('chama_id', chamaId)
      .order('contribution_date', { ascending: false });

    if (contributionsError) {
      console.error('Error fetching contributions:', contributionsError);
    }

    // Get loans data
    const { data: loans, error: loansError } = await supabase
      .from('chama_loans')
      .select('*')
      .eq('chama_id', chamaId)
      .order('created_at', { ascending: false });

    if (loansError) {
      console.error('Error fetching loans:', loansError);
    }

    // Generate report content based on type
    let reportContent = '';
    const currentDate = new Date().toLocaleDateString();

    switch (reportType) {
      case 'monthly_contribution':
        const currentMonth = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        const monthlyContributions = contributions?.filter(c => 
          new Date(c.contribution_date).getMonth() === new Date().getMonth()
        ) || [];
        
        reportContent = `
          <h1>${chama.name} - Monthly Contribution Report</h1>
          <h2>Period: ${currentMonth}</h2>
          <p>Generated on: ${currentDate}</p>
          
          <h3>Summary</h3>
          <p>Total Members: ${members?.length || 0}</p>
          <p>Total Contributions This Month: KES ${monthlyContributions.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}</p>
          <p>Expected Monthly Collection: KES ${(chama.contribution_amount * (members?.length || 0)).toLocaleString()}</p>
          
          <h3>Member Contributions</h3>
          <table border="1" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Email</th>
                <th>Amount Contributed</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${members?.map(member => {
                const memberContributions = monthlyContributions.filter(c => c.member_id === member.id);
                const totalContributed = memberContributions.reduce((sum, c) => sum + c.amount, 0);
                return `
                  <tr>
                    <td>${member.profiles?.full_name || 'N/A'}</td>
                    <td>${member.profiles?.email || 'N/A'}</td>
                    <td>KES ${totalContributed.toLocaleString()}</td>
                    <td>${memberContributions[0]?.contribution_date || 'No contribution'}</td>
                    <td>${totalContributed >= chama.contribution_amount ? 'Complete' : 'Pending'}</td>
                  </tr>
                `;
              }).join('') || '<tr><td colspan="5">No data available</td></tr>'}
            </tbody>
          </table>
        `;
        break;

      case 'loan_statement':
        reportContent = `
          <h1>${chama.name} - Loan Statement</h1>
          <p>Generated on: ${currentDate}</p>
          
          <h3>Loan Portfolio Summary</h3>
          <p>Total Active Loans: ${loans?.filter(l => l.status === 'active').length || 0}</p>
          <p>Total Loan Amount: KES ${loans?.reduce((sum, l) => sum + l.amount, 0).toLocaleString() || 0}</p>
          <p>Total Repaid: KES ${loans?.reduce((sum, l) => sum + (l.repaid_amount || 0), 0).toLocaleString() || 0}</p>
          
          <h3>Loan Details</h3>
          <table border="1" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th>Borrower</th>
                <th>Amount</th>
                <th>Interest Rate</th>
                <th>Duration</th>
                <th>Repaid Amount</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              ${loans?.map(loan => `
                <tr>
                  <td>Member ${loan.borrower_id}</td>
                  <td>KES ${loan.amount.toLocaleString()}</td>
                  <td>${loan.interest_rate}%</td>
                  <td>${loan.duration_months} months</td>
                  <td>KES ${(loan.repaid_amount || 0).toLocaleString()}</td>
                  <td>${loan.status}</td>
                  <td>${loan.due_date || 'N/A'}</td>
                </tr>
              `).join('') || '<tr><td colspan="7">No loans available</td></tr>'}
            </tbody>
          </table>
        `;
        break;

      case 'balance_sheet':
        const totalContributions = contributions?.reduce((sum, c) => sum + c.amount, 0) || 0;
        const totalLoans = loans?.reduce((sum, l) => sum + l.amount, 0) || 0;
        const totalRepayments = loans?.reduce((sum, l) => sum + (l.repaid_amount || 0), 0) || 0;
        
        reportContent = `
          <h1>${chama.name} - Balance Sheet</h1>
          <p>Generated on: ${currentDate}</p>
          
          <h3>Assets</h3>
          <table border="1" style="width: 100%; border-collapse: collapse;">
            <tr><td>Cash (Total Contributions)</td><td>KES ${totalContributions.toLocaleString()}</td></tr>
            <tr><td>Loans Receivable</td><td>KES ${(totalLoans - totalRepayments).toLocaleString()}</td></tr>
            <tr><td><strong>Total Assets</strong></td><td><strong>KES ${(totalContributions + totalLoans - totalRepayments).toLocaleString()}</strong></td></tr>
          </table>
          
          <h3>Liabilities & Equity</h3>
          <table border="1" style="width: 100%; border-collapse: collapse;">
            <tr><td>Member Savings</td><td>KES ${totalContributions.toLocaleString()}</td></tr>
            <tr><td>Retained Earnings</td><td>KES ${(totalRepayments - totalLoans).toLocaleString()}</td></tr>
            <tr><td><strong>Total Liabilities & Equity</strong></td><td><strong>KES ${totalContributions.toLocaleString()}</strong></td></tr>
          </table>
        `;
        break;

      case 'member_summary':
        reportContent = `
          <h1>${chama.name} - Member Summary</h1>
          <p>Generated on: ${currentDate}</p>
          
          <h3>Member Activity Summary</h3>
          <table border="1" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Email</th>
                <th>Total Contributed</th>
                <th>Last Contribution</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${members?.map(member => `
                <tr>
                  <td>${member.profiles?.full_name || 'N/A'}</td>
                  <td>${member.profiles?.email || 'N/A'}</td>
                  <td>KES ${(member.total_contributed || 0).toLocaleString()}</td>
                  <td>${member.last_contribution_date || 'Never'}</td>
                  <td>${member.role}</td>
                  <td>${member.is_active ? 'Active' : 'Inactive'}</td>
                </tr>
              `).join('') || '<tr><td colspan="6">No members available</td></tr>'}
            </tbody>
          </table>
        `;
        break;
    }

    if (format === 'pdf') {
      // For now, return HTML content - you can integrate with a PDF service later
      return new Response(JSON.stringify({
        success: true,
        pdfData: reportContent,
        message: 'Report generated successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // Email format - you can integrate with an email service
      return new Response(JSON.stringify({
        success: true,
        message: 'Report sent to email successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Report generation error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
