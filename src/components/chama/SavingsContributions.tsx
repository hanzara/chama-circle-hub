
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { DollarSign, Calendar, TrendingUp, Users, CreditCard, Smartphone, Building2, Clock, CheckCircle, AlertCircle, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { useMpesaIntegration } from '@/hooks/useMpesaIntegration';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface SavingsContributionsProps {
  chamaData: any;
}

const SavingsContributions: React.FC<SavingsContributionsProps> = ({ chamaData }) => {
  const [contributionAmount, setContributionAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('mpesa');
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const { stkPushMutation, isProcessingPayment } = useMpesaIntegration();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock data
  const contributionHistory = [
    { month: 'Jan', amount: 12000, target: 15000 },
    { month: 'Feb', amount: 15000, target: 15000 },
    { month: 'Mar', amount: 13500, target: 15000 },
    { month: 'Apr', amount: 15000, target: 15000 },
    { month: 'May', amount: 14200, target: 15000 },
    { month: 'Jun', amount: 16000, target: 15000 }
  ];

  const memberContributions = [
    { name: 'John Doe', amount: 15000, status: 'paid', date: '2024-01-05', method: 'M-Pesa' },
    { name: 'Jane Smith', amount: 15000, status: 'paid', date: '2024-01-03', method: 'Bank Transfer' },
    { name: 'Michael Brown', amount: 0, status: 'pending', date: null, method: null },
    { name: 'Sarah Wilson', amount: 15000, status: 'paid', date: '2024-01-02', method: 'M-Pesa' },
    { name: 'David Johnson', amount: 7500, status: 'partial', date: '2024-01-04', method: 'Cash' }
  ];

  const savingsGoals = [
    { name: 'Emergency Fund', target: 500000, current: 425000, deadline: '2024-06-30' },
    { name: 'Investment Capital', target: 1000000, current: 680000, deadline: '2024-12-31' },
    { name: 'Group Insurance', target: 200000, current: 156000, deadline: '2024-09-15' }
  ];

  const upcomingContributions = [
    { member: 'Michael Brown', amount: 15000, dueDate: '2024-01-15', daysLeft: 3 },
    { member: 'All Members', amount: 15000, dueDate: '2024-02-01', daysLeft: 19 }
  ];

  // Chama contribution mutation
  const chamaContributionMutation = useMutation({
    mutationFn: async ({ amount, description, phoneNumber }: { 
      amount: number; 
      description?: string;
      phoneNumber: string;
    }) => {
      console.log('Making chama contribution:', { amount, description, phoneNumber });

      // First initiate M-Pesa payment
      const mpesaResult = await stkPushMutation.mutateAsync({
        phoneNumber,
        amount,
        description: description || `Contribution to ${chamaData.name}`,
        purpose: 'contribution',
        chamaId: chamaData.id
      });

      if (mpesaResult.ResponseCode === '0') {
        // Record the contribution in the chama system
        const { data, error } = await (supabase as any).rpc('make_chama_contribution', {
          p_chama_id: chamaData.id,
          p_amount: amount,
          p_payment_method: 'mpesa',
          p_payment_reference: mpesaResult.CheckoutRequestID,
          p_notes: description || 'Member contribution via M-Pesa'
        });

        if (error) {
          console.error('Error recording chama contribution:', error);
          throw error;
        }

        // The contribution will automatically be added to the central wallet
        // via the make_chama_contribution function
        return data;
      } else {
        throw new Error(mpesaResult.ResponseDescription || 'Payment initiation failed');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chama-data'] });
      queryClient.invalidateQueries({ queryKey: ['admin-wallet-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-activities'] });
      toast({
        title: "Contribution Successful! 🎉",
        description: "Your contribution has been added to the chama's central wallet",
      });
    },
    onError: (error: any) => {
      console.error('Contribution failed:', error);
      toast({
        title: "Contribution Failed",
        description: error.message || "Failed to process contribution",
        variant: "destructive",
      });
    },
  });

  const handleContribution = async () => {
    if (!contributionAmount || !phoneNumber) {
      toast({
        title: "Missing Information",
        description: "Please enter both amount and phone number",
        variant: "destructive",
      });
      return;
    }

    try {
      await chamaContributionMutation.mutateAsync({
        phoneNumber,
        amount: parseFloat(contributionAmount),
        description: `Monthly contribution to ${chamaData.name}`
      });
      
      setContributionAmount('');
      setPhoneNumber('');
    } catch (error) {
      console.error('Contribution failed:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'pending':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Partial</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Savings & Contributions</h2>
        <p className="text-muted-foreground">Manage your chama contributions and track savings progress</p>
      </div>

      <Tabs defaultValue="contribute" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="contribute">Make Contribution</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="members">Member Status</TabsTrigger>
          <TabsTrigger value="goals">Savings Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="contribute" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Quick Contribution
                </CardTitle>
                <CardDescription>
                  Contribute directly to the chama's central wallet
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Wallet className="h-4 w-4" />
                    <span className="text-sm font-medium">Central Wallet Balance</span>
                  </div>
                  <p className="text-lg font-bold text-blue-900">
                    <CurrencyDisplay amount={chamaData.totalSavings || 0} />
                  </p>
                  <p className="text-xs text-blue-600">
                    All contributions are automatically added here
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Contribution Amount</label>
                  <Input
                    type="number"
                    placeholder="Enter amount (KES)"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={selectedMethod === 'mpesa' ? 'default' : 'outline'}
                      onClick={() => setSelectedMethod('mpesa')}
                      className="flex flex-col items-center h-16"
                    >
                      <Smartphone className="h-4 w-4" />
                      <span className="text-xs">M-Pesa</span>
                    </Button>
                    <Button
                      variant={selectedMethod === 'bank' ? 'default' : 'outline'}
                      onClick={() => setSelectedMethod('bank')}
                      className="flex flex-col items-center h-16"
                      disabled
                    >
                      <Building2 className="h-4 w-4" />
                      <span className="text-xs">Bank</span>
                    </Button>
                    <Button
                      variant={selectedMethod === 'card' ? 'default' : 'outline'}
                      onClick={() => setSelectedMethod('card')}
                      className="flex flex-col items-center h-16"
                      disabled
                    >
                      <CreditCard className="h-4 w-4" />
                      <span className="text-xs">Card</span>
                    </Button>
                  </div>
                </div>

                {selectedMethod === 'mpesa' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">M-Pesa Phone Number</label>
                    <Input
                      placeholder="254712345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                )}

                <Button 
                  onClick={handleContribution} 
                  className="w-full"
                  disabled={chamaContributionMutation.isPending || isProcessingPayment}
                >
                  {chamaContributionMutation.isPending || isProcessingPayment ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Contribute to Central Wallet
                    </>
                  )}
                </Button>

                <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium mb-1">How it works:</p>
                  <p>1. Enter your contribution amount</p>
                  <p>2. Complete M-Pesa payment on your phone</p>
                  <p>3. Funds are automatically added to the central wallet</p>
                  <p>4. Admin can then manage disbursements</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Contribution Summary</CardTitle>
                <CardDescription>Your contribution status this month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Monthly Target:</span>
                  <span className="font-bold"><CurrencyDisplay amount={15000} /></span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Contributed:</span>
                  <span className="font-bold text-green-600"><CurrencyDisplay amount={15000} /></span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Status:</span>
                  <Badge className="bg-green-100 text-green-800">Complete</Badge>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Central Wallet Impact
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Your total contributions:</span>
                      <span className="font-medium"><CurrencyDisplay amount={125000} /></span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">% of central wallet:</span>
                      <span className="font-medium">5.2%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Central Wallet Overview</CardTitle>
              <CardDescription>How the chama's funds are managed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">
                    <CurrencyDisplay amount={chamaData.totalSavings || 0} />
                  </div>
                  <p className="text-sm text-green-600">Total Wallet Balance</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">
                    <CurrencyDisplay amount={260000} />
                  </div>
                  <p className="text-sm text-blue-600">This Month's Contributions</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-700">
                    <CurrencyDisplay amount={107000} />
                  </div>
                  <p className="text-sm text-orange-600">This Month's Disbursements</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Contribution Trends</CardTitle>
              <CardDescription>Your monthly contribution pattern</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={contributionHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`KES ${value.toLocaleString()}`, 'Amount']} />
                  <Bar dataKey="amount" fill="#3b82f6" />
                  <Bar dataKey="target" fill="#e5e7eb" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Recent Contributions</CardTitle>
              <CardDescription>Your last 6 months of contributions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contributionHistory.reverse().map((contribution, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{contribution.month} 2024 Contribution</p>
                        <p className="text-sm text-muted-foreground">Monthly contribution</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold"><CurrencyDisplay amount={contribution.amount} /></p>
                      <p className="text-sm text-muted-foreground">
                        {contribution.amount >= contribution.target ? 'Complete' : 'Partial'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Member Contribution Status</CardTitle>
              <CardDescription>Track all member contributions for this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {memberContributions.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.date ? `Paid on ${member.date}` : 'Not paid yet'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-bold">
                          <CurrencyDisplay amount={member.amount} />
                        </p>
                        <p className="text-sm text-muted-foreground">{member.method}</p>
                      </div>
                      {getStatusBadge(member.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Savings Goals</CardTitle>
              <CardDescription>Track progress towards your collective financial objectives</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {savingsGoals.map((goal, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{goal.name}</h4>
                      <span className="text-sm text-muted-foreground">Due: {goal.deadline}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>
                          <CurrencyDisplay amount={goal.current} /> / <CurrencyDisplay amount={goal.target} />
                        </span>
                      </div>
                      <Progress value={(goal.current / goal.target) * 100} className="h-3" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{Math.round((goal.current / goal.target) * 100)}% complete</span>
                        <span>
                          <CurrencyDisplay amount={goal.target - goal.current} /> remaining
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t">
                <Button className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Create New Savings Goal
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SavingsContributions;
