import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useAnalyticsData = (chamaId: string) => {
  return useQuery({
    queryKey: ['analytics-data', chamaId],
    queryFn: async () => {
      console.log('Fetching analytics data for chama:', chamaId);

      // Get member growth data
      const { data: memberData, error: memberError } = await (supabase as any)
        .from('chama_members')
        .select('joined_at, is_active')
        .eq('chama_id', chamaId)
        .order('joined_at', { ascending: true });

      if (memberError) {
        console.error('Error fetching member data:', memberError);
      }

      // Process member growth data
      const memberGrowth = (memberData as any[])?.reduce((acc: any[], member: any, index: number) => {
        const date = new Date(member.joined_at).toLocaleDateString();
        const existingEntry = acc.find(entry => entry.date === date);
        
        if (existingEntry) {
          existingEntry.totalMembers += 1;
          if (member.is_active) existingEntry.activeMembers += 1;
        } else {
          acc.push({
            date,
            totalMembers: index + 1,
            activeMembers: member.is_active ? index + 1 : index,
          });
        }
        
        return acc;
      }, []) || [];

      // Get financial data
      const { data: contributionData, error: contributionError } = await (supabase as any)
        .from('chama_contributions_new')
        .select('amount, contribution_date')
        .eq('chama_id', chamaId)
        .order('contribution_date', { ascending: true });

      if (contributionError) {
        console.error('Error fetching contribution data:', contributionError);
      }

      // Process contribution trends
      const contributionTrends = (contributionData as any[])?.reduce((acc: any[], contribution: any) => {
        const month = new Date(contribution.contribution_date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        
        const existingEntry = acc.find(entry => entry.month === month);
        
        if (existingEntry) {
          existingEntry.amount += Number(contribution.amount);
          existingEntry.count += 1;
        } else {
          acc.push({
            month,
            amount: Number(contribution.amount),
            count: 1,
          });
        }
        
        return acc;
      }, []) || [];

      // Calculate summary statistics
      const totalContributions = (contributionData as any[])?.reduce((sum: number, c: any) => sum + Number(c.amount), 0) || 0;
      const averageContribution = (contributionData as any[])?.length ? totalContributions / (contributionData as any[]).length : 0;
      const activeMembers = (memberData as any[])?.filter((m: any) => m.is_active).length || 0;
      const totalMembers = (memberData as any[])?.length || 0;

      return {
        memberGrowth,
        contributionTrends,
        summary: {
          totalContributions,
          averageContribution,
          activeMembers,
          totalMembers,
          memberRetentionRate: totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0,
        },
      };
    },
    enabled: !!chamaId,
  });
};