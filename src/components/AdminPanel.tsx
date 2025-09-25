import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, FileText, Settings } from 'lucide-react';

export const AdminPanel = () => {
  const { user } = useAuth();
  const { isAdmin, setAdminRole, loading } = useUserRole();
  const { toast } = useToast();
  const [emailInput, setEmailInput] = useState('');
  const [isSettingAdmin, setIsSettingAdmin] = useState(false);

  const handleSetAdmin = async () => {
    if (!emailInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    // For demo purposes, we'll make the current user an admin
    // In a real app, you'd need to find the user by email first
    if (emailInput === user?.email) {
      setIsSettingAdmin(true);
      const success = await setAdminRole(user.id);
      
      if (success) {
        toast({
          title: "Success! 🎉",
          description: "Admin role has been granted.",
        });
        setEmailInput('');
      } else {
        toast({
          title: "Error",
          description: "Failed to set admin role",
          variant: "destructive",
        });
      }
      setIsSettingAdmin(false);
    } else {
      toast({
        title: "Info",
        description: "For demo purposes, only your own email can be made admin",
        variant: "default",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Admin Status
          </CardTitle>
          <CardDescription>
            Your current role and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant={isAdmin ? "default" : "secondary"}>
              {isAdmin ? "Administrator" : "Regular User"}
            </Badge>
            {isAdmin && (
              <Badge variant="outline" className="text-green-600">
                Full Access
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {isAdmin 
              ? "You have administrator privileges and can access all features." 
              : "You have standard user access. Contact an admin for elevated permissions."
            }
          </p>
        </CardContent>
      </Card>

      {/* Make Admin Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Grant Admin Access
          </CardTitle>
          <CardDescription>
            Make a user an administrator (Demo: Use your own email)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleSetAdmin}
            disabled={isSettingAdmin}
            className="w-full"
          >
            {isSettingAdmin ? "Granting Admin Access..." : "Grant Admin Access"}
          </Button>
        </CardContent>
      </Card>

      {/* Admin Features */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Admin Features
            </CardTitle>
            <CardDescription>
              Features available to administrators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <h4 className="font-medium">Advanced Reports</h4>
                  <p className="text-sm text-muted-foreground">Generate CSV, PDF reports</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <h4 className="font-medium">User Management</h4>
                  <p className="text-sm text-muted-foreground">Manage user roles</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                <Settings className="w-5 h-5 text-primary" />
                <div>
                  <h4 className="font-medium">System Settings</h4>
                  <p className="text-sm text-muted-foreground">Configure system</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <h4 className="font-medium">Security</h4>
                  <p className="text-sm text-muted-foreground">Security management</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};