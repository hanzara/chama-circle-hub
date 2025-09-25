
import React, { useState } from 'react';
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
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminUserManagement: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Mock user data
  const users = [
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

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );

  const handleUserAction = (action: string, userId: string, userName: string) => {
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
        toast({
          title: "KYC Verified",
          description: `${userName}'s KYC verification has been approved.`,
        });
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
        {filteredUsers.map((user) => (
          <Card key={user.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{user.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{user.email}</span>
                        <span>•</span>
                        <span>{user.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-2 mb-4">
                    {getStatusBadge(user.status)}
                    {getRoleBadge(user.role)}
                    {getKycBadge(user.kycStatus)}
                    {user.flaggedActivities > 0 && (
                      <Badge className="bg-red-100 text-red-800 border-red-200">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {user.flaggedActivities} Flags
                      </Badge>
                    )}
                  </div>

                  {/* User Stats */}
                  <div className="grid gap-4 md:grid-cols-5 mb-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Credit Score</p>
                      <p className={`font-semibold ${user.creditScore >= 700 ? 'text-green-600' : user.creditScore >= 600 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {user.creditScore}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Contributions</p>
                      <p className="font-semibold">KES {user.totalContributions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Chamas</p>
                      <p className="font-semibold">{user.chamasCount}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Last Login</p>
                      <p className="font-semibold">{user.lastLogin}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                      <p className="font-semibold">{user.registrationDate}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  
                  {user.status === 'active' ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleUserAction('suspend', user.id, user.name)}
                    >
                      <Ban className="h-4 w-4 mr-1" />
                      Suspend
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-green-600 hover:text-green-700"
                      onClick={() => handleUserAction('unsuspend', user.id, user.name)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Unsuspend
                    </Button>
                  )}

                  {user.kycStatus === 'pending' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUserAction('verify', user.id, user.name)}
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      Verify KYC
                    </Button>
                  )}

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleUserAction('resetPin', user.id, user.name)}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Reset PIN
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Profile: {selectedUser.name}</DialogTitle>
              <DialogDescription>
                Complete user information and account management
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Full Name</Label>
                  <p className="font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <Label>Email Address</Label>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <p className="font-medium">{selectedUser.phone}</p>
                </div>
                <div>
                  <Label>Account Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedUser.status)}</div>
                </div>
                <div>
                  <Label>KYC Status</Label>
                  <div className="mt-1">{getKycBadge(selectedUser.kycStatus)}</div>
                </div>
                <div>
                  <Label>User Role</Label>
                  <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedUser(null)}>
                  Close
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    handleUserAction('ban', selectedUser.id, selectedUser.name);
                    setSelectedUser(null);
                  }}
                >
                  Permanent Ban
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
