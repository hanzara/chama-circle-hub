
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, User, Bell } from 'lucide-react';

interface SecurityPermissionsProps {
  chamaData: any;
}

const SecurityPermissions: React.FC<SecurityPermissionsProps> = ({ chamaData }) => {
  const permissions = [
    { role: 'Chair', permissions: ['View all data', 'Approve members', 'Schedule meetings', 'Create polls', 'Manage settings'] },
    { role: 'Treasurer', permissions: ['View financial data', 'Approve loans', 'Record expenses', 'Generate reports'] },
    { role: 'Member', permissions: ['View own data', 'Make contributions', 'Apply for loans', 'Vote in polls'] }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Security & Permissions</h2>
        <p className="text-muted-foreground">Manage access control and security settings</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Permissions
            </CardTitle>
            <CardDescription>Access levels for different member roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {permissions.map((roleInfo, index) => (
                <div key={index} className="p-4 border rounded-lg bg-white/50">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="h-4 w-4" />
                    <Badge variant="secondary">{roleInfo.role}</Badge>
                  </div>
                  <div className="space-y-1">
                    {roleInfo.permissions.map((permission, pIndex) => (
                      <p key={pIndex} className="text-sm text-muted-foreground">• {permission}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>Configure security preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span>Two-Factor Authentication</span>
              <Button size="sm" variant="outline">Enable</Button>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span>Privacy Settings</span>
              <Button size="sm" variant="outline">Configure</Button>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span>Audit Logs</span>
              <Button size="sm" variant="outline">View</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecurityPermissions;
