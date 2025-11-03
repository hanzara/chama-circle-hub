import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';

export const useChamaRoles = (chamaId: string) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get current user's role
  const userRole = useQuery({
    queryKey: ['user-chama-role', user?.id, chamaId],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('chama_members')
        .select('role, id')
        .eq('user_id', user.id)
        .eq('chama_id', chamaId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!chamaId
  });

  // Check if user is admin/creator
  const isAdmin = userRole.data?.role === 'admin' || userRole.data?.role === 'chairman';
  const isTreasurer = userRole.data?.role === 'treasurer';
  const isSecretary = userRole.data?.role === 'secretary';

  // Create credential
  const createCredential = useMutation({
    mutationFn: async ({ role, code }: { role: string; code: string }) => {
      const { data, error } = await supabase.rpc('create_member_credential', {
        p_chama_id: chamaId,
        p_credential_type: role,
        p_credential_value: code
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Credential Created",
        description: "Role assignment credential has been created"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create credential",
        variant: "destructive"
      });
    }
  });

  // Assign role using credential
  const assignRole = useMutation({
    mutationFn: async ({ code, role }: { code: string; role: string }) => {
      const { data, error } = await supabase.rpc('assign_role_with_credential', {
        p_chama_id: chamaId,
        p_credential_value: code,
        p_credential_type: role
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['user-chama-role'] });
        queryClient.invalidateQueries({ queryKey: ['chama-members'] });
        toast({
          title: "Role Assigned",
          description: data.message || "Your role has been updated"
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to assign role",
          variant: "destructive"
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign role",
        variant: "destructive"
      });
    }
  });

  return {
    userRole: userRole.data,
    isAdmin,
    isTreasurer,
    isSecretary,
    isLoading: userRole.isLoading,
    createCredential,
    assignRole
  };
};