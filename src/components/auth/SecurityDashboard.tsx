import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Eye, 
  Lock, 
  AlertTriangle, 
  CheckCircle, 
  Monitor,
  Smartphone,
  MapPin,
  Clock,
  LogOut,
  Trash2,
  Settings,
  UserX,
  Activity
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  device_info: any;
  ip_address: string;
  location_data: any;
  is_active: boolean;
  expires_at: string;
  last_activity: string;
  created_at: string;
}

interface FraudLog {
  id: string;
  user_id: string;
  event_type: string;
  risk_score: number;
  details: any;
  ip_address: string;
  user_agent: string;
  location_data: any;
  action_taken: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

const SecurityDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [fraudLogs, setFraudLogs] = useState<FraudLog[]>([]);
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    emailNotifications: true,
    smsNotifications: false,
    autoLogoutTime: 30, // minutes
  });

  React.useEffect(() => {
    if (user) {
      fetchSessions();
      fetchFraudLogs();
      fetchSecuritySettings();
    }
  }, [user]);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .order('last_activity', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSessions((data || []).map(session => ({
        ...session,
        ip_address: session.ip_address as string || 'Unknown'
      })));
    } catch (error: any) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchFraudLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('fraud_detection_logs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      const logs: FraudLog[] = (data || []).map(log => ({
        id: log.id,
        user_id: log.user_id,
        event_type: log.event_type,
        risk_score: log.risk_score,
        details: log.details,
        ip_address: typeof log.ip_address === 'string' ? log.ip_address : 'Unknown',
        user_agent: log.user_agent,
        location_data: log.location_data,
        action_taken: log.action_taken,
        reviewed_by: log.reviewed_by,
        reviewed_at: log.reviewed_at,
        created_at: log.created_at,
      }));
      
      setFraudLogs(logs);
    } catch (error: any) {
      console.error('Error fetching fraud logs:', error);
    }
  };

  const fetchSecuritySettings = async () => {
    // This would fetch from a user_security_settings table
    // For now, we'll use default values
  };

  const terminateSession = async (sessionId: string) => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('id', sessionId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Session Terminated",
        description: "The selected session has been terminated",
      });

      fetchSessions();
    } catch (error: any) {
      console.error('Error terminating session:', error);
      toast({
        title: "Error",
        description: "Failed to terminate session",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const terminateAllSessions = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('user_id', user?.id)
        .neq('session_token', 'current'); // Keep current session active

      if (error) throw error;

      toast({
        title: "All Sessions Terminated",
        description: "All other sessions have been terminated. You remain logged in on this device.",
      });

      fetchSessions();
    } catch (error: any) {
      console.error('Error terminating all sessions:', error);
      toast({
        title: "Error",
        description: "Failed to terminate all sessions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resolveFraudLog = async (logId: string) => {
    try {
      const { error } = await supabase
        .from('fraud_detection_logs')
        .update({ action_taken: 'resolved_by_user' })
        .eq('id', logId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Alert Resolved",
        description: "The security alert has been marked as resolved",
      });

      fetchFraudLogs();
    } catch (error: any) {
      console.error('Error resolving fraud log:', error);
      toast({
        title: "Error",
        description: "Failed to resolve alert",
        variant: "destructive",
      });
    }
  };

  const getRiskScoreBadge = (score: number) => {
    if (score >= 70) return <Badge className="bg-red-100 text-red-800">High Risk</Badge>;
    if (score >= 40) return <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>;
    return <Badge className="bg-green-100 text-green-800">Low Risk</Badge>;
  };

  const getDeviceIcon = (deviceInfo: any) => {
    if (deviceInfo?.device_type === 'mobile') return <Smartphone className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">85%</div>
            <p className="text-xs text-muted-foreground">Good security posture</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.filter(s => s.is_active).length}</div>
            <p className="text-xs text-muted-foreground">Current devices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{fraudLogs.length}</div>
            <p className="text-xs text-muted-foreground">Unresolved alerts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">2FA Status</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {securitySettings.twoFactorEnabled ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {securitySettings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sessions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
          <TabsTrigger value="settings">Security Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Active Sessions
              </CardTitle>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={terminateAllSessions}
                disabled={loading}
                className="gap-2"
              >
                <UserX className="h-4 w-4" />
                Terminate All
              </Button>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active sessions found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.filter(session => session.is_active).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getDeviceIcon(session.device_info)}
                        <div>
                          <p className="font-medium">
                            {session.device_info?.browser || 'Unknown Browser'} on {session.device_info?.os || 'Unknown OS'}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {session.ip_address}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Last active: {new Date(session.last_activity).toLocaleString()}
                            </span>
                          </div>
                          {session.location_data?.city && (
                            <p className="text-xs text-muted-foreground">
                              {session.location_data.city}, {session.location_data.country}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => terminateSession(session.id)}
                        disabled={loading}
                        className="gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Terminate
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Security Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fraudLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>No security alerts - your account is secure!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {fraudLogs.map((log) => (
                    <Alert key={log.id} className="relative">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="pr-16">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium capitalize">{log.event_type.replace('_', ' ')}</span>
                          {getRiskScoreBadge(log.risk_score)}
                        </div>
                        <p className="text-sm mb-2">
                          Detected on {new Date(log.created_at).toLocaleString()}
                        </p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {log.event_type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </AlertDescription>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => resolveFraudLog(log.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Configure your security preferences to enhance account protection.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    {securitySettings.twoFactorEnabled ? 'Disable' : 'Enable'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive email alerts for security events
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    {securitySettings.emailNotifications ? 'Disable' : 'Enable'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">SMS Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive SMS alerts for critical security events
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    {securitySettings.smsNotifications ? 'Disable' : 'Enable'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto Logout</h4>
                    <p className="text-sm text-muted-foreground">
                      Automatically log out after {securitySettings.autoLogoutTime} minutes of inactivity
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h4 className="font-medium text-destructive mb-4">Danger Zone</h4>
                <div className="space-y-3">
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityDashboard;