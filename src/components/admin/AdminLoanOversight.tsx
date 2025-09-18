
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Filter,
  Download,
  Search
} from 'lucide-react';

const AdminLoanOversight: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

  // Mock loan data
  const loans = [
    {
      id: 'L001',
      borrowerName: 'Joseph Nzai',
      chamaName: 'Makini Self Help Group',
      amount: 50000,
      interestRate: 12,
      status: 'active',
      riskLevel: 'low',
      region: 'Kilifi',
      disbursedDate: '2024-05-15',
      dueDate: '2024-11-15',
      repaidAmount: 20000,
      remainingAmount: 30000,
      creditScore: 785,
      repaymentRate: 95
    },
    {
      id: 'L002',
      borrowerName: 'Mary Wanjiku',
      chamaName: 'Women Empowerment',
      amount: 75000,
      interestRate: 15,
      status: 'overdue',
      riskLevel: 'high',
      region: 'Mombasa',
      disbursedDate: '2024-04-10',
      dueDate: '2024-10-10',
      repaidAmount: 25000,
      remainingAmount: 50000,
      creditScore: 620,
      repaymentRate: 65
    },
    {
      id: 'L003',
      borrowerName: 'Peter Otieno',
      chamaName: 'Youth Business Fund',
      amount: 30000,
      interestRate: 10,
      status: 'pending',
      riskLevel: 'medium',
      region: 'Kisumu',
      disbursedDate: null,
      dueDate: null,
      repaidAmount: 0,
      remainingAmount: 30000,
      creditScore: 680,
      repaymentRate: 80
    }
  ];

  const loanStats = {
    totalLoans: 8934,
    totalVolume: 456000000,
    activeLoans: 6750,
    overdueLoans: 234,
    avgRepaymentRate: 87.5,
    riskDistribution: {
      low: 60,
      medium: 25,
      high: 15
    }
  };

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.chamaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'all' || loan.riskLevel === riskFilter;
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    const matchesRegion = regionFilter === 'all' || loan.region === regionFilter;
    
    return matchesSearch && matchesRisk && matchesStatus && matchesRegion;
  });

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Loan Statistics */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loanStats.totalLoans.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All-time loans</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {(loanStats.totalVolume / 1000000).toFixed(0)}M</div>
            <p className="text-xs text-muted-foreground">Total disbursed</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{loanStats.activeLoans.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Loans</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{loanStats.overdueLoans}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repayment Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loanStats.avgRepaymentRate}%</div>
            <p className="text-xs text-muted-foreground">Platform average</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Loan Management & Oversight
          </CardTitle>
          <CardDescription>
            Monitor and manage all platform loans by risk level, status, and region
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search by borrower, chama, or loan ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="Nairobi">Nairobi</SelectItem>
                  <SelectItem value="Mombasa">Mombasa</SelectItem>
                  <SelectItem value="Kisumu">Kisumu</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loans List */}
      <div className="space-y-4">
        {filteredLoans.map((loan) => (
          <Card key={loan.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {loan.id}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{loan.borrowerName}</h3>
                      <p className="text-sm text-muted-foreground">{loan.chamaName}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-6 mb-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Amount</p>
                      <p className="font-semibold">KES {loan.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Interest Rate</p>
                      <p className="font-semibold">{loan.interestRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Repaid</p>
                      <p className="font-semibold text-green-600">KES {loan.repaidAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Remaining</p>
                      <p className="font-semibold text-orange-600">KES {loan.remainingAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Credit Score</p>
                      <p className={`font-semibold ${loan.creditScore >= 700 ? 'text-green-600' : loan.creditScore >= 600 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {loan.creditScore}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Repayment Rate</p>
                      <p className={`font-semibold ${loan.repaymentRate >= 80 ? 'text-green-600' : loan.repaymentRate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {loan.repaymentRate}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge className={getRiskBadgeColor(loan.riskLevel)}>
                      {loan.riskLevel.charAt(0).toUpperCase() + loan.riskLevel.slice(1)} Risk
                    </Badge>
                    <Badge className={getStatusBadgeColor(loan.status)}>
                      {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{loan.region}</span>
                    {loan.disbursedDate && (
                      <span className="text-sm text-muted-foreground">
                        Disbursed: {loan.disbursedDate}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  {loan.status === 'overdue' && (
                    <Button variant="destructive" size="sm">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Flag
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminLoanOversight;
