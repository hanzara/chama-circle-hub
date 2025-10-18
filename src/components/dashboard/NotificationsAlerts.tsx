import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  X,
  Calendar,
  CreditCard,
  Shield,
  Wallet
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'payment_reminder' | 'kyc_prompt' | 'failed_transfer' | 'meeting_reminder' | 'low_balance' | 'info';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  read: boolean;
  action_url?: string;
}

interface NotificationsAlertsProps {
  notifications: Notification[];
  onDismiss: (notificationId: string) => void;
  onMarkAsRead: (notificationId: string) => void;
}

export const NotificationsAlerts: React.FC<NotificationsAlertsProps> = ({ 
  notifications, 
  onDismiss, 
  onMarkAsRead 
}) => {
  if (!notifications || notifications.length === 0) {
    return null; // Don't show empty notifications component
  }

  const unreadNotifications = notifications.filter(n => !n.read);
  const criticalNotifications = notifications.filter(n => n.priority === 'critical');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment_reminder':
        return <Calendar className="h-4 w-4" />;
      case 'kyc_prompt':
        return <Shield className="h-4 w-4" />;
      case 'failed_transfer':
        return <AlertTriangle className="h-4 w-4" />;
      case 'meeting_reminder':
        return <Calendar className="h-4 w-4" />;
      case 'low_balance':
        return <Wallet className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge variant="secondary" className="bg-orange-500 text-white">High</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-500 text-white">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return null;
    }
  };

  // Show critical notifications first, then others by recency
  const sortedNotifications = [...notifications]
    .sort((a, b) => {
      if (a.priority === 'critical' && b.priority !== 'critical') return -1;
      if (b.priority === 'critical' && a.priority !== 'critical') return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })
    .slice(0, 5); // Show only the 5 most important notifications

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notifications
            {unreadNotifications.length > 0 && (
              <Badge variant="destructive" className="rounded-full">
                {unreadNotifications.length}
              </Badge>
            )}
          </div>
          {criticalNotifications.length > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {criticalNotifications.length} Critical
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-l-4 rounded-r-lg ${getPriorityColor(notification.priority)} ${
                !notification.read ? 'font-medium' : 'opacity-75'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium">{notification.title}</h4>
                      {getPriorityBadge(notification.priority)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 ml-2">
                  {!notification.read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onMarkAsRead(notification.id)}
                      className="h-6 w-6 p-0"
                    >
                      <CheckCircle className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDismiss(notification.id)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};