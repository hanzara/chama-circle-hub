
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, DollarSign, Mail, Download } from 'lucide-react';
import { useReports } from '@/hooks/useReports';

interface ReportsStatementsProps {
  chamaData: any;
}

const ReportsStatements: React.FC<ReportsStatementsProps> = ({ chamaData }) => {
  const { generateReport, isGenerating } = useReports();

  const reportTypes = [
    { 
      id: 'monthly_contribution',
      name: 'Monthly Contribution Report', 
      description: 'Member contributions for the current month', 
      icon: DollarSign 
    },
    { 
      id: 'loan_statement',
      name: 'Loan Statement', 
      description: 'Detailed loan portfolio and repayment status', 
      icon: FileText 
    },
    { 
      id: 'balance_sheet',
      name: 'Balance Sheet', 
      description: 'Complete financial position of the group', 
      icon: FileText 
    },
    { 
      id: 'member_summary',
      name: 'Member Summary', 
      description: 'Individual member activity and standings', 
      icon: FileText 
    }
  ];

  const handleGenerateReport = (reportType: string, format: 'pdf' | 'email') => {
    generateReport({
      chamaId: chamaData.id,
      reportType: reportType as any,
      format
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Reports & Statements</h2>
        <p className="text-muted-foreground">Generate and download financial reports</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {reportTypes.map((report) => {
          const IconComponent = report.icon;
          return (
            <Card key={report.id} className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconComponent className="h-5 w-5" />
                  {report.name}
                </CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleGenerateReport(report.id, 'pdf')}
                    disabled={isGenerating}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    {isGenerating ? 'Generating...' : 'Generate PDF'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleGenerateReport(report.id, 'email')}
                    disabled={isGenerating}
                    className="flex items-center gap-1"
                  >
                    <Mail className="h-3 w-3" />
                    Email Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ReportsStatements;
