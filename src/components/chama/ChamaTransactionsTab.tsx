import React, { useState } from 'react';
import { ArrowUpDown, Filter, Search, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useChamaTransactions } from '@/hooks/useChamaTransactions';

interface ChamaTransactionsTabProps {
  chamaId: string;
  userRole?: string;
  isAdmin?: boolean;
}

export const ChamaTransactionsTab: React.FC<ChamaTransactionsTabProps> = ({ 
  chamaId, 
  userRole = 'member',
  isAdmin = false 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  
  const { data: transactions, isLoading } = useChamaTransactions(chamaId);

  const filteredTransactions = transactions?.filter(transaction => {
    const matchesSearch = !searchQuery || 
      transaction.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'all' || transaction.transaction_type === selectedType;
    const matchesStatus = selectedStatus === 'all' || transaction.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  }) || [];

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    switch (sortBy) {
      case 'date_desc':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'date_asc':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'amount_desc':
        return b.amount - a.amount;
      case 'amount_asc':
        return a.amount - b.amount;
      default:
        return 0;
    }
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return '↓';
      case 'withdrawal':
        return '↑';
      case 'transfer':
        return '→';
      default:
        return '•';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      pending: "outline",
      failed: "destructive",
      cancelled: "secondary"
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const calculateTotals = () => {
    const deposits = sortedTransactions
      .filter(t => t.transaction_type === 'deposit' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const withdrawals = sortedTransactions
      .filter(t => t.transaction_type === 'withdrawal' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    return { deposits, withdrawals, net: deposits - withdrawals };
  };

  const totals = calculateTotals();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Transactions</h3>
          <p className="text-sm text-muted-foreground">
            {transactions?.length || 0} total transactions
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline">Record Deposit</Button>
            <Button variant="outline">Process Payment</Button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <ArrowUpDown className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Deposits</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(totals.deposits)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <ArrowUpDown className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Withdrawals</p>
                <p className="text-lg font-semibold text-red-600">
                  {formatCurrency(totals.withdrawals)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Balance</p>
                <p className={`text-lg font-semibold ${totals.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totals.net)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="deposit">Deposits</SelectItem>
            <SelectItem value="withdrawal">Withdrawals</SelectItem>
            <SelectItem value="transfer">Transfers</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[140px]">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date_desc">Latest First</SelectItem>
            <SelectItem value="date_asc">Oldest First</SelectItem>
            <SelectItem value="amount_desc">Highest Amount</SelectItem>
            <SelectItem value="amount_asc">Lowest Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {sortedTransactions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-2">No transactions found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No transactions match your search criteria.' : 'No transactions recorded yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedTransactions.map((transaction) => (
            <Card key={transaction.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-mono text-lg">
                      {getTypeIcon(transaction.transaction_type)}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground">
                          {transaction.description || `${transaction.transaction_type} transaction`}
                        </h4>
                        {getStatusBadge(transaction.status)}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(transaction.created_at).toLocaleString()}</span>
                        </div>
                        {transaction.payment_method && (
                          <span>via {transaction.payment_method}</span>
                        )}
                        {transaction.payment_reference && (
                          <span>Ref: {transaction.payment_reference}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-lg font-semibold ${
                      transaction.transaction_type === 'deposit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.transaction_type === 'deposit' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Load More */}
      {filteredTransactions.length > 0 && filteredTransactions.length % 20 === 0 && (
        <div className="text-center">
          <Button variant="outline">
            Load More Transactions
          </Button>
        </div>
      )}
    </div>
  );
};