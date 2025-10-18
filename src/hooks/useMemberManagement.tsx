import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { useChamaMembers } from './useChamaMembers';
import { useChamaRoles } from './useChamaRoles';

export const useMemberManagement = (chamaId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: members, isLoading } = useChamaMembers(chamaId);
  const { isAdmin, isTreasurer } = useChamaRoles(chamaId);

  const updateMemberRole = useMutation({
    mutationFn: async ({ memberId, newRole }: { memberId: string; newRole: string }) => {
      const { data, error } = await supabase.functions.invoke('assign-role', {
        body: {
          chamaId,
          targetMemberId: memberId,
          newRole: newRole
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chama-members', chamaId] });
      queryClient.invalidateQueries({ queryKey: ['user-chama-role'] });
      toast({
        title: 'Role Updated',
        description: 'Member role has been updated successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update role',
        variant: 'destructive'
      });
    }
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('chama_members')
        .update({ is_active: false })
        .eq('id', memberId);

      if (error) throw error;

      // Log activity
      await supabase.from('chama_activities').insert({
        chama_id: chamaId,
        member_id: memberId,
        activity_type: 'member_removed',
        description: 'Member was removed from the chama'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chama-members', chamaId] });
      toast({
        title: 'Member Removed',
        description: 'Member has been removed from the chama'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove member',
        variant: 'destructive'
      });
    }
  });

  return {
    members: members || [],
    isLoading,
    updateMemberRole: updateMemberRole.mutate,
    isUpdatingRole: updateMemberRole.isPending,
    removeMember: removeMember.mutate,
    isRemovingMember: removeMember.isPending,
    canManageRoles: isAdmin,
    canViewFinancials: isAdmin || isTreasurer
  };
};