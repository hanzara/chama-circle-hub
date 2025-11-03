import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';

interface JoinChamaRequestParams {
  chamaId: string;
  details: {
    full_name: string;
    phone_number: string;
    occupation?: string;
    reason: string;
  };
}

export const useJoinChamaRequest = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chamaId, details }: JoinChamaRequestParams) => {
      if (!user) throw new Error('User not authenticated');

      // First, update or create profile with the provided details
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: details.full_name,
          phone_number: details.phone_number,
          occupation: details.occupation || null,
        }, {
          onConflict: 'user_id'
        });

      if (profileError) throw profileError;

      // Create a pending membership request (is_active = false)
      const { data, error } = await supabase
        .from('chama_members')
        .insert({
          chama_id: chamaId,
          user_id: user.id,
          role: 'member',
          is_active: false,
        })
        .select()
        .single();

      if (error) {
        // Check if user is already a member
        if (error.code === '23505') {
          throw new Error('You have already requested to join this chama or are already a member');
        }
        throw error;
      }

      // Create a notification/activity for the admin
      const { error: activityError } = await supabase
        .from('chama_activities')
        .insert({
          chama_id: chamaId,
          member_id: data.id,
          activity_type: 'member_joined',
          description: `${details.full_name} has requested to join the chama. Reason: ${details.reason}`,
        });

      if (activityError) console.error('Failed to log activity:', activityError);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-chamas'] });
      queryClient.invalidateQueries({ queryKey: ['user-chamas'] });
      
      toast({
        title: "Request Sent! ✓",
        description: "Your request to join the chama has been sent to the admin for approval.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send join request",
        variant: "destructive",
      });
    }
  });
};
