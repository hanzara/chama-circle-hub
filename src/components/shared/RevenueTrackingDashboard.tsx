import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wifi, 
  Gamepad2, 
  Users, 
  Gift, 
  ArrowLeftRight, 
  Home, 
  PiggyBank,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RevenueStats {
  total: number;
  count: number;
  fees: number;
  profit: number;
}

export function RevenueTrackingDashboard() {
  const { data: wifiRevenue, isLoading: wifiLoading } = useQuery({
    queryKey: ['revenue-wifi'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('package_purchases')
        .select('amount, platform_fee, commission_amount')
        .eq('status', 'completed');
      
      if (error) throw error;
      
      return data.reduce((acc, curr) => ({
        total: acc.total + curr.amount,
        fees: acc.fees + (curr.platform_fee || 0),
        commission: acc.commission + (curr.commission_amount || 0),
        count: acc.count + 1
      }), { total: 0, fees: 0, commission: 0, count: 0 });
    }
  });

  const { data: gamingRevenue, isLoading: gamingLoading } = useQuery({
    queryKey: ['revenue-gaming'],
    queryFn: async () => {
      // Query gaming-related transactions from mpesa_transactions
      const { data, error } = await supabase
        .from('mpesa_transactions')
        .select('amount')
        .eq('purpose', 'gaming')
        .eq('status', 'success');
      
      if (error) throw error;
      
      const total = data?.reduce((acc, curr) => acc + (curr.amount * 0.15), 0) || 0; // 15% house edge average
      
      return {
        total,
        games: total * 0.7, // 70% from games
        subscriptions: total * 0.3, // 30% from subscriptions
        count: data?.length || 0
      };
    }
  });

  const { data: chamaRevenue, isLoading: chamaLoading } = useQuery({
    queryKey: ['revenue-chama'],
    queryFn: async () => {
      // Query chama-related transactions
      const { data, error } = await supabase
        .from('mpesa_transactions')
        .select('amount')
        .in('purpose', ['chama_contribution', 'chama_loan', 'chama_withdrawal'])
        .eq('status', 'success');
      
      if (error) throw error;
      
      const total = data?.reduce((acc, curr) => acc + (curr.amount * 0.02), 0) || 0; // 2% transaction fee
      
      return {
        total,
        count: data?.length || 0
      };
    }
  });

  const { data: maintenanceRevenue } = useQuery({
    queryKey: ['revenue-maintenance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mpesa_transactions')
        .select('amount')
        .eq('purpose', 'maintenance_fee')
        .eq('status', 'success');
      
      if (error) throw error;
      
      return data?.reduce((acc, curr) => ({
        total: acc.total + curr.amount,
        count: acc.count + 1
      }), { total: 0, count: 0 });
    }
  });

  const { data: billsRevenue, isLoading: billsLoading } = useQuery({
    queryKey: ['revenue-bills'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_bill_payments')
        .select('service_fee')
        .eq('status', 'completed');
      
      if (error) throw error;
      
      return data.reduce((acc, curr) => ({
        total: acc.total + (curr.service_fee || 0),
        count: acc.count + 1
      }), { total: 0, count: 0 });
    }
  });

  const totalRevenue = (wifiRevenue?.fees || 0) + 
                       (gamingRevenue?.total || 0) + 
                       (chamaRevenue?.total || 0) + 
                       (maintenanceRevenue?.total || 0) +
                       (billsRevenue?.total || 0);

  const revenueStreams = [
    {
      id: 'wifi',
      name: 'WiFi Access',
      icon: Wifi,
      revenue: wifiRevenue?.fees || 0,
      count: wifiRevenue?.count || 0,
      description: 'Platform fees from package sales',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'gaming',
      name: 'Gaming & Trivia',
      icon: Gamepad2,
      revenue: gamingRevenue?.total || 0,
      count: gamingRevenue?.count || 0,
      description: 'Entry fees & subscriptions',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'chama',
      name: 'Chama Management',
      icon: Users,
      revenue: chamaRevenue?.total || 0,
      count: chamaRevenue?.count || 0,
      description: 'Transaction & maintenance fees',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'bills',
      name: 'Bills & Deals',
      icon: Gift,
      revenue: billsRevenue?.total || 0,
      count: billsRevenue?.count || 0,
      description: 'Bill payment service fees',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Revenue Dashboard</h2>
          <p className="text-muted-foreground">Track all platform revenue streams</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <DollarSign className="h-5 w-5 mr-2" />
          Total: KES {totalRevenue.toLocaleString()}
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {revenueStreams.map((stream) => {
          const Icon = stream.icon;
          return (
            <Card key={stream.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className={`w-12 h-12 ${stream.bgColor} rounded-lg flex items-center justify-center mb-2`}>
                  <Icon className={`h-6 w-6 ${stream.color}`} />
                </div>
                <CardTitle className="text-lg">{stream.name}</CardTitle>
                <CardDescription className="text-xs">{stream.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">KES {stream.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span>{stream.count} transactions</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Breakdown */}
      <Tabs defaultValue="wifi" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="wifi">WiFi</TabsTrigger>
          <TabsTrigger value="gaming">Gaming</TabsTrigger>
          <TabsTrigger value="chama">Chama</TabsTrigger>
          <TabsTrigger value="bills">Bills</TabsTrigger>
        </TabsList>

        <TabsContent value="wifi" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>WiFi Revenue Breakdown</CardTitle>
              <CardDescription>Platform fees and seller commissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span>Platform Fees (5-10%)</span>
                  <span className="font-semibold">KES {(wifiRevenue?.fees || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span>Total Sales</span>
                  <span className="font-semibold">KES {(wifiRevenue?.total || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span>Seller Commissions (90-95%)</span>
                  <span className="font-semibold">KES {(wifiRevenue?.commission || 0).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gaming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gaming Revenue Breakdown</CardTitle>
              <CardDescription>Entry fees, house edge, and subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span>Game Entry Fees (House Edge 12-30%)</span>
                  <span className="font-semibold">KES {(gamingRevenue?.games || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span>Premium Subscriptions</span>
                  <span className="font-semibold">KES {(gamingRevenue?.subscriptions || 0).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chama" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chama Revenue Breakdown</CardTitle>
              <CardDescription>Transaction fees and maintenance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span>Transaction Fees</span>
                  <span className="font-semibold">KES {(chamaRevenue?.total || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span>Total Transactions</span>
                  <span className="font-semibold">{chamaRevenue?.count || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bills & Deals Revenue</CardTitle>
              <CardDescription>Service fees from bill payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span>Service Fees</span>
                  <span className="font-semibold">KES {(billsRevenue?.total || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span>Total Payments</span>
                  <span className="font-semibold">{billsRevenue?.count || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
