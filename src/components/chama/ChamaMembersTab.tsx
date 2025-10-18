import React, { useState } from 'react';
import { Users, User, Search, Filter, Shield, Star, Calendar, Phone, Download, History, Settings, UserCog, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useChamaMembers } from '@/hooks/useChamaMembers';
import { useCSVExport } from '@/hooks/useCSVExport';
import { RoleManagement } from './RoleManagement';
import { toast } from '@/hooks/use-toast';

interface ChamaMembersTabProps {
  chamaId: string;
  userRole?: string;
  isAdmin?: boolean;
}

export const ChamaMembersTab: React.FC<ChamaMembersTabProps> = ({ 
  chamaId, 
  userRole = 'member',
  isAdmin = false 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [showRoleManagement, setShowRoleManagement] = useState(false);
  
  const { data: members, isLoading } = useChamaMembers(chamaId);
  const { exportToCSV } = useCSVExport();

  const filteredMembers = members?.filter(member => {
    const profile = member.profiles as any;
    const name = profile?.full_name || profile?.email || '';
    const phone = profile?.phone_number || '';
    const matchesSearch = !searchQuery || 
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.includes(searchQuery) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    return matchesSearch && matchesRole;
  }) || [];

  const handleExportMembers = () => {
    const headers = ['Name', 'Email', 'Phone', 'Role', 'Total Contributed', 'Joined Date', 'Last Contribution', 'Status'];
    const exportData = filteredMembers.map((member) => {
      const profile = member.profiles as any;
      return {
        name: profile?.full_name || 'N/A',
        email: profile?.email || 'N/A',
        phone: profile?.phone_number || 'N/A',
        role: member.role,
        total_contributed: member.total_contributed || 0,
        joined_date: new Date(member.joined_at).toLocaleDateString(),
        last_contribution: member.last_contribution_date 
          ? new Date(member.last_contribution_date).toLocaleDateString() 
          : 'Never',
        status: member.is_active ? 'Active' : 'Inactive'
      };
    });
    
    exportToCSV(exportData, `chama-members`, headers);
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      admin: "default",
      treasurer: "secondary", 
      secretary: "outline",
      member: "outline"
    };

    const colors: Record<string, string> = {
      admin: "text-blue-600 bg-blue-50 border-blue-200",
      treasurer: "text-green-600 bg-green-50 border-green-200",
      secretary: "text-purple-600 bg-purple-50 border-purple-200",
      member: "text-gray-600 bg-gray-50 border-gray-200"
    };

    return (
      <Badge variant={variants[role] || "outline"} className={colors[role]}>
        {role?.charAt(0).toUpperCase() + role?.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Members</h3>
          <p className="text-sm text-muted-foreground">
            {members?.length || 0} total members
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportMembers}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          {isAdmin && (
            <>
              <Button variant="outline" size="sm" onClick={() => setShowAuditLog(true)}>
                <History className="h-4 w-4 mr-2" />
                Audit Log
              </Button>
              <Button size="sm" onClick={() => setShowRoleManagement(true)}>
                <UserCog className="h-4 w-4 mr-2" />
                Manage Roles
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="treasurer">Treasurer</SelectItem>
            <SelectItem value="secretary">Secretary</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-lg font-semibold">
                  {members?.filter(m => m.role === 'admin').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Treasurers</p>
                <p className="text-lg font-semibold">
                  {members?.filter(m => m.role === 'treasurer').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-lg font-semibold">
                  {members?.filter(m => m.is_active).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-lg font-semibold">
                  {members?.filter(m => 
                    m.last_contribution_date && 
                    new Date(m.last_contribution_date).getMonth() === new Date().getMonth()
                  ).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members List */}
      <div className="grid gap-4">
        {filteredMembers.map((member) => {
          const profile = member.profiles as any;
          const memberName = profile?.full_name || profile?.email || 'Unknown Member';
          const memberPhone = profile?.phone_number;
          const memberEmail = profile?.email;
          
          return (
            <Card key={member.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedMember(member)}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(memberName)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground">{memberName}</h4>
                        {getRoleBadge(member.role)}
                      </div>
                      
                      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                        {memberEmail && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{memberEmail}</span>
                          </div>
                        )}
                        {memberPhone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{memberPhone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Joined {new Date(member.joined_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium text-foreground">{formatCurrency(member.total_contributed || 0)}</p>
                      <p className="text-xs text-muted-foreground">Total Contributed</p>
                      {member.last_contribution_date && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Last: {new Date(member.last_contribution_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    
                    {(isAdmin || userRole === 'treasurer' || userRole === 'secretary') && (
                      <Button variant="outline" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMember(member);
                      }}>
                        <Settings className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredMembers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-foreground mb-2">No members found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'No members match your search criteria.' : 'This chama has no members yet.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Member Details Modal */}
      {selectedMember && (
        <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Member Details</DialogTitle>
            </DialogHeader>
            <MemberDetailsView member={selectedMember} chamaId={chamaId} isAdmin={isAdmin} userRole={userRole} />
          </DialogContent>
        </Dialog>
      )}

      {/* Role Management Modal */}
      {showRoleManagement && (
        <Dialog open={showRoleManagement} onOpenChange={setShowRoleManagement}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Role Management</DialogTitle>
            </DialogHeader>
            <RoleManagement chamaId={chamaId} />
          </DialogContent>
        </Dialog>
      )}

      {/* Audit Log Modal */}
      {showAuditLog && (
        <Dialog open={showAuditLog} onOpenChange={setShowAuditLog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Audit Log</DialogTitle>
            </DialogHeader>
            <AuditLogView chamaId={chamaId} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Member Details View Component
const MemberDetailsView: React.FC<{ member: any; chamaId: string; isAdmin: boolean; userRole: string }> = ({ 
  member, 
  chamaId, 
  isAdmin,
  userRole 
}) => {
  const profile = member.profiles as any;
  const memberName = profile?.full_name || profile?.email || 'Unknown Member';
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Member Profile */}
      <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-primary/10 text-primary text-xl">
            {memberName.split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{memberName}</h3>
          <div className="space-y-1 text-sm text-muted-foreground mt-2">
            {profile?.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3" />
                <span>{profile.email}</span>
              </div>
            )}
            {profile?.phone_number && (
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3" />
                <span>{profile.phone_number}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span>Joined {new Date(member.joined_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
          {member.role?.charAt(0).toUpperCase() + member.role?.slice(1)}
        </Badge>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Contributed</p>
            <p className="text-2xl font-bold">{formatCurrency(member.total_contributed || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Savings Balance</p>
            <p className="text-2xl font-bold">{formatCurrency(member.savings_balance || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">MGR Balance</p>
            <p className="text-2xl font-bold">{formatCurrency(member.mgr_balance || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Last Contribution</p>
            <p className="text-lg font-semibold">
              {member.last_contribution_date 
                ? new Date(member.last_contribution_date).toLocaleDateString()
                : 'Never'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Wallet Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
            <span className="text-sm">Chama Savings Wallet</span>
            <span className="font-semibold">{formatCurrency(member.savings_balance || 0)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
            <span className="text-sm">Merry-Go-Round Wallet</span>
            <span className="font-semibold">{formatCurrency(member.mgr_balance || 0)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
            <span className="text-sm">Withdrawal Status</span>
            <Badge variant={member.withdrawal_locked ? 'destructive' : 'default'}>
              {member.withdrawal_locked ? 'Locked' : 'Unlocked'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Loan Status (if admin/treasurer) */}
      {(isAdmin || userRole === 'treasurer') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Loan Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">View loan details in the Loans tab</p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {(isAdmin || userRole === 'treasurer') && (
        <div className="flex gap-2 justify-end">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Statement
          </Button>
        </div>
      )}
    </div>
  );
};

// Audit Log View Component
const AuditLogView: React.FC<{ chamaId: string }> = ({ chamaId }) => {
  const [logs, setLogs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Fetch audit logs from chama_audit_logs table
    const fetchLogs = async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data, error } = await supabase
          .from('chama_audit_logs')
          .select(`
            *,
            actor:actor_id(id),
            target:target_id(id)
          `)
          .eq('chama_id', chamaId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        setLogs(data || []);
      } catch (error) {
        console.error('Error fetching audit logs:', error);
        toast({
          title: "Error",
          description: "Failed to load audit logs",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [chamaId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.length === 0 ? (
        <div className="text-center p-8">
          <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No audit logs found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <Card key={log.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{log.action}</p>
                    {log.old_value && log.new_value && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Changed from: {log.old_value} → {log.new_value}
                      </p>
                    )}
                    {log.details && (
                      <pre className="text-xs text-muted-foreground mt-2 bg-muted/30 p-2 rounded max-w-full overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{new Date(log.created_at).toLocaleDateString()}</p>
                    <p>{new Date(log.created_at).toLocaleTimeString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};