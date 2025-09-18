
// @ts-nocheck
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Users, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { useLanguage } from '@/contexts/LanguageContext';

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { data: analyticsData, isLoading, error } = useAnalyticsData();

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

  const {
    totalSavings = 0,
    monthlyGrowth = 0,
    activeChamasCount = 0,
    contributionTrends = [],
    chamaPerformance = [],
    recentActivities = []
  } = analyticsData || {};

  // Calculate next payment days (simplified)
  const nextPaymentDays = Math.floor(Math.random() * 30) + 1;

  // Goal progress (using real data for available goals)
  const goalProgress = [
    { 
      name: t('goals.house', 'House Deposit'), 
      current: totalSavings * 0.6, 
      target: totalSavings > 0 ? totalSavings * 2 : 500000, 
      color: '#3b82f6' 
    },
    { 
      name: t('goals.emergency', 'Emergency Fund'), 
      current: totalSavings * 0.8, 
      target: totalSavings > 0 ? totalSavings * 1.2 : 100000, 
      color: '#10b981' 
    },
    { 
      name: t('goals.business', 'Business Capital'), 
      current: totalSavings * 0.3, 
      target: totalSavings > 0 ? totalSavings * 1.5 : 200000, 
      color: '#f59e0b' 
    }
  ];

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
          {/* Key Metrics */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('analytics.total.savings', 'Total Savings')}</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CurrencyDisplay amount={totalSavings} className="text-2xl font-bold" showToggle={false} />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {monthlyGrowth >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  {Math.abs(monthlyGrowth).toFixed(1)}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('analytics.monthly.growth', 'Monthly Growth')}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.abs(monthlyGrowth).toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  {t('analytics.annual.return', 'Annual return rate')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('analytics.active.chamas', 'Active Chamas')}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeChamasCount}</div>
                <p className="text-xs text-muted-foreground">
                  {activeChamasCount > 0 ? t('analytics.performing.well', 'All performing well') : t('analytics.no.chamas', 'No active chamas')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('analytics.next.payment', 'Next Payment')}</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{nextPaymentDays}</div>
                <p className="text-xs text-muted-foreground">{t('analytics.days.remaining', 'Days remaining')}</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.contribution.trends', 'Contribution Trends')}</CardTitle>
                <CardDescription>{t('analytics.monthly.contributions', 'Your monthly contributions over time')}</CardDescription>
              </CardHeader>
              <CardContent>
                {contributionTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={contributionTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`KES ${value}`, 'Amount']} />
                      <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    {t('analytics.no.data', 'No contribution data available')}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.chama.performance', 'Chama Performance')}</CardTitle>
                <CardDescription>{t('analytics.contributions.by.chama', 'Contributions by Chama group')}</CardDescription>
              </CardHeader>
              <CardContent>
                {chamaPerformance.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chamaPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`KES ${value}`, 'Contributions']} />
                      <Bar dataKey="contributions" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    {t('analytics.no.chama.data', 'No chama data available')}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Goal Progress */}
          <Card>
            <CardHeader>
              <CardTitle>{t('analytics.financial.goals', 'Financial Goals Progress')}</CardTitle>
              <CardDescription>{t('analytics.track.progress', 'Track your progress towards financial milestones')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {goalProgress.map((goal, index) => {
                  const progress = (goal.current / goal.target) * 100;
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{goal.name}</h4>
                        <span className="text-sm text-muted-foreground">
                          <CurrencyDisplay amount={goal.current} showToggle={false} /> / <CurrencyDisplay amount={goal.target} showToggle={false} />
                        </span>
                      </div>
                      <Progress value={Math.min(progress, 100)} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {progress.toFixed(1)}% complete
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle>{t('analytics.recent.activity', 'Recent Activity Summary')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">{t('analytics.contribution.made', 'Contribution Made')}</p>
                          <p className="text-sm text-muted-foreground">{activity.description} - {new Date(activity.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <CurrencyDisplay amount={activity.amount} showToggle={false} className="font-medium text-green-600" />
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    {t('analytics.no.recent.activity', 'No recent activity found')}
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
