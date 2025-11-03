import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface Invitation {
  id: string;
  email?: string | null;
  phone_number?: string | null;
  full_name?: string | null;
  created_at: string;
  expires_at?: string | null;
  status: 'pending' | 'pending_approval' | 'accepted' | 'rejected' | 'expired';
  role?: string | null;
  invitation_token?: string | null;
}

export const useInvitations = (chamaId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch invitations for the chama
  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ['invitations', chamaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('member_invitations')
        .select('id, email, phone_number, full_name, created_at, expires_at, status, role, invitation_token')
        .eq('chama_id', chamaId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Invitation[];
    },
    enabled: !!chamaId && !!user,
  });

  // Create invitation mutation
  const { mutate: createInvitation, isPending: isCreating } = useMutation({
    mutationFn: async ({ email, phoneNumber, role = 'member' }: { email?: string; phoneNumber?: string; role?: string }) => {
      // Create the invitation in the database
      const { data: invitationId, error } = await supabase.rpc('create_chama_invitation', {
        p_chama_id: chamaId,
        p_email: email || null,
        p_phone_number: phoneNumber || null,
        p_role: role,
      });

      if (error) throw error;

      let notificationSent = false;
      
      // If phone number or email is provided, try to send notification
      if (phoneNumber || email) {
        // Get chama details
        const { data: chamaData } = await supabase
          .from('chamas')
          .select('name')
          .eq('id', chamaId)
          .single();

        // Get invitation token
        const { data: invitationData } = await supabase
          .from('member_invitations')
          .select('invitation_token')
          .eq('id', invitationId)
          .single();

        if (invitationData?.invitation_token) {
          const inviteLink = `${window.location.origin}/join-chama?token=${invitationData.invitation_token}`;
          
          // For now, just copy the link to clipboard as SMS/Email aren't configured
          try {
            await navigator.clipboard.writeText(inviteLink);
            notificationSent = true;
          } catch (clipboardError) {
            console.error('Failed to copy to clipboard:', clipboardError);
          }
        }
      }

      return { invitationId, notificationSent };
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['invitations', chamaId] });
      toast({
        title: 'Invitation created',
        description: data?.notificationSent 
          ? 'Invitation link copied to clipboard. Share it with the member.' 
          : 'Invitation created. Share the link from the invitations list.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create invitation',
        variant: 'destructive',
      });
    },
  });

  // Revoke invitation mutation
  const { mutate: revokeInvitation } = useMutation({
    mutationFn: async (invitationId: string) => {
      const { data, error } = await supabase.rpc('revoke_chama_invitation', {
        p_invitation_id: invitationId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', chamaId] });
      toast({
        title: 'Invitation revoked',
        description: 'The invitation has been revoked successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to revoke invitation',
        variant: 'destructive',
      });
    },
  });

  // Approve join request mutation
  const { mutate: approveRequest, isPending: isApproving } = useMutation({
    mutationFn: async (invitationId: string) => {
      const { data, error } = await supabase.rpc('approve_join_request', {
        p_invitation_id: invitationId,
      });

      if (error) throw error;
      
      const result = data as { success?: boolean; message?: string } | null;
      if (result?.success === false) {
        throw new Error(result?.message || 'Failed to approve request');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', chamaId] });
      queryClient.invalidateQueries({ queryKey: ['chama-members', chamaId] });
      queryClient.invalidateQueries({ queryKey: ['chama-data'] });
      toast({
        title: 'Request approved',
        description: 'The member has been added to the chama',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve request',
        variant: 'destructive',
      });
    },
  });

  // Reject join request mutation
  const { mutate: rejectRequest, isPending: isRejecting } = useMutation({
    mutationFn: async (invitationId: string) => {
      const { data, error } = await supabase.rpc('reject_join_request', {
        p_invitation_id: invitationId,
      });

      if (error) throw error;
      
      const result = data as { success?: boolean; message?: string } | null;
      if (result?.success === false) {
        throw new Error(result?.message || 'Failed to reject request');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', chamaId] });
      toast({
        title: 'Request rejected',
        description: 'The join request has been rejected',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject request',
        variant: 'destructive',
      });
    },
  });

  return {
    invitations,
    isLoading,
    createInvitation,
    isCreating,
    revokeInvitation,
    approveRequest,
    isApproving,
    rejectRequest,
    isRejecting,
  };
};

export const useAcceptInvitation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (invitationToken: string) => {
      const { data, error } = await supabase.rpc('accept_chama_invitation', {
        invitation_token: invitationToken,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['user-chamas'] });
      queryClient.invalidateQueries({ queryKey: ['chama-members'] });
      queryClient.invalidateQueries({ queryKey: ['chama-data'] });
      
      if (data?.success) {
        toast({
          title: 'Success',
          description: data.message || 'You have joined the chama successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: data?.message || 'Failed to accept invitation',
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to accept invitation',
        variant: 'destructive',
      });
    },
  });

  return { mutate, isPending };
};
