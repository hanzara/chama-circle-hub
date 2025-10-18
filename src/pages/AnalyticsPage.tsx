
// @ts-nocheck
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Users, Calendar, Target, PieChart, Activity, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Area, AreaChart } from 'recharts';
import { useComprehensiveAnalytics } from '@/hooks/useComprehensiveAnalytics';
import { useLanguage } from '@/contexts/LanguageContext';

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { data: analyticsData, isLoading, error } = useComprehensiveAnalytics();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading your analytics...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-red-600">Error loading analytics data</div>
          </div>
        </main>
      </div>
    );
  }

  if (!analyticsData) return null;

  const {
    overview,
    chamaAnalytics,
    personalSavings,
    contributionTrends,
    loanSummary,
    recentActivities,
    financialHealth
  } = analyticsData;

  // Calculate next payment days (simplified)
  const nextPaymentDays = Math.floor(Math.random() * 30) + 1;

  // Colors for charts
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  // Financial health color
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

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
            <h1 className="text-3xl font-bold">{t('analytics.title', 'Analytics Dashboard')}</h1>
            <p className="text-muted-foreground">{t('analytics.subtitle', 'Track your financial progress')}</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Financial Health Score */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Financial Health Score
                  </CardTitle>
                  <CardDescription>Overall assessment of your financial well-being</CardDescription>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${getHealthColor(financialHealth.score)}`}>
                    {financialHealth.score}/100
                  </div>
                  <Badge variant={financialHealth.score >= 80 ? 'default' : financialHealth.score >= 60 ? 'secondary' : 'destructive'}>
                    {getHealthLabel(financialHealth.score)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Savings</div>
                  <div className="text-lg font-semibold">{financialHealth.factors.savings}/25</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Diversification</div>
                  <div className="text-lg font-semibold">{financialHealth.factors.diversification}/25</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Consistency</div>
                  <div className="text-lg font-semibold">{financialHealth.factors.consistency}/25</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Debt Management</div>
                  <div className="text-lg font-semibold">{financialHealth.factors.debt}/25</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CurrencyDisplay amount={overview.netWorth} className="text-2xl font-bold" showToggle={false} />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {overview.monthlyGrowth >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  {Math.abs(overview.monthlyGrowth).toFixed(1)}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CurrencyDisplay amount={overview.totalSavings} className="text-2xl font-bold" showToggle={false} />
                <p className="text-xs text-muted-foreground">
                  Chamas + Personal savings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Chamas</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.activeChamasCount}</div>
                <p className="text-xs text-muted-foreground">
                  {overview.activeChamasCount > 0 ? 'Contributing actively' : 'Join a chama to start'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Investments</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CurrencyDisplay amount={overview.totalInvestments} className="text-2xl font-bold" showToggle={false} />
                <p className="text-xs text-muted-foreground">Portfolio value</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Savings Trends</CardTitle>
                <CardDescription>Your monthly savings across all sources</CardDescription>
              </CardHeader>
              <CardContent>
                {contributionTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={contributionTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: any, name: string) => [
                        `KES ${Number(value).toLocaleString()}`, 
                        name === 'chamaContributions' ? 'Chama Contributions' : 
                        name === 'personalSavings' ? 'Personal Savings' : 'Total'
                      ]} />
                      <Area type="monotone" dataKey="chamaContributions" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="personalSavings" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No savings data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chama Performance</CardTitle>
                <CardDescription>Your contributions and growth by chama</CardDescription>
              </CardHeader>
              <CardContent>
                {chamaAnalytics.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chamaAnalytics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: any, name: string) => [
                        name === 'totalContributed' ? `KES ${Number(value).toLocaleString()}` : `${Number(value).toFixed(1)}%`,
                        name === 'totalContributed' ? 'Total Contributed' : 'Growth Rate'
                      ]} />
                      <Bar dataKey="totalContributed" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No chama data available</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => navigate('/chamas')}
                      >
                        Join a Chama
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Multi-section Layout */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Personal Goals Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Personal Savings Goals
                </CardTitle>
                <CardDescription>Your progress towards personal financial goals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {personalSavings.goalProgress.length > 0 ? (
                    personalSavings.goalProgress.map((goal, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">{goal.goalName}</h4>
                          <span className="text-sm text-muted-foreground">
                            <CurrencyDisplay amount={goal.current} showToggle={false} /> / <CurrencyDisplay amount={goal.target} showToggle={false} />
                          </span>
                        </div>
                        <Progress value={Math.min(goal.progress, 100)} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {goal.progress.toFixed(1)}% complete
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No personal savings goals set</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => navigate('/personal-savings')}
                      >
                        Set Goals
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Loan Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Loan Summary</CardTitle>
                <CardDescription>Overview of your borrowing activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active Loans</span>
                    <span className="font-medium">{loanSummary.activeLoans}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Borrowed</span>
                    <CurrencyDisplay amount={loanSummary.totalBorrowed} showToggle={false} className="font-medium" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Repaid</span>
                    <CurrencyDisplay amount={loanSummary.totalRepaid} showToggle={false} className="font-medium text-green-600" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Repayment Rate</span>
                    <Badge variant={loanSummary.repaymentRate >= 80 ? 'default' : loanSummary.repaymentRate >= 60 ? 'secondary' : 'destructive'}>
                      {loanSummary.repaymentRate.toFixed(1)}%
                    </Badge>
                  </div>
                  {loanSummary.activeLoans === 0 && loanSummary.totalBorrowed === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <p className="text-sm">No loan activity</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => navigate('/loans')}
                      >
                        Explore Loans
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity Summary
              </CardTitle>
              <CardDescription>Your latest financial activities across all platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => {
                    const getActivityIcon = (type: string) => {
                      switch (type) {
                        case 'contribution': return '💰';
                        case 'savings': return '🏦';
                        case 'loan': return '📋';
                        case 'investment': return '📈';
                        default: return '💼';
                      }
                    };

                    const getActivityColor = (type: string) => {
                      switch (type) {
                        case 'contribution': return 'bg-blue-50 border-blue-200';
                        case 'savings': return 'bg-green-50 border-green-200';
                        case 'loan': return 'bg-orange-50 border-orange-200';
                        case 'investment': return 'bg-purple-50 border-purple-200';
                        default: return 'bg-gray-50 border-gray-200';
                      }
                    };

                    return (
                      <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${getActivityColor(activity.type)}`}>
                        <div className="flex items-center gap-3">
                          <div className="text-lg">{getActivityIcon(activity.type)}</div>
                          <div>
                            <p className="font-medium capitalize">{activity.type} {activity.chamaName ? `- ${activity.chamaName}` : ''}</p>
                            <p className="text-sm text-muted-foreground">
                              {activity.description} • {new Date(activity.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <CurrencyDisplay 
                          amount={activity.amount} 
                          showToggle={false} 
                          className="font-medium"
                        />
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No recent activity found</p>
                    <p className="text-sm mt-1">Start by making a contribution or saving some money!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AnalyticsPage;
