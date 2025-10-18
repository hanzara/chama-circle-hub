import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, Filter, Download, ArrowUpRight, ArrowDownLeft, 
  Repeat, DollarSign, Calendar, User, Building, Smartphone,
  Eye, FileText, RefreshCw
} from 'lucide-react';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { useToast } from '@/hooks/use-toast';

interface TransactionLedgerProps {
  userId: string;
  chamaId?: string;
  userRole?: string;
}

const TransactionLedger: React.FC<TransactionLedgerProps> = ({ userId, chamaId, userRole }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'contribution' | 'topup' | 'transfer' | 'withdrawal' | 'payout'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [dateRange, setDateRange] = useState<'all' | '7d' | '30d' | '90d'>('30d');
  const { toast } = useToast();

  // Mock transaction data - would come from backend
  const transactions = [
    {
      id: 'txn-001',
      type: 'contribution',
      amount: 15000,
      description: 'Monthly chama contribution',
      status: 'completed',
      date: '2024-01-15T10:30:00Z',
      from: 'user-wallet',
      to: 'chama-central',
      fromName: 'Your Wallet',
      toName: 'Chama Central Wallet',
      paymentMethod: 'mpesa',
      reference: 'MPX1234567890',
      fee: 0,
      balance: 190000
    },
    {
      id: 'txn-002',
      type: 'topup',
      amount: 25000,
      description: 'M-Pesa wallet top-up',
      status: 'completed',
      date: '2024-01-14T15:45:00Z',
      from: 'mpesa-254712345678',
      to: 'user-wallet',
      fromName: 'M-Pesa (254712345678)',
      toName: 'Your Wallet',
      paymentMethod: 'mpesa',
      reference: 'MPX0987654321',
      fee: 15,
      balance: 175000
    },
    {
      id: 'txn-003',
      type: 'transfer',
      amount: 5000,
      description: 'Send to Jane Smith',
      status: 'completed',
      date: '2024-01-13T09:15:00Z',
      from: 'user-wallet',
      to: 'member-jane-smith',
      fromName: 'Your Wallet',
      toName: 'Jane Smith',
      paymentMethod: 'internal',
      reference: 'TXN789123456',
      fee: 0,
      balance: 150000
    },
    {
      id: 'txn-004',
      type: 'payout',
      amount: 75000,
      description: 'MGR monthly payout',
      status: 'completed',
      date: '2024-01-01T12:00:00Z',
      from: 'mgr-pool',
      to: 'user-mgr-wallet',
      fromName: 'MGR Pool',
      toName: 'Your MGR Wallet',
      paymentMethod: 'internal',
      reference: 'MGR202401001',
      fee: 0,
      balance: 155000
    },
    {
      id: 'txn-005',
      type: 'withdrawal',
      amount: 10000,
      description: 'Withdraw to M-Pesa',
      status: 'pending',
      date: '2024-01-16T08:20:00Z',
      from: 'user-mgr-wallet',
      to: 'mpesa-254712345678',
      fromName: 'Your MGR Wallet',
      toName: 'M-Pesa (254712345678)',
      paymentMethod: 'mpesa',
      reference: 'WTH456789123',
      fee: 25,
      balance: 80000
    },
    {
      id: 'txn-006',
      type: 'transfer',
      amount: 3500,
      description: 'Received from Michael Brown',
      status: 'completed',
      date: '2024-01-12T16:30:00Z',
      from: 'member-michael-brown',
      to: 'user-wallet',
      fromName: 'Michael Brown',
      toName: 'Your Wallet',
      paymentMethod: 'internal',
      reference: 'TXN321654987',
      fee: 0,
      balance: 155000
    }
  ];

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = searchQuery === '' || 
      txn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.fromName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.toName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || txn.type === filterType;
    const matchesStatus = filterStatus === 'all' || txn.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTransactionIcon = (type: string, amount: number) => {
    switch (type) {
      case 'contribution':
        return <Building className="h-4 w-4 text-blue-600" />;
      case 'topup':
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case 'transfer':
        return amount > 0 ? 
          <ArrowDownLeft className="h-4 w-4 text-green-600" /> : 
          <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case 'payout':
        return <Repeat className="h-4 w-4 text-purple-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'mpesa':
        return <Smartphone className="h-3 w-3" />;
      case 'internal':
        return <RefreshCw className="h-3 w-3" />;
      case 'bank':
        return <Building className="h-3 w-3" />;
      default:
        return <DollarSign className="h-3 w-3" />;
    }
  };

  const handleExport = () => {
    toast({
      title: "Exporting Transactions",
      description: "Your transaction report is being generated...",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const TransactionRow = ({ transaction }: { transaction: any }) => (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          {getTransactionIcon(transaction.type, transaction.amount)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{transaction.description}</h4>
            {getStatusBadge(transaction.status)}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <span>{formatDate(transaction.date)}</span>
            <span className="flex items-center gap-1">
              {getPaymentMethodIcon(transaction.paymentMethod)}
              {transaction.paymentMethod.toUpperCase()}
            </span>
            <span>Ref: {transaction.reference}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {transaction.fromName} → {transaction.toName}
          </div>
        </div>
      </div>

      <div className="text-right space-y-1">
        <div className={`font-bold ${
          transaction.type === 'topup' || transaction.type === 'payout' || 
          (transaction.type === 'transfer' && transaction.to.includes('user')) ? 
          'text-green-600' : 'text-red-600'
        }`}>
          {transaction.type === 'topup' || transaction.type === 'payout' || 
           (transaction.type === 'transfer' && transaction.to.includes('user')) ? '+' : '-'}
          <CurrencyDisplay amount={transaction.amount} showToggle={false} />
        </div>
        {transaction.fee > 0 && (
          <div className="text-xs text-muted-foreground">
            Fee: <CurrencyDisplay amount={transaction.fee} showToggle={false} />
          </div>
        )}
        <div className="text-xs text-muted-foreground">
          Balance: <CurrencyDisplay amount={transaction.balance} showToggle={false} />
        </div>
      </div>
    </div>
  );

  const summaryStats = {
    totalIn: transactions
      .filter(t => t.type === 'topup' || t.type === 'payout' || (t.type === 'transfer' && t.to.includes('user')))
      .reduce((sum, t) => sum + t.amount, 0),
    totalOut: transactions
      .filter(t => t.type === 'contribution' || t.type === 'withdrawal' || (t.type === 'transfer' && t.from.includes('user')))
      .reduce((sum, t) => sum + t.amount, 0),
    totalFees: transactions.reduce((sum, t) => sum + (t.fee || 0), 0),
    transactionCount: transactions.length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transaction Ledger</h2>
          <p className="text-muted-foreground">Complete record of all money movements</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View Report
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Money In</CardTitle>
          </CardHeader>
          <CardContent>
            <CurrencyDisplay 
              amount={summaryStats.totalIn} 
              className="text-xl font-bold text-green-600" 
              showToggle={false} 
            />
            <p className="text-xs text-muted-foreground mt-1">This period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Money Out</CardTitle>
          </CardHeader>
          <CardContent>
            <CurrencyDisplay 
              amount={summaryStats.totalOut} 
              className="text-xl font-bold text-red-600" 
              showToggle={false} 
            />
            <p className="text-xs text-muted-foreground mt-1">This period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <CurrencyDisplay 
              amount={summaryStats.totalFees} 
              className="text-xl font-bold" 
              showToggle={false} 
            />
            <p className="text-xs text-muted-foreground mt-1">Transaction fees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{summaryStats.transactionCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Total count</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="contributions">Contributions</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Filters */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="contribution">Contributions</option>
                    <option value="topup">Top-ups</option>
                    <option value="transfer">Transfers</option>
                    <option value="withdrawal">Withdrawals</option>
                    <option value="payout">Payouts</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Period</label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value as any)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="all">All Time</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction List */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No transactions found</p>
                    <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                  </div>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TransactionRow key={transaction.id} transaction={transaction} />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contributions" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Contribution History</CardTitle>
              <CardDescription>All chama contribution transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions
                  .filter(t => t.type === 'contribution')
                  .map((transaction) => (
                    <TransactionRow key={transaction.id} transaction={transaction} />
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfers" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Transfer History</CardTitle>
              <CardDescription>Member-to-member transfers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions
                  .filter(t => t.type === 'transfer')
                  .map((transaction) => (
                    <TransactionRow key={transaction.id} transaction={transaction} />
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>MGR and dividend payouts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions
                  .filter(t => t.type === 'payout')
                  .map((transaction) => (
                    <TransactionRow key={transaction.id} transaction={transaction} />
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TransactionLedger;