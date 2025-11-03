import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  useRecentActivities,
  useRecentTransactions,
  usePendingMembers,
  useMonthlyContributions,
  useActiveLoans,
  useManualDeposit,
  useProcessPayment,
  useApproveMember,
  useRejectMember,
  useAdminDashboard
} from '@/hooks/useAdminDashboard';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Activity,
  CheckCircle,
  XCircle,
  CreditCard,
  Wallet
} from 'lucide-react';

interface AdminDashboardProps {
  chamaData: {
    id: string;
    name: string;
    total_savings: number;
    current_members: number;
  };
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ chamaData }) => {
  const { toast } = useToast();
  const [depositAmount, setDepositAmount] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDescription, setPaymentDescription] = useState('');

  // Use the individual hooks
  const { data: activities, isLoading: activitiesLoading } = useRecentActivities(chamaData.id);
  const { data: transactions, isLoading: transactionsLoading } = useRecentTransactions(chamaData.id);
  const { data: pendingMembers, isLoading: pendingLoading } = usePendingMembers(chamaData.id);
  const { data: contributions, isLoading: contributionsLoading } = useMonthlyContributions(chamaData.id);
  const { data: loans, isLoading: loansLoading } = useActiveLoans(chamaData.id);
  const { data: adminData, isLoading: adminLoading } = useAdminDashboard(chamaData.id);

  // Mutations
  const manualDeposit = useManualDeposit(chamaData.id);
  const processPayment = useProcessPayment(chamaData.id);
  const approveMember = useApproveMember(chamaData.id);
  const rejectMember = useRejectMember(chamaData.id);

  const handleDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    manualDeposit.mutate({
      amount: parseFloat(depositAmount),
      paymentMethod: 'mobile_money',
      description: 'Manual deposit by treasurer'
    });
    setDepositAmount('');
  };

  const handlePayment = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    processPayment.mutate({
      amount: parseFloat(paymentAmount),
      paymentMethod: 'mobile_money',
      description: paymentDescription || 'Payment processed by treasurer'
    });
    setPaymentAmount('');
    setPaymentDescription('');
  };

  const isLoading = activitiesLoading || transactionsLoading || pendingLoading || 
                   contributionsLoading || loansLoading || adminLoading;

  return (
    <div className="space-y-6">
      {/* Admin Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminData?.total_members || 0}</div>
            <p className="text-xs text-muted-foreground">
              {adminData?.active_members || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Contributions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {adminData?.monthly_contributions?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminData?.active_loans || 0}</div>
            <p className="text-xs text-muted-foreground">
              KES {adminData?.total_loans?.toLocaleString() || '0'} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contribution Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminData?.contribution_rate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Members contributing
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="finances">Finances</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deposit">Manual Deposit</Label>
                  <div className="flex gap-2">
                    <Input
                      id="deposit"
                      type="number"
                      placeholder="Amount"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                    />
                    <Button 
                      onClick={handleDeposit}
                      disabled={manualDeposit.isPending}
                    >
                      Deposit
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment">Process Payment</Label>
                  <div className="space-y-2">
                    <Input
                      id="payment"
                      type="number"
                      placeholder="Amount"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                    />
                    <Input
                      placeholder="Description"
                      value={paymentDescription}
                      onChange={(e) => setPaymentDescription(e.target.value)}
                    />
                    <Button 
                      onClick={handlePayment}
                      disabled={processPayment.isPending}
                      className="w-full"
                    >
                      Process Payment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {transactions?.slice(0, 5).map((transaction: any) => (
                      <div key={transaction.id} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <p className="font-medium">{transaction.transaction_type}</p>
                          <p className="text-sm text-muted-foreground">{transaction.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">KES {transaction.amount}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Member Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingMembers?.map((member: any) => (
                  <div key={member.id} className="flex justify-between items-center p-4 border rounded">
                    <div>
                      <p className="font-medium">{member.profiles?.full_name || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">{member.profiles?.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Requested: {new Date(member.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => approveMember.mutate(member.id)}
                        disabled={approveMember.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rejectMember.mutate(member.id)}
                        disabled={rejectMember.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingMembers?.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No pending member requests
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Contributions Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">KES {contributions?.summary?.totalAmount?.toLocaleString() || '0'}</p>
                  <p className="text-sm text-muted-foreground">Total This Month</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{contributions?.summary?.contributorsCount || 0}</p>
                  <p className="text-sm text-muted-foreground">Contributors</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">KES {contributions?.summary?.averageContribution?.toLocaleString() || '0'}</p>
                  <p className="text-sm text-muted-foreground">Average</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {activities?.map((activity: any) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 border rounded">
                      <Activity className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.created_at).toLocaleDateString()} at{' '}
                          {new Date(activity.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge variant="outline">{activity.activity_type}</Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;