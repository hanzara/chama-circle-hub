import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useCSVExportChama = () => {
  const { toast } = useToast();

  const exportContributions = async (chamaId: string, chamaName: string) => {
    try {
      // Fetch contributions
      const { data, error } = await supabase
        .from('chama_contributions_new')
        .select(`
          *,
          chama_members!inner(
            user_id,
            profiles:user_id(email, full_name)
          )
        `)
        .eq('chama_id', chamaId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: "No Data",
          description: "No contributions found to export",
          variant: "destructive"
        });
        return;
      }

      // Prepare CSV data
      const csvHeaders = ['Date', 'Member', 'Email', 'Amount (KES)', 'Payment Method', 'Status', 'Notes'];
      const csvRows = data.map((contribution: any) => {
        const profile = contribution.chama_members?.profiles;
        return [
          new Date(contribution.created_at).toLocaleString(),
          profile?.full_name || 'N/A',
          profile?.email || 'N/A',
          contribution.amount,
          contribution.payment_method || 'N/A',
          contribution.status,
          contribution.notes || ''
        ];
      });

      // Create CSV content
      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${chamaName.replace(/\s+/g, '_')}_contributions_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description: "Contributions data has been downloaded"
      });

    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export contributions",
        variant: "destructive"
      });
    }
  };

  const exportLoans = async (chamaId: string, chamaName: string) => {
    try {
      // Fetch loans with repayments
      const { data, error } = await supabase
        .from('chama_loans')
        .select(`
          *,
          chama_members!inner(
            profiles:user_id(email, full_name)
          ),
          chama_loan_repayments(*)
        `)
        .eq('chama_id', chamaId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: "No Data",
          description: "No loans found to export",
          variant: "destructive"
        });
        return;
      }

      // Prepare CSV data
      const csvHeaders = ['Date', 'Borrower', 'Email', 'Amount', 'Interest Rate', 'Duration (Months)', 'Repaid', 'Status', 'Due Date'];
      const csvRows = data.map((loan: any) => {
        const profile = loan.chama_members?.profiles;
        return [
          new Date(loan.created_at).toLocaleString(),
          profile?.full_name || 'N/A',
          profile?.email || 'N/A',
          loan.amount,
          `${loan.interest_rate}%`,
          loan.duration_months,
          loan.repaid_amount || 0,
          loan.status,
          loan.due_date ? new Date(loan.due_date).toLocaleDateString() : 'N/A'
        ];
      });

      // Create CSV content
      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${chamaName.replace(/\s+/g, '_')}_loans_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description: "Loans data has been downloaded"
      });

    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export loans",
        variant: "destructive"
      });
    }
  };

  return {
    exportContributions,
    exportLoans
  };
};
