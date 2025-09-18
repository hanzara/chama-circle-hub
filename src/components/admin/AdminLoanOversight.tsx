
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Filter,
  Download,
  Search,
  UserCheck,
  UserX,
  Loader2
} from 'lucide-react';
import { 
  useAdminLoansOverview, 
  useAdminLoanStatistics, 
  useUpdateLoanStatus, 
  useExportLoanData, 
  useAdminLoanRegions,
  AdminLoanData 
} from '@/hooks/useAdminLoanOversight';

const AdminLoanOversight: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [selectedLoan, setSelectedLoan] = useState<AdminLoanData | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'disburse' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Hooks for data fetching and mutations
  const { data: loans = [], isLoading: loansLoading, error: loansError } = useAdminLoansOverview();
  const { data: loanStats, isLoading: statsLoading } = useAdminLoanStatistics();
  const { data: regions = [] } = useAdminLoanRegions();
  const updateLoanStatus = useUpdateLoanStatus();
  const exportLoanData = useExportLoanData();

  // Filter loans based on search and filter criteria
  const filteredLoans = loans.filter((loan: AdminLoanData) => {
    const matchesSearch = loan.borrower_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.borrower_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.chama_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'all' || loan.risk_rating === riskFilter;
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    const matchesRegion = regionFilter === 'all' || loan.borrower_region === regionFilter;
    
    return matchesSearch && matchesRisk && matchesStatus && matchesRegion;
  });

  const handleLoanAction = (loan: AdminLoanData, action: 'approve' | 'reject' | 'disburse') => {
    setSelectedLoan(loan);
    setActionType(action);
    setActionDialogOpen(true);
    setRejectionReason('');
  };

  const handleConfirmAction = () => {
    if (!selectedLoan || !actionType) return;

    const statusMap = {
      approve: 'approved',
      reject: 'rejected',
      disburse: 'funded'
    };

    updateLoanStatus.mutate({
      loanId: selectedLoan.id,
      status: statusMap[actionType],
      rejectionReason: actionType === 'reject' ? rejectionReason : undefined,
    });

    setActionDialogOpen(false);
    setSelectedLoan(null);
    setActionType(null);
    setRejectionReason('');
  };

  const handleExport = () => {
    exportLoanData.mutate({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      riskLevel: riskFilter !== 'all' ? riskFilter : undefined,
      region: regionFilter !== 'all' ? regionFilter : undefined,
      searchTerm: searchTerm || undefined,
    });
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'approved': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'rejected': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'funded': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loansError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load loan data</h3>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Loan Statistics */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">{loanStats?.total_loans?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">All-time loans</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  KES {((loanStats?.total_volume || 0) / 1000000).toFixed(1)}M
                </div>
                <p className="text-xs text-muted-foreground">Total disbursed</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">
                  {loanStats?.active_loans?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">Currently active</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Loans</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold text-red-600">
                  {loanStats?.overdue_loans || 0}
                </div>
                <p className="text-xs text-muted-foreground">Require attention</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repayment Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {(loanStats?.avg_repayment_rate || 0).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">Platform average</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Loan Management & Oversight
          </CardTitle>
          <CardDescription>
            Monitor and manage all platform loans by risk level, status, and region
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search by borrower, chama, or loan ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="funded">Funded</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExport}
                disabled={exportLoanData.isPending}
              >
                {exportLoanData.isPending ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-1" />
                )}
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loans List */}
      {loansLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLoans.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No loans found matching your criteria</p>
              </CardContent>
            </Card>
          ) : (
            filteredLoans.map((loan) => (
              <Card key={loan.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {loan.id.slice(0, 3).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{loan.borrower_name}</h3>
                          <p className="text-sm text-muted-foreground">{loan.chama_name}</p>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-6 mb-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Amount</p>
                          <p className="font-semibold">KES {loan.loan_amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Interest Rate</p>
                          <p className="font-semibold">{loan.interest_rate}%</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Repaid</p>
                          <p className="font-semibold text-green-600">KES {loan.repaid_amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Remaining</p>
                          <p className="font-semibold text-orange-600">KES {loan.remaining_amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Credit Score</p>
                          <p className={`font-semibold ${loan.credit_score >= 700 ? 'text-green-600' : loan.credit_score >= 600 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {loan.credit_score}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Repayment Rate</p>
                          <p className={`font-semibold ${loan.repayment_rate >= 80 ? 'text-green-600' : loan.repayment_rate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {loan.repayment_rate.toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Badge className={getRiskBadgeColor(loan.risk_rating)}>
                          {loan.risk_rating.charAt(0).toUpperCase() + loan.risk_rating.slice(1)} Risk
                        </Badge>
                        <Badge className={getStatusBadgeColor(loan.status)}>
                          {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{loan.borrower_region}</span>
                        {loan.days_overdue > 0 && (
                          <span className="text-sm text-red-600 font-medium">
                            {loan.days_overdue} days overdue
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      
                      {loan.status === 'pending' && (
                        <>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleLoanAction(loan, 'approve')}
                            disabled={updateLoanStatus.isPending}
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleLoanAction(loan, 'reject')}
                            disabled={updateLoanStatus.isPending}
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      
                      {loan.status === 'approved' && (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleLoanAction(loan, 'disburse')}
                          disabled={updateLoanStatus.isPending}
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Disburse
                        </Button>
                      )}
                      
                      {loan.status === 'overdue' && (
                        <Button variant="destructive" size="sm">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Flag
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Approve Loan Application'}
              {actionType === 'reject' && 'Reject Loan Application'}
              {actionType === 'disburse' && 'Disburse Loan Funds'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' && 'Are you sure you want to approve this loan application?'}
              {actionType === 'reject' && 'Please provide a reason for rejecting this loan application.'}
              {actionType === 'disburse' && 'Are you sure you want to disburse funds for this loan?'}
            </DialogDescription>
          </DialogHeader>

          {actionType === 'reject' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Rejection Reason</label>
              <Textarea
                placeholder="Please explain why this loan is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmAction}
              disabled={updateLoanStatus.isPending || (actionType === 'reject' && !rejectionReason.trim())}
              variant={actionType === 'reject' ? 'destructive' : 'default'}
            >
              {updateLoanStatus.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {actionType === 'approve' && 'Approve Loan'}
              {actionType === 'reject' && 'Reject Loan'}
              {actionType === 'disburse' && 'Disburse Funds'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLoanOversight;
