import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowUpDown, 
  CreditCard,
  DollarSign,
  RefreshCw,
  Gift,
  Minus,
  Filter
} from "lucide-react";
import { useEnhancedWallet } from "@/hooks/useEnhancedWallet";
import { format } from "date-fns";

const TRANSACTION_ICONS: Record<string, any> = {
  deposit: ArrowDownLeft,
  withdrawal: ArrowUpRight,
  conversion: ArrowUpDown,
  payment: CreditCard,
  refund: RefreshCw,
  reward: Gift,
  fee: Minus,
  transfer: ArrowUpRight,
  staking: DollarSign,
  unstaking: DollarSign
};

const TRANSACTION_COLORS: Record<string, string> = {
  deposit: 'text-green-600',
  withdrawal: 'text-red-600',
  conversion: 'text-blue-600',
  payment: 'text-purple-600',
  refund: 'text-green-600',
  reward: 'text-yellow-600',
  fee: 'text-orange-600',
  transfer: 'text-indigo-600',
  staking: 'text-teal-600',
  unstaking: 'text-cyan-600'
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800'
};

export const TransactionHistory = () => {
  const { transactions, refreshData } = useEnhancedWallet();

  const getTransactionDisplayAmount = (transaction: any) => {
    if (transaction.transaction_type === 'conversion') {
      return `${transaction.from_amount?.toFixed(4)} ${transaction.from_currency} → ${transaction.to_amount?.toFixed(4)} ${transaction.to_currency}`;
    }
    
    if (transaction.from_amount && transaction.from_currency) {
      return `${transaction.from_amount.toFixed(4)} ${transaction.from_currency}`;
    }
    
    if (transaction.to_amount && transaction.to_currency) {
      return `${transaction.to_amount.toFixed(4)} ${transaction.to_currency}`;
    }

    return 'N/A';
  };

  const getTransactionType = (transaction: any) => {
    return transaction.transaction_type.charAt(0).toUpperCase() + transaction.transaction_type.slice(1);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Recent wallet activity and transactions</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm" onClick={refreshData}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No transactions yet</p>
            <p className="text-sm">Your transaction history will appear here</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {transactions.map((transaction) => {
                const IconComponent = TRANSACTION_ICONS[transaction.transaction_type] || CreditCard;
                const iconColor = TRANSACTION_COLORS[transaction.transaction_type] || 'text-gray-600';
                const statusColor = STATUS_COLORS[transaction.status] || 'bg-gray-100 text-gray-800';

                return (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center ${iconColor}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{getTransactionType(transaction)}</span>
                          <Badge variant="outline" className={statusColor}>
                            {transaction.status}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {transaction.description || 'No description'}
                        </p>
                        
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(transaction.created_at), 'MMM dd, yyyy • HH:mm')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-mono text-sm font-medium">
                        {getTransactionDisplayAmount(transaction)}
                      </p>
                      
                      {transaction.fee_amount > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Fee: {transaction.fee_amount.toFixed(4)} {transaction.fee_currency}
                        </p>
                      )}
                      
                      {transaction.exchange_rate && transaction.exchange_rate !== 1 && (
                        <p className="text-xs text-muted-foreground">
                          Rate: {transaction.exchange_rate.toFixed(6)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};