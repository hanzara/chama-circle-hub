import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Download,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  commission: number;
  net_amount: number;
  status: string;
  voucher_code: string | null;
  created_at: string;
  meta: any;
}

interface SalesMetrics {
  today: {
    sales: number;
    transactions: number;
    commission: number;
    net: number;
  };
  week: {
    sales: number;
    transactions: number;
    commission: number;
    net: number;
  };
  month: {
    sales: number;
    transactions: number;
    commission: number;
    net: number;
  };
}

interface SalesDashboardProps {
  sellerId: string;
}

export function SalesDashboard({ sellerId }: SalesDashboardProps) {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [metrics, setMetrics] = useState<SalesMetrics>({
    today: { sales: 0, transactions: 0, commission: 0, net: 0 },
    week: { sales: 0, transactions: 0, commission: 0, net: 0 },
    month: { sales: 0, transactions: 0, commission: 0, net: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('today');

  useEffect(() => {
    fetchSalesData();
    
    // Load demo sales data from localStorage
    const demoSales = JSON.parse(localStorage.getItem('seller-sales') || '[]');
    setTransactions(demoSales);
    
    // Calculate metrics from demo data
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const calculateMetrics = (transactions: Transaction[], fromDate: Date) => {
      const filtered = transactions.filter(t => new Date(t.created_at) >= fromDate);
      return {
        sales: filtered.reduce((sum, t) => sum + t.amount, 0),
        transactions: filtered.length,
        commission: filtered.reduce((sum, t) => sum + t.commission, 0),
        net: filtered.reduce((sum, t) => sum + t.net_amount, 0),
      };
    };

    setMetrics({
      today: calculateMetrics(demoSales, today),
      week: calculateMetrics(demoSales, weekAgo),
      month: calculateMetrics(demoSales, monthAgo),
    });
    
    setLoading(false);
  }, [sellerId]);

  const fetchSalesData = async () => {
    try {
      // Fetch recent transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('wifi_transactions')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (transactionsError) throw transactionsError;
      setTransactions(transactionsData || []);

      // Calculate metrics
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const calculateMetrics = (transactions: Transaction[], fromDate: Date) => {
        const filtered = transactions.filter(t => new Date(t.created_at) >= fromDate);
        return {
          sales: filtered.reduce((sum, t) => sum + t.amount, 0),
          transactions: filtered.length,
          commission: filtered.reduce((sum, t) => sum + t.commission, 0),
          net: filtered.reduce((sum, t) => sum + t.net_amount, 0),
        };
      };

      setMetrics({
        today: calculateMetrics(transactionsData || [], today),
        week: calculateMetrics(transactionsData || [], weekAgo),
        month: calculateMetrics(transactionsData || [], monthAgo),
      });
    } catch (error: any) {
      console.error('Error fetching sales data:', error);
      toast({
        title: "Error",
        description: "Failed to load sales data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amountInCents: number) => {
    return `KES ${(amountInCents / 100).toFixed(0)}`;
  };

  const exportTransactions = () => {
    const csv = [
      ['Date', 'Amount', 'Commission', 'Net Amount', 'Status', 'Voucher Code'],
      ...transactions.map(t => [
        new Date(t.created_at).toLocaleDateString(),
        (t.amount / 100).toFixed(2),
        (t.commission / 100).toFixed(2),
        (t.net_amount / 100).toFixed(2),
        t.status,
        t.voucher_code || '',
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getMetricsForTimeframe = () => {
    return metrics[timeframe as keyof SalesMetrics];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentMetrics = getMetricsForTimeframe();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sales Dashboard</h2>
          <p className="text-muted-foreground">Track your sales performance and revenue</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">7 Days</SelectItem>
              <SelectItem value="month">30 Days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={exportTransactions}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Gross Sales</p>
              <p className="text-2xl font-bold">{formatCurrency(currentMetrics.sales)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-sm text-green-600">From {transactions.length} sales</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Transactions</p>
              <p className="text-2xl font-bold">{currentMetrics.transactions}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <Users className="h-4 w-4 text-blue-600 mr-1" />
            <span className="text-sm text-blue-600">Total count</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Commission</p>
              <p className="text-2xl font-bold">{formatCurrency(currentMetrics.commission)}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <ArrowDownRight className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <TrendingUp className="h-4 w-4 text-orange-600 mr-1" />
            <span className="text-sm text-orange-600">Platform fee</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Net Revenue</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(currentMetrics.net)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-sm text-green-600">Your earnings</span>
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h4 className="text-lg font-semibold mb-2">No Sales Yet</h4>
            <p className="text-muted-foreground">
              Your transaction history will appear here once customers start purchasing your packages.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.slice(0, 10).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{formatCurrency(transaction.amount)}</span>
                      <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                        {transaction.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {transaction.voucher_code && `Voucher: ${transaction.voucher_code}`}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-medium text-green-600">+{formatCurrency(transaction.net_amount)}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(transaction.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            
            {transactions.length > 10 && (
              <div className="text-center">
                <Button variant="outline" onClick={exportTransactions}>
                  View All Transactions
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}