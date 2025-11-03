import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ChamaMemberWithProfile {
  id: string;
  user_id: string;
  chama_id: string;
  role: string;
  is_active: boolean;
  joined_at: string;
  total_contributed: number;
  last_contribution_date: string | null;
  savings_balance: number;
  mgr_balance: number;
  mgr_turn_order: number;
  mgr_turn_date: string | null;
  merry_balance: number;
  withdrawal_locked: boolean;
  auto_debit_enabled: boolean;
  profiles?: {
    display_name?: string;
    email?: string;
    avatar_url?: string;
  };
}

export const useChamaMembers = (chamaId: string) => {
  return useQuery({
    queryKey: ['chama-members', chamaId],
    queryFn: async () => {
      console.log('Fetching members for chama:', chamaId);

      // Fetch members first
      const { data: members, error: membersError } = await supabase
        .from('chama_members')
        .select('*')
        .eq('chama_id', chamaId)
        .eq('is_active', true)
        .order('joined_at', { ascending: false });

      if (membersError) {
        console.error('Error fetching chama members:', membersError);
        throw membersError;
      }

      if (!members || members.length === 0) {
        console.log('No members found for chama');
        return [];
      }

      // Get user IDs to fetch profiles
      const userIds = members.map(m => m.user_id);

      // Fetch enhanced profiles for these users
      const { data: profiles } = await supabase
        .from('user_profiles_enhanced')
        .select('user_id, full_name, email')
        .in('user_id', userIds);

      // Create a map of profiles by user_id
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Transform to add profiles in expected format
      const transformedMembers: ChamaMemberWithProfile[] = members.map((member: any) => {
        const profile = profileMap.get(member.user_id);
        return {
          ...member,
          profiles: {
            display_name: profile?.full_name || 'Unknown Member',
            email: profile?.email || '',
            avatar_url: ''
          }
        };
      });

      console.log('Fetched chama members:', transformedMembers);
      return transformedMembers;
    },
    enabled: !!chamaId,
  });
};