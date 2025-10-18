import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useMarketplaceChamas = () => {
  return useQuery({
    queryKey: ['marketplace-chamas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chamas')
        .select('*')
        .eq('is_marketplace_chama', true)
        .is('purchased_by', null)
        .eq('status', 'active')
        .order('max_members', { ascending: true });

      if (error) throw error;
      return data;
    }
  });
};

export const usePurchaseMarketplaceChama = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chamaId, amount }: { chamaId: string; amount: number }) => {
      if (!user) throw new Error('User not authenticated');

      const { data: updatedChama, error: updateError } = await supabase
        .from('chamas')
        .update({
          purchased_by: user.id,
          purchased_at: new Date().toISOString(),
          purchase_amount: amount
        })
        .eq('id', chamaId)
        .select()
        .single();

      if (updateError) throw updateError;

      const { error: memberError } = await supabase
        .from('chama_members')
        .insert({
          chama_id: chamaId,
          user_id: user.id,
          role: 'admin',
          is_active: true
        });

      if (memberError) throw memberError;

      return updatedChama;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-chamas'] });
      queryClient.invalidateQueries({ queryKey: ['user-chamas'] });
      toast({
        title: "Chama Purchased! 🎉",
        description: "You now own this chama and can start inviting members."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase chama",
        variant: "destructive"
      });
    }
  });
};
