import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Phone, Mail, Download, UserCog, Loader2 } from 'lucide-react';
import { useMemberManagement } from '@/hooks/useMemberManagement';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { MemberDetailsModal } from './MemberDetailsModal';
import { useToast } from '@/hooks/use-toast';

interface MemberManagementProps {
  chamaData: any;
}

export const MemberManagement: React.FC<MemberManagementProps> = ({ chamaData }) => {
  const chamaId = chamaData?.id;
  const { toast } = useToast();
  const { 
    members, 
    isLoading, 
    updateMemberRole, 
    isUpdatingRole,
    removeMember,
    canManageRoles,
    canViewFinancials
  } = useMemberManagement(chamaId);
  
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const handleViewDetails = (member: any) => {
    setSelectedMember(member);
    setDetailsModalOpen(true);
  };

  const handleRoleChange = (memberId: string, newRole: string) => {
    updateMemberRole({ memberId, newRole });
  };

  const handleExportCSV = () => {
    if (!members || members.length === 0) {
      toast({ title: 'No Data', description: 'No members to export', variant: 'destructive' });
      return;
    }

    const headers = ['Name', 'Email', 'Phone', 'Role', 'Total Contributed', 'Status', 'Joined Date'];
    const rows = members.map((m: any) => {
      const profile = m.profiles as any;
      return [
        profile?.full_name || 'N/A',
        profile?.email || 'N/A',
        profile?.phone_number || 'N/A',
        m.role,
        m.total_contributed || 0,
        m.is_active ? 'Active' : 'Inactive',
        new Date(m.joined_at).toLocaleDateString()
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chamaData?.name || 'chama'}-members-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast({ title: 'Export Successful', description: 'Member list exported to CSV' });
  };

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

  const totalMembers = members?.length || 0;
  const activeMembers = members?.filter((m: any) => m.is_active).length || 0;
  const totalContributions = members?.reduce((sum: number, m: any) => sum + (m.total_contributed || 0), 0) || 0;
  const avgContribution = totalMembers > 0 ? totalContributions / totalMembers : 0;

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Member Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Member Management
              </CardTitle>
              <CardDescription>
                Manage your chama members and their roles
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">Total Members</div>
              <div className="text-2xl font-bold">{totalMembers}</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">Active Members</div>
              <div className="text-2xl font-bold">{activeMembers}</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">Total Contributions</div>
              <div className="text-lg font-bold"><CurrencyDisplay amount={totalContributions} showToggle={false} /></div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">Avg. Contribution</div>
              <div className="text-lg font-bold"><CurrencyDisplay amount={avgContribution} showToggle={false} /></div>
            </div>
          </div>

          {/* Members List */}
          <div className="space-y-3">
            <h3 className="font-semibold">Members ({totalMembers})</h3>
            {members && members.length > 0 ? (
              <div className="space-y-2">
                {members.map((member: any) => {
                  const profile = member.profiles as any;
                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer"
                      onClick={() => handleViewDetails(member)}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{profile?.full_name || profile?.email || 'Unknown'}</p>
                            <Badge variant={getRoleBadgeVariant(member.role)}>
                              {member.role}
                            </Badge>
                            {!member.is_active && (
                              <Badge variant="outline">Inactive</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {profile?.email || 'N/A'}
                            </span>
                            {profile?.phone_number && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {profile.phone_number}
                              </span>
                            )}
                          </div>
                        </div>
                        {canViewFinancials && (
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">Contributed</div>
                            <div className="font-semibold">
                              <CurrencyDisplay amount={member.total_contributed || 0} showToggle={false} />
                            </div>
                          </div>
                        )}
                      </div>
                      {canManageRoles && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(member);
                          }}
                        >
                          <UserCog className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No members yet</p>
              </div>
            )}
          </div>

          {/* Role Permissions Info */}
          <div className="p-4 border rounded-lg space-y-2 text-sm bg-muted/30">
            <p className="font-medium">Role Permissions:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• <strong>Admin/Chairman:</strong> Full access, can assign roles & manage funds</li>
              <li>• <strong>Treasurer:</strong> Verify contributions, manage finances, download reports</li>
              <li>• <strong>Secretary:</strong> Send announcements, manage communications</li>
              <li>• <strong>Member:</strong> View balances, contribute, participate in votes</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <MemberDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        canManageRoles={canManageRoles}
        onRemoveMember={removeMember}
        onChangeRole={handleRoleChange}
      />
    </>
  );
};

export default MemberManagement;
