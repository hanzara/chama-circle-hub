import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Lock, Unlock, RefreshCw, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface MerryGoRoundScheduleProps {
  chamaId: string;
  isAdmin: boolean;
}

export const MerryGoRoundSchedule: React.FC<MerryGoRoundScheduleProps> = ({ chamaId, isAdmin }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: members, isLoading } = useQuery({
    queryKey: ['chama-mgr-schedule', chamaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chama_members')
        .select(`
          *,
          profiles:user_id(full_name, email)
        `)
        .eq('chama_id', chamaId)
        .eq('is_active', true)
        .order('mgr_turn_order', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const setNextTurnMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('manage-mgr-schedule', {
        body: {
          chamaId,
          action: 'set_next_turn'
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chama-mgr-schedule', chamaId] });
      queryClient.invalidateQueries({ queryKey: ['chama-members', chamaId] });
      toast({
        title: 'Turn Updated',
        description: 'Next member\'s turn has been activated'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to set next turn',
        variant: 'destructive'
      });
    }
  });

  const lockAllMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('manage-mgr-schedule', {
        body: {
          chamaId,
          action: 'lock_all'
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chama-mgr-schedule', chamaId] });
      toast({
        title: 'All Locked',
        description: 'All member withdrawals have been locked'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to lock withdrawals',
        variant: 'destructive'
      });
    }
  });

  const currentTurn = members?.find(m => !m.withdrawal_locked);

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Merry-Go-Round Schedule</CardTitle>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => lockAllMutation.mutate()}
                disabled={lockAllMutation.isPending}
              >
                {lockAllMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="sm"
                onClick={() => setNextTurnMutation.mutate()}
                disabled={setNextTurnMutation.isPending}
              >
                {setNextTurnMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Next Turn
              </Button>
            </div>
          )}
        </div>
        <CardDescription>
          Track and manage the merry-go-round payout schedule
        </CardDescription>
      </CardHeader>
      <CardContent>
        {currentTurn && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Current Turn</p>
            <p className="font-bold text-lg">
              {(currentTurn.profiles as any)?.full_name || (currentTurn.profiles as any)?.email || 'Member'}
            </p>
            <Badge variant="default" className="mt-2">Active Turn</Badge>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {members?.map((member, index) => (
              <div
                key={member.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  !member.withdrawal_locked 
                    ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500' 
                    : 'bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">
                      {(member.profiles as any)?.full_name || (member.profiles as any)?.email || 'Member'}
                    </p>
                    {member.mgr_turn_date && (
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(member.mgr_turn_date), 'MMM dd, yyyy')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {member.withdrawal_locked ? (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Locked
                    </Badge>
                  ) : (
                    <Badge variant="default" className="flex items-center gap-1 bg-green-500">
                      <Unlock className="h-3 w-3" />
                      Active
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
