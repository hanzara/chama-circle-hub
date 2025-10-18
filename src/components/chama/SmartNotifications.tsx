
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, DollarSign, Users } from 'lucide-react';

interface SmartNotificationsProps {
  chamaData: any;
}

const SmartNotifications: React.FC<SmartNotificationsProps> = ({ chamaData }) => {
  const notifications = [
    { id: '1', type: 'contribution', title: 'Contribution Due Soon', message: 'Your monthly contribution of KES 5,000 is due in 3 days', priority: 'high', time: '1 hour ago', icon: DollarSign },
    { id: '2', type: 'meeting', title: 'Meeting Reminder', message: 'Monthly meeting scheduled for tomorrow at 6:00 PM', priority: 'medium', time: '2 hours ago', icon: Calendar },
    { id: '3', type: 'loan', title: 'Loan Payment Due', message: 'Your loan payment of KES 8,797 is due on January 15th', priority: 'high', time: '1 day ago', icon: DollarSign },
    { id: '4', type: 'vote', title: 'Voting Reminder', message: 'Investment proposal voting ends in 2 days', priority: 'medium', time: '1 day ago', icon: Users }
  ];

  const notificationSettings = [
    { type: 'Contribution Reminders', enabled: true, description: 'Get notified about upcoming contributions' },
    { type: 'Meeting Alerts', enabled: true, description: 'Receive meeting reminders and updates' },
    { type: 'Loan Notifications', enabled: true, description: 'Alerts for loan payments and approvals' },
    { type: 'Voting Reminders', enabled: false, description: 'Notifications for active polls and voting' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Smart Notifications</h2>
        <p className="text-muted-foreground">Manage alerts and reminders</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Notifications
            </CardTitle>
            <CardDescription>Your latest alerts and reminders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notification) => {
                const IconComponent = notification.icon;
                return (
                  <div key={notification.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <IconComponent className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <Badge variant={getPriorityColor(notification.priority)} className="text-xs">
                          {notification.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button className="w-full mt-4" variant="outline">View All Notifications</Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure your alert preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notificationSettings.map((setting, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-sm">{setting.type}</h4>
                    <p className="text-xs text-muted-foreground">{setting.description}</p>
                  </div>
                  <Button size="sm" variant={setting.enabled ? "default" : "outline"}>
                    {setting.enabled ? "On" : "Off"}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SmartNotifications;
