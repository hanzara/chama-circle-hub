import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Lock, Unlock, Shield, Edit2, Check, X } from 'lucide-react';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { MemberUnlockModal } from './MemberUnlockModal';
import { useMemberManagement } from '@/hooks/useMemberManagement';

interface MemberManagementTableProps {
  members: any[];
  isAdmin: boolean;
  chamaId: string;
}

export const MemberManagementTable = ({ members, isAdmin, chamaId }: MemberManagementTableProps) => {
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  const { updateMemberName, isUpdatingName } = useMemberManagement(chamaId);

  const handleUnlockClick = (member: any) => {
    setSelectedMember(member);
    setUnlockModalOpen(true);
  };

  const handleEditClick = (member: any) => {
    setEditingMemberId(member.id);
    setEditedName(member.profiles?.full_name || '');
  };

  const handleSaveName = (member: any) => {
    if (editedName.trim()) {
      updateMemberName({ userId: member.user_id, newName: editedName.trim() });
      setEditingMemberId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingMemberId(null);
    setEditedName('');
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
                      {editingMemberId === member.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="h-8 max-w-[200px]"
                            placeholder="Enter name"
                            disabled={isUpdatingName}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => handleSaveName(member)}
                            disabled={isUpdatingName}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={handleCancelEdit}
                            disabled={isUpdatingName}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>{profile.full_name || 'Unknown'}</span>
                          {isAdmin && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => handleEditClick(member)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      )}
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
