
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Reports & Statements
          </h2>
          <p className="text-muted-foreground mt-1">Generate and download comprehensive financial reports</p>
        </div>
        <Badge variant="outline" className="text-xs">
          <FileText className="h-3 w-3 mr-1" />
          {reportTypes.length} Report Types
        </Badge>
      </div>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Quick Report Generation</h3>
              <p className="text-sm text-muted-foreground">
                Select any report type below to generate a PDF or receive it via email. 
                All reports include up-to-date information and are ready for download immediately.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {reportTypes.map((report) => {
          const IconComponent = report.icon;
          return (
            <Card key={report.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <IconComponent className="h-4 w-4 text-primary" />
                  </div>
                  {report.name}
                </CardTitle>
                <CardDescription className="text-sm">{report.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleGenerateReport(report.id, 'pdf')}
                    disabled={isGenerating}
                    className="flex-1 items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    {isGenerating ? 'Generating...' : 'Download PDF'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleGenerateReport(report.id, 'email')}
                    disabled={isGenerating}
                    className="flex-1 items-center gap-1"
                  >
                    <Mail className="h-3 w-3" />
                    Email Me
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
