import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeWallet } from '@/hooks/useRealtimeWallet';

interface DashboardData {
  walletBalance: number;
  recentTransactions: any[];
  upcomingContributions: any[];
  activeChamas: any[];
  savingsGoals: any[];
  notifications: any[];
  reputationScore: number;
  verified: boolean;
}

export const useDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Use real-time wallet balance
  const { balance: realtimeBalance, isLoading: isWalletLoading } = useRealtimeWallet();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch dashboard data
  const dashboardQuery = useQuery({
    queryKey: ['dashboard', user?.id],
    queryFn: async (): Promise<DashboardData> => {
      if (!user?.id) throw new Error('User not authenticated');

      try {
        // Get authorization header
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error('No session token');

        // Call the edge function to get composed dashboard data
        const { data, error } = await supabase.functions.invoke('get-dashboard-data', {
          body: { userId: user.id },
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        if (error) throw error;

        setLastUpdated(new Date());
        return data;
      } catch (error) {
        console.error('Dashboard fetch error:', error);
        throw error;
      }
    },
    enabled: !!user?.id && !isOffline,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 5000, // Data is fresh for 5 seconds
  });

  // Track dashboard analytics
  const trackDashboardEvent = async (eventType: string, metadata?: any) => {
    try {
      await supabase.functions.invoke('track-analytics', {
        body: {
          event: eventType,
          userId: user?.id,
          metadata,
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  };

  // Refresh dashboard data
  const refreshDashboard = () => {
    if (isOffline) {
      toast({
        title: "Offline",
        description: "Cannot refresh while offline",
        variant: "destructive",
      });
      return;
    }
    
    dashboardQuery.refetch();
    trackDashboardEvent('dashboard_refresh');
  };

  // Quick action handlers
  const handleQuickAction = (actionType: 'add_money' | 'send' | 'request_loan' | 'join_chama' | 'make_contribution' | 'withdraw') => {
    if (isOffline && (actionType === 'add_money' || actionType === 'send' || actionType === 'make_contribution' || actionType === 'withdraw')) {
      toast({
        title: "Offline",
        description: "Money operations are not available offline",
        variant: "destructive",
      });
      return;
    }

    trackDashboardEvent('quick_action_used', { type: actionType });
    
    return actionType; // Return the action type so the component can handle it
  };

  // Merge real-time balance with dashboard data
  const enhancedData = dashboardQuery.data ? {
    ...dashboardQuery.data,
    walletBalance: realtimeBalance, // Use real-time balance
  } : undefined;

  return {
    data: enhancedData,
    isLoading: dashboardQuery.isLoading || isWalletLoading,
    error: dashboardQuery.error,
    isOffline,
    lastUpdated,
    refreshDashboard,
    handleQuickAction,
    trackDashboardEvent,
  };
};