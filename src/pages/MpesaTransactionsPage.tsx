// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Filter, Download, RefreshCw, CheckCircle, XCircle, Clock, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { useMpesaIntegration } from '@/hooks/useMpesaIntegration';
import { format } from 'date-fns';

const MpesaTransactionsPage = () => {
  const navigate = useNavigate();
  const { transactionHistory, isLoadingHistory, pendingTransactions } = useMpesaIntegration();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [purposeFilter, setPurposeFilter] = useState('all');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'success':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getPurposeLabel = (purpose: string) => {
    switch (purpose) {
      case 'contribution':
        return 'Contribution';
      case 'registration':
        return 'Registration';
      case 'loan_repayment':
        return 'Loan Repayment';
      case 'loan_disbursement':
        return 'Loan Disbursement';
      default:
        return 'Other';
    }
  };

  const filteredTransactions = transactionHistory?.filter(transaction => {
    const matchesSearch = 
      transaction.mpesa_receipt_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.phone_number.includes(searchTerm) ||
      'general'.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesPurpose = purposeFilter === 'all' || true;
    
    return matchesSearch && matchesStatus && matchesPurpose;
  });

  const exportTransactions = () => {
    if (!filteredTransactions) return;
    
    const csvContent = [
      ['Date', 'Amount', 'Purpose', 'Status', 'Receipt Number', 'Phone Number'].join(','),
      ...filteredTransactions.map(transaction => [
        format(new Date(transaction.created_at), 'yyyy-MM-dd HH:mm:ss'),
        transaction.amount,
        'M-Pesa Payment',
        transaction.status,
        transaction.mpesa_receipt_number || 'N/A',
        transaction.phone_number
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mpesa-transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">M-Pesa Transactions</h1>
              <p className="text-muted-foreground">Track your payment history and transaction status</p>
            </div>
          </div>

          {/* Pending Transactions Alert */}
          {pendingTransactions && pendingTransactions.length > 0 && (
            <Card className="mb-6 border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <Clock className="h-5 w-5" />
                  Pending Transactions
                </CardTitle>
                <CardDescription className="text-yellow-700">
                  You have {pendingTransactions.length} pending M-Pesa transaction(s). 
                  These will update automatically once payment is completed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pendingTransactions.slice(0, 3).map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <div>
                        <p className="font-medium">M-Pesa Payment</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(transaction.created_at), 'MMM d, yyyy HH:mm')}
                        </p>
                      </div>
                      <div className="text-right">
                        <CurrencyDisplay amount={transaction.amount} showToggle={false} className="font-bold" />
                        <p className="text-sm text-yellow-600">Pending</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={purposeFilter} onValueChange={setPurposeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Purposes</SelectItem>
                    <SelectItem value="contribution">Contributions</SelectItem>
                    <SelectItem value="registration">Registration</SelectItem>
                    <SelectItem value="loan_repayment">Loan Repayment</SelectItem>
                    <SelectItem value="loan_disbursement">Loan Disbursement</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={exportTransactions} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <Smartphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{transactionHistory?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  All time M-Pesa transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Successful Payments</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {transactionHistory?.filter(t => t.status === 'success').length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Completed successfully
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                <CurrencyDisplay amount={0} showToggle={false} className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <CurrencyDisplay 
                    amount={transactionHistory?.filter(t => t.status === 'success').reduce((sum, t) => sum + t.amount, 0) || 0}
                    showToggle={false}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Successfully processed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Transactions List */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Your complete M-Pesa transaction history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading transactions...</span>
                </div>
              ) : filteredTransactions && filteredTransactions.length > 0 ? (
                <div className="space-y-4">
                  {filteredTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(transaction.status)}
                        <div>
                          <p className="font-medium">M-Pesa Payment</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(transaction.created_at), 'MMM d, yyyy HH:mm')}
                          </p>
                          {transaction.mpesa_receipt_number && (
                            <p className="text-xs text-green-600">
                              Receipt: {transaction.mpesa_receipt_number}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <CurrencyDisplay amount={transaction.amount} showToggle={false} className="font-bold" />
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={getStatusVariant(transaction.status)} className="text-xs">
                            {transaction.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Chama Transaction
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {transaction.phone_number}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Smartphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No transactions found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== 'all' || purposeFilter !== 'all'
                      ? "Try adjusting your filters or search terms"
                      : "You haven't made any M-Pesa transactions yet"
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MpesaTransactionsPage;