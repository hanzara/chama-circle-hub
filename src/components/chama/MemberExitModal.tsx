import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Download, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CurrencyDisplay from '@/components/CurrencyDisplay';

interface MemberExitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chamaId: string;
  memberId: string;
  memberName: string;
  savingsBalance: number;
  mgrBalance: number;
}

export const MemberExitModal: React.FC<MemberExitModalProps> = ({
  open,
  onOpenChange,
  chamaId,
  memberId,
  memberName,
  savingsBalance,
  mgrBalance
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [exitReason, setExitReason] = useState('');
  const totalBalance = savingsBalance + mgrBalance;

  const exitMutation = useMutation({
    mutationFn: async () => {
      // Generate exit statement
      const { data: exitData, error: exitError } = await supabase
        .from('chama_activities')
        .insert({
          chama_id: chamaId,
          member_id: memberId,
          activity_type: 'member_exit',
          description: `${memberName} left the chama. Exit reason: ${exitReason || 'Not specified'}`,
          amount: totalBalance
        })
        .select()
        .single();

      if (exitError) throw exitError;

      // Deactivate member
      const { error: deactivateError } = await supabase
        .from('chama_members')
        .update({ is_active: false })
        .eq('id', memberId);

      if (deactivateError) throw deactivateError;

      // Decrement chama member count
      const { data: chama } = await supabase
        .from('chamas')
        .select('current_members')
        .eq('id', chamaId)
        .single();

      if (chama) {
        await supabase
          .from('chamas')
          .update({ current_members: Math.max(0, chama.current_members - 1) })
          .eq('id', chamaId);
      }

      // Create exit statement
      const exitStatement = {
        member_name: memberName,
        exit_date: new Date().toISOString(),
        total_contributed: savingsBalance,
        mgr_balance: mgrBalance,
        total_balance: totalBalance,
        exit_reason: exitReason || 'Not specified',
        chama_id: chamaId
      };

      return exitStatement;
    },
    onSuccess: (exitStatement) => {
      queryClient.invalidateQueries({ queryKey: ['chama-members', chamaId] });
      
      // Download exit statement as JSON (simplified - could be PDF)
      const dataStr = JSON.stringify(exitStatement, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `exit-statement-${memberName.replace(/\s/g, '-')}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      toast({
        title: 'Member Exit Processed',
        description: 'Exit statement has been downloaded'
      });
      
      onOpenChange(false);
      setExitReason('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process exit',
        variant: 'destructive'
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Member Exit</DialogTitle>
          <DialogDescription>
            Process member exit from the chama
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This action will deactivate {memberName} from the chama. Their balances will be recorded in an exit statement.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <p className="text-sm text-muted-foreground">Final Balances:</p>
            <div className="flex justify-between">
              <span>Savings Balance:</span>
              <CurrencyDisplay amount={savingsBalance} className="font-semibold" />
            </div>
            <div className="flex justify-between">
              <span>MGR Balance:</span>
              <CurrencyDisplay amount={mgrBalance} className="font-semibold" />
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-bold">Total:</span>
              <CurrencyDisplay amount={totalBalance} className="font-bold" />
            </div>
          </div>

          <div>
            <Label htmlFor="exit-reason">Exit Reason (Optional)</Label>
            <Textarea
              id="exit-reason"
              placeholder="Why is this member leaving?"
              value={exitReason}
              onChange={(e) => setExitReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={() => exitMutation.mutate()}
            disabled={exitMutation.isPending}
          >
            {exitMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Process Exit & Download Statement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
