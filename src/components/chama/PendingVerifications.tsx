import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, RefreshCw, UserPlus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { VerifyContributionButton } from './VerifyContributionButton';
import { format } from 'date-fns';
import { useApproveMember, useRejectMember } from '@/hooks/useAdminDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PendingVerificationsProps {
  chamaId: string;
}

export const PendingVerifications: React.FC<PendingVerificationsProps> = ({ chamaId }) => {
  const approveMemberMutation = useApproveMember(chamaId);
  const rejectMemberMutation = useRejectMember(chamaId);

  const { data: pendingContributions, isLoading: loadingContributions, refetch: refetchContributions } = useQuery({
    queryKey: ['pending-contributions', chamaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chama_contributions_new')
        .select(`
          *,
          chama_members!inner(
            profiles:user_id(full_name, email)
          )
        `)
        .eq('chama_id', chamaId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: pendingMembers, isLoading: loadingMembers, refetch: refetchMembers } = useQuery({
    queryKey: ['pending-members', chamaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chama_members')
        .select(`
          *,
          profiles:user_id(full_name, email, phone_number, occupation)
        `)
        .eq('chama_id', chamaId)
        .eq('is_active', false)
        .order('joined_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const handleApproveMember = async (memberId: string) => {
    await approveMemberMutation.mutateAsync(memberId);
    refetchMembers();
  };

  const handleRejectMember = async (memberId: string) => {
    await rejectMemberMutation.mutateAsync(memberId);
    refetchMembers();
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <CardTitle>Pending Approvals</CardTitle>
          </div>
          <Button variant="outline" size="icon" onClick={() => {
            refetchContributions();
            refetchMembers();
          }}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="members">
              <UserPlus className="h-4 w-4 mr-2" />
              Member Requests {pendingMembers && pendingMembers.length > 0 && `(${pendingMembers.length})`}
            </TabsTrigger>
            <TabsTrigger value="contributions">
              <Clock className="h-4 w-4 mr-2" />
              Contributions {pendingContributions && pendingContributions.length > 0 && `(${pendingContributions.length})`}
            </TabsTrigger>
          </TabsList>

          {/* Pending Member Requests */}
          <TabsContent value="members" className="mt-4">
            {loadingMembers ? (
              <div className="space-y-2">
                {[1, 2].map(i => (
                  <div key={i} className="h-20 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : pendingMembers && pendingMembers.length > 0 ? (
              <div className="space-y-3">
                {pendingMembers.map((member) => {
                  const profile = member.profiles as any;
                  
                  return (
                    <div
                      key={member.id}
                      className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold text-lg">
                              {profile?.full_name || profile?.email || 'New Member'}
                            </p>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              Pending
                            </Badge>
                          </div>
                          {profile?.email && (
                            <p className="text-sm text-muted-foreground">
                              Email: {profile.email}
                            </p>
                          )}
                          {profile?.phone_number && (
                            <p className="text-sm text-muted-foreground">
                              Phone: {profile.phone_number}
                            </p>
                          )}
                          {profile?.occupation && (
                            <p className="text-sm text-muted-foreground">
                              Occupation: {profile.occupation}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            Requested: {format(new Date(member.joined_at), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApproveMember(member.id)}
                            disabled={approveMemberMutation.isPending}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectMember(member.id)}
                            disabled={rejectMemberMutation.isPending}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <UserPlus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No pending member requests</p>
              </div>
            )}
          </TabsContent>

          {/* Pending Contribution Verifications */}
          <TabsContent value="contributions" className="mt-4">
            {loadingContributions ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : pendingContributions && pendingContributions.length > 0 ? (
              <div className="space-y-3">
                {pendingContributions.map((contribution) => {
                  const member = contribution.chama_members as any;
                  const profile = member?.profiles;
                  
                  return (
                    <div
                      key={contribution.id}
                      className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-medium">
                              {profile?.full_name || profile?.email || 'Member'}
                            </p>
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                              Pending
                            </Badge>
                          </div>
                          <CurrencyDisplay 
                            amount={contribution.amount} 
                            className="text-lg font-bold text-orange-600"
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            {format(new Date(contribution.created_at), 'MMM dd, yyyy HH:mm')}
                          </p>
                          {contribution.payment_method && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Method: {contribution.payment_method}
                            </p>
                          )}
                          {contribution.payment_reference && (
                            <p className="text-xs text-muted-foreground">
                              Ref: {contribution.payment_reference}
                            </p>
                          )}
                          {contribution.notes && (
                            <p className="text-sm text-muted-foreground mt-2 italic">
                              "{contribution.notes}"
                            </p>
                          )}
                        </div>
                        <div className="ml-4">
                          <VerifyContributionButton
                            contributionId={contribution.id}
                            chamaId={chamaId}
                            amount={contribution.amount}
                            onVerified={() => refetchContributions()}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No pending verifications</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
