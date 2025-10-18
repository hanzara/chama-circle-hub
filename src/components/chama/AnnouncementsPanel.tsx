import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Check } from 'lucide-react';
import { useChamaNotifications } from '@/hooks/useChamaNotifications';
import { formatDistanceToNow } from 'date-fns';

interface AnnouncementsPanelProps {
  chamaId: string;
}

export const AnnouncementsPanel: React.FC<AnnouncementsPanelProps> = ({ chamaId }) => {
  const { notifications, isLoading, markAsRead, markAllAsRead } = useChamaNotifications(chamaId);

  const announcements = notifications.filter(n => n.type === 'announcement');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return <div>Loading announcements...</div>;
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Announcements
        </CardTitle>
        {announcements.some(a => !a.is_read) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsRead.mutate()}
          >
            Mark All Read
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {announcements.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No announcements yet
          </p>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`p-4 rounded-lg border ${
                announcement.is_read ? 'bg-background' : 'bg-accent/50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{announcement.title}</h4>
                  {announcement.metadata && typeof announcement.metadata === 'object' && 'priority' in announcement.metadata && (
                    <Badge variant={getPriorityColor(announcement.metadata.priority as string)}>
                      {announcement.metadata.priority as string}
                    </Badge>
                  )}
                </div>
                {!announcement.is_read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead.mutate(announcement.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {announcement.message}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
