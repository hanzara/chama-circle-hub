
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, Building2, Target, AlertTriangle } from 'lucide-react';

const AdminAnalytics: React.FC = () => {
  // Mock data for charts
  const monthlyGrowthData = [
    { month: 'Jan', users: 8500, chamas: 1200, loans: 6800, volume: 35000000 },
    { month: 'Feb', users: 9200, chamas: 1280, loans: 7200, volume: 38000000 },
    { month: 'Mar', users: 10100, chamas: 1350, loans: 7800, volume: 41000000 },
    { month: 'Apr', users: 11000, chamas: 1420, loans: 8400, volume: 44000000 },
    { month: 'May', users: 11800, chamas: 1485, loans: 8900, volume: 47000000 },
    { month: 'Jun', users: 12547, chamas: 1532, loans: 9340, volume: 50000000 }
  ];

  const loanPerformanceData = [
    { name: 'Excellent (90-100%)', value: 45, color: '#10B981' },
    { name: 'Good (75-89%)', value: 30, color: '#3B82F6' },
    { name: 'Fair (60-74%)', value: 18, color: '#F59E0B' },
    { name: 'Poor (Below 60%)', value: 7, color: '#EF4444' }
  ];

  const regionalDistribution = [
    { region: 'Nairobi', users: 4200, chamas: 580, volume: 18500000 },
    { region: 'Mombasa', users: 2100, chamas: 290, volume: 9200000 },
    { region: 'Kisumu', users: 1800, chamas: 245, volume: 7800000 },
    { region: 'Nakuru', users: 1500, chamas: 208, volume: 6300000 },
    { region: 'Eldoret', users: 1300, chamas: 175, volume: 5400000 },
    { region: 'Others', users: 1647, chamas: 234, volume: 8200000 }
  ];

  const userEngagementData = [
    { metric: 'Daily Active Users', value: 8934, change: '+12%', trend: 'up' },
    { metric: 'Weekly Active Users', value: 11247, change: '+8%', trend: 'up' },
    { metric: 'Monthly Active Users', value: 12547, change: '+15%', trend: 'up' },
    { metric: 'Average Session Duration', value: '8.5 min', change: '+5%', trend: 'up' },
    { metric: 'Churn Rate', value: '2.3%', change: '-0.8%', trend: 'down' },
    { metric: 'Retention Rate (30-day)', value: '87.2%', change: '+3.1%', trend: 'up' }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {userEngagementData.map((metric, index) => (
          <Card key={index} className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.metric}</CardTitle>
              <TrendingUp className={`h-4 w-4 ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className={`text-xs ${metric.change.startsWith('+') ? 'text-green-600' : metric.change.startsWith('-') && metric.trend === 'down' ? 'text-green-600' : 'text-red-600'}`}>
                {metric.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Platform Growth Chart */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Platform Growth Trends</CardTitle>
          <CardDescription>Monthly growth across key metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: any, name: string) => {
                if (name === 'volume') return [`KES ${(value / 1000000).toFixed(1)}M`, 'Loan Volume'];
                return [value.toLocaleString(), name.charAt(0).toUpperCase() + name.slice(1)];
              }} />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#3B82F6" name="Users" strokeWidth={2} />
              <Line type="monotone" dataKey="chamas" stroke="#10B981" name="Chamas" strokeWidth={2} />
              <Line type="monotone" dataKey="loans" stroke="#F59E0B" name="Loans" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Loan Performance Distribution */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Loan Repayment Performance</CardTitle>
            <CardDescription>Distribution of loan repayment rates</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={loanPerformanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {loanPerformanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Regional Distribution */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Regional Distribution</CardTitle>
            <CardDescription>Platform usage by region</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionalDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip formatter={(value: any, name: string) => {
                  if (name === 'volume') return [`KES ${(value / 1000000).toFixed(1)}M`, 'Loan Volume'];
                  return [value.toLocaleString(), name.charAt(0).toUpperCase() + name.slice(1)];
                }} />
                <Legend />
                <Bar dataKey="users" fill="#3B82F6" name="Users" />
                <Bar dataKey="chamas" fill="#10B981" name="Chamas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Risk Alerts */}
      <Card className="border-0 shadow-lg border-l-4 border-l-yellow-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-700">
            <AlertTriangle className="h-5 w-5" />
            Risk Alerts & Monitoring
          </CardTitle>
          <CardDescription>Issues requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <div>
                <p className="font-medium text-red-800">High Default Rate in Kisumu Region</p>
                <p className="text-sm text-red-600">15% above platform average - requires investigation</p>
              </div>
              <div className="text-red-600 font-bold">URGENT</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div>
                <p className="font-medium text-yellow-800">234 Pending KYC Verifications</p>
                <p className="text-sm text-yellow-600">Processing backlog exceeds 48-hour target</p>
              </div>
              <div className="text-yellow-600 font-bold">MODERATE</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <p className="font-medium text-blue-800">New Chama Applications Spike</p>
                <p className="text-sm text-blue-600">45% increase in applications this week</p>
              </div>
              <div className="text-blue-600 font-bold">INFO</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
