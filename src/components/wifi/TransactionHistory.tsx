import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ArrowUpRight, ArrowDownLeft, DollarSign, Clock } from 'lucide-react';

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  description: string;
  payment_method: string;
  status: string;
  created_at: string;
}

export const TransactionHistory: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('wifi_wallet_transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'topup':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'purchase':
        return <ArrowDownLeft className="h-4 w-4 text-red-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return <Card className="animate-pulse"><CardContent className="h-32" /></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getTransactionIcon(transaction.transaction_type)}
                  <div>
                    <p className="font-medium text-sm">{transaction.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{new Date(transaction.created_at).toLocaleDateString()}</span>
                      <Badge variant="outline" className="text-xs">
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className={`font-medium ${transaction.transaction_type === 'topup' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.transaction_type === 'topup' ? '+' : '-'}
                  KES {Math.abs(transaction.amount).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};