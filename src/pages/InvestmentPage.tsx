
// @ts-nocheck

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, TrendingUp, DollarSign, PieChart, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts';
import Navigation from '@/components/Navigation';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { useInvestmentData } from '@/hooks/useInvestmentData';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const InvestmentPage = () => {
  const navigate = useNavigate();
  const { data, isLoading, investMutation, isInvesting } = useInvestmentData();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');

  const handleInvest = async () => {
    if (!selectedProject || !investmentAmount) return;
    
    await investMutation.mutateAsync({
      projectId: selectedProject,
      amount: parseFloat(investmentAmount)
    });
    
    setSelectedProject(null);
    setInvestmentAmount('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading investment data...</div>
        </div>
      </div>
    );
  }

  const pieChartData = Object.entries(data?.categoryDistribution || {}).map(([category, amount]) => ({
    name: category,
    value: amount as number
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Smart Investment Tracking</h1>
            <p className="text-muted-foreground">Monitor and grow your investment portfolio</p>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="grid gap-4 md:grid-cols-5 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CurrencyDisplay amount={data?.statistics.totalInvested || 0} className="text-2xl font-bold" showToggle={false} />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CurrencyDisplay amount={data?.statistics.totalReturns || 0} className="text-2xl font-bold text-green-600" showToggle={false} />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CurrencyDisplay amount={data?.statistics.portfolioValue || 0} className="text-2xl font-bold" showToggle={false} />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall ROI</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{data?.statistics.overallROI.toFixed(1)}%</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.statistics.activeInvestments}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Performance Chart */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Investment Performance</CardTitle>
              <CardDescription>Your returns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data?.performanceData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="returns" stroke="#00C49F" strokeWidth={2} />
                  <Line type="monotone" dataKey="invested" stroke="#0088FE" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Portfolio Distribution */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Portfolio Distribution</CardTitle>
              <CardDescription>Investment by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <RechartsPieChart data={pieChartData}>
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </RechartsPieChart>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Available Investment Opportunities */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle>Available Investment Opportunities</CardTitle>
            <CardDescription>Discover new projects to invest in</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data?.availableProjects.map((project) => (
                <div key={project.id} className="p-4 border rounded-lg bg-white/50 hover:bg-white/80 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{project.title}</h3>
                    <Badge variant={project.risk_score <= 3 ? 'secondary' : project.risk_score <= 6 ? 'default' : 'destructive'}>
                      Risk: {project.risk_score}/10
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Target:</span>
                      <CurrencyDisplay amount={project.target_amount} showToggle={false} />
                    </div>
                    <div className="flex justify-between">
                      <span>Raised:</span>
                      <CurrencyDisplay amount={project.current_funding} showToggle={false} />
                    </div>
                    <div className="flex justify-between">
                      <span>Projected ROI:</span>
                      <span className="text-green-600">{project.projected_roi}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Min Investment:</span>
                      <CurrencyDisplay amount={project.minimum_investment} showToggle={false} />
                    </div>
                  </div>
                  
                  {selectedProject === project.id ? (
                    <div className="mt-4 space-y-2">
                      <Label htmlFor={`amount-${project.id}`}>Investment Amount</Label>
                      <Input
                        id={`amount-${project.id}`}
                        type="number"
                        value={investmentAmount}
                        onChange={(e) => setInvestmentAmount(e.target.value)}
                        placeholder={`Min: ${project.minimum_investment}`}
                        min={project.minimum_investment}
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleInvest} disabled={isInvesting} size="sm">
                          {isInvesting ? 'Investing...' : 'Invest'}
                        </Button>
                        <Button variant="outline" onClick={() => setSelectedProject(null)} size="sm">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      className="w-full mt-4" 
                      size="sm"
                      onClick={() => setSelectedProject(project.id)}
                    >
                      Invest Now
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Investments */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Your Current Investments</CardTitle>
            <CardDescription>Track your active investment portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.investments.map((investment) => (
                <div key={investment.id} className="p-4 border rounded-lg bg-white/50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium">{(investment.investment_projects as any)?.title || 'Investment'}</h3>
                      <p className="text-sm text-muted-foreground">{(investment.investment_projects as any)?.category}</p>
                    </div>
                    <Badge variant={investment.status === 'active' ? 'secondary' : 'default'}>
                      {investment.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Invested</p>
                      <p className="font-medium">
                        <CurrencyDisplay amount={investment.amount_invested} showToggle={false} />
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Returns</p>
                      <p className="font-medium text-green-600">
                        <CurrencyDisplay amount={investment.returns_earned || 0} showToggle={false} />
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Shares</p>
                      <p className="font-medium">{investment.shares_percentage.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">ROI</p>
                      <p className="font-medium text-green-600">
                        {investment.amount_invested > 0 ? 
                          (((investment.returns_earned || 0) / investment.amount_invested) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default InvestmentPage;
