
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Lock, 
  Eye, 
  FileText, 
  DollarSign, 
  User, 
  Shield,
  Search,
  Download,
  Calendar,
  Activity
} from 'lucide-react';

const BankAuditLogs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const auditLogs = [
    {
      id: 'AL001',
      timestamp: '2024-07-14 10:30:15',
      action: 'fund_loan',
      user: 'Bank Partner 1',
      userId: 'BP001',
      details: 'Funded loan L001 for KES 50,000',
      loanId: 'L001',
      borrowerName: 'John Kamau',
      amount: 50000,
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      status: 'success',
      riskLevel: 'low'
    },
    {
      id: 'AL002',
      timestamp: '2024-07-14 09:45:22',
      action: 'view_borrower_profile',
      user: 'Bank Partner 1',
      userId: 'BP001',
      details: 'Accessed borrower profile for Mary Wanjiku',
      borrowerId: 'B002',
      borrowerName: 'Mary Wanjiku',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      status: 'success',
      riskLevel: 'medium'
    },
    {
      id: 'AL003',
      timestamp: '2024-07-14 08:20:18',
      action: 'api_access',
      user: 'Bank Partner 1 API',
      userId: 'BP001_API',
      details: 'Retrieved available loan applications via API',
      endpoint: '/api/v1/loans/available',
      responseCode: 200,
      recordsReturned: 15,
      ipAddress: '203.0.113.42',
      userAgent: 'Bank-Integration/1.0',
      status: 'success',
      riskLevel: 'low'
    },
    {
      id: 'AL004',
      timestamp: '2024-07-13 16:55:30',
      action: 'download_report',
      user: 'Bank Partner 1',
      userId: 'BP001',
      details: 'Downloaded compliance report for June 2024',
      reportType: 'compliance_summary',
      reportPeriod: 'June 2024',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      status: 'success',
      riskLevel: 'low'
    },
    {
      id: 'AL005',
      timestamp: '2024-07-13 14:30:45',
      action: 'failed_authentication',
      user: 'Unknown',
      userId: 'UNKNOWN',
      details: 'Failed login attempt with invalid API key',
      ipAddress: '198.51.100.10',
      userAgent: 'curl/7.68.0',
      status: 'failure',
      riskLevel: 'high'
    }
  ];

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.borrowerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesDate = dateFilter === 'all' || 
                       (dateFilter === 'today' && log.timestamp.startsWith('2024-07-14')) ||
                       (dateFilter === 'yesterday' && log.timestamp.startsWith('2024-07-13')) ||
                       (dateFilter === 'week' && log.timestamp >= '2024-07-08');
    
    return matchesSearch && matchesAction && matchesDate;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'fund_loan':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'view_borrower_profile':
        return <User className="h-4 w-4 text-blue-600" />;
      case 'api_access':
        return <Activity className="h-4 w-4 text-purple-600" />;
      case 'download_report':
        return <FileText className="h-4 w-4 text-orange-600" />;
      case 'failed_authentication':
        return <Shield className="h-4 w-4 text-red-600" />;
      default:
        return <Eye className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Success</Badge>;
      case 'failure':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Low Risk</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium Risk</Badge>;
      case 'high':
        return <Badge className="bg-red-100 text-red-800 border-red-200">High Risk</Badge>;
      default:
        return <Badge variant="outline">{risk}</Badge>;
    }
  };

  const auditStats = {
    totalLogs: auditLogs.length,
    successfulActions: auditLogs.filter(log => log.status === 'success').length,
    failedActions: auditLogs.filter(log => log.status === 'failure').length,
    highRiskActions: auditLogs.filter(log => log.riskLevel === 'high').length
  };

  return (
    <div className="space-y-6">
      {/* Audit Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditStats.totalLogs}</div>
            <p className="text-xs text-muted-foreground">Logged activities</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{auditStats.successfulActions}</div>
            <p className="text-xs text-green-600">Completed actions</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Actions</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{auditStats.failedActions}</div>
            <p className="text-xs text-red-600">Security incidents</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{auditStats.highRiskActions}</div>
            <p className="text-xs text-red-600">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Secure Audit Logs
          </CardTitle>
          <CardDescription>
            Read-only access to all partner activities, loan interactions, and security events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search logs by action, user, or borrower..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Action Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="fund_loan">Fund Loan</SelectItem>
                  <SelectItem value="view_borrower_profile">View Profile</SelectItem>
                  <SelectItem value="api_access">API Access</SelectItem>
                  <SelectItem value="download_report">Download Report</SelectItem>
                  <SelectItem value="failed_authentication">Failed Auth</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Entries */}
      <div className="space-y-4">
        {filteredLogs.map((log) => (
          <Card key={log.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {getActionIcon(log.action)}
                    <div>
                      <h4 className="font-medium">{log.details}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{log.timestamp}</span>
                        <span>•</span>
                        <span>User: {log.user}</span>
                        {log.borrowerName && (
                          <>
                            <span>•</span>
                            <span>Borrower: {log.borrowerName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    {getStatusBadge(log.status)}
                    {getRiskBadge(log.riskLevel)}
                    <Badge variant="outline">{log.action.replace('_', ' ').toUpperCase()}</Badge>
                  </div>

                  {/* Additional Details */}
                  <div className="grid gap-2 md:grid-cols-3 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">IP Address:</span>
                      <span className="ml-1">{log.ipAddress}</span>
                    </div>
                    {log.amount && (
                      <div>
                        <span className="font-medium text-muted-foreground">Amount:</span>
                        <span className="ml-1 font-medium">KES {log.amount.toLocaleString()}</span>
                      </div>
                    )}
                    {log.endpoint && (
                      <div>
                        <span className="font-medium text-muted-foreground">Endpoint:</span>
                        <code className="ml-1 text-xs bg-muted px-1 py-0.5 rounded">{log.endpoint}</code>
                      </div>
                    )}
                  </div>

                  {log.userAgent && (
                    <div className="text-xs text-muted-foreground mt-2">
                      <span className="font-medium">User Agent:</span>
                      <span className="ml-1">{log.userAgent}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security Notice */}
      <Card className="border-0 shadow-lg border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 mb-1">Security & Compliance</h4>
              <p className="text-sm text-blue-700">
                All partner activities are logged and monitored for security and compliance purposes. 
                Logs are retained for 7 years and are available for regulatory audits upon request.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BankAuditLogs;
