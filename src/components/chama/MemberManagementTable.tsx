import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Lock, Unlock, Shield } from 'lucide-react';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { MemberUnlockModal } from './MemberUnlockModal';

interface MemberManagementTableProps {
  members: any[];
  isAdmin: boolean;
  chamaId: string;
}

export const MemberManagementTable = ({ members, isAdmin, chamaId }: MemberManagementTableProps) => {
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);

  const handleUnlockClick = (member: any) => {
    setSelectedMember(member);
    setUnlockModalOpen(true);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Savings Balance</TableHead>
              <TableHead>MGR Balance</TableHead>
              <TableHead>Withdrawal Status</TableHead>
              {isAdmin && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => {
              const profile = member.profiles || {};
              const isLocked = member.withdrawal_locked ?? true;
              
              return (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{profile.full_name || 'Unknown'}</div>
                      <div className="text-sm text-muted-foreground">{profile.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                      {member.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <CurrencyDisplay amount={member.savings_balance || 0} showToggle={false} />
                  </TableCell>
                  <TableCell>
                    <CurrencyDisplay amount={member.mgr_balance || 0} showToggle={false} />
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnlockClick(member)}
                      >
                        {isLocked ? (
                          <>
                            <Unlock className="h-3 w-3 mr-1" />
                            Unlock
                          </>
                        ) : (
                          <>
                            <Lock className="h-3 w-3 mr-1" />
                            Lock
                          </>
                        )}
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
            {members.length === 0 && (
              <TableRow>
                <TableCell colSpan={isAdmin ? 6 : 5} className="text-center text-muted-foreground">
                  No members found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <MemberUnlockModal
        open={unlockModalOpen}
        onOpenChange={setUnlockModalOpen}
        member={selectedMember}
        chamaId={chamaId}
      />
    </>
  );
};
