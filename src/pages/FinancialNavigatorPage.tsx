
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, TrendingUp, Shield, Target, AlertTriangle, CheckCircle, 
  ArrowUp, ArrowDown, DollarSign, PiggyBank, CreditCard, Lightbulb,
  Zap, Calendar, Users, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

const FinancialNavigatorPage = () => {
  const navigate = useNavigate();
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

  // Mock data for demonstrations
  const cashFlowData = [
    { date: 'Week 1', income: 15000, expenses: 12000, predicted: 14500 },
    { date: 'Week 2', income: 18000, expenses: 13500, predicted: 16200 },
    { date: 'Week 3', income: 16500, expenses: 14000, predicted: 15800 },
    { date: 'Week 4', income: 19000, expenses: 12500, predicted: 17400 },
  ];

  const healthScoreBreakdown = [
    { category: 'Payment History', score: 92, weight: 35, color: '#22c55e' },
    { category: 'Savings Behavior', score: 78, weight: 25, color: '#3b82f6' },
    { category: 'Financial Literacy', score: 85, weight: 20, color: '#8b5cf6' },
    { category: 'Income Stability', score: 88, weight: 20, color: '#f59e0b' },
  ];

  const opportunities = [
    {
      type: 'savings',
      title: 'High-Yield Savings Account',
      description: 'Switch to a savings account with 8.5% interest rate',
      potential: 'KES 2,400 extra per year',
      risk: 'low',
      urgency: 'medium'
    },
    {
      type: 'debt',
      title: 'Debt Consolidation',
      description: 'Combine 3 small loans into one at lower interest',
      potential: 'Save KES 450 per month',
      risk: 'low',
      urgency: 'high'
    },
    {
      type: 'investment',
      title: 'Treasury Bills Investment',
      description: 'Invest excess funds in 91-day T-Bills',
      potential: 'KES 1,200 monthly returns',
      risk: 'low',
      urgency: 'low'
    },
    {
      type: 'expense',
      title: 'Subscription Optimization',
      description: 'Cancel 2 unused subscriptions detected',
      potential: 'Save KES 800 monthly',
      risk: 'none',
      urgency: 'high'
    }
  ];

  const marketInsights = [
    {
      title: 'Inflation Alert',
      description: 'Food prices expected to rise 3.2% this month',
      impact: 'Budget +KES 960 for groceries',
      action: 'Consider bulk purchasing essentials'
    },
    {
      title: 'Exchange Rate Opportunity',
      description: 'USD-KES rate favorable for forex savings',
      impact: 'Potential 2.5% gain on USD holdings',
      action: 'Convert excess KES to USD'
    }
  ];

  const overallHealthScore = healthScoreBreakdown.reduce((acc, item) => 
    acc + (item.score * item.weight / 100), 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Financial Navigator
                </h1>
                <p className="text-muted-foreground text-lg">
                  Your intelligent financial companion powered by advanced AI
                </p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
              <TabsTrigger value="health">Health Score</TabsTrigger>
              <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <div className="grid gap-6">
                {/* Key Metrics Overview */}
                <div className="grid md:grid-cols-4 gap-6">
                  <Card className="relative overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Financial Health</p>
                          <p className="text-3xl font-bold text-green-600">{Math.round(overallHealthScore)}</p>
                          <p className="text-xs text-green-600 flex items-center mt-1">
                            <ArrowUp className="h-3 w-3 mr-1" />
                            +5 this month
                          </p>
                        </div>
                        <Shield className="h-8 w-8 text-green-500" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent" />
                    </CardContent>
                  </Card>

                  <Card className="relative overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Predicted Surplus</p>
                          <p className="text-3xl font-bold text-blue-600">KES 4,200</p>
                          <p className="text-xs text-blue-600">Next 30 days</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-blue-500" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent" />
                    </CardContent>
                  </Card>

                  <Card className="relative overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Savings Rate</p>
                          <p className="text-3xl font-bold text-purple-600">18%</p>
                          <p className="text-xs text-purple-600 flex items-center mt-1">
                            <ArrowUp className="h-3 w-3 mr-1" />
                            Above average
                          </p>
                        </div>
                        <PiggyBank className="h-8 w-8 text-purple-500" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent" />
                    </CardContent>
                  </Card>

                  <Card className="relative overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Credit Utilization</p>
                          <p className="text-3xl font-bold text-orange-600">23%</p>
                          <p className="text-xs text-green-600 flex items-center mt-1">
                            <ArrowDown className="h-3 w-3 mr-1" />
                            Improving
                          </p>
                        </div>
                        <CreditCard className="h-8 w-8 text-orange-500" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent" />
                    </CardContent>
                  </Card>
                </div>

                {/* AI Insights Alert */}
                <Alert className="border-blue-200 bg-blue-50">
                  <Zap className="h-4 w-4" />
                  <AlertDescription>
                    <strong>AI Insight:</strong> Your spending pattern suggests you could save KES 3,200 monthly by optimizing 
                    recurring expenses. <Button variant="link" className="p-0 h-auto">View recommendations</Button>
                  </AlertDescription>
                </Alert>

                {/* Recent Opportunities */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Top Opportunities This Week
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {opportunities.slice(0, 3).map((opportunity, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex-1">
                            <h4 className="font-medium">{opportunity.title}</h4>
                            <p className="text-sm text-muted-foreground">{opportunity.description}</p>
                            <p className="text-sm font-medium text-green-600 mt-1">{opportunity.potential}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={opportunity.urgency === 'high' ? 'destructive' : 'secondary'}>
                              {opportunity.urgency}
                            </Badge>
                            <Button size="sm" variant="outline">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="cashflow">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Predictive Cash Flow Analysis</CardTitle>
                    <CardDescription>
                      AI-powered predictions based on your transaction history and income patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={cashFlowData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Area type="monotone" dataKey="income" stackId="1" stroke="#22c55e" fill="#22c55e" opacity={0.6} />
                          <Area type="monotone" dataKey="expenses" stackId="2" stroke="#ef4444" fill="#ef4444" opacity={0.6} />
                          <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={3} strokeDasharray="5 5" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        Cash Flow Alerts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Potential shortfall of KES 2,100 expected on March 15th due to school fees payment
                          </AlertDescription>
                        </Alert>
                        <Alert className="border-green-200 bg-green-50">
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            Salary boost detected! KES 5,000 bonus expected March 20th
                          </AlertDescription>
                        </Alert>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Smart Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
                          <h4 className="font-medium text-blue-900">Micro-loan Suggestion</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Consider a KES 3,000 bridge loan at 2.1% interest to cover the March 15th gap
                          </p>
                        </div>
                        <div className="p-3 border-l-4 border-green-500 bg-green-50">
                          <h4 className="font-medium text-green-900">Savings Opportunity</h4>
                          <p className="text-sm text-green-700 mt-1">
                            Redirect KES 2,000 from your March bonus to emergency fund
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="health">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Financial Health Score: {Math.round(overallHealthScore)}
                    </CardTitle>
                    <CardDescription>
                      Comprehensive assessment beyond traditional credit scores
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {healthScoreBreakdown.map((item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{item.category}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Weight: {item.weight}%</span>
                              <Badge variant="outline" style={{ color: item.color }}>
                                {item.score}/100
                              </Badge>
                            </div>
                          </div>
                          <Progress value={item.score} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Score Improvement Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium">Complete Financial Literacy Module</h4>
                            <p className="text-sm text-muted-foreground">+3 points to overall score</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Target className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium">Increase Savings Rate to 20%</h4>
                            <p className="text-sm text-muted-foreground">+5 points to Savings Behavior</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Calendar className="h-5 w-5 text-purple-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium">Maintain 6-month Payment Streak</h4>
                            <p className="text-sm text-muted-foreground">+8 points to Payment History</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Score Benefits</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-3 border rounded-lg">
                          <h4 className="font-medium text-green-600">Current Tier: Gold</h4>
                          <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                            <li>• Interest rates from 8.5%</li>
                            <li>• Credit limit up to KES 150,000</li>
                            <li>• Priority customer support</li>
                          </ul>
                        </div>
                        <div className="p-3 border-2 border-dashed border-blue-300 rounded-lg">
                          <h4 className="font-medium text-blue-600">Next Tier: Platinum (Score 90+)</h4>
                          <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                            <li>• Interest rates from 6.5%</li>
                            <li>• Credit limit up to KES 300,000</li>
                            <li>• Personal relationship manager</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="opportunities">
              <div className="grid gap-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {opportunities.map((opportunity, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                          <Badge variant={
                            opportunity.urgency === 'high' ? 'destructive' : 
                            opportunity.urgency === 'medium' ? 'default' : 'secondary'
                          }>
                            {opportunity.urgency}
                          </Badge>
                        </div>
                        <CardDescription>{opportunity.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Potential Benefit</span>
                            <span className="font-medium text-green-600">{opportunity.potential}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Risk Level</span>
                            <Badge variant="outline">{opportunity.risk}</Badge>
                          </div>
                          <Button className="w-full">
                            Take Action
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Market Insights
                    </CardTitle>
                    <CardDescription>
                      Localized economic trends affecting your finances
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {marketInsights.map((insight, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <h4 className="font-medium">{insight.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-sm font-medium text-orange-600">{insight.impact}</span>
                            <span className="text-sm text-blue-600">{insight.action}</span>
                          </div>
                        </div>
                      ))}
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

export default FinancialNavigatorPage;
