
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Calendar, TrendingUp, Users, FileText, CheckCircle, Clock, AlertCircle, Calculator } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { useToast } from '@/hooks/use-toast';
import { useChamaLoans } from '@/hooks/useChamaLoans';

interface LoanManagementProps {
  chamaData: any;
}

const LoanManagement: React.FC<LoanManagementProps> = ({ chamaData }) => {
  const [loanAmount, setLoanAmount] = useState('');
  const [loanPurpose, setLoanPurpose] = useState('');
  const [repaymentPeriod, setRepaymentPeriod] = useState('');
  const { toast } = useToast();
  
  const { 
    loans, 
    isLoading, 
    applyForLoan, 
    isApplying,
    approveLoan,
    isApproving,
    rejectLoan,
    isRejecting
  } = useChamaLoans(chamaData.id);

  // Mock data
  const loanApplications = [
    { id: '1', borrower: 'John Doe', amount: 50000, purpose: 'Business expansion', status: 'approved', date: '2024-01-10', dueDate: '2024-07-10' },
    { id: '2', borrower: 'Sarah Wilson', amount: 30000, purpose: 'Emergency medical', status: 'pending', date: '2024-01-12', dueDate: null },
    { id: '3', borrower: 'Michael Brown', amount: 75000, purpose: 'Education fees', status: 'active', date: '2024-01-05', dueDate: '2024-12-05' },
    { id: '4', borrower: 'Jane Smith', amount: 25000, purpose: 'Home improvement', status: 'completed', date: '2024-01-01', dueDate: '2024-06-01' }
  ];

  const loanPortfolio = [
    { month: 'Jan', issued: 180000, repaid: 120000 },
    { month: 'Feb', issued: 150000, repaid: 140000 },
    { month: 'Mar', issued: 200000, repaid: 160000 },
    { month: 'Apr', issued: 120000, repaid: 180000 },
    { month: 'May', issued: 250000, repaid: 200000 },
    { month: 'Jun', issued: 180000, repaid: 220000 }
  ];

  const repaymentSchedule = [
    { borrower: 'John Doe', amount: 8500, dueDate: '2024-02-10', status: 'upcoming' },
    { borrower: 'Michael Brown', amount: 12000, dueDate: '2024-02-05', status: 'overdue' },
    { borrower: 'Sarah Wilson', amount: 5500, dueDate: '2024-02-15', status: 'upcoming' },
    { borrower: 'Jane Smith', amount: 4200, dueDate: '2024-02-01', status: 'paid' }
  ];

  const loanStats = {
    totalLoaned: 850000,
    totalRepaid: 680000,
    activeLoans: 8,
    defaultRate: 2.5,
    avgInterestRate: 12.5
  };

  const calculateLoanDetails = () => {
    if (!loanAmount || !repaymentPeriod) return null;
    
    const principal = parseFloat(loanAmount);
    const months = parseInt(repaymentPeriod);
    const interestRate = 12.5; // 12.5% annual
    const monthlyRate = interestRate / 100 / 12;
    
    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                          (Math.pow(1 + monthlyRate, months) - 1);
    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - principal;
    
    return {
      monthlyPayment: Math.round(monthlyPayment),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
      interestRate
    };
  };

  const handleLoanApplication = () => {
    if (!loanAmount || !loanPurpose || !repaymentPeriod) {
      toast({
        title: "Incomplete Application",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    applyForLoan({
      amount: parseFloat(loanAmount),
      purpose: loanPurpose,
      repaymentPeriodMonths: parseInt(repaymentPeriod)
    });

    // Reset form
    setLoanAmount('');
    setLoanPurpose('');
    setRepaymentPeriod('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800"><DollarSign className="h-3 w-3 mr-1" />Active</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'overdue':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Overdue</Badge>;
      case 'upcoming':
        return <Badge variant="outline"><Calendar className="h-3 w-3 mr-1" />Upcoming</Badge>;
      case 'paid':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const loanCalculation = calculateLoanDetails();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Loan Management</h2>
        <p className="text-muted-foreground">Apply for loans and manage repayments</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Loaned</p>
                <p className="text-lg font-bold"><CurrencyDisplay amount={loanStats.totalLoaned} /></p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Repaid</p>
                <p className="text-lg font-bold"><CurrencyDisplay amount={loanStats.totalRepaid} /></p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Active Loans</p>
                <p className="text-lg font-bold">{loanStats.activeLoans}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Default Rate</p>
                <p className="text-lg font-bold">{loanStats.defaultRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calculator className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Avg Interest</p>
                <p className="text-lg font-bold">{loanStats.avgInterestRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="apply" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="apply">Apply for Loan</TabsTrigger>
          <TabsTrigger value="portfolio">Loan Portfolio</TabsTrigger>
          <TabsTrigger value="repayments">Repayment Schedule</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="apply" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Loan Application</CardTitle>
                <CardDescription>Apply for a loan from your chama fund</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Loan Amount (KES)</label>
                  <Input
                    type="number"
                    placeholder="Enter loan amount"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Repayment Period</label>
                  <Select value={repaymentPeriod} onValueChange={setRepaymentPeriod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select repayment period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 months</SelectItem>
                      <SelectItem value="6">6 months</SelectItem>
                      <SelectItem value="12">12 months</SelectItem>
                      <SelectItem value="18">18 months</SelectItem>
                      <SelectItem value="24">24 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Purpose of Loan</label>
                  <Textarea
                    placeholder="Describe the purpose of your loan application"
                    value={loanPurpose}
                    onChange={(e) => setLoanPurpose(e.target.value)}
                  />
                </div>


                <Button 
                  onClick={handleLoanApplication} 
                  className="w-full"
                  disabled={isApplying}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {isApplying ? 'Submitting...' : 'Submit Application'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Loan Calculator</CardTitle>
                <CardDescription>Calculate your monthly payments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loanCalculation ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-3">Loan Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Loan Amount:</span>
                          <span className="font-medium"><CurrencyDisplay amount={parseFloat(loanAmount)} /></span>
                        </div>
                        <div className="flex justify-between">
                          <span>Interest Rate:</span>
                          <span className="font-medium">{loanCalculation.interestRate}% p.a.</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Repayment Period:</span>
                          <span className="font-medium">{repaymentPeriod} months</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="font-medium">Monthly Payment:</span>
                        <span className="text-lg font-bold text-blue-600">
                          <CurrencyDisplay amount={loanCalculation.monthlyPayment} />
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="font-medium">Total Interest:</span>
                        <span className="text-lg font-bold text-orange-600">
                          <CurrencyDisplay amount={loanCalculation.totalInterest} />
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="font-medium">Total Payment:</span>
                        <span className="text-lg font-bold text-gray-900">
                          <CurrencyDisplay amount={loanCalculation.totalPayment} />
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Enter loan amount and period to see calculations</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Loan Portfolio Overview</CardTitle>
              <CardDescription>Track loan issuance and repayment trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={loanPortfolio}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`KES ${value.toLocaleString()}`, 'Amount']} />
                  <Bar dataKey="issued" fill="#3b82f6" name="Loans Issued" />
                  <Bar dataKey="repaid" fill="#10b981" name="Repayments" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Portfolio Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Repayment Rate</span>
                      <span>97.5%</span>
                    </div>
                    <Progress value={97.5} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Fund Utilization</span>
                      <span>68%</span>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Low Risk:</span>
                    <span className="text-sm font-medium text-green-600">85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Medium Risk:</span>
                    <span className="text-sm font-medium text-yellow-600">12%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">High Risk:</span>
                    <span className="text-sm font-medium text-red-600">3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Available Funds</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    <CurrencyDisplay amount={1200000} />
                  </p>
                  <p className="text-sm text-muted-foreground">Available for lending</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="repayments" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Upcoming Repayments</CardTitle>
              <CardDescription>Track member loan repayment schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {repaymentSchedule.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {payment.borrower.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{payment.borrower}</p>
                        <p className="text-sm text-muted-foreground">Due: {payment.dueDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-bold"><CurrencyDisplay amount={payment.amount} /></p>
                        <p className="text-sm text-muted-foreground">Monthly payment</p>
                      </div>
                      {getStatusBadge(payment.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Loan Applications</CardTitle>
              <CardDescription>All member loan applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loanApplications.map((application, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {application.borrower.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{application.borrower}</p>
                        <p className="text-sm text-muted-foreground">{application.purpose}</p>
                        <p className="text-xs text-muted-foreground">Applied: {application.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-bold"><CurrencyDisplay amount={application.amount} /></p>
                        <p className="text-sm text-muted-foreground">
                          {application.dueDate ? `Due: ${application.dueDate}` : 'Pending approval'}
                        </p>
                      </div>
                      {getStatusBadge(application.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoanManagement;
