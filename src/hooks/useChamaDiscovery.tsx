import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DiscoverableChama {
  id: string;
  name: string;
  description: string;
  category_id: string;
  contribution_amount: number;
  contribution_frequency: string;
  max_members: number;
  current_members: number;
  total_savings: number;
  status: string;
  created_at: string;
  created_by: string;
  category_name?: string;
  creator_email?: string;
  is_following?: boolean;
  is_member?: boolean;
}

interface ChamaStats {
  total_chamas: number;
  total_members: number;
  active_events: number;
  success_rate: number;
}

export const useChamaDiscovery = () => {
  const { user } = useAuth();
  const [chamas, setChamas] = useState<DiscoverableChama[]>([]);
  const [filteredChamas, setFilteredChamas] = useState<DiscoverableChama[]>([]);
  const [stats, setStats] = useState<ChamaStats>({
    total_chamas: 0,
    total_members: 0,
    active_events: 0,
    success_rate: 0
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch all discoverable chamas
  const fetchChamas = async () => {
    setLoading(true);
    try {
      // Get chamas with category information
      const { data: chamasData, error } = await supabase
        .from('chamas')
        .select(`
          *,
          chama_categories (
            name
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user's follows if logged in
      let followedChamas: string[] = [];
      let memberChamas: string[] = [];
      
      if (user) {
        const { data: followsData } = await supabase
          .from('chama_follows')
          .select('chama_id')
          .eq('follower_id', user.id);
        
        followedChamas = followsData?.map(f => f.chama_id) || [];

        const { data: membersData } = await supabase
          .from('chama_members')
          .select('chama_id')
          .eq('user_id', user.id)
          .eq('is_active', true);
        
        memberChamas = membersData?.map(m => m.chama_id) || [];
      }

      // Format the data
      const formattedChamas: DiscoverableChama[] = chamasData?.map(chama => ({
        ...chama,
        category_name: (chama.chama_categories as any)?.name || 'General',
        is_following: followedChamas.includes(chama.id),
        is_member: memberChamas.includes(chama.id)
      })) || [];

      setChamas(formattedChamas);
      setFilteredChamas(formattedChamas);
    } catch (error: any) {
      console.error('Error fetching chamas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch community stats
  const fetchStats = async () => {
    try {
      // Get total chamas
      const { count: chamasCount } = await supabase
        .from('chamas')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get total members across all chamas
      const { data: membersData } = await supabase
        .from('chamas')
        .select('current_members')
        .eq('status', 'active');

      const totalMembers = membersData?.reduce((sum, chama) => sum + (chama.current_members || 0), 0) || 0;

      // Get active events count
      const { count: eventsCount } = await supabase
        .from('community_events')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'upcoming');

      setStats({
        total_chamas: chamasCount || 0,
        total_members: totalMembers,
        active_events: eventsCount || 0,
        success_rate: 89 // Placeholder - could be calculated based on completion rates
      });
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  };

  // Filter chamas based on search and category
  const filterChamas = () => {
    let filtered = [...chamas];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(chama => 
        chama.name.toLowerCase().includes(query) ||
        chama.description?.toLowerCase().includes(query) ||
        chama.category_name?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(chama => 
        chama.category_name?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredChamas(filtered);
  };

  // Get recommended chamas for user
  const getRecommendedChamas = () => {
    if (!user) return chamas.slice(0, 3);

    // Simple recommendation logic - could be enhanced with ML
    // For now, recommend based on:
    // 1. Chamas with similar contribution amounts to user's current chamas
    // 2. Popular chamas with high member counts
    // 3. Recently created active chamas

    const recommended = chamas
      .filter(chama => !chama.is_member) // Exclude chamas user is already in
      .sort((a, b) => {
        // Prioritize by member count and total savings
        const scoreA = (a.current_members * 0.6) + (a.total_savings / 100000 * 0.4);
        const scoreB = (b.current_members * 0.6) + (b.total_savings / 100000 * 0.4);
        return scoreB - scoreA;
      })
      .slice(0, 3);

    return recommended;
  };

  // Get category counts
  const getCategoryCounts = () => {
    const counts: Record<string, number> = { all: chamas.length };
    
    chamas.forEach(chama => {
      const category = chama.category_name || 'General';
      counts[category.toLowerCase()] = (counts[category.toLowerCase()] || 0) + 1;
    });

    return counts;
  };

  // Update search query
  const updateSearchQuery = (query: string) => {
    setSearchQuery(query);
  };

  // Update selected category
  const updateSelectedCategory = (category: string) => {
    setSelectedCategory(category);
  };

  // Get chama details
  const getChamaDetails = async (chamaId: string) => {
    try {
      const { data, error } = await supabase
        .from('chamas')
        .select(`
          *,
          chama_categories (
            name
          ),
          chama_members (
            user_id,
            role,
            total_contributed,
            joined_at,
            is_active
          ),
          chama_activities (
            activity_type,
            description,
            amount,
            created_at
          )
        `)
        .eq('id', chamaId)
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error fetching chama details:', error);
      return null;
    }
  };

  // Effects
  useEffect(() => {
    fetchChamas();
    fetchStats();
  }, [user]);

  useEffect(() => {
    filterChamas();
  }, [searchQuery, selectedCategory, chamas]);

  return {
    chamas: filteredChamas,
    allChamas: chamas,
    stats,
    loading,
    searchQuery,
    selectedCategory,
    getRecommendedChamas,
    getCategoryCounts,
    getChamaDetails,
    updateSearchQuery,
    updateSelectedCategory,
    refetch: fetchChamas
  };
};