
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  MessageSquare, 
  Send, 
  Users, 
  Building2, 
  Bell, 
  Calendar,
  Target,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminMessaging: React.FC = () => {
  const { toast } = useToast();
  const [messageForm, setMessageForm] = useState({
    title: '',
    message: '',
    priority: 'medium',
    targetAudience: 'all',
    scheduledTime: '',
    includeEmail: false,
    includeSMS: false,
    includePush: true
  });

  // Mock data
  const messageTemplates = [
    {
      id: 1,
      name: 'Loan Repayment Reminder',
      category: 'Loans',
      content: 'Dear {name}, your loan repayment of KES {amount} is due on {date}. Please ensure timely payment to maintain your credit score.'
    },
    {
      id: 2,
      name: 'Chama Contribution Reminder',
      category: 'Contributions',
      content: 'Hello {name}, your monthly contribution of KES {amount} for {chama_name} is due. Contribute now to stay active.'
    },
    {
      id: 3,
      name: 'Welcome New Member',
      category: 'Onboarding',
      content: 'Welcome to Verdio, {name}! Complete your KYC verification to unlock all features and start your financial journey.'
    }
  ];

  const sentMessages = [
    {
      id: 1,
      title: 'Monthly Contribution Reminder',
      recipients: 1234,
      sent: '2024-07-13 09:00',
      deliveryRate: 98.5,
      openRate: 76.2,
      status: 'delivered'
    },
    {
      id: 2,
      title: 'System Maintenance Notice',
      recipients: 12547,
      sent: '2024-07-12 18:00',
      deliveryRate: 99.2,
      openRate: 82.1,
      status: 'delivered'
    },
    {
      id: 3,
      title: 'New Feature Announcement',
      recipients: 8934,
      sent: '2024-07-11 10:30',
      deliveryRate: 97.8,
      openRate: 68.5,
      status: 'delivered'
    }
  ];

  const handleSendMessage = () => {
    if (!messageForm.title || !messageForm.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    console.log('Sending message:', messageForm);
    
    toast({
      title: "Message Sent! 📨",
      description: `Message "${messageForm.title}" has been sent successfully.`,
    });

    // Reset form
    setMessageForm({
      title: '',
      message: '',
      priority: 'medium',
      targetAudience: 'all',
      scheduledTime: '',
      includeEmail: false,
      includeSMS: false,
      includePush: true
    });
  };

  const getAudienceCount = (audience: string) => {
    switch (audience) {
      case 'all': return 12547;
      case 'active-users': return 8934;
      case 'chama-leaders': return 1432;
      case 'overdue-loans': return 234;
      case 'pending-kyc': return 456;
      default: return 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Message Composer */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Compose Bulk Message
          </CardTitle>
          <CardDescription>
            Send targeted messages to users, groups, or specific segments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="title">Message Title *</Label>
              <Input
                id="title"
                value={messageForm.title}
                onChange={(e) => setMessageForm({...messageForm, title: e.target.value})}
                placeholder="Enter message title"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority Level</Label>
              <Select value={messageForm.priority} onValueChange={(value) => setMessageForm({...messageForm, priority: value})}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="message">Message Content *</Label>
            <Textarea
              id="message"
              value={messageForm.message}
              onChange={(e) => setMessageForm({...messageForm, message: e.target.value})}
              placeholder="Type your message here..."
              rows={4}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use {'{name}'}, {'{amount}'}, {'{date}'} for personalization
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="audience">Target Audience</Label>
              <Select value={messageForm.targetAudience} onValueChange={(value) => setMessageForm({...messageForm, targetAudience: value})}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users ({getAudienceCount('all').toLocaleString()})</SelectItem>
                  <SelectItem value="active-users">Active Users ({getAudienceCount('active-users').toLocaleString()})</SelectItem>
                  <SelectItem value="chama-leaders">Chama Leaders ({getAudienceCount('chama-leaders').toLocaleString()})</SelectItem>
                  <SelectItem value="overdue-loans">Overdue Loans ({getAudienceCount('overdue-loans').toLocaleString()})</SelectItem>
                  <SelectItem value="pending-kyc">Pending KYC ({getAudienceCount('pending-kyc').toLocaleString()})</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="schedule">Schedule (Optional)</Label>
              <Input
                id="schedule"
                type="datetime-local"
                value={messageForm.scheduledTime}
                onChange={(e) => setMessageForm({...messageForm, scheduledTime: e.target.value})}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Delivery Channels</Label>
            <div className="flex gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="push"
                  checked={messageForm.includePush}
                  onCheckedChange={(checked) => setMessageForm({...messageForm, includePush: !!checked})}
                />
                <Label htmlFor="push">Push Notification</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email"
                  checked={messageForm.includeEmail}
                  onCheckedChange={(checked) => setMessageForm({...messageForm, includeEmail: !!checked})}
                />
                <Label htmlFor="email">Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sms"
                  checked={messageForm.includeSMS}
                  onCheckedChange={(checked) => setMessageForm({...messageForm, includeSMS: !!checked})}
                />
                <Label htmlFor="sms">SMS</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline">
              Save as Draft
            </Button>
            <Button onClick={handleSendMessage} className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
              <Send className="h-4 w-4 mr-2" />
              {messageForm.scheduledTime ? 'Schedule Message' : 'Send Now'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Message Templates */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Message Templates</CardTitle>
            <CardDescription>Pre-built templates for common communications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {messageTemplates.map((template) => (
                <div key={template.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{template.name}</h4>
                      <Badge variant="outline" className="text-xs mt-1">
                        {template.category}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {template.content}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setMessageForm({
                        ...messageForm,
                        title: template.name,
                        message: template.content
                      })}
                    >
                      Use
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Message History */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
            <CardDescription>Message delivery statistics and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sentMessages.map((message) => (
                <div key={message.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{message.title}</h4>
                    <Badge 
                      variant="outline" 
                      className={message.status === 'delivered' ? 'border-green-200 text-green-800' : 'border-gray-200'}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {message.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Recipients:</span>
                      <span className="font-medium ml-1">{message.recipients.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Sent:</span>
                      <span className="font-medium ml-1">{message.sent}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Delivery:</span>
                      <span className="font-medium ml-1 text-green-600">{message.deliveryRate}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Open Rate:</span>
                      <span className="font-medium ml-1 text-blue-600">{message.openRate}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminMessaging;
