import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Calendar, DollarSign, TrendingUp, PiggyBank, Smartphone, Award, BarChart3, Target, Sparkles, Globe, Settings, Building2, Star } from 'lucide-react';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import FeaturesCarousel from '@/components/FeaturesCarousel';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  const upcomingContributions = [
    { chama: 'Unity Savings Group', amount: 5000, date: '2024-01-15', status: 'pending' },
    { chama: 'School Fees Chama', amount: 3000, date: '2024-01-12', status: 'due' }
  ];

  const recentActivity = [
    { type: 'contribution', chama: 'Unity Savings Group', amount: 5000, date: '2023-12-15' },
    { type: 'payout', chama: 'School Fees Chama', amount: 24000, date: '2023-12-10' },
    { type: 'joined', chama: 'Tech Entrepreneurs Chama', date: '2023-12-05' }
  ];

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'personal-savings':
        navigate('/personal-savings');
        break;
      case 'create-chama':
        navigate('/create-chama');
        break;
      case 'smart-wallet':
        navigate('/smart-wallet');
        break;
      case 'investment':
        navigate('/investment');
        break;
      case 'analytics':
        navigate('/analytics');
        break;
      case 'mobile-money':
        navigate('/mobile-money');
        break;
      case 'chamas':
        navigate('/chamas');
        break;
      case 'community':
        navigate('/community-hub');
        break;
      case 'partner':
        navigate('/partner-dashboard');
        break;
      case 'admin':
        navigate('/admin-portal');
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-emerald-50/30 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.05),transparent_70%)] animate-pulse" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(16,185,129,0.05),transparent_70%)] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_90%,rgba(147,51,234,0.03),transparent_70%)] animate-pulse" style={{ animationDelay: '2s' }} />
      
      {/* Floating Orbs */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-300/10 to-pink-300/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '1.5s' }} />
      
      {/* Mesh Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KPGcgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjAzIj4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPgo8L2c+CjwvZz4KPC9zdmc+')] opacity-40" />
      
      <div className="container mx-auto px-6 py-8 space-y-12 relative z-10">
        {/* Quick Financial Overview */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Welcome Back</h1>
          
          {/* Financial Health Check */}
          <Card className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Financial Health Score</h3>
                <Badge variant="default" className="bg-green-500">Excellent</Badge>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full" style={{width: '85%'}}></div>
                </div>
                <span className="text-sm font-medium">85/100</span>
              </div>
            </CardContent>
          </Card>

          {/* Today's Summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">2</div>
                  <div className="text-sm text-muted-foreground">Due Contributions</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">1</div>
                  <div className="text-sm text-muted-foreground">Meetings Today</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <CurrencyDisplay amount={5500} className="text-2xl font-bold text-purple-600" showToggle={false} />
                  <div className="text-sm text-muted-foreground">Expected Income</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">3</div>
                  <div className="text-sm text-muted-foreground">Pending Approvals</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Quick Stats */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <Card className="group relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white transform hover:scale-110 transition-all duration-300 hover:shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-blue-100">Total Wealth</CardTitle>
              <div className="p-2 bg-white/20 rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <CurrencyDisplay amount={336000} className="text-4xl font-bold text-white mb-2" showToggle={false} />
              <p className="text-sm text-blue-100 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                +12% from last month
              </p>
            </CardContent>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8" />
          </Card>

          <Card className="group relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-green-500 to-green-600 text-white transform hover:scale-110 transition-all duration-300 hover:shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-green-100">Active Chamas</CardTitle>
              <div className="p-2 bg-white/20 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">2</div>
              <p className="text-sm text-green-100">Both performing excellently</p>
            </CardContent>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8" />
          </Card>

          <Card className="group relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white transform hover:scale-110 transition-all duration-300 hover:shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-purple-100">Personal Savings</CardTitle>
              <div className="p-2 bg-white/20 rounded-lg">
                <PiggyBank className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <CurrencyDisplay amount={85000} className="text-4xl font-bold text-white mb-2" showToggle={false} />
              <p className="text-sm text-purple-100">Goal: KES 100,000</p>
            </CardContent>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8" />
          </Card>

          <Card className="group relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white transform hover:scale-110 transition-all duration-300 hover:shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-orange-100">Growth Rate</CardTitle>
              <div className="p-2 bg-white/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">18.5%</div>
              <p className="text-sm text-orange-100">Annual return</p>
            </CardContent>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8" />
          </Card>
        </div>

        {/* Dashboard Section */}
        <div className="text-center space-y-6 py-16 relative">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold text-foreground">Dashboard</h2>
            <div className="flex items-center justify-center gap-4">
              <CurrencyDisplay amount={5000} className="text-6xl font-bold text-kenyan-green" showToggle={false} />
              <div className="flex items-center text-kenyan-green">
                <TrendingUp className="h-8 w-8 mr-2" />
                <span className="text-2xl font-semibold">↗</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Carousel Section */}
        <FeaturesCarousel />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-8">
          <Card 
            className="group cursor-pointer border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            onClick={() => handleQuickAction('chamas')}
          >
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-blue-500 rounded-full">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-blue-900">My Chamas</h3>
              <p className="text-sm text-blue-700 mt-1">2 Active</p>
            </CardContent>
          </Card>

          <Card 
            className="group cursor-pointer border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            onClick={() => handleQuickAction('personal-savings')}
          >
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-green-500 rounded-full">
                  <PiggyBank className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-green-900">Personal Savings</h3>
              <p className="text-sm text-green-700 mt-1">KES 85,000</p>
            </CardContent>
          </Card>

          <Card 
            className="group cursor-pointer border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            onClick={() => handleQuickAction('mobile-money')}
          >
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-purple-500 rounded-full">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-purple-900">M-Pesa</h3>
              <p className="text-sm text-purple-700 mt-1">Send & Receive</p>
            </CardContent>
          </Card>

          <Card 
            className="group cursor-pointer border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            onClick={() => handleQuickAction('create-chama')}
          >
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-orange-500 rounded-full">
                  <Plus className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-orange-900">Create Chama</h3>
              <p className="text-sm text-orange-700 mt-1">Start New Group</p>
            </CardContent>
          </Card>

          <Card 
            className="group cursor-pointer border-0 shadow-lg bg-gradient-to-br from-teal-50 to-teal-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            onClick={() => handleQuickAction('investment')}
          >
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-teal-500 rounded-full">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-teal-900">Investments</h3>
              <p className="text-sm text-teal-700 mt-1">Grow Wealth</p>
            </CardContent>
          </Card>

          <Card 
            className="group cursor-pointer border-0 shadow-lg bg-gradient-to-br from-pink-50 to-pink-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            onClick={() => handleQuickAction('smart-wallet')}
          >
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-pink-500 rounded-full">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-pink-900">Smart Wallet</h3>
              <p className="text-sm text-pink-700 mt-1">Digital Payments</p>
            </CardContent>
          </Card>

          <Card 
            className="group cursor-pointer border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            onClick={() => handleQuickAction('analytics')}
          >
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-indigo-500 rounded-full">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-indigo-900">Analytics</h3>
              <p className="text-sm text-indigo-700 mt-1">Track Progress</p>
            </CardContent>
          </Card>

          <Card 
            className="group cursor-pointer border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            onClick={() => handleQuickAction('community')}
          >
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-yellow-500 rounded-full">
                  <Globe className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-yellow-900">Community</h3>
              <p className="text-sm text-yellow-700 mt-1">Connect & Learn</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upcoming Contributions */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Upcoming Contributions
              </CardTitle>
              <CardDescription>Your scheduled payments this month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingContributions.map((contribution, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
                  <div>
                    <p className="font-medium">{contribution.chama}</p>
                    <p className="text-sm text-muted-foreground">{contribution.date}</p>
                  </div>
                  <div className="text-right">
                    <CurrencyDisplay amount={contribution.amount} showToggle={false} className="font-medium" />
                    <Badge variant={contribution.status === 'due' ? 'destructive' : 'secondary'} className="ml-2">
                      {contribution.status}
                    </Badge>
                  </div>
                </div>
              ))}
              <Button className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600">
                View All Contributions
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest financial activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
                  <div className={`w-3 h-3 rounded-full ${
                    activity.type === 'contribution' ? 'bg-green-500' :
                    activity.type === 'payout' ? 'bg-blue-500' : 'bg-purple-500'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium">
                      {activity.type === 'contribution' ? 'Contribution made' :
                       activity.type === 'payout' ? 'Payout received' : 'Joined chama'}
                    </p>
                    <p className="text-sm text-muted-foreground">{activity.chama}</p>
                    <p className="text-xs text-muted-foreground">{activity.date}</p>
                  </div>
                  {activity.amount && (
                    <CurrencyDisplay amount={activity.amount} showToggle={false} className="text-sm font-medium" />
                  )}
                </div>
              ))}
              <Button className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                View All Activity
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Call to Action */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white relative overflow-hidden">
          <CardContent className="p-12 text-center relative z-10">
            <div className="flex justify-center mb-6">
              <Award className="h-16 w-16 text-yellow-300" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Financial Future?</h2>
            <p className="text-blue-100 mb-8 max-w-3xl mx-auto text-lg leading-relaxed">
              Join thousands of Kenyans who are building wealth through community savings, smart investments, and innovative financial tools. 
              Start your journey today and achieve your financial goals faster than ever before.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-4">
                Start Your Journey
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4">
                Explore Features
              </Button>
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />
        </Card>
      </div>
    </div>
  );
};

export default Index;