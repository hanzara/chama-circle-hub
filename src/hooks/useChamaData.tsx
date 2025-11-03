import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export const useChamaData = (chamaId: string) => {
  const queryClient = useQueryClient();

  // Query for chama details
  const { data: chama, isLoading: chamaLoading } = useQuery({
    queryKey: ['chama', chamaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chamas')
        .select('*')
        .eq('id', chamaId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!chamaId,
  });

  // Query for chama members
  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['chama-members', chamaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chama_members')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email,
            phone_number
          )
        `)
        .eq('chama_id', chamaId)
        .eq('is_active', true);

      if (error) throw error;
      return data;
    },
    enabled: !!chamaId,
  });

  // Set up real-time subscription for contributions
  useEffect(() => {
    if (!chamaId) return;

    const channel = supabase
      .channel(`chama-${chamaId}-contributions`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chama_contributions_new',
          filter: `chama_id=eq.${chamaId}`,
        },
        () => {
          // Invalidate all related queries when a contribution is made
          queryClient.invalidateQueries({ queryKey: ['chama-members', chamaId] });
          queryClient.invalidateQueries({ queryKey: ['chama-leaderboard', chamaId] });
          queryClient.invalidateQueries({ queryKey: ['chama', chamaId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chamaId, queryClient]);

  // Set up real-time subscription for member updates
  useEffect(() => {
    if (!chamaId) return;

    const channel = supabase
      .channel(`chama-${chamaId}-members`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chama_members',
          filter: `chama_id=eq.${chamaId}`,
        },
        () => {
          // Invalidate member queries when members change
          queryClient.invalidateQueries({ queryKey: ['chama-members', chamaId] });
          queryClient.invalidateQueries({ queryKey: ['chama-leaderboard', chamaId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chamaId, queryClient]);

  return {
    chama,
    members,
    isLoading: chamaLoading || membersLoading,
  };
};
