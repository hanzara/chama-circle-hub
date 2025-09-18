
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, User, Mail, Shield, UserCheck, Settings } from 'lucide-react';
import { useMemberManagement } from '@/hooks/useMemberManagement';
import CurrencyDisplay from '@/components/CurrencyDisplay';

interface MemberManagementProps {
  chamaData: any;
}

const MemberManagement: React.FC<MemberManagementProps> = ({ chamaData }) => {
  const { 
    members, 
    isLoading, 
    updateMemberRole, 
    isUpdatingRole,
    inviteMember,
    isInviting 
  } = useMemberManagement(chamaData.id);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const handleInviteMember = () => {
    if (inviteEmail.trim()) {
      inviteMember({
        email: inviteEmail,
        role: inviteRole
      });
      setInviteEmail('');
      setInviteRole('member');
      setIsInviteOpen(false);
    }
  };

  const handleRoleChange = (memberId: string, newRole: string) => {
    updateMemberRole({ memberId, newRole });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'treasurer': return 'secondary';
      case 'secretary': return 'outline';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Member Management</h2>
            <p className="text-muted-foreground">Loading members...</p>
          </div>
        </div>
      </div>
    );
  }

  const activeMembers = members || [];
  const totalContributions = activeMembers.reduce((sum, member) => sum + (member.total_contributed || 0), 0);
  const avgContribution = activeMembers.length > 0 ? totalContributions / activeMembers.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Member Management</h2>
          <p className="text-muted-foreground">Manage group members and assign roles</p>
        </div>
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
              <DialogDescription>
                Add a registered user to this chama and assign their role.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="member-email">Email Address</Label>
                <Input
                  id="member-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter member's email..."
                />
              </div>
              <div>
                <Label htmlFor="member-role">Role</Label>
                <select
                  id="member-role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="member">Member</option>
                  <option value="secretary">Secretary</option>
                  <option value="treasurer">Treasurer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleInviteMember}
                disabled={isInviting || !inviteEmail.trim()}
              >
                {isInviting ? 'Adding...' : 'Add Member'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Member Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMembers.length}</div>
            <p className="text-xs text-muted-foreground">Active members</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Officers</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeMembers.filter(m => m.role !== 'member').length}
            </div>
            <p className="text-xs text-muted-foreground">Admin, Treasurer & Secretary</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
          </CardHeader>
          <CardContent>
            <CurrencyDisplay 
              amount={totalContributions} 
              className="text-2xl font-bold" 
              showToggle={false} 
            />
            <p className="text-xs text-muted-foreground">All members</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Contribution</CardTitle>
          </CardHeader>
          <CardContent>
            <CurrencyDisplay 
              amount={avgContribution} 
              className="text-2xl font-bold" 
              showToggle={false} 
            />
            <p className="text-xs text-muted-foreground">Per member</p>
          </CardContent>
        </Card>
      </div>

      {/* Members List */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Members List</CardTitle>
          <CardDescription>View and manage all group members and their roles</CardDescription>
        </CardHeader>
        <CardContent>
          {activeMembers.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No members found</p>
              <Button onClick={() => setIsInviteOpen(true)} className="mt-4">
                Add First Member
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeMembers.map((member) => {
                const profile = member.profiles;
                
                return (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg bg-white/50 hover:bg-white/80 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-medium">
                        {profile?.full_name ? 
                          profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase() :
                          profile?.email?.charAt(0).toUpperCase() || 'U'
                        }
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {profile?.full_name || profile?.email || 'Unknown User'}
                        </h3>
                        {profile?.email && (
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            {profile.email}
                          </p>
                        )}
                        {member.joined_at && (
                          <p className="text-xs text-muted-foreground">
                            Joined: {new Date(member.joined_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={getRoleBadgeColor(member.role)}>
                          {member.role?.charAt(0).toUpperCase() + member.role?.slice(1)}
                        </Badge>
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value)}
                          disabled={isUpdatingRole}
                          className="text-xs border border-input rounded px-2 py-1"
                        >
                          <option value="member">Member</option>
                          <option value="secretary">Secretary</option>
                          <option value="treasurer">Treasurer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <p className="text-sm">
                        <CurrencyDisplay amount={member.total_contributed || 0} showToggle={false} />
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Total contributed
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MemberManagement;
