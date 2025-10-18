import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, Phone, Mail, Wallet, TrendingUp, AlertCircle, Download } from 'lucide-react';
import CurrencyDisplay from '@/components/CurrencyDisplay';

interface MemberDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: any;
  canManageRoles: boolean;
  onRemoveMember?: (memberId: string) => void;
  onChangeRole?: (memberId: string, newRole: string) => void;
}

export const MemberDetailsModal: React.FC<MemberDetailsModalProps> = ({
  isOpen,
  onClose,
  member,
  canManageRoles,
  onRemoveMember,
  onChangeRole,
}) => {
  if (!member) return null;

  const profile = member.profiles as any;
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
      case 'chairman':
        return 'destructive';
      case 'treasurer':
        return 'default';
      case 'secretary':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Member Details
          </DialogTitle>
          <DialogDescription>
            View member information and manage their role
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{profile?.full_name || 'N/A'}</h3>
                <Badge variant={getRoleBadgeVariant(member.role)} className="mt-1">
                  {member.role}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Joined {new Date(member.joined_at).toLocaleDateString()}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{profile?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{profile?.phone_number || 'N/A'}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Financial Summary */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Financial Summary
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">Total Contributed</div>
                <div className="text-xl font-bold mt-1">
                  <CurrencyDisplay amount={member.total_contributed || 0} />
                </div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">Savings Balance</div>
                <div className="text-xl font-bold mt-1">
                  <CurrencyDisplay amount={member.savings_balance || 0} />
                </div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">MGR Balance</div>
                <div className="text-xl font-bold mt-1">
                  <CurrencyDisplay amount={member.mgr_balance || 0} />
                </div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">Last Contribution</div>
                <div className="text-sm font-medium mt-1">
                  {member.last_contribution_date
                    ? new Date(member.last_contribution_date).toLocaleDateString()
                    : 'Never'}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Status Indicators */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Status
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Withdrawal Lock</span>
                <Badge variant={member.withdrawal_locked ? 'destructive' : 'secondary'}>
                  {member.withdrawal_locked ? 'Locked' : 'Unlocked'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Auto-Debit</span>
                <Badge variant={member.auto_debit_enabled ? 'default' : 'outline'}>
                  {member.auto_debit_enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Account Status</span>
                <Badge variant={member.is_active ? 'default' : 'secondary'}>
                  {member.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          {canManageRoles && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Admin Actions
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onChangeRole?.(member.id, 'treasurer')}
                    disabled={member.role === 'treasurer'}
                  >
                    Make Treasurer
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onChangeRole?.(member.id, 'secretary')}
                    disabled={member.role === 'secretary'}
                  >
                    Make Secretary
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onChangeRole?.(member.id, 'admin')}
                    disabled={member.role === 'admin'}
                  >
                    Make Admin
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onChangeRole?.(member.id, 'member')}
                    disabled={member.role === 'member'}
                  >
                    Make Member
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm('Are you sure you want to remove this member?')) {
                        onRemoveMember?.(member.id);
                        onClose();
                      }
                    }}
                  >
                    Remove Member
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
