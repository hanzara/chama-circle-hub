import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useReports } from '@/hooks/useReports';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Mail, Shield } from 'lucide-react';

export const ReportsWithAdmin = () => {
  const { isAdmin } = useAuth();
  const { generateReport, isGenerating } = useReports();
  const [reportType, setReportType] = useState<string>('');
  const [format, setFormat] = useState<string>('');

  const handleGenerateReport = () => {
    if (!reportType || !format) return;
    
    // Using a demo chama ID - in real app this would come from context
    generateReport({
      chamaId: 'demo-chama-id',
      reportType: reportType as any,
      format: format as any
    });
  };

  const reportTypes = [
    { value: 'monthly_contribution', label: 'Monthly Contribution Report' },
    { value: 'loan_statement', label: 'Loan Statement' },
    { value: 'balance_sheet', label: 'Balance Sheet' },
    { value: 'member_summary', label: 'Member Summary' }
  ];

  const formatOptions = isAdmin 
    ? [
        { value: 'csv', label: 'CSV Download', icon: Download },
        { value: 'pdf', label: 'PDF Download', icon: FileText },
        { value: 'email', label: 'Email Report', icon: Mail }
      ]
    : [
        { value: 'email', label: 'Email Report', icon: Mail }
      ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Reports
          {isAdmin && (
            <Badge variant="default" className="ml-2">
              Admin Access
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Generate and download reports
          {!isAdmin && (
            <span className="block text-amber-600 mt-1">
              <Shield className="w-3 h-3 inline mr-1" />
              Limited access - CSV/PDF require admin privileges
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Report Type</label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Format</label>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {formatOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <option.icon className="w-4 h-4" />
                    {option.label}
                    {option.value === 'csv' && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        Admin Only
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleGenerateReport}
          disabled={!reportType || !format || isGenerating}
          className="w-full"
        >
          {isGenerating ? "Generating..." : "Generate Report"}
        </Button>

        {!isAdmin && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <Shield className="w-4 h-4 inline mr-1" />
              To access CSV and PDF downloads, contact your administrator for elevated permissions.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};