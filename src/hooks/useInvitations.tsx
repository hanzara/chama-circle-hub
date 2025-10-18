import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Invitation {
  id: string;
  email?: string | null;
  phone_number?: string | null;
  created_at: string;
  expires_at?: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
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
        .select('id, email, phone_number, created_at, expires_at, status, role, invitation_token')
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

      // If phone number is provided, send SMS
      if (phoneNumber) {
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

        // Get inviter name
        const { data: profileData } = await supabase
          .from('user_profiles_enhanced')
          .select('full_name')
          .eq('user_id', user?.id)
          .single();

        if (invitationData?.invitation_token) {
          // Send SMS via edge function
          const { error: smsError } = await supabase.functions.invoke('send-sms-invitation', {
            body: {
              phoneNumber,
              chamaName: chamaData?.name || 'a chama',
              invitationToken: invitationData.invitation_token,
              inviterName: profileData?.full_name || undefined,
            },
          });

          if (smsError) {
            console.error('Failed to send SMS:', smsError);
            // Don't throw error, invitation was created successfully
          }
        }
      }

      return invitationId;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invitations', chamaId] });
      toast({
        title: 'Invitation sent',
        description: 'The invitation has been created successfully',
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

  return {
    invitations,
    isLoading,
    createInvitation,
    isCreating,
    revokeInvitation,
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
      queryClient.invalidateQueries({ queryKey: ['user-chamas'] });
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
