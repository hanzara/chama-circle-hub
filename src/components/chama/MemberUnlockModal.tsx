import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWalletOperations } from '@/hooks/useWalletOperations';
import { Lock, Unlock, Loader2 } from 'lucide-react';
import CurrencyDisplay from '@/components/CurrencyDisplay';

interface MemberUnlockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: any;
  chamaId: string;
}

export const MemberUnlockModal = ({
  open,
  onOpenChange,
  member,
  chamaId
}: MemberUnlockModalProps) => {
  const { mutate: executeOperation, isPending } = useWalletOperations();

  const handleToggleLock = (lock: boolean) => {
    executeOperation({
      operation: lock ? 'lock' : 'unlock',
      chamaId,
      targetMemberId: member?.id
    }, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  if (!member) return null;

  const isLocked = member.withdrawal_locked ?? true;
  const profile = member.profiles || {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Member Withdrawal Access</DialogTitle>
          <DialogDescription>
            Control MGR wallet withdrawal permissions for this member
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{profile.full_name || profile.email || 'Member'}</span>
              <Badge variant={isLocked ? "destructive" : "default"}>
                {isLocked ? (
                  <>
                    <Lock className="h-3 w-3 mr-1" />
                    Locked
                  </>
                ) : (
                  <>
                    <Unlock className="h-3 w-3 mr-1" />
                    Unlocked
                  </>
                )}
              </Badge>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Savings Balance:</span>
                <CurrencyDisplay amount={member.savings_balance || 0} showToggle={false} />
              </div>
              <div className="flex justify-between">
                <span>MGR Balance:</span>
                <CurrencyDisplay amount={member.mgr_balance || 0} showToggle={false} />
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {isLocked ? (
              <p>This member's MGR wallet withdrawals are currently <strong>locked</strong>. They cannot withdraw funds until you unlock them.</p>
            ) : (
              <p>This member's MGR wallet withdrawals are currently <strong>unlocked</strong>. They can withdraw funds to their payout method.</p>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          {isLocked ? (
            <Button
              onClick={() => handleToggleLock(false)}
              disabled={isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Unlock className="h-4 w-4 mr-2" />
              Unlock Withdrawals
            </Button>
          ) : (
            <Button
              onClick={() => handleToggleLock(true)}
              disabled={isPending}
              variant="destructive"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Lock className="h-4 w-4 mr-2" />
              Lock Withdrawals
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
