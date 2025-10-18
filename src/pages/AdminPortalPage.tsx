
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  Building2, 
  BarChart3, 
  FileDown, 
  MessageSquare,
  Shield,
  Brain,
  Eye,
  TestTube,
  DollarSign,
  UserCog,
  Search,
  Filter,
  Ban,
  CheckCircle,
  AlertTriangle,
  Settings
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/hooks/useAuth';
import AdminLogin from '@/components/AdminLogin';
import AdminUserDirectory from '@/components/admin/AdminUserDirectory';
import AdminGroupOversight from '@/components/admin/AdminGroupOversight';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import AdminLoanOversight from '@/components/admin/AdminLoanOversight';
import AdminUserManagement from '@/components/admin/AdminUserManagement';
import AdminCreditEngine from '@/components/admin/AdminCreditEngine';
import AdminMessaging from '@/components/admin/AdminMessaging';
import { AdminSellerVerification } from '@/components/admin/AdminSellerVerification';

const AdminPortalPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (role: 'admin' | 'bank') => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} type="admin" />;
  }

  const adminStats = {
    totalUsers: 12547,
    activeChamas: 1432,
    totalLoans: 8934,
    platformVolume: 45600000,
    pendingVerifications: 234,
    flaggedActivities: 12
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Admin Portal
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete platform oversight and management
          </p>
          <Badge variant="destructive" className="mt-2">
            <Shield className="h-3 w-3 mr-1" />
            Super Admin Access
          </Badge>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid gap-4 md:grid-cols-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Chamas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats.activeChamas.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats.totalLoans.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+15% from last month</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Volume</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KES {(adminStats.platformVolume / 1000000).toFixed(1)}M</div>
              <p className="text-xs text-muted-foreground">+22% from last month</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{adminStats.pendingVerifications}</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Flagged Activities</CardTitle>
              <Ban className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{adminStats.flaggedActivities}</div>
              <p className="text-xs text-muted-foreground">Urgent review needed</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 bg-white/50 backdrop-blur-sm mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              <span className="hidden sm:inline">Groups</span>
            </TabsTrigger>
            <TabsTrigger value="loans" className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              <span className="hidden sm:inline">Loans</span>
            </TabsTrigger>
            <TabsTrigger value="sellers" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span className="hidden sm:inline">Sellers</span>
            </TabsTrigger>
            <TabsTrigger value="management" className="flex items-center gap-1">
              <UserCog className="h-3 w-3" />
              <span className="hidden sm:inline">Manage</span>
            </TabsTrigger>
            <TabsTrigger value="credit" className="flex items-center gap-1">
              <Brain className="h-3 w-3" />
              <span className="hidden sm:inline">Credit</span>
            </TabsTrigger>
            <TabsTrigger value="messaging" className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center gap-1">
              <TestTube className="h-3 w-3" />
              <span className="hidden sm:inline">A/B Test</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1">
              <Settings className="h-3 w-3" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminAnalytics />
          </TabsContent>

          <TabsContent value="users">
            <AdminUserDirectory />
          </TabsContent>

          <TabsContent value="groups">
            <AdminGroupOversight />
          </TabsContent>

          <TabsContent value="loans">
            <AdminLoanOversight />
          </TabsContent>

          <TabsContent value="sellers">
            <AdminSellerVerification />
          </TabsContent>

          <TabsContent value="management">
            <AdminUserManagement />
          </TabsContent>

          <TabsContent value="credit">
            <AdminCreditEngine />
          </TabsContent>

          <TabsContent value="messaging">
            <AdminMessaging />
          </TabsContent>

          <TabsContent value="testing">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  A/B Testing Console
                </CardTitle>
                <CardDescription>
                  Test new features and improvements with specific user segments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>A/B Testing features coming soon...</p>
                    <p className="text-sm">Set up experiments, control groups, and measure feature impact</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Platform Settings
                  </CardTitle>
                  <CardDescription>
                    Configure platform-wide settings and policies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="transaction-fee">Transaction Fee (%)</Label>
                        <Input id="transaction-fee" type="number" defaultValue="2.5" />
                      </div>
                      <div>
                        <Label htmlFor="loan-processing-fee">Loan Processing Fee (KES)</Label>
                        <Input id="loan-processing-fee" type="number" defaultValue="500" />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button>Save Settings</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Admin Demo Integration */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    Admin Demo
                  </CardTitle>
                  <CardDescription>
                    Interactive demo environment for testing admin features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <iframe 
                    src="/admin-demo" 
                    className="w-full h-[600px] border rounded-lg"
                    title="Admin Demo"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPortalPage;
