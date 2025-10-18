
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  UserCog, 
  UserPlus, 
  Ban, 
  CheckCircle, 
  Shield, 
  RefreshCw,
  Search,
  AlertTriangle,
  Eye,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  user_id?: string;
  display_name?: string;
  name?: string;
  email: string;
  phone_number?: string;
  phone?: string;
  kyc_status?: string;
  kycStatus?: string;
  is_verified?: boolean;
  phone_verified?: boolean;
  created_at?: string;
  status?: string;
  role?: string;
  flaggedActivities?: number;
  creditScore?: number;
  totalContributions?: number;
  chamasCount?: number;
  lastLogin?: string;
  registrationDate?: string;
}

const AdminUserManagement: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch users from Supabase
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get emails from auth.users
      const usersWithEmails = await Promise.all(
        (data || []).map(async (profile) => {
          const { data: userData } = await supabase.auth.admin.getUserById(profile.user_id);
          return {
            ...profile,
            email: userData?.user?.email || 'N/A'
          };
        })
      );

      setUsers(usersWithEmails);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyUserKYC = async (userId: string, userName: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          verification_status: 'verified'
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "KYC Verified",
        description: `${userName}'s KYC verification has been approved.`,
      });

      // Refresh users list
      fetchUsers();
    } catch (error) {
      console.error('Error verifying KYC:', error);
      toast({
        title: "Error",
        description: "Failed to verify KYC",
        variant: "destructive"
      });
    }
  };

  const rejectUserKYC = async (userId: string, userName: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          verification_status: 'rejected'
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "KYC Rejected",
        description: `${userName}'s KYC verification has been rejected.`,
        variant: "destructive"
      });

      // Refresh users list
      fetchUsers();
    } catch (error) {
      console.error('Error rejecting KYC:', error);
      toast({
        title: "Error",
        description: "Failed to reject KYC",
        variant: "destructive"
      });
    }
  };

  // Mock user data for fallback
  const mockUsers = [
    {
      id: '1',
      name: 'Joseph Nzai',
      email: 'joseph.nzai@email.com',
      phone: '+254705448355',
      status: 'active',
      role: 'user',
      kycStatus: 'verified',
      creditScore: 785,
      totalContributions: 150000,
      chamasCount: 3,
      flaggedActivities: 0,
      lastLogin: '2024-07-13',
      registrationDate: '2024-01-15'
    },
    {
      id: '2',
      name: 'Mary Wanjiku',
      email: 'mary.wanjiku@email.com',
      phone: '+254702345678',
      status: 'suspended',
      role: 'user',
      kycStatus: 'pending',
      creditScore: 620,
      totalContributions: 95000,
      chamasCount: 2,
      flaggedActivities: 3,
      lastLogin: '2024-07-10',
      registrationDate: '2024-02-20'
    },
    {
      id: '3',
      name: 'Peter Admin',
      email: 'peter.admin@verdio.com',
      phone: '+254703456789',
      status: 'active',
      role: 'admin',
      kycStatus: 'verified',
      creditScore: 850,
      totalContributions: 0,
      chamasCount: 0,
      flaggedActivities: 0,
      lastLogin: '2024-07-14',
      registrationDate: '2024-01-01'
    }
  ];

  const displayUsers = loading ? mockUsers : users;
  
  const filteredUsers = displayUsers.filter(user =>
    ((user as any).display_name || (user as any).name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ((user as any).phone_number || (user as any).phone || '').includes(searchTerm)
  );

  const handleUserAction = async (action: string, userId: string, userName: string) => {
    console.log(`${action} action for user ${userId}`);
    
    switch (action) {
      case 'suspend':
        toast({
          title: "User Suspended",
          description: `${userName} has been suspended successfully.`,
          variant: "destructive"
        });
        break;
      case 'unsuspend':
        toast({
          title: "User Unsuspended",
          description: `${userName} has been reactivated successfully.`,
        });
        break;
      case 'verify':
        await verifyUserKYC(userId, userName);
        break;
      case 'reject':
        await rejectUserKYC(userId, userName, 'Rejected by admin');
        break;
      case 'resetPin':
        toast({
          title: "PIN Reset",
          description: `PIN reset link sent to ${userName}.`,
        });
        break;
      case 'ban':
        toast({
          title: "User Banned",
          description: `${userName} has been permanently banned.`,
          variant: "destructive"
        });
        break;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Suspended</Badge>;
      case 'banned':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Banned</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getKycBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Not Started</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Admin</Badge>;
      case 'moderator':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Moderator</Badge>;
      default:
        return <Badge variant="outline">User</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {loading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      {/* Header with Search */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            User Management Console
          </CardTitle>
          <CardDescription>
            Create, manage, and moderate user accounts with comprehensive oversight
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search users by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>
                    Manually create a new user account with admin privileges
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" placeholder="Enter full name" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="Enter email address" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="+254..." />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button onClick={() => {
                      toast({
                        title: "User Created",
                        description: "New user account created successfully. Login credentials sent via email.",
                      });
                    }}>
                      Create User
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => {
          const userName = (user as any).display_name || (user as any).name || 'Unknown User';
          const userEmail = user.email || 'N/A';
          const userPhone = (user as any).phone_number || (user as any).phone || 'N/A';
          const userKycStatus = (user as any).kyc_status || (user as any).kycStatus || 'pending';
          const userId = (user as any).user_id || user.id;
          
          return (
            <Card key={user.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{userName}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{userEmail}</span>
                          <span>•</span>
                          <span>{userPhone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex items-center gap-2 mb-4">
                      {getStatusBadge((user as any).status || 'active')}
                      {getRoleBadge((user as any).role || 'user')}
                      {getKycBadge(userKycStatus)}
                      {(user as any).flaggedActivities && (user as any).flaggedActivities > 0 && (
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {(user as any).flaggedActivities} Flags
                        </Badge>
                      )}
                    </div>

                    {/* User Stats */}
                    <div className="grid gap-4 md:grid-cols-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Verified</p>
                        <p className="font-semibold">
                          {(user as any).is_verified ? 'Yes' : 'No'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">KYC Status</p>
                        <p className="font-semibold capitalize">{userKycStatus}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Phone Verified</p>
                        <p className="font-semibold">{(user as any).phone_verified ? 'Yes' : 'No'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                        <p className="font-semibold">
                          {(user as any).created_at ? new Date((user as any).created_at).toLocaleDateString() : (user as any).registrationDate || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    
                    {userKycStatus === 'pending' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleUserAction('verify', userId, userName)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve KYC
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleUserAction('reject', userId, userName)}
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Reject KYC
                        </Button>
                      </>
                    )}
                    
                    {userKycStatus === 'verified' && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}

                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUserAction('resetPin', userId, userName)}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Reset PIN
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Profile: {(selectedUser as any).display_name || (selectedUser as any).name}</DialogTitle>
              <DialogDescription>
                Complete user information and account management
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Full Name</Label>
                  <p className="font-medium">{(selectedUser as any).display_name || (selectedUser as any).name || 'N/A'}</p>
                </div>
                <div>
                  <Label>Email Address</Label>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <p className="font-medium">{(selectedUser as any).phone_number || (selectedUser as any).phone || 'N/A'}</p>
                </div>
                <div>
                  <Label>Account Status</Label>
                  <div className="mt-1">{getStatusBadge((selectedUser as any).status || 'active')}</div>
                </div>
                <div>
                  <Label>KYC Status</Label>
                  <div className="mt-1">{getKycBadge((selectedUser as any).kyc_status || (selectedUser as any).kycStatus || 'pending')}</div>
                </div>
                <div>
                  <Label>User Role</Label>
                  <div className="mt-1">{getRoleBadge((selectedUser as any).role || 'user')}</div>
                </div>
                <div>
                  <Label>Verified</Label>
                  <p className="font-medium">{(selectedUser as any).is_verified ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <Label>Created At</Label>
                  <p className="font-medium">
                    {(selectedUser as any).created_at ? new Date((selectedUser as any).created_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                {((selectedUser as any).kyc_status === 'pending' || (selectedUser as any).kycStatus === 'pending') && (
                  <>
                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        handleUserAction('verify', (selectedUser as any).user_id || selectedUser.id, (selectedUser as any).display_name || (selectedUser as any).name);
                        setSelectedUser(null);
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve KYC
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        handleUserAction('reject', (selectedUser as any).user_id || selectedUser.id, (selectedUser as any).display_name || (selectedUser as any).name);
                        setSelectedUser(null);
                      }}
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Reject KYC
                    </Button>
                  </>
                )}
                <Button variant="outline" onClick={() => setSelectedUser(null)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminUserManagement;
