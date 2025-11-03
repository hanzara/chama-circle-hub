import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Users, 
  PiggyBank, 
  CreditCard, 
  Clock,
  CheckCircle,
  XCircle,
  Loader
} from 'lucide-react';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { useNavigate } from 'react-router-dom';

interface RecentTransaction {
  id: string;
  type: 'contribution' | 'loan_disbursement' | 'loan_repayment' | 'transfer' | 'deposit' | 'withdrawal';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  chama_name?: string;
  reference?: string;
}

interface RecentTransactionsProps {
  transactions: RecentTransaction[];
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ 
  transactions 
}) => {
  const navigate = useNavigate();

  if (!transactions || transactions.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
          <CardDescription>Your transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No Recent Activity
            </h3>
            <p className="text-sm text-muted-foreground">
              Your transactions will appear here once you start using the app
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'contribution':
        return <Users className="h-4 w-4" />;
      case 'loan_disbursement':
      case 'loan_repayment':
        return <PiggyBank className="h-4 w-4" />;
      case 'deposit':
        return <ArrowDownLeft className="h-4 w-4" />;
      case 'withdrawal':
      case 'transfer':
        return <ArrowUpRight className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-success" />;
      case 'failed':
        return <XCircle className="h-3 w-3 text-destructive" />;
      case 'pending':
        return <Loader className="h-3 w-3 text-orange-500 animate-spin" />;
      default:
        return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="text-success border-success">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-orange-500 text-white">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAmountColor = (type: string, status: string) => {
    if (status !== 'completed') return 'text-muted-foreground';
    
    switch (type) {
      case 'deposit':
      case 'loan_disbursement':
        return 'text-success';
      case 'withdrawal':
      case 'transfer':
      case 'contribution':
      case 'loan_repayment':
        return 'text-destructive';
      default:
        return 'text-foreground';
    }
  };

  const formatTransactionType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Recent Activity ({transactions.length})
        </CardTitle>
        <CardDescription>Your transaction history</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.slice(0, 10).map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">
                      {formatTransactionType(transaction.type)}
                    </h4>
                    {getStatusIcon(transaction.status)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {transaction.chama_name || transaction.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <CurrencyDisplay 
                  amount={transaction.amount} 
                  className={`font-semibold text-sm ${getAmountColor(transaction.type, transaction.status)}`}
                  showToggle={false} 
                />
                <div className="mt-1">
                  {getStatusBadge(transaction.status)}
                </div>
              </div>
            </div>
          ))}

          {transactions.length > 10 && (
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => navigate('/smart-wallet')}
            >
              View All Transactions
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};