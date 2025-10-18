
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  BarChart3, 
  FileDown, 
  Shield,
  Eye,
  CheckCircle,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Globe,
  Lock,
  Zap
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/hooks/useAuth';
import AdminLogin from '@/components/AdminLogin';
import BankLoanMarketplace from '@/components/bank/BankLoanMarketplace';
import BankBorrowerVerification from '@/components/bank/BankBorrowerVerification';
import BankComplianceView from '@/components/bank/BankComplianceView';
import BankImpactMetrics from '@/components/bank/BankImpactMetrics';
import BankAPIConsole from '@/components/bank/BankAPIConsole';
import BankAuditLogs from '@/components/bank/BankAuditLogs';

const BankPortalPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (role: 'admin' | 'bank') => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} type="bank" />;
  }

  const bankStats = {
    availableLoans: 234,
    fundedAmount: 25600000,
    activeInvestments: 156,
    impactReach: 5670,
    avgReturn: 12.5,
    verifiedBorrowers: 1890
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Bank Partner Portal
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            Access verified borrowers and fund impactful loans
          </p>
          <Badge variant="secondary" className="mt-2">
            <Building2 className="h-3 w-3 mr-1" />
            Verified Partner
          </Badge>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Loans</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{bankStats.availableLoans}</div>
              <p className="text-xs text-blue-600">Ready to fund</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Funded Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">KES {(bankStats.fundedAmount / 1000000).toFixed(1)}M</div>
              <p className="text-xs text-green-600">Total disbursed</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">{bankStats.activeInvestments}</div>
              <p className="text-xs text-purple-600">Performing loans</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Impact Reach</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">{bankStats.impactReach.toLocaleString()}</div>
              <p className="text-xs text-orange-600">Lives impacted</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-teal-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Return</CardTitle>
              <BarChart3 className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-700">{bankStats.avgReturn}%</div>
              <p className="text-xs text-teal-600">Annual return</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Borrowers</CardTitle>
              <CheckCircle className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-700">{bankStats.verifiedBorrowers.toLocaleString()}</div>
              <p className="text-xs text-indigo-600">KYC verified</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-7 bg-white/50 backdrop-blur-sm mb-6 overflow-x-auto">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span className="hidden sm:inline">Loans</span>
            </TabsTrigger>
            <TabsTrigger value="verification" className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span className="hidden sm:inline">Verify</span>
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span className="hidden sm:inline">KYC</span>
            </TabsTrigger>
            <TabsTrigger value="impact" className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              <span className="hidden sm:inline">Impact</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span className="hidden sm:inline">API</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              <span className="hidden sm:inline">Audit</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <BankImpactMetrics />
          </TabsContent>

          <TabsContent value="marketplace">
            <BankLoanMarketplace />
          </TabsContent>

          <TabsContent value="verification">
            <BankBorrowerVerification />
          </TabsContent>

          <TabsContent value="compliance">
            <BankComplianceView />
          </TabsContent>

          <TabsContent value="impact">
            <BankImpactMetrics />
          </TabsContent>

          <TabsContent value="api">
            <BankAPIConsole />
          </TabsContent>

          <TabsContent value="audit">
            <BankAuditLogs />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BankPortalPage;
