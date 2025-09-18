
// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  PiggyBank, Target, Calendar, DollarSign, TrendingUp, 
  HandCoins, Users, Clock, AlertCircle, Plus, Minus,
  ArrowUpRight, ArrowDownRight, Wallet, Send, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { usePersonalSavings } from '@/hooks/usePersonalSavings';
import PeerLendingContent from '@/components/PeerLendingContent';

const PersonalSavingsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    walletData, 
    savingsGoals, 
    isLoading, 
    addSavings, 
    getSavingsBreakdown, 
    getSavingsData 
  } = usePersonalSavings();
  
  const [savingAmount, setSavingAmount] = useState('');
  const [savingFrequency, setSavingFrequency] = useState('daily');
  const [savingGoal, setSavingGoal] = useState('');
  const [lendAmount, setLendAmount] = useState('');
  const [borrowerDetails, setBorrowerDetails] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Mock data for lending (keeping this as mock for now)
  const lendingHistory = [
    { id: 1, borrower: 'John Doe', amount: 5000, status: 'active', dueDate: '2024-02-15', interest: 10 },
    { id: 2, borrower: 'Jane Smith', amount: 8000, status: 'completed', dueDate: '2024-01-20', interest: 12 },
    { id: 3, borrower: 'Mike Johnson', amount: 3000, status: 'overdue', dueDate: '2024-01-30', interest: 15 },
  ];

  // Get real data from hook
  const savingsData = getSavingsData();
  const savingsBreakdown = getSavingsBreakdown();

  const handleSave = async () => {
    if (!savingAmount || parseFloat(savingAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount to save",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      await addSavings(
        parseFloat(savingAmount),
        savingGoal || undefined,
        savingFrequency as 'daily' | 'weekly' | 'monthly' | 'one_time'
      );
      
      // Clear form on success
      setSavingAmount('');
      setSavingGoal('');
    } catch (error) {
      // Error is already handled in the hook
    } finally {
      setIsSaving(false);
    }
  };

  const handleLend = () => {
    if (!lendAmount || !borrowerDetails) {
      toast({
        title: "Error",
        description: "Please fill in all lending details",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Loan Offer Sent",
      description: `Loan offer of KES ${lendAmount} sent to ${borrowerDetails}`,
    });
    setLendAmount('');
    setBorrowerDetails('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                <PiggyBank className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Personal Savings
                </h1>
                <p className="text-muted-foreground text-lg">
                  Build your wealth through consistent saving and smart lending
                </p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="savings" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="savings">My Savings</TabsTrigger>
              <TabsTrigger value="lending">Peer Lending</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="savings">
              <div className="grid gap-6">
                {/* Wallet Overview */}
                <div className="grid md:grid-cols-4 gap-6">
                  <Card className="relative overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Wallet Balance</p>
                          <CurrencyDisplay amount={walletData.balance} className="text-3xl font-bold" showToggle={false} />
                          <p className="text-xs text-green-600 flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Available for savings
                          </p>
                        </div>
                        <Wallet className="h-8 w-8 text-green-500" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent" />
                    </CardContent>
                  </Card>

                  <Card className="relative overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Savings</p>
                          <CurrencyDisplay amount={walletData.totalSavings} className="text-3xl font-bold text-blue-600" showToggle={false} />
                          <p className="text-xs text-blue-600">Across all goals</p>
                        </div>
                        <Target className="h-8 w-8 text-blue-500" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent" />
                    </CardContent>
                  </Card>

                  <Card className="relative overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Monthly Progress</p>
                          <CurrencyDisplay amount={savingsData[savingsData.length - 1]?.amount || 0} className="text-3xl font-bold text-purple-600" showToggle={false} />
                          <p className="text-xs text-purple-600">Goal: KES {walletData.monthlyTarget.toLocaleString()}</p>
                        </div>
                        <Calendar className="h-8 w-8 text-purple-500" />
                      </div>
                      <Progress value={(savingsData[savingsData.length - 1]?.amount || 0) / walletData.monthlyTarget * 100} className="mt-2" />
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent" />
                    </CardContent>
                  </Card>

                  <Card className="relative overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Saving Streak</p>
                          <p className="text-3xl font-bold text-orange-600">{walletData.currentStreak}</p>
                          <p className="text-xs text-orange-600">days in a row</p>
                        </div>
                        <Clock className="h-8 w-8 text-orange-500" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent" />
                    </CardContent>
                  </Card>
                </div>

                {/* Savings Actions */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Add to Savings
                      </CardTitle>
                      <CardDescription>Save money daily or monthly to reach your goals</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount to Save</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="Enter amount"
                          value={savingAmount}
                          onChange={(e) => setSavingAmount(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Saving Frequency</Label>
                        <div className="flex gap-2">
                          <Button
                            variant={savingFrequency === 'daily' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSavingFrequency('daily')}
                          >
                            Daily
                          </Button>
                          <Button
                            variant={savingFrequency === 'weekly' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSavingFrequency('weekly')}
                          >
                            Weekly
                          </Button>
                          <Button
                            variant={savingFrequency === 'monthly' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSavingFrequency('monthly')}
                          >
                            Monthly
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="goal">Savings Goal (Optional)</Label>
                        <Input
                          id="goal"
                          placeholder="e.g., Emergency Fund, Vacation"
                          value={savingGoal}
                          onChange={(e) => setSavingGoal(e.target.value)}
                        />
                      </div>

                      <Button onClick={handleSave} className="w-full" disabled={isSaving}>
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <PiggyBank className="h-4 w-4 mr-2" />
                        )}
                        {isSaving ? 'Saving...' : 'Save Money'}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Savings Goals Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="h-64 w-full flex items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      ) : savingsBreakdown.length > 0 ? (
                        <>
                          <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={savingsBreakdown}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={40}
                                  outerRadius={80}
                                  dataKey="value"
                                >
                                  {savingsBreakdown.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="mt-4 space-y-2">
                            {savingsBreakdown.map((item, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                  <span className="text-sm">{item.name}</span>
                                </div>
                                <CurrencyDisplay amount={item.value} className="text-sm font-medium" showToggle={false} />
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="h-64 w-full flex flex-col items-center justify-center text-muted-foreground">
                          <PiggyBank className="h-12 w-12 mb-4" />
                          <p className="text-center">No savings goals yet</p>
                          <p className="text-sm text-center">Create your first savings goal to see the breakdown</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="lending">
              <PeerLendingContent />
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid gap-6">
                {/* Savings Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle>Savings Performance</CardTitle>
                    <CardDescription>Track your monthly savings vs targets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={savingsData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="amount" fill="#22c55e" name="Saved" />
                          <Bar dataKey="target" fill="#94a3b8" name="Target" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Financial Insights */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Savings Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Alert>
                          <TrendingUp className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Great job!</strong> You're saving 15% more than last month. Keep up the momentum!
                          </AlertDescription>
                        </Alert>
                        <Alert>
                          <Target className="h-4 w-4" />
                          <AlertDescription>
                            You're 87% towards your monthly goal. Just KES 2,000 more to reach your target!
                          </AlertDescription>
                        </Alert>
                        <Alert>
                          <Calendar className="h-4 w-4" />
                          <AlertDescription>
                            Your {walletData.currentStreak}-day saving streak is impressive! Daily consistency pays off.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Lending Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Repayment Rate</span>
                          <span className="font-medium">85%</span>
                        </div>
                        <Progress value={85} />
                        
                        <div className="flex justify-between items-center">
                          <span>Average Interest</span>
                          <span className="font-medium">12.5%</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span>Total Borrowers</span>
                          <span className="font-medium">5</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default PersonalSavingsPage;
