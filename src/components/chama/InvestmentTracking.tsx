
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, DollarSign, Target, PieChart, BarChart3, ArrowUpRight, ArrowDownRight, Plus, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { useToast } from '@/hooks/use-toast';

interface InvestmentTrackingProps {
  chamaData: any;
}

const InvestmentTracking: React.FC<InvestmentTrackingProps> = ({ chamaData }) => {
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [investmentType, setInvestmentType] = useState('');
  const [expectedReturn, setExpectedReturn] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  // Mock investment data
  const currentInvestments = [
    {
      id: '1',
      name: 'Money Market Fund',
      type: 'Money Market',
      amount: 500000,
      currentValue: 545000,
      roi: 9.0,
      risk: 'Low',
      maturityDate: '2024-12-31',
      status: 'active'
    },
    {
      id: '2',
      name: 'Real Estate Project',
      type: 'Real Estate',
      amount: 800000,
      currentValue: 920000,
      roi: 15.0,
      risk: 'Medium',
      maturityDate: '2025-06-30',
      status: 'active'
    },
    {
      id: '3',
      name: 'Government Bonds',
      type: 'Bonds',
      amount: 300000,
      currentValue: 324000,
      roi: 8.0,
      risk: 'Low',
      maturityDate: '2024-08-15',
      status: 'active'
    },
    {
      id: '4',
      name: 'Small Business Loan',
      type: 'Business',
      amount: 200000,
      currentValue: 235000,
      roi: 17.5,
      risk: 'High',
      maturityDate: '2024-09-30',
      status: 'active'
    }
  ];

  const performanceData = [
    { month: 'Jan', value: 1600000, growth: 2.5 },
    { month: 'Feb', value: 1680000, growth: 5.0 },
    { month: 'Mar', value: 1742000, growth: 8.9 },
    { month: 'Apr', value: 1820000, growth: 13.8 },
    { month: 'May', value: 1895000, growth: 18.4 },
    { month: 'Jun', value: 2024000, growth: 26.5 }
  ];

  const portfolioAllocation = [
    { name: 'Real Estate', value: 920000, percentage: 45.5, color: '#3b82f6' },
    { name: 'Money Market', value: 545000, percentage: 27.0, color: '#10b981' },
    { name: 'Bonds', value: 324000, percentage: 16.0, color: '#f59e0b' },
    { name: 'Business Loans', value: 235000, percentage: 11.5, color: '#ef4444' }
  ];

  const investmentOpportunities = [
    {
      name: 'Green Energy Project',
      type: 'Renewable Energy',
      minInvestment: 100000,
      expectedROI: 18.5,
      duration: '24 months',
      riskLevel: 'Medium-High',
      description: 'Solar panel installation project with government backing'
    },
    {
      name: 'Agriculture Fund',
      type: 'Agriculture',
      minInvestment: 50000,
      expectedROI: 14.2,
      duration: '18 months',
      riskLevel: 'Medium',
      description: 'Diversified agricultural investment in cash crops'
    },
    {
      name: 'Tech Startup',
      type: 'Technology',
      minInvestment: 200000,
      expectedROI: 25.0,
      duration: '36 months',
      riskLevel: 'High',
      description: 'Fintech startup focusing on mobile payments'
    }
  ];

  const portfolioStats = {
    totalValue: 2024000,
    totalInvested: 1800000,
    totalGains: 224000,
    averageROI: 12.4,
    bestPerformer: 'Small Business Loan (17.5%)',
    worstPerformer: 'Government Bonds (8.0%)'
  };

  const handleInvestment = () => {
    if (!investmentAmount || !investmentType || !expectedReturn) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Investment Proposal Submitted! 📈",
      description: "Your investment proposal has been submitted for member review",
    });

    // Reset form
    setInvestmentAmount('');
    setInvestmentType('');
    setExpectedReturn('');
    setDescription('');
  };

  const getRiskBadge = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low':
        return <Badge className="bg-green-100 text-green-800">{risk}</Badge>;
      case 'medium':
      case 'medium-high':
        return <Badge className="bg-yellow-100 text-yellow-800">{risk}</Badge>;
      case 'high':
        return <Badge className="bg-red-100 text-red-800">{risk}</Badge>;
      default:
        return <Badge variant="outline">{risk}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
      case 'matured':
        return <Badge className="bg-green-100 text-green-800">Matured</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Investment Tracking</h2>
        <p className="text-muted-foreground">Monitor and manage your chama's investment portfolio</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Portfolio Value</p>
                <p className="text-lg font-bold">
                  <CurrencyDisplay amount={portfolioStats.totalValue} />
                </p>
                <p className="text-xs text-green-600">+12.4% overall ROI</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Gains</p>
                <p className="text-lg font-bold text-green-600">
                  <CurrencyDisplay amount={portfolioStats.totalGains} />
                </p>
                <p className="text-xs text-muted-foreground">
                  From <CurrencyDisplay amount={portfolioStats.totalInvested} />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Best Performer</p>
                <p className="text-sm font-bold">Small Business</p>
                <p className="text-xs text-green-600">+17.5% ROI</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Active Investments</p>
                <p className="text-lg font-bold">{currentInvestments.length}</p>
                <p className="text-xs text-muted-foreground">All performing well</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="portfolio" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="portfolio">Current Portfolio</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="propose">Propose Investment</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Current Investments</CardTitle>
                <CardDescription>Active investment positions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentInvestments.map((investment, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{investment.name}</h4>
                          <p className="text-sm text-muted-foreground">{investment.type}</p>
                        </div>
                        <div className="flex gap-2">
                          {getRiskBadge(investment.risk)}
                          {getStatusBadge(investment.status)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Invested</p>
                          <p className="font-medium">
                            <CurrencyDisplay amount={investment.amount} />
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Current Value</p>
                          <p className="font-medium text-green-600">
                            <CurrencyDisplay amount={investment.currentValue} />
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">ROI</p>
                          <p className="font-medium">{investment.roi}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Maturity</p>
                          <p className="font-medium">{investment.maturityDate}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1">
                          {investment.currentValue > investment.amount ? (
                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-600" />
                          )}
                          <span className={`text-sm font-medium ${
                            investment.currentValue > investment.amount ? 'text-green-600' : 'text-red-600'
                          }`}>
                            <CurrencyDisplay amount={investment.currentValue - investment.amount} />
                          </span>
                        </div>
                        <Button size="sm" variant="outline">View Details</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Portfolio Allocation</CardTitle>
                <CardDescription>Investment distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPieChart>
                      <Pie
                        data={portfolioAllocation}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ percentage }) => `${percentage.toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {portfolioAllocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`KES ${value.toLocaleString()}`, 'Value']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>

                  <div className="space-y-2">
                    {portfolioAllocation.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium">
                            <CurrencyDisplay amount={item.value} />
                          </span>
                          <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Investment Performance</CardTitle>
              <CardDescription>Portfolio value growth over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'value' ? `KES ${value.toLocaleString()}` : `${value}%`,
                      name === 'value' ? 'Portfolio Value' : 'Growth %'
                    ]} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    name="value"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="growth" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="growth"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">6-Month Growth:</span>
                  <span className="font-medium text-green-600">+26.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Best Month:</span>
                  <span className="font-medium">June (+7.9%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Worst Month:</span>
                  <span className="font-medium">January (+2.5%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Volatility:</span>
                  <span className="font-medium">Low (8.2%)</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Risk Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Low Risk (60%)</span>
                    <span>KES 1.2M</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Medium Risk (28%)</span>
                    <span>KES 567K</span>
                  </div>
                  <Progress value={28} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>High Risk (12%)</span>
                    <span>KES 243K</span>
                  </div>
                  <Progress value={12} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Future Projections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">12-Month Target:</span>
                  <span className="font-medium">KES 2.8M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Expected ROI:</span>
                  <span className="font-medium text-green-600">+38%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Risk Rating:</span>
                  <span className="font-medium">Moderate</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Confidence:</span>
                  <span className="font-medium">82%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Investment Opportunities</CardTitle>
              <CardDescription>Available investment options for your chama</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {investmentOpportunities.map((opportunity, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{opportunity.name}</h4>
                        <p className="text-sm text-muted-foreground">{opportunity.type}</p>
                      </div>
                      {getRiskBadge(opportunity.riskLevel)}
                    </div>

                    <p className="text-sm text-muted-foreground">{opportunity.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Min Investment</p>
                        <p className="font-medium">
                          <CurrencyDisplay amount={opportunity.minInvestment} />
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Expected ROI</p>
                        <p className="font-medium text-green-600">{opportunity.expectedROI}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p className="font-medium">{opportunity.duration}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Risk Level</p>
                        <p className="font-medium">{opportunity.riskLevel}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm">
                        <Plus className="h-3 w-3 mr-1" />
                        Invest Now
                      </Button>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="propose" className="space-y-6">
          <Card className="border-0 shadow-lg max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Propose New Investment</CardTitle>
              <CardDescription>Submit an investment proposal for member review</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Investment Amount (KES)</label>
                <Input
                  type="number"
                  placeholder="Enter investment amount"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Investment Type</label>
                <Select value={investmentType} onValueChange={setInvestmentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select investment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="real-estate">Real Estate</SelectItem>
                    <SelectItem value="money-market">Money Market Fund</SelectItem>
                    <SelectItem value="bonds">Government Bonds</SelectItem>
                    <SelectItem value="business">Business Investment</SelectItem>
                    <SelectItem value="stocks">Stock Market</SelectItem>
                    <SelectItem value="agriculture">Agriculture</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Expected Annual Return (%)</label>
                <Input
                  type="number"
                  placeholder="Enter expected return percentage"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Investment Description</label>
                <Textarea
                  placeholder="Describe the investment opportunity, risks, and expected outcomes"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800">Investment Notice</p>
                    <p className="text-amber-700">
                      All investment proposals require majority member approval. Consider the risk level and potential returns carefully.
                    </p>
                  </div>
                </div>
              </div>

              <Button onClick={handleInvestment} className="w-full">
                <TrendingUp className="h-4 w-4 mr-2" />
                Submit Investment Proposal
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvestmentTracking;
