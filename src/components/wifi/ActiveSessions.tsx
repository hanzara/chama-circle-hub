import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Clock, Wifi, Play, Square, RotateCcw } from 'lucide-react';

interface Session {
  id: string;
  session_token: string;
  voucher_code: string;
  status: string;
  start_time: string;
  end_time: string;
  data_used_mb: number;
  data_limit_mb: number | null;
  amount_paid: number;
  can_extend: boolean;
  wifi_hotspots: {
    name: string;
    network_ssid: string;
  };
  wifi_packages: {
    name: string;
    duration_minutes: number;
    is_stackable: boolean;
  };
}

export const ActiveSessions: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchActiveSessions();
    }
  }, [user]);

  useEffect(() => {
    // Load demo sessions from localStorage
    const purchases = JSON.parse(localStorage.getItem('wifi-purchases') || '[]');
    const activeSessions = purchases
      .filter((p: any) => p.status === 'active')
      .map((p: any) => ({
        id: p.id,
        session_token: `token_${p.id}`,
        voucher_code: `WIFI${p.id.slice(-6)}`,
        status: 'active',
        start_time: p.purchaseDate,
        end_time: p.expiresAt || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        data_used_mb: Math.floor(Math.random() * 500),
        data_limit_mb: p.dataLimit || null,
        amount_paid: p.price,
        can_extend: true,
        wifi_hotspots: {
          name: p.hotspot,
          network_ssid: `${p.hotspot.replace(/\s+/g, '_')}_5G`
        },
        wifi_packages: {
          name: p.packageName,
          duration_minutes: p.duration || 60,
          is_stackable: false
        }
      }));
    
    setSessions(activeSessions);
    setLoading(false);
  }, []);

  const fetchActiveSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('wifi_sessions')
        .select(`
          *,
          wifi_hotspots (name, network_ssid),
          wifi_packages (name, duration_minutes, is_stackable)
        `)
        .eq('user_id', user?.id)
        .in('status', ['active', 'extended'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error: any) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load active sessions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (endTime: string) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const diff = end - now;

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getDataUsagePercent = (used: number, limit: number | null) => {
    if (!limit) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Wifi className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No active sessions</p>
            <p className="text-sm text-muted-foreground mt-1">
              Purchase a package to start browsing
            </p>
          </CardContent>
        </Card>
      ) : (
        sessions.map((session) => (
          <Card key={session.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-green-500" />
                  {session.wifi_hotspots.name}
                </div>
                <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                  {session.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Network</p>
                  <p className="font-medium">{session.wifi_hotspots.network_ssid}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Package</p>
                  <p className="font-medium">{session.wifi_packages.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Time Left</p>
                  <p className="font-medium">{getTimeRemaining(session.end_time)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Voucher</p>
                  <p className="font-mono text-sm">{session.voucher_code}</p>
                </div>
              </div>

              {session.data_limit_mb && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Data Usage</span>
                    <span>{session.data_used_mb} MB / {session.data_limit_mb} MB</span>
                  </div>
                  <Progress value={getDataUsagePercent(session.data_used_mb, session.data_limit_mb)} />
                </div>
              )}

              <div className="flex gap-2">
                {session.can_extend && (
                  <Button size="sm" variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Extend Session
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  <Square className="h-4 w-4 mr-2" />
                  Terminate
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};