import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Bell, 
  Check, 
  Heart, 
  MessageCircle, 
  Share2, 
  Mail, 
  Trash2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useChamaNotifications } from '@/hooks/useChamaNotifications';
import { useAnnouncementInteractions, useEmailSubscription } from '@/hooks/useAnnouncementInteractions';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface EnhancedAnnouncementsPanelProps {
  chamaId: string;
}

export const EnhancedAnnouncementsPanel: React.FC<EnhancedAnnouncementsPanelProps> = ({ chamaId }) => {
  const { user } = useAuth();
  const { notifications, isLoading, markAsRead, markAllAsRead } = useChamaNotifications(chamaId);
  const { subscription, updateSubscription } = useEmailSubscription(chamaId);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const announcements = notifications.filter(n => n.type === 'announcement');

  const getPriorityColor = (priority: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      default: return 'secondary';
    }
  };

  const handleCopyLink = (announcementId: string) => {
    const link = `${window.location.origin}/chama/${chamaId}/announcement/${announcementId}`;
    navigator.clipboard.writeText(link);
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
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Email Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Email Notification Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="announcements">Announcements</Label>
                  <Switch
                    id="announcements"
                    checked={subscription?.subscribed_to_announcements || false}
                    onCheckedChange={(checked) => 
                      updateSubscription.mutate({ subscribed_to_announcements: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="contributions">Contributions</Label>
                  <Switch
                    id="contributions"
                    checked={subscription?.subscribed_to_contributions || false}
                    onCheckedChange={(checked) => 
                      updateSubscription.mutate({ subscribed_to_contributions: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="loans">Loans</Label>
                  <Switch
                    id="loans"
                    checked={subscription?.subscribed_to_loans || false}
                    onCheckedChange={(checked) => 
                      updateSubscription.mutate({ subscribed_to_loans: checked })
                    }
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
          {announcements.some(a => !a.is_read) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsRead.mutate()}
            >
              Mark All Read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {announcements.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No announcements yet
          </p>
        ) : (
          announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              isRead={announcement.is_read}
              onMarkAsRead={() => markAsRead.mutate(announcement.id)}
              onCopyLink={handleCopyLink}
              getPriorityColor={getPriorityColor}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
};

interface AnnouncementCardProps {
  announcement: any;
  isRead: boolean;
  onMarkAsRead: () => void;
  onCopyLink: (id: string) => void;
  getPriorityColor: (priority: string) => "default" | "destructive" | "outline" | "secondary";
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  isRead,
  onMarkAsRead,
  onCopyLink,
  getPriorityColor
}) => {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  
  const {
    isLikedByUser,
    likesCount,
    commentsCount,
    sharesCount,
    comments,
    toggleLike,
    addComment,
    deleteComment,
    shareAnnouncement
  } = useAnnouncementInteractions(announcement.id);

  const handleAddComment = () => {
    if (commentText.trim()) {
      addComment.mutate(commentText);
      setCommentText('');
    }
  };

  const handleShare = async (type: 'internal' | 'external' | 'copy_link') => {
    if (type === 'copy_link') {
      onCopyLink(announcement.id);
    }
    shareAnnouncement.mutate(type);
  };

  return (
    <div
      className={`p-4 rounded-lg border transition-colors ${
        isRead ? 'bg-background' : 'bg-accent/50'
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
        {!isRead && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAsRead}
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-3">
        {announcement.message}
      </p>

      <div className="flex items-center gap-4 mb-3">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => toggleLike.mutate()}
        >
          <Heart className={`h-4 w-4 ${isLikedByUser ? 'fill-red-500 text-red-500' : ''}`} />
          <span className="text-xs">{likesCount}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-xs">{commentsCount}</span>
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              <span className="text-xs">{sharesCount}</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Announcement</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleShare('copy_link')}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleShare('internal')}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Share Internally
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleShare('external')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Share Externally
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {showComments && (
        <div className="mt-4 space-y-3">
          <Separator />
          
          <div className="space-y-2">
            {comments.map((comment: any) => (
              <div key={comment.id} className="flex gap-3 p-2 rounded-lg bg-muted/50">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.user_profiles?.avatar_url} />
                  <AvatarFallback>
                    {comment.user_profiles?.display_name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {comment.user_profiles?.display_name || 'Anonymous'}
                    </p>
                    {comment.user_id === user?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteComment.mutate(comment.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{comment.comment_text}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Textarea
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-[60px]"
            />
            <Button onClick={handleAddComment} disabled={!commentText.trim()}>
              Post
            </Button>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-3">
        {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
      </p>
    </div>
  );
};
