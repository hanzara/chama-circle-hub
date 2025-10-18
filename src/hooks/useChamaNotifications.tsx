import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useChamaNotifications = (chamaId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ['chama-notifications', user?.id, chamaId],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('chama_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (chamaId) {
        query = query.eq('chama_id', chamaId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('chama_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chama-notifications'] });
    }
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user) return;

      const { error } = await supabase
        .from('chama_notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chama-notifications'] });
    }
  });

  const unreadCount = notificationsQuery.data?.filter(n => !n.is_read).length || 0;

  return {
    notifications: notificationsQuery.data || [],
    isLoading: notificationsQuery.isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead
  };
};