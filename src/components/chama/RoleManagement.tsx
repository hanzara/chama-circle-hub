import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Shield, UserCog, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RoleManagementProps {
  chamaId: string;
}

export const RoleManagement: React.FC<RoleManagementProps> = ({ chamaId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');

  const { data: members, isLoading } = useQuery({
    queryKey: ['chama-members-roles', chamaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chama_members')
        .select(`
          *,
          profiles:user_id(full_name, email)
        `)
        .eq('chama_id', chamaId)
        .eq('is_active', true)
        .order('role', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const assignRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: string }) => {
      const { data, error } = await supabase.functions.invoke('assign-role', {
        body: {
          chamaId,
          targetMemberId: memberId,
          newRole: role
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chama-members-roles', chamaId] });
      queryClient.invalidateQueries({ queryKey: ['chama-members', chamaId] });
      toast({
        title: 'Role Updated',
        description: 'Member role has been updated successfully'
      });
      setSelectedMember('');
      setSelectedRole('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update role',
        variant: 'destructive'
      });
    }
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'treasurer': return 'bg-blue-500';
      case 'secretary': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Role Management</CardTitle>
        </div>
        <CardDescription>
          Assign roles to members to grant them additional permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Assign Role Section */}
        <div className="p-4 bg-muted/50 rounded-lg space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            Assign New Role
          </h4>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Select Member</label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a member" />
                </SelectTrigger>
                <SelectContent>
                  {members?.filter(m => m.role === 'member').map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {(member.profiles as any)?.full_name || (member.profiles as any)?.email || 'Member'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Select Role</label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="treasurer">Treasurer</SelectItem>
                  <SelectItem value="secretary">Secretary</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={() => assignRoleMutation.mutate({ memberId: selectedMember, role: selectedRole })}
            disabled={!selectedMember || !selectedRole || assignRoleMutation.isPending}
            className="w-full"
          >
            {assignRoleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign Role
          </Button>
        </div>

        {/* Current Roles */}
        <div>
          <h4 className="font-medium mb-3">Current Roles</h4>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {members?.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${getRoleBadgeColor(member.role)}`} />
                    <div>
                      <p className="font-medium">
                        {(member.profiles as any)?.full_name || (member.profiles as any)?.email || 'Member'}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={member.role === 'admin' ? 'default' : 'secondary'}
                    className={member.role !== 'member' ? getRoleBadgeColor(member.role) + ' text-white' : ''}
                  >
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Role Permissions Info */}
        <div className="p-4 border rounded-lg space-y-2 text-sm">
          <p className="font-medium">Role Permissions:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• <strong>Admin:</strong> Full access, can assign roles & unlock funds</li>
            <li>• <strong>Treasurer:</strong> Verify contributions, manage finances, download reports</li>
            <li>• <strong>Secretary:</strong> Send announcements, manage communications</li>
            <li>• <strong>Member:</strong> View balances, contribute, participate in votes</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
