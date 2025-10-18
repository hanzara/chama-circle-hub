import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Send, Users, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnnouncementComposerProps {
  chamaId: string;
  userRole: string;
}

export const AnnouncementComposer: React.FC<AnnouncementComposerProps> = ({ chamaId, userRole }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');
  const [priority, setPriority] = useState('normal');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const canSendAnnouncements = ['admin', 'secretary', 'chairman'].includes(userRole);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in both title and message',
        variant: 'destructive'
      });
      return;
    }

    setIsSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('chama-announcements', {
        body: {
          chamaId,
          title,
          message,
          targetMembers: target,
          priority
        }
      });

      if (error) throw error;

      toast({
        title: 'Announcement Sent',
        description: `Sent to ${data.recipients} member(s)`,
      });

      setTitle('');
      setMessage('');
      setTarget('all');
      setPriority('normal');

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send announcement',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!canSendAnnouncements) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Only admins, secretaries, and chairmen can send announcements</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          Send Announcement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Announcement title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            placeholder="Type your announcement message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Target Audience</Label>
            <Select value={target} onValueChange={setTarget}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    All Members
                  </div>
                </SelectItem>
                <SelectItem value="single">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Specific Member
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={priority === 'urgent' ? 'destructive' : priority === 'high' ? 'default' : 'secondary'}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
          </Badge>
        </div>

        <Button 
          onClick={handleSend} 
          disabled={isSending}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          {isSending ? 'Sending...' : 'Send Announcement'}
        </Button>
      </CardContent>
    </Card>
  );
};
