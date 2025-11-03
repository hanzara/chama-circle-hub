
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  User, 
  Building2,
  TrendingUp,
  Activity,
  Search,
  Shield
} from 'lucide-react';

const BankBorrowerVerification: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const borrowers = [
    {
      id: 'B001',
      name: 'John Kamau',
      email: 'john.kamau@email.com',
      phone: '+254701234567',
      nationalId: '12345678',
      creditScore: 785,
      kycStatus: 'verified',
      walletActivity: {
        totalTransactions: 245,
        averageBalance: 45000,
        lastActivity: '2024-07-14'
      },
      repaymentRecord: {
        totalLoans: 3,
        onTimePayments: 18,
        latePayments: 1,
        defaulted: 0,
        repaymentRate: 95
      },
      chamaParticipation: {
        activeMemberships: 3,
        totalContributions: 150000,
        leadershipRoles: 1
      },
      riskLevel: 'low',
      verifiedDocuments: ['National ID', 'Bank Statement', 'Salary Slip', 'Utility Bill'],
      pendingDocuments: []
    },
    {
      id: 'B002',
      name: 'Mary Wanjiku',
      email: 'mary.wanjiku@email.com',
      phone: '+254702345678',
      nationalId: '87654321',
      creditScore: 650,
      kycStatus: 'pending',
      walletActivity: {
        totalTransactions: 128,
        averageBalance: 28000,
        lastActivity: '2024-07-13'
      },
      repaymentRecord: {
        totalLoans: 2,
        onTimePayments: 8,
        latePayments: 3,
        defaulted: 0,
        repaymentRate: 73
      },
      chamaParticipation: {
        activeMemberships: 2,
        totalContributions: 95000,
        leadershipRoles: 0
      },
      riskLevel: 'medium',
      verifiedDocuments: ['National ID', 'Bank Statement'],
      pendingDocuments: ['Salary Slip', 'Business License']
    }
  ];

  const filteredBorrowers = borrowers.filter(borrower =>
    borrower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    borrower.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    borrower.phone.includes(searchTerm)
  );

  const getKycBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Verified
        </Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Pending
        </Badge>;
      default:
        return <Badge variant="secondary">Not Started</Badge>;
    }
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

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Borrower Verification Portal
          </CardTitle>
          <CardDescription>
            Review complete borrower profiles with Verdio ID, credit scores, and activity history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search borrowers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Borrower Profiles */}
      <div className="space-y-6">
        {filteredBorrowers.map((borrower) => (
          <Card key={borrower.id} className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    {borrower.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{borrower.name}</h3>
                    <p className="text-sm text-muted-foreground">ID: {borrower.id} • Verdio ID: {borrower.nationalId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getKycBadge(borrower.kycStatus)}
                  {getRiskBadge(borrower.riskLevel)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="wallet">Wallet Activity</TabsTrigger>
                  <TabsTrigger value="repayment">Repayment History</TabsTrigger>
                  <TabsTrigger value="chama">Chama Participation</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Credit Score</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl font-bold ${borrower.creditScore >= 700 ? 'text-green-600' : borrower.creditScore >= 600 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {borrower.creditScore}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {borrower.creditScore >= 700 ? 'Excellent' : borrower.creditScore >= 600 ? 'Good' : 'Fair'}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Contact Info</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1">
                          <p className="text-sm">{borrower.email}</p>
                          <p className="text-sm">{borrower.phone}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Repayment Rate</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl font-bold ${borrower.repaymentRecord.repaymentRate >= 90 ? 'text-green-600' : borrower.repaymentRecord.repaymentRate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {borrower.repaymentRecord.repaymentRate}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {borrower.repaymentRecord.totalLoans} loans
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Chama Activity</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{borrower.chamaParticipation.activeMemberships}</div>
                        <p className="text-xs text-muted-foreground">
                          Active memberships
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="wallet" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Total Transactions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{borrower.walletActivity.totalTransactions}</div>
                        <p className="text-xs text-muted-foreground">All-time transactions</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Average Balance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">KES {borrower.walletActivity.averageBalance.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">30-day average</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Last Activity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{borrower.walletActivity.lastActivity}</div>
                        <p className="text-xs text-muted-foreground">Most recent transaction</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="repayment" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Total Loans</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{borrower.repaymentRecord.totalLoans}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">On-Time Payments</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">{borrower.repaymentRecord.onTimePayments}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Late Payments</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{borrower.repaymentRecord.latePayments}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Defaults</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-600">{borrower.repaymentRecord.defaulted}</div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="chama" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Active Memberships</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{borrower.chamaParticipation.activeMemberships}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Total Contributions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">KES {borrower.chamaParticipation.totalContributions.toLocaleString()}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Leadership Roles</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{borrower.chamaParticipation.leadershipRoles}</div>
                        {borrower.chamaParticipation.leadershipRoles > 0 && (
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200 mt-2">
                            Leader
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Verified Documents
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {borrower.verifiedDocuments.map((doc, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
                              <FileText className="h-4 w-4 text-green-600" />
                              <span className="text-sm">{doc}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          Pending Documents
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {borrower.pendingDocuments.length > 0 ? (
                          <div className="space-y-2">
                            {borrower.pendingDocuments.map((doc, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                                <FileText className="h-4 w-4 text-yellow-600" />
                                <span className="text-sm">{doc}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-green-600">All documents verified</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  Full KYC Report
                </Button>
                <Button>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve for Funding
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BankBorrowerVerification;
