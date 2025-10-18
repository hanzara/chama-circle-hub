import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { 
  Shield, 
  Users, 
  Activity, 
  Settings, 
  LogOut, 
  Key,
  Database,
  BarChart3,
  Lock,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const PortalDashboard = () => {
  const { portalUser, logout, isAdmin, isSuperAdmin } = usePortalAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeChamas: 0,
    totalTransactions: 0,
    systemHealth: 'Good'
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch basic stats (simplified for demo)
      const { data: users } = await supabase.from('profiles').select('id', { count: 'exact' });
      const { data: chamas } = await supabase.from('chamas').select('id', { count: 'exact' });
      
      setStats({
        totalUsers: users?.length || 0,
        activeChamas: chamas?.length || 0,
        totalTransactions: 1250, // Demo data
        systemHealth: 'Good'
      });

      // Fetch recent portal access logs
      if (isAdmin()) {
        const { data: logs } = await supabase
          .from('portal_access_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        
        setRecentActivity(logs || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCredential = async (accessLevel: string) => {
    try {
      const { data, error } = await supabase.rpc('create_portal_credential', {
        p_access_level: accessLevel,
        p_max_uses: 5,
        p_expires_hours: 24
      });

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        toast({
          title: "Credential Created",
          description: `New ${accessLevel} credential: ${result.credential_code}`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Portal Dashboard</h1>
                <p className="text-xs text-muted-foreground">ChamaWallet Administration</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">{portalUser?.username}</p>
                <Badge variant={portalUser?.access_level === 'super_admin' ? 'default' : 'secondary'}>
                  {portalUser?.access_level?.toUpperCase()}
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Database className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.activeChamas}</p>
                  <p className="text-sm text-muted-foreground">Active Chamas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalTransactions}</p>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.systemHealth}</p>
                  <p className="text-sm text-muted-foreground">System Status</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            {isAdmin() && <TabsTrigger value="credentials">Access Control</TabsTrigger>}
            <TabsTrigger value="activity">Activity Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Overview</CardTitle>
                  <CardDescription>Current system status and health metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Database Status</span>
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Online
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Authentication Service</span>
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Operational
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>M-Pesa Integration</span>
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isSuperAdmin() && (
                    <>
                      <Button variant="outline" className="w-full justify-start" onClick={() => createCredential('admin')}>
                        <Key className="h-4 w-4 mr-2" />
                        Generate Admin Credential
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => createCredential('member')}>
                        <Users className="h-4 w-4 mr-2" />
                        Generate Member Credential
                      </Button>
                    </>
                  )}
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    System Configuration
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage platform users and their access levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">User management features coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {isAdmin() && (
            <TabsContent value="credentials">
              <Card>
                <CardHeader>
                  <CardTitle>Access Control</CardTitle>
                  <CardDescription>Manage portal access credentials and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-24 flex-col"
                      onClick={() => createCredential('admin')}
                    >
                      <Shield className="h-6 w-6 mb-2" />
                      Create Admin Access
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-24 flex-col"
                      onClick={() => createCredential('member')}
                    >
                      <Users className="h-6 w-6 mb-2" />
                      Create Member Access
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Activity Logs</CardTitle>
                <CardDescription>Recent portal access and system activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{activity.action}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant={activity.success ? 'default' : 'destructive'}>
                          {activity.success ? 'Success' : 'Failed'}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};