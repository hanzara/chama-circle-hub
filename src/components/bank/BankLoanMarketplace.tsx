
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Target, 
  DollarSign, 
  TrendingUp, 
  Eye, 
  HandCoins,
  Search,
  Filter,
  Calendar,
  User,
  Building2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BankLoanMarketplace: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [amountFilter, setAmountFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const availableLoans = [
    {
      id: 'L001',
      borrowerName: 'John Kamau',
      type: 'individual',
      chamaName: 'Unity Savings Group',
      amount: 50000,
      interestRate: 12,
      term: 12,
      purpose: 'Small business expansion',
      creditScore: 785,
      riskLevel: 'low',
      applicationDate: '2024-07-10',
      requiredAmount: 50000,
      fundedAmount: 0,
      fundingProgress: 0,
      monthlyIncome: 35000,
      collateral: 'Business equipment',
      repaymentHistory: 95
    },
    {
      id: 'L002',
      borrowerName: 'Women Empowerment Chama',
      type: 'group',
      chamaName: 'Women Empowerment Chama',
      amount: 200000,
      interestRate: 10,
      term: 18,
      purpose: 'Group farming project',
      creditScore: 820,
      riskLevel: 'low',
      applicationDate: '2024-07-12',
      requiredAmount: 200000,
      fundedAmount: 75000,
      fundingProgress: 37.5,
      monthlyIncome: 180000,
      collateral: 'Farm equipment & land lease',
      repaymentHistory: 98
    },
    {
      id: 'L003',
      borrowerName: 'Peter Otieno',
      type: 'individual',
      chamaName: 'Youth Business Fund',
      amount: 75000,
      interestRate: 15,
      term: 24,
      purpose: 'Motorcycle taxi business',
      creditScore: 650,
      riskLevel: 'medium',
      applicationDate: '2024-07-13',
      requiredAmount: 75000,
      fundedAmount: 25000,
      fundingProgress: 33.3,
      monthlyIncome: 28000,
      collateral: 'Motorcycle',
      repaymentHistory: 82
    }
  ];

  const filteredLoans = availableLoans.filter(loan => {
    const matchesSearch = loan.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.chamaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'all' || loan.riskLevel === riskFilter;
    const matchesAmount = amountFilter === 'all' || 
                         (amountFilter === 'small' && loan.amount <= 50000) ||
                         (amountFilter === 'medium' && loan.amount > 50000 && loan.amount <= 100000) ||
                         (amountFilter === 'large' && loan.amount > 100000);
    const matchesType = typeFilter === 'all' || loan.type === typeFilter;
    
    return matchesSearch && matchesRisk && matchesAmount && matchesType;
  });

  const handleFundLoan = (loanId: string, borrowerName: string, amount: number) => {
    console.log(`Funding loan ${loanId} for ${borrowerName}`);
    toast({
      title: "Funding Initiated! 💰",
      description: `Funding process started for ${borrowerName}'s loan of KES ${amount.toLocaleString()}.`,
    });
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Low Risk</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium Risk</Badge>;
      case 'high':
        return <Badge className="bg-red-100 text-red-800 border-red-200">High Risk</Badge>;
      default:
        return <Badge variant="outline">{risk}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === 'group' ? (
      <Badge className="bg-purple-100 text-purple-800 border-purple-200">
        <Building2 className="h-3 w-3 mr-1" />
        Group Loan
      </Badge>
    ) : (
      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
        <User className="h-3 w-3 mr-1" />
        Individual
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Marketplace Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Loans</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{availableLoans.length}</div>
            <p className="text-xs text-blue-600">Ready to fund</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Demand</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              KES {(availableLoans.reduce((sum, loan) => sum + loan.amount, 0) / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-green-600">Funding needed</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Interest</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {(availableLoans.reduce((sum, loan) => sum + loan.interestRate, 0) / availableLoans.length).toFixed(1)}%
            </div>
            <p className="text-xs text-purple-600">Expected return</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Risk Loans</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {availableLoans.filter(loan => loan.riskLevel === 'low').length}
            </div>
            <p className="text-xs text-green-600">Prime opportunities</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Loan Marketplace
          </CardTitle>
          <CardDescription>
            Browse and fund verified loan requests from individuals and groups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by borrower, chama, or purpose..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                </SelectContent>
              </Select>

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

              <Select value={amountFilter} onValueChange={setAmountFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Amount" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Amounts</SelectItem>
                  <SelectItem value="small">≤ 50K</SelectItem>
                  <SelectItem value="medium">50K - 100K</SelectItem>
                  <SelectItem value="large">&gt; 100K</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loan Listings */}
      <div className="space-y-4">
        {filteredLoans.map((loan) => (
          <Card key={loan.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {loan.id}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{loan.borrowerName}</h3>
                      <p className="text-sm text-muted-foreground">{loan.chamaName}</p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-4">
                    {getTypeBadge(loan.type)}
                    {getRiskBadge(loan.riskLevel)}
                    <Badge variant="outline">
                      <Calendar className="h-3 w-3 mr-1" />
                      {loan.term} months
                    </Badge>
                  </div>

                  {/* Loan Details Grid */}
                  <div className="grid gap-4 md:grid-cols-6 mb-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Loan Amount</p>
                      <p className="font-semibold text-lg">KES {loan.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Interest Rate</p>
                      <p className="font-semibold text-green-600">{loan.interestRate}% p.a.</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Credit Score</p>
                      <p className={`font-semibold ${loan.creditScore >= 700 ? 'text-green-600' : loan.creditScore >= 600 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {loan.creditScore}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Monthly Income</p>
                      <p className="font-semibold">KES {loan.monthlyIncome.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Repayment Rate</p>
                      <p className={`font-semibold ${loan.repaymentHistory >= 90 ? 'text-green-600' : loan.repaymentHistory >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {loan.repaymentHistory}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Funding Progress</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${loan.fundingProgress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium">{loan.fundingProgress.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Loan Purpose */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-muted-foreground">Purpose</p>
                    <p className="font-medium">{loan.purpose}</p>
                  </div>

                  {/* Collateral */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-muted-foreground">Collateral</p>
                    <p className="font-medium">{loan.collateral}</p>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Applied: {loan.applicationDate} • Funded: KES {loan.fundedAmount.toLocaleString()} / KES {loan.requiredAmount.toLocaleString()}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View Profile
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleFundLoan(loan.id, loan.borrowerName, loan.amount)}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    <HandCoins className="h-4 w-4 mr-1" />
                    Fund Loan
                  </Button>
                  <Button variant="outline" size="sm">
                    Co-Fund
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BankLoanMarketplace;
