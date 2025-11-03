
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, DollarSign, Clock, AlertTriangle, CheckCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLoanData } from '@/hooks/useLoanData';
import { useLanguage } from '@/contexts/LanguageContext';

const LoanManagementPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { data: loanData, isLoading, error } = useLoanData();
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading loan data...</div>
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
            <div className="text-lg text-red-600">Error loading loan data</div>
          </div>
        </main>
      </div>
    );
  }

  const { loanApplications, statistics, loanHistory, recentActivities } = loanData || {};

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'pending': return 'outline';
      case 'overdue': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
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
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Loan Management</h1>
            <p className="text-muted-foreground">Manage your loans and track repayments</p>
          </div>
          <Button onClick={() => navigate('/apply-loan')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Apply for Loan
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="active">Active Loans</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="repayments">Repayments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Loan Statistics */}
            <div className="grid gap-6 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Borrowed</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <CurrencyDisplay amount={statistics?.totalBorrowed || 0} className="text-2xl font-bold" showToggle={false} />
                  <p className="text-xs text-muted-foreground">
                    Across {loanApplications?.length || 0} loans
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Repaid</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <CurrencyDisplay amount={statistics?.totalRepaid || 0} className="text-2xl font-bold" showToggle={false} />
                  <p className="text-xs text-muted-foreground">
                    {statistics?.totalBorrowed > 0 ? 
                      `${((statistics.totalRepaid / statistics.totalBorrowed) * 100).toFixed(1)}% repaid` : 
                      'No loans yet'
                    }
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statistics?.activeLoans || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <CurrencyDisplay amount={statistics?.outstandingBalance || 0} className="text-2xl font-bold" showToggle={false} />
                  <p className="text-xs text-muted-foreground">
                    {statistics?.overdueLoans > 0 ? `${statistics.overdueLoans} overdue` : 'All current'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Loan History Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Loan History</CardTitle>
                <CardDescription>Your borrowing activity over time</CardDescription>
              </CardHeader>
              <CardContent>
                {loanHistory?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={loanHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`KES ${value}`, 'Amount']} />
                      <Bar dataKey="amount" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No loan history available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Loan Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities?.length > 0 ? (
                    recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.type === 'loan_application' ? 'bg-blue-500' : 'bg-green-500'
                          }`}></div>
                          <div>
                            <p className="font-medium text-sm">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant={getStatusColor(activity.status)}>
                          {activity.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No recent loan activities
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active" className="space-y-6">
            <div className="grid gap-4">
              {loanApplications?.filter(loan => loan.status === 'active').map((loan) => (
                <Card key={loan.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">{(loan.chamas as any)?.name || 'Unknown Chama'}</h3>
                        <p className="text-sm text-muted-foreground">
                          Loan ID: {loan.id.slice(0, 8)}...
                        </p>
                      </div>
                      <Badge variant={getStatusColor(loan.status)} className="flex items-center gap-1">
                        {getStatusIcon(loan.status)}
                        {loan.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Loan Amount</p>
                        <CurrencyDisplay amount={loan.amount} className="font-semibold" showToggle={false} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Repaid</p>
                        <CurrencyDisplay amount={loan.repaid_amount || 0} className="font-semibold" showToggle={false} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Interest Rate</p>
                        <p className="font-semibold">{loan.interest_rate}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Due Date</p>
                        <p className="font-semibold">
                          {loan.due_date ? new Date(loan.due_date).toLocaleDateString() : 'Not set'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Repayment Progress</span>
                        <span>{loan.amount > 0 ? ((loan.repaid_amount || 0) / loan.amount * 100).toFixed(1) : 0}%</span>
                      </div>
                      <Progress value={loan.amount > 0 ? (loan.repaid_amount || 0) / loan.amount * 100 : 0} className="h-2" />
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">Make Payment</Button>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {loanApplications?.filter(loan => loan.status === 'active').length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No active loans found</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <div className="grid gap-4">
              {loanApplications?.map((loan) => (
                <Card key={loan.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold">{(loan.chamas as any)?.name || 'Unknown Chama'}</h3>
                          <Badge variant={getStatusColor(loan.status)} className="flex items-center gap-1">
                            {getStatusIcon(loan.status)}
                            {loan.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Amount</p>
                            <CurrencyDisplay amount={loan.amount} className="font-medium" showToggle={false} />
                          </div>
                          <div>
                            <p className="text-muted-foreground">Interest</p>
                            <p className="font-medium">{loan.interest_rate}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Duration</p>
                            <p className="font-medium">{loan.duration_months} months</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Applied</p>
                            <p className="font-medium">{new Date(loan.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {loanApplications?.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No loan history found</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="repayments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Repayment Schedule</CardTitle>
                <CardDescription>Track your upcoming and completed payments</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Repayment tracking feature coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default LoanManagementPage;
