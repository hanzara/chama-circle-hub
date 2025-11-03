import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface ContributionNotification {
  id: string;
  member_name: string;
  amount: number;
  chama_name: string;
  timestamp: string;
}

export const useRealtimeContributions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recentContribution, setRecentContribution] = useState<ContributionNotification | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to contribution changes for chamas the user is a member of
    const channel = supabase
      .channel('contribution-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chama_contributions_new'
        },
        async (payload) => {
          const contribution = payload.new as any;

          // Fetch chama and member details
          const { data: memberData } = await supabase
            .from('chama_members')
            .select(`
              id,
              user_id,
              chama_id,
              chamas!inner(id, name),
              profiles:user_id(full_name, email)
            `)
            .eq('id', contribution.member_id)
            .single();

          if (!memberData) return;

          // Check if current user is a member of this chama
          const { data: isMember } = await supabase
            .from('chama_members')
            .select('id')
            .eq('chama_id', memberData.chama_id)
            .eq('user_id', user.id)
            .single();

          if (!isMember) return;

          const notification: ContributionNotification = {
            id: contribution.id,
            member_name: (memberData as any).profiles?.full_name || (memberData as any).profiles?.email || 'A member',
            amount: contribution.amount,
            chama_name: (memberData as any).chamas.name,
            timestamp: contribution.created_at
          };

          setRecentContribution(notification);

          // Show celebratory toast
          toast({
            title: '🎉 New Contribution!',
            description: `${notification.member_name} contributed KES ${notification.amount.toLocaleString()} to ${notification.chama_name}`,
            duration: 6000
          });

          // Clear the recent contribution after 5 seconds
          setTimeout(() => {
            setRecentContribution(null);
          }, 5000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, toast]);

  return { recentContribution };
};
