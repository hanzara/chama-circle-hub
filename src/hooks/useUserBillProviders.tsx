import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface UserBillProvider {
  id: string;
  user_id: string;
  provider_name: string;
  provider_type: 'paybill' | 'till' | 'account';
  paybill_number?: string;
  till_number?: string;
  account_number?: string;
  provider_code?: string;
  category: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export const useUserBillProviders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's custom bill providers
  const userBillProvidersQuery = useQuery({
    queryKey: ['user-bill-providers', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_bill_providers')
        .select('*')
        .eq('user_id', user.id)
        .order('is_favorite', { ascending: false })
        .order('provider_name', { ascending: true });

      if (error) throw error;
      return (data || []) as UserBillProvider[];
    },
    enabled: !!user,
  });

  // Add new bill provider
  const addBillProviderMutation = useMutation({
    mutationFn: async (providerData: Omit<UserBillProvider, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_bill_providers')
        .insert({
          user_id: user.id,
          ...providerData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-bill-providers'] });
      toast({
        title: "Success! 🎉",
        description: "Bill provider added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add bill provider",
        variant: "destructive",
      });
    },
  });

  // Update bill provider
  const updateBillProviderMutation = useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<Omit<UserBillProvider, 'id' | 'user_id' | 'created_at' | 'updated_at'>> 
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_bill_providers')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-bill-providers'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update bill provider",
        variant: "destructive",
      });
    },
  });

  // Delete bill provider
  const deleteBillProviderMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_bill_providers')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-bill-providers'] });
      toast({
        title: "Success",
        description: "Bill provider deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete bill provider",
        variant: "destructive",
      });
    },
  });

  // Toggle favorite status
  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ id, is_favorite }: { id: string; is_favorite: boolean }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_bill_providers')
        .update({ is_favorite: !is_favorite })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-bill-providers'] });
      toast({
        title: data.is_favorite ? "Added to favorites ⭐" : "Removed from favorites",
        description: `${data.provider_name} ${data.is_favorite ? 'added to' : 'removed from'} favorites`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update favorite status",
        variant: "destructive",
      });
    },
  });

  // Get providers by category
  const getProvidersByCategory = () => {
    const providers = userBillProvidersQuery.data || [];
    const categories: Record<string, UserBillProvider[]> = {};
    
    providers.forEach(provider => {
      const category = provider.category;
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(provider);
    });
    
    return categories;
  };

  // Get favorite providers
  const getFavoriteProviders = () => {
    const providers = userBillProvidersQuery.data || [];
    return providers.filter(provider => provider.is_favorite);
  };

  return {
    // Data
    userBillProviders: userBillProvidersQuery.data || [],
    providersByCategory: getProvidersByCategory(),
    favoriteProviders: getFavoriteProviders(),
    
    // Loading states
    isLoading: userBillProvidersQuery.isLoading,
    
    // Actions
    addBillProvider: addBillProviderMutation.mutate,
    updateBillProvider: updateBillProviderMutation.mutate,
    deleteBillProvider: deleteBillProviderMutation.mutate,
    toggleFavorite: toggleFavoriteMutation.mutate,
    
    // Mutation states
    isAdding: addBillProviderMutation.isPending,
    isUpdating: updateBillProviderMutation.isPending,
    isDeleting: deleteBillProviderMutation.isPending,
    isTogglingFavorite: toggleFavoriteMutation.isPending,
  };
};