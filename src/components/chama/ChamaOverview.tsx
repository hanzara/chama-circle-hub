
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, DollarSign, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, Target, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import CurrencyDisplay from '@/components/CurrencyDisplay';

interface ChamaOverviewProps {
  chamaData: any;
}

const ChamaOverview: React.FC<ChamaOverviewProps> = ({ chamaData }) => {
  // Mock data for charts
  const contributionTrends = [
    { month: 'Jan', amount: 180000 },
    { month: 'Feb', amount: 220000 },
    { month: 'Mar', amount: 210000 },
    { month: 'Apr', amount: 240000 },
    { month: 'May', amount: 235000 },
    { month: 'Jun', amount: 260000 }
  ];

  const memberContributions = [
    { name: 'John Doe', amount: 25000, percentage: 12 },
    { name: 'Jane Smith', amount: 23000, percentage: 11 },
    { name: 'Michael Brown', amount: 22000, percentage: 10 },
    { name: 'Sarah Wilson', amount: 21000, percentage: 10 },
    { name: 'Others', amount: 109000, percentage: 57 }
  ];

  const expenseBreakdown = [
    { name: 'Loans', value: 650000, color: '#3b82f6' },
    { name: 'Investments', value: 300000, color: '#10b981' },
    { name: 'Operations', value: 75000, color: '#f59e0b' },
    { name: 'Emergency Fund', value: 175000, color: '#ef4444' }
  ];

  const savingsGoals = [
    { name: 'Emergency Fund', target: 500000, current: 175000, progress: 35 },
    { name: 'Investment Pool', target: 1000000, current: 300000, progress: 30 },
    { name: 'Member Welfare', target: 200000, current: 120000, progress: 60 }
  ];

  const recentActivities = [
    { type: 'contribution', member: 'John Doe', amount: 12000, date: '2 hours ago' },
    { type: 'loan', member: 'Sarah Wilson', amount: 50000, date: '1 day ago' },
    { type: 'investment', member: 'System', amount: 100000, date: '3 days ago' },
    { type: 'payment', member: 'Michael Brown', amount: 8000, date: '5 days ago' }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'contribution': return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case 'loan': return <ArrowDownRight className="h-4 w-4 text-blue-600" />;
      case 'investment': return <TrendingUp className="h-4 w-4 text-purple-600" />;
      case 'payment': return <DollarSign className="h-4 w-4 text-orange-600" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Chama Overview</h2>
        <p className="text-muted-foreground">Complete financial dashboard for {chamaData.name}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyDisplay amount={chamaData.totalSavings} />
            </div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chamaData.memberCount}</div>
            <p className="text-xs text-muted-foreground">
              +2 new this month
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loans Issued</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyDisplay amount={chamaData.loansIssued} />
            </div>
            <p className="text-xs text-muted-foreground">
              {chamaData.activeLoans} active loans
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly ROI</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.5%</div>
            <p className="text-xs text-muted-foreground">
              Above target of 7%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Contribution Trends</CardTitle>
            <CardDescription>Monthly contribution patterns over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={contributionTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`KES ${value.toLocaleString()}`, 'Amount']} />
                <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Fund Allocation</CardTitle>
            <CardDescription>How your savings are allocated</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`KES ${value.toLocaleString()}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Savings Goals */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Savings Goals Progress</CardTitle>
          <CardDescription>Track progress towards financial objectives</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {savingsGoals.map((goal, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{goal.name}</span>
                  <span className="text-muted-foreground">
                    <CurrencyDisplay amount={goal.current} /> / <CurrencyDisplay amount={goal.target} />
                  </span>
                </div>
                <Progress value={goal.progress} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {goal.progress}% complete
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Contributors & Recent Activities */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Top Contributors</CardTitle>
            <CardDescription>This month's leading members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {memberContributions.map((member, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.percentage}% of total</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">
                      <CurrencyDisplay amount={member.amount} />
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest chama transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {activity.member} - {activity.type}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      <CurrencyDisplay amount={activity.amount} />
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => {
                // Navigate to savings tab with contribution form
                const event = new CustomEvent('navigate-to-tab', { detail: 'savings' });
                window.dispatchEvent(event);
              }}
            >
              <DollarSign className="h-6 w-6" />
              <span className="text-sm">Make Contribution</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => {
                // Navigate to loans tab
                const event = new CustomEvent('navigate-to-tab', { detail: 'loans' });
                window.dispatchEvent(event);
              }}
            >
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">Request Loan</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => {
                // Navigate to members tab
                const event = new CustomEvent('navigate-to-tab', { detail: 'members' });
                window.dispatchEvent(event);
              }}
            >
              <Users className="h-6 w-6" />
              <span className="text-sm">Invite Member</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => {
                // Navigate to meetings tab
                const event = new CustomEvent('navigate-to-tab', { detail: 'meetings' });
                window.dispatchEvent(event);
              }}
            >
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Schedule Meeting</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChamaOverview;
