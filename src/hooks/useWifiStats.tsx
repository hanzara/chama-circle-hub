import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useWifiStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['wifi-stats', user?.id],
    queryFn: async () => {
      if (!user) {
        return {
          nearbyHotspots: 0,
          activeSessions: 0,
          walletBalance: 0,
          dataUsedToday: '0.0'
        };
      }

      try {
        // Fetch nearby hotspots count
        const { count: hotspotsCount } = await (supabase as any)
          .from('wifi_hotspots')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true);

        // Fetch active sessions count
        const { count: sessionsCount } = await (supabase as any)
          .from('wifi_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .in('status', ['active', 'extended']);

        // Fetch wallet balance
        const { data: wallet } = await (supabase as any)
          .from('buyer_wallets')
          .select('balance')
          .eq('user_id', user.id)
          .maybeSingle();

        // Fetch today's data usage
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { data: todaySessions } = await (supabase as any)
          .from('wifi_sessions')
          .select('data_used_mb')
          .eq('user_id', user.id)
          .gte('start_time', today.toISOString());

        const dataUsedToday = todaySessions?.reduce(
          (sum: number, session: any) => sum + (session.data_used_mb || 0), 
          0
        ) || 0;

        return {
          nearbyHotspots: hotspotsCount || 0,
          activeSessions: sessionsCount || 0,
          walletBalance: wallet?.balance || 0,
          dataUsedToday: (dataUsedToday / 1024).toFixed(1) // Convert MB to GB
        };
      } catch (error) {
        console.error('Error fetching wifi stats:', error);
        return {
          nearbyHotspots: 0,
          activeSessions: 0,
          walletBalance: 0,
          dataUsedToday: '0.0'
        };
      }
    },
    enabled: !!user,
    refetchInterval: 30000 // Refetch every 30 seconds
  });
};
