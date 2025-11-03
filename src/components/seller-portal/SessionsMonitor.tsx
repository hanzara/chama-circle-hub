import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Wifi, 
  Clock, 
  Activity, 
  Zap,
  Search,
  RefreshCw
} from 'lucide-react';

interface Session {
  id: string;
  hotspot_id: string;
  buyer_id: string | null;
  voucher_code: string | null;
  started_at: string;
  expires_at: string | null;
  bytes_used: number;
  status: 'active' | 'expired' | 'disconnected';
  device_info: any;
  hotspots?: {
    name: string;
    address: string | null;
  };
}

interface SessionsMonitorProps {
  sellerId: string;
}

export function SessionsMonitor({ sellerId }: SessionsMonitorProps) {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterHotspot, setFilterHotspot] = useState('all');

  useEffect(() => {
    fetchSessionsData();
    // Set up real-time updates
    const interval = setInterval(fetchSessionsData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [sellerId]);

  const fetchSessionsData = async () => {
    try {
      // Fetch hotspots first
      const { data: hotspotsData, error: hotspotsError } = await supabase
        .from('hotspots')
        .select('id, name, address')
        .eq('seller_id', sellerId)
        .eq('verified', true);

      if (hotspotsError) throw hotspotsError;
      setHotspots(hotspotsData || []);

      if (!hotspotsData || hotspotsData.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch sessions for seller's hotspots
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('hotspot_sessions')
        .select(`
          *,
          hotspots!hotspot_sessions_hotspot_id_fkey (
            name, address
          )
        `)
        .in('hotspot_id', hotspotsData.map(h => h.id))
        .order('started_at', { ascending: false });

      if (sessionsError) throw sessionsError;
      setSessions((sessionsData || []) as Session[]);
    } catch (error: any) {
      console.error('Error fetching sessions data:', error);
      toast({
        title: "Error",
        description: "Failed to load sessions data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('hotspot_sessions')
        .update({ 
          status: 'disconnected',
          expires_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: "Session Disconnected",
        description: "User session has been terminated",
      });

      fetchSessionsData();
    } catch (error: any) {
      console.error('Error disconnecting session:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect session",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (session: Session) => {
    const isExpired = session.expires_at && new Date(session.expires_at) < new Date();
    
    if (session.status === 'disconnected') {
      return <Badge variant="secondary">Disconnected</Badge>;
    }
    if (isExpired || session.status === 'expired') {
      return <Badge variant="outline" className="text-orange-600">Expired</Badge>;
    }
    return <Badge className="bg-green-600">Active</Badge>;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTimeRemaining = (expiresAt: string | null) => {
    if (!expiresAt) return 'Unlimited';
    
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffMs = expires.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Expired';
    
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`;
    }
    return `${diffMins}m`;
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = searchTerm === '' || 
      session.voucher_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.hotspots?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || session.status === filterStatus;
    const matchesHotspot = filterHotspot === 'all' || session.hotspot_id === filterHotspot;
    
    return matchesSearch && matchesStatus && matchesHotspot;
  });

  const activeSessions = sessions.filter(s => s.status === 'active').length;
  const totalDataUsed = sessions.reduce((sum, s) => sum + s.bytes_used, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (hotspots.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Wifi className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Verified Hotspots</h3>
        <p className="text-muted-foreground">
          You need verified hotspots to monitor user sessions.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Active Sessions</h2>
          <p className="text-muted-foreground">Monitor and manage user connections in real-time</p>
        </div>
        
        <Button variant="outline" onClick={fetchSessionsData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
              <p className="text-2xl font-bold text-green-600">{activeSessions}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
              <p className="text-2xl font-bold">{sessions.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data Used</p>
              <p className="text-2xl font-bold">{formatBytes(totalDataUsed)}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Zap className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by voucher code or hotspot..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="disconnected">Disconnected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterHotspot} onValueChange={setFilterHotspot}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Hotspot" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hotspots</SelectItem>
              {hotspots.map((hotspot) => (
                <SelectItem key={hotspot.id} value={hotspot.id}>
                  {hotspot.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Sessions List */}
      <Card className="p-6">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h4 className="text-lg font-semibold mb-2">No Sessions Found</h4>
            <p className="text-muted-foreground">
              {sessions.length === 0 
                ? "No user sessions yet. Sessions will appear here when customers connect to your hotspots."
                : "No sessions match your current filters."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Wifi className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{session.hotspots?.name}</span>
                      {getStatusBadge(session)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {session.voucher_code ? `Voucher: ${session.voucher_code}` : 'Direct connection'}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Data: {formatBytes(session.bytes_used)}</span>
                      <span>Time left: {getTimeRemaining(session.expires_at)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Started: {new Date(session.started_at).toLocaleString()}</p>
                    {session.expires_at && (
                      <p>Expires: {new Date(session.expires_at).toLocaleString()}</p>
                    )}
                  </div>
                  
                  {session.status === 'active' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDisconnectSession(session.id)}
                    >
                      Disconnect
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}