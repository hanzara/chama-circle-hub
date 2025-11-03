import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Check, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

export const InvitationsPanel: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ['my-invitations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('member_invitations')
        .select(`
          *,
          chamas:chama_id (
            id,
            name,
            description,
            contribution_amount
          )
        `)
        .or(`email.eq.${user.email},phone_number.eq.${user.user_metadata?.phone}`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const acceptInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { data, error } = await supabase.rpc('accept_chama_invitation', {
        invitation_token: invitationId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['user-chamas'] });
      toast({
        title: 'Invitation accepted',
        description: 'You have successfully joined the chama',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to accept invitation',
        variant: 'destructive',
      });
    },
  });

  const declineInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('member_invitations')
        .update({ status: 'rejected' })
        .eq('id', invitationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-invitations'] });
      toast({
        title: 'Invitation declined',
        description: 'You have declined the invitation',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to decline invitation',
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return <div>Loading invitations...</div>;
  }

  if (invitations.length === 0) {
    return null;
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Pending Invitations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {invitations.map((invitation: any) => (
          <div
            key={invitation.id}
            className="p-4 rounded-lg border bg-accent/50"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-lg">
                  {invitation.chamas?.name}
                </h4>
                <Badge variant="outline" className="mt-1">
                  {invitation.role || 'member'}
                </Badge>
              </div>
            </div>
            
            {invitation.chamas?.description && (
              <p className="text-sm text-muted-foreground mb-3">
                {invitation.chamas.description}
              </p>
            )}
            
            <div className="text-sm space-y-1 mb-3">
              <p>
                <span className="font-medium">Contribution:</span> KES {invitation.chamas?.contribution_amount}
              </p>
              <p className="text-xs text-muted-foreground">
                Invited {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => acceptInvitation.mutate(invitation.id)}
                disabled={acceptInvitation.isPending}
                className="flex-1"
              >
                <Check className="h-4 w-4 mr-2" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => declineInvitation.mutate(invitation.id)}
                disabled={declineInvitation.isPending}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Decline
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
