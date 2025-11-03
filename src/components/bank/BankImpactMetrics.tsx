
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Globe, Users, TrendingUp, Target, Heart, Sprout } from 'lucide-react';

const BankImpactMetrics: React.FC = () => {
  // Mock impact data
  const socialImpactData = [
    { category: 'Women-led Groups', funded: 245, amount: 12500000, impact: 1470 },
    { category: 'Youth Entrepreneurs', funded: 189, amount: 9800000, impact: 1134 },
    { category: 'Rural Communities', funded: 156, amount: 8200000, impact: 936 },
    { category: 'Small Business', funded: 312, amount: 15600000, impact: 1872 },
    { category: 'Agriculture', funded: 98, amount: 6400000, impact: 588 },
    { category: 'Education', funded: 67, amount: 4200000, impact: 402 }
  ];

  const monthlyImpactTrend = [
    { month: 'Jan', womenGroups: 35, youthGroups: 28, ruralCommunities: 22, totalImpact: 510 },
    { month: 'Feb', womenGroups: 42, youthGroups: 31, ruralCommunities: 25, totalImpact: 588 },
    { month: 'Mar', womenGroups: 38, youthGroups: 35, ruralCommunities: 28, totalImpact: 606 },
    { month: 'Apr', womenGroups: 45, youthGroups: 33, ruralCommunities: 30, totalImpact: 648 },
    { month: 'May', womenGroups: 41, youthGroups: 38, ruralCommunities: 27, totalImpact: 636 },
    { month: 'Jun', womenGroups: 44, youthGroups: 35, ruralCommunities: 32, totalImpact: 666 }
  ];

  const genderDistribution = [
    { name: 'Women', value: 68, color: '#EC4899' },
    { name: 'Men', value: 32, color: '#3B82F6' }
  ];

  const ageDistribution = [
    { name: '18-25', value: 28, color: '#10B981' },
    { name: '26-35', value: 35, color: '#3B82F6' },
    { name: '36-45', value: 22, color: '#F59E0B' },
    { name: '46+', value: 15, color: '#8B5CF6' }
  ];

  const impactMetrics = {
    totalLivesBenefited: 6402,
    womenEmpowered: 4353,
    jobsCreated: 1247,
    businessesLaunched: 892,
    ruralReach: 936,
    avgLoanSize: 58500,
    repaymentRate: 94.2,
    sustainabilityScore: 8.7
  };

  return (
    <div className="space-y-6">
      {/* Impact Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-50 to-pink-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lives Impacted</CardTitle>
            <Heart className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-700">{impactMetrics.totalLivesBenefited.toLocaleString()}</div>
            <p className="text-xs text-pink-600">People benefited from loans</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Women Empowered</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{impactMetrics.womenEmpowered.toLocaleString()}</div>
            <p className="text-xs text-purple-600">68% of all beneficiaries</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jobs Created</CardTitle>
            <Sprout className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{impactMetrics.jobsCreated.toLocaleString()}</div>
            <p className="text-xs text-green-600">New employment opportunities</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Businesses Launched</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{impactMetrics.businessesLaunched}</div>
            <p className="text-xs text-blue-600">New enterprises started</p>
          </CardContent>
        </Card>
      </div>

      {/* Social Impact by Category */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Social Impact by Category</CardTitle>
          <CardDescription>
            Breakdown of funded groups and their reach across different demographics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={socialImpactData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={(value: any, name: string) => {
                if (name === 'amount') return [`KES ${(value / 1000000).toFixed(1)}M`, 'Amount Funded'];
                return [value, name];
              }} />
              <Legend />
              <Bar yAxisId="left" dataKey="funded" fill="#3B82F6" name="Groups Funded" />
              <Bar yAxisId="left" dataKey="impact" fill="#10B981" name="People Impacted" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Impact Trend */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Monthly Impact Trends</CardTitle>
            <CardDescription>Growth in different demographic segments over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyImpactTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="womenGroups" stroke="#EC4899" name="Women Groups" strokeWidth={2} />
                <Line type="monotone" dataKey="youthGroups" stroke="#3B82F6" name="Youth Groups" strokeWidth={2} />
                <Line type="monotone" dataKey="ruralCommunities" stroke="#10B981" name="Rural Communities" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gender Distribution */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Beneficiary Demographics</CardTitle>
            <CardDescription>Gender and age distribution of loan beneficiaries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium mb-2">Gender Distribution</h4>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={genderDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {genderDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Age Distribution</h4>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={ageDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {ageDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Impact Report Summary */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Impact Report Summary
          </CardTitle>
          <CardDescription>
            Key performance indicators and sustainability metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-4">
              <h4 className="font-medium text-center">Financial Performance</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Average Loan Size</span>
                  <span className="font-medium">KES {impactMetrics.avgLoanSize.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Repayment Rate</span>
                  <span className="font-medium text-green-600">{impactMetrics.repaymentRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Default Rate</span>
                  <span className="font-medium text-red-600">{(100 - impactMetrics.repaymentRate).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-center">Social Reach</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Rural Beneficiaries</span>
                  <span className="font-medium">{impactMetrics.ruralReach}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Women Participation</span>
                  <span className="font-medium text-pink-600">68%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Youth Engagement</span>
                  <span className="font-medium text-blue-600">28%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-center">Sustainability</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Sustainability Score</span>
                  <span className="font-medium text-green-600">{impactMetrics.sustainabilityScore}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Business Survival Rate</span>
                  <span className="font-medium text-green-600">87%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Repeat Borrowers</span>
                  <span className="font-medium">62%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BankImpactMetrics;
