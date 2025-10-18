
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Wallet, Zap, Bell, Calendar, TrendingUp, Award, Target, 
  CreditCard, Smartphone, DollarSign, Settings, CheckCircle,
  AlertTriangle, Clock, Gamepad2, Star, Trophy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import SubAccountManager from '@/components/SubAccountManager';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const SmartWalletPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [autoRepayEnabled, setAutoRepayEnabled] = useState(true);
  const [savingsStreakActive, setSavingsStreakActive] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);

  // Mock data
  const expenseData = [
    { category: 'Food & Dining', amount: 12500, percentage: 35, color: '#ef4444' },
    { category: 'Transportation', amount: 8500, percentage: 24, color: '#3b82f6' },
    { category: 'Utilities', amount: 6000, percentage: 17, color: '#22c55e' },
    { category: 'Entertainment', amount: 4500, percentage: 13, color: '#f59e0b' },
    { category: 'Shopping', amount: 3900, percentage: 11, color: '#8b5cf6' },
  ];

  const monthlyTrends = [
    { month: 'Jan', income: 45000, expenses: 32000, savings: 13000 },
    { month: 'Feb', income: 48000, expenses: 35000, savings: 13000 },
    { month: 'Mar', income: 47000, expenses: 33000, savings: 14000 },
    { month: 'Apr', income: 50000, expenses: 36000, savings: 14000 },
    { month: 'May', income: 52000, expenses: 38000, savings: 14000 },
    { month: 'Jun', income: 49000, expenses: 34000, savings: 15000 },
  ];

  const gamificationData = {
    currentStreak: 23,
    totalPoints: 1847,
    level: 'Gold Saver',
    nextLevelPoints: 2000,
    badges: [
      { name: 'Early Bird', description: '30 consecutive on-time payments', earned: true },
      { name: 'Streak Master', description: '60-day savings streak', earned: true },
      { name: 'Budget Boss', description: 'Under budget for 3 months', earned: true },
      { name: 'Debt Crusher', description: 'Pay off loan early', earned: false },
      { name: 'Investment Pioneer', description: 'First investment made', earned: false },
    ]
  };

  const upcomingPayments = [
    { name: 'Business Loan', amount: 8500, date: '2024-03-15', status: 'scheduled', type: 'loan' },
    { name: 'Chama Contribution', amount: 5000, date: '2024-03-18', status: 'pending', type: 'contribution' },
    { name: 'Personal Loan', amount: 3200, date: '2024-03-22', status: 'scheduled', type: 'loan' },
  ];

  const handleOptimizePayment = () => {
    toast({
      title: "Payment Optimized",
      description: "Auto-debit scheduled for optimal timing based on your income pattern",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                <Wallet className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Smart Wallet
                </h1>
                <p className="text-muted-foreground text-lg">
                  Intelligent payment management and automated financial habits
                </p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="payments">Smart Payments</TabsTrigger>
              <TabsTrigger value="sub-accounts">Sub-Accounts</TabsTrigger>
              <TabsTrigger value="gamification">Rewards Hub</TabsTrigger>
              <TabsTrigger value="analytics">AI Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <div className="grid gap-6">
                {/* Balance Overview */}
                <div className="grid md:grid-cols-4 gap-6">
                  <Card className="relative overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Available Balance</p>
                          <p className="text-3xl font-bold">KES 24,500</p>
                          <p className="text-xs text-green-600 flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +12% this month
                          </p>
                        </div>
                        <Wallet className="h-8 w-8 text-blue-500" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent" />
                    </CardContent>
                  </Card>

                  <Card className="relative overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Monthly Savings</p>
                          <p className="text-3xl font-bold text-green-600">KES 15,000</p>
                          <p className="text-xs text-green-600">Goal: KES 18,000</p>
                        </div>
                        <Target className="h-8 w-8 text-green-500" />
                      </div>
                      <Progress value={83} className="mt-2" />
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent" />
                    </CardContent>
                  </Card>

                  <Card className="relative overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Reward Points</p>
                          <p className="text-3xl font-bold text-purple-600">{gamificationData.totalPoints}</p>
                          <p className="text-xs text-purple-600">{gamificationData.level}</p>
                        </div>
                        <Award className="h-8 w-8 text-purple-500" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent" />
                    </CardContent>
                  </Card>

                  <Card className="relative overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Payment Streak</p>
                          <p className="text-3xl font-bold text-orange-600">{gamificationData.currentStreak}</p>
                          <p className="text-xs text-orange-600">days on time</p>
                        </div>
                        <Clock className="h-8 w-8 text-orange-500" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent" />
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Smart Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Button className="h-20 flex-col gap-2" variant="outline">
                        <CreditCard className="h-6 w-6" />
                        <span>Quick Payment</span>
                      </Button>
                      <Button className="h-20 flex-col gap-2" variant="outline">
                        <Smartphone className="h-6 w-6" />
                        <span>M-Pesa Sync</span>
                      </Button>
                      <Button className="h-20 flex-col gap-2" variant="outline">
                        <Target className="h-6 w-6" />
                        <span>Set Goal</span>
                      </Button>
                      <Button className="h-20 flex-col gap-2" variant="outline">
                        <Settings className="h-6 w-6" />
                        <span>Auto Settings</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Monthly Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Flow</CardTitle>
                    <CardDescription>Monthly income, expenses, and savings trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyTrends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Area type="monotone" dataKey="income" stackId="1" stroke="#22c55e" fill="#22c55e" opacity={0.6} />
                          <Area type="monotone" dataKey="expenses" stackId="2" stroke="#ef4444" fill="#ef4444" opacity={0.6} />
                          <Area type="monotone" dataKey="savings" stackId="3" stroke="#3b82f6" fill="#3b82f6" opacity={0.8} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="payments">
              <div className="grid gap-6">
                {/* Auto-Payment Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Predictive Payment Management
                    </CardTitle>
                    <CardDescription>
                      AI-optimized payment scheduling based on your income patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Auto-Repayment Optimization</h4>
                        <p className="text-sm text-muted-foreground">Automatically schedule payments when funds are available</p>
                      </div>
                      <Switch checked={autoRepayEnabled} onCheckedChange={setAutoRepayEnabled} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Smart Budget Alerts</h4>
                        <p className="text-sm text-muted-foreground">Get notified before approaching spending limits</p>
                      </div>
                      <Switch checked={budgetAlerts} onCheckedChange={setBudgetAlerts} />
                    </div>

                    <Alert>
                      <Bell className="h-4 w-4" />
                      <AlertDescription>
                        AI detected optimal payment time: <strong>March 15th at 2:00 PM</strong> - Right after salary credit
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                {/* Upcoming Payments */}
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Payments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingPayments.map((payment, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              payment.type === 'loan' ? 'bg-blue-100' : 'bg-green-100'
                            }`}>
                              <CreditCard className={`h-4 w-4 ${
                                payment.type === 'loan' ? 'text-blue-600' : 'text-green-600'
                              }`} />
                            </div>
                            <div>
                              <h4 className="font-medium">{payment.name}</h4>
                              <p className="text-sm text-muted-foreground">Due: {payment.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-medium">KES {payment.amount.toLocaleString()}</p>
                              <Badge variant={payment.status === 'scheduled' ? 'default' : 'secondary'}>
                                {payment.status}
                              </Badge>
                            </div>
                            <Button size="sm" variant="outline" onClick={handleOptimizePayment}>
                              Optimize
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Multi-Source Repayment */}
                <Card>
                  <CardHeader>
                    <CardTitle>Multi-Source Payment Setup</CardTitle>
                    <CardDescription>Consolidate funds from multiple accounts for payments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        <Card className="p-4">
                          <div className="flex items-center gap-3">
                            <Smartphone className="h-8 w-8 text-green-600" />
                            <div>
                              <h4 className="font-medium">M-Pesa</h4>
                              <p className="text-sm text-muted-foreground">Balance: KES 12,500</p>
                            </div>
                          </div>
                          <Button size="sm" className="w-full mt-3" variant="outline">
                            Link Account
                          </Button>
                        </Card>

                        <Card className="p-4">
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-8 w-8 text-blue-600" />
                            <div>
                              <h4 className="font-medium">KCB Bank</h4>
                              <p className="text-sm text-muted-foreground">Balance: KES 45,200</p>
                            </div>
                          </div>
                          <Button size="sm" className="w-full mt-3" variant="outline">
                            Connected
                          </Button>
                        </Card>

                        <Card className="p-4">
                          <div className="flex items-center gap-3">
                            <Wallet className="h-8 w-8 text-purple-600" />
                            <div>
                              <h4 className="font-medium">Equity Bank</h4>
                              <p className="text-sm text-muted-foreground">Balance: KES 8,900</p>
                            </div>
                          </div>
                          <Button size="sm" className="w-full mt-3" variant="outline">
                            Link Account
                          </Button>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sub-accounts">
              <SubAccountManager />
            </TabsContent>

            <TabsContent value="gamification">
              <div className="grid gap-6">
                {/* Achievement Overview */}
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="text-center">
                    <CardContent className="p-6">
                      <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold">{gamificationData.level}</h3>
                      <p className="text-muted-foreground">Current Level</p>
                      <div className="mt-4">
                        <Progress value={(gamificationData.totalPoints / gamificationData.nextLevelPoints) * 100} />
                        <p className="text-xs text-muted-foreground mt-2">
                          {gamificationData.nextLevelPoints - gamificationData.totalPoints} points to Platinum
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="text-center">
                    <CardContent className="p-6">
                      <Star className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold">{gamificationData.totalPoints}</h3>
                      <p className="text-muted-foreground">Total Points</p>
                      <div className="mt-4 space-y-2">
                        <Button size="sm" className="w-full">
                          Redeem Airtime
                        </Button>
                        <Button size="sm" variant="outline" className="w-full">
                          View Rewards
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="text-center">
                    <CardContent className="p-6">
                      <Gamepad2 className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold">{gamificationData.currentStreak}</h3>
                      <p className="text-muted-foreground">Day Streak</p>
                      <div className="mt-4">
                        <Badge className="w-full py-2">
                          Streak Bonus: +50 pts daily
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Badges & Achievements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Badges & Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {gamificationData.badges.map((badge, index) => (
                        <Card key={index} className={`p-4 ${badge.earned ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${
                              badge.earned ? 'bg-green-100' : 'bg-gray-100'
                            }`}>
                              {badge.earned ? (
                                <CheckCircle className="h-6 w-6 text-green-600" />
                              ) : (
                                <Clock className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <h4 className={`font-medium ${badge.earned ? 'text-green-900' : 'text-gray-500'}`}>
                                {badge.name}
                              </h4>
                              <p className={`text-xs ${badge.earned ? 'text-green-700' : 'text-gray-400'}`}>
                                {badge.description}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Financial Literacy Challenges */}
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Literacy Challenges</CardTitle>
                    <CardDescription>Complete challenges to earn points and improve your financial knowledge</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Budgeting Basics Quiz</h4>
                          <p className="text-sm text-muted-foreground">Learn effective budgeting strategies</p>
                          <Badge variant="outline" className="mt-1">+100 points</Badge>
                        </div>
                        <Button>Start Challenge</Button>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Investment Fundamentals</h4>
                          <p className="text-sm text-muted-foreground">Understanding basic investment principles</p>
                          <Badge variant="outline" className="mt-1">+150 points</Badge>
                        </div>
                        <Button>Start Challenge</Button>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                        <div>
                          <h4 className="font-medium text-green-900">Debt Management Mastery</h4>
                          <p className="text-sm text-green-700">Strategies for managing and reducing debt</p>
                          <Badge className="bg-green-100 text-green-800 mt-1">Completed +200 points</Badge>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid gap-6">
                {/* Expense Breakdown */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Expense Categorization</CardTitle>
                      <CardDescription>Automatic transaction categorization and insights</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={expenseData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={120}
                              dataKey="amount"
                            >
                              {expenseData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Spending Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {expenseData.map((expense, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{expense.category}</span>
                              <span className="text-sm">KES {expense.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress value={expense.percentage} className="flex-1" />
                              <span className="text-xs text-muted-foreground">{expense.percentage}%</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">AI Recommendations</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Consider reducing dining expenses by 15% to boost savings</li>
                          <li>• Transport costs are above average - explore carpooling options</li>
                          <li>• Great job keeping utilities under control!</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Smart Alerts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Smart Budget Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Alert className="border-yellow-200 bg-yellow-50">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Budget Alert:</strong> You're approaching 80% of your monthly dining budget (KES 10,000 spent of KES 12,500)
                        </AlertDescription>
                      </Alert>

                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Savings Win:</strong> You're 20% ahead of your monthly savings goal! Consider increasing your target.
                        </AlertDescription>
                      </Alert>

                      <Alert className="border-blue-200 bg-blue-50">
                        <TrendingUp className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Trend Alert:</strong> Your transportation costs have increased by 25% this month. Review recent trips.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default SmartWalletPage;
