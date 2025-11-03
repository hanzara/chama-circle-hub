
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from './use-toast';

export const useReports = () => {
  const { toast } = useToast();

  const generateReportMutation = useMutation({
    mutationFn: async ({ chamaId, reportType, format }: {
      chamaId: string;
      reportType: 'monthly_contribution' | 'loan_statement' | 'balance_sheet' | 'member_summary';
      format: 'pdf' | 'email' | 'csv';
    }) => {
      console.log('=== Generating Report ===');
      console.log('Chama ID:', chamaId);
      console.log('Report Type:', reportType);
      console.log('Format:', format);

      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          chamaId,
          reportType,
          format
        }
      });

      if (error) {
        console.error('Report generation error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data, variables) => {
      console.log('=== Report Generation Success ===');
      console.log('Data:', data);
      
      if (variables.format === 'csv') {
        // For CSV, create a download link
        if (data.csvData) {
          const blob = new Blob([data.csvData], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${data.chamaName || 'chama'}_${variables.reportType}_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }
        
        toast({
          title: "Report Generated! 📊",
          description: "Your CSV report has been downloaded.",
        });
      } else if (variables.format === 'pdf') {
        // For PDF, convert HTML to PDF and download
        if (data.htmlContent) {
          // Create a new window with the HTML content for printing
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.write(data.htmlContent);
            printWindow.document.close();
            
            // Wait for content to load, then print
            printWindow.onload = () => {
              setTimeout(() => {
                printWindow.print();
              }, 500);
            };
          }
        }
        
        toast({
          title: "Report Generated! 📄",
          description: "Your PDF report is ready. Use the print dialog to save as PDF.",
        });
      } else {
        toast({
          title: "Report Sent! 📧",
          description: "The report will be sent to your email shortly.",
        });
      }
    },
    onError: (error: any) => {
      console.error('Report generation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate report",
        variant: "destructive",
      });
    },
  });

  return {
    generateReport: generateReportMutation.mutate,
    isGenerating: generateReportMutation.isPending,
  };
};
