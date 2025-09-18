
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, FileText, Shield, Bell, Download, Save } from 'lucide-react';
import { useAdminTools } from '@/hooks/useAdminTools';

interface AdminToolsProps {
  chamaData: any;
}

const AdminTools: React.FC<AdminToolsProps> = ({ chamaData }) => {
  const { updateChama, isUpdating, exportData, isExporting, sendAnnouncement, isSending } = useAdminTools();
  
  const [groupName, setGroupName] = useState(chamaData.name);
  const [groupDescription, setGroupDescription] = useState(chamaData.description || '');
  const [contributionAmount, setContributionAmount] = useState(chamaData.contribution_amount);
  const [contributionFrequency, setContributionFrequency] = useState(chamaData.contribution_frequency);
  
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementPriority, setAnnouncementPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);

  const handleSaveChanges = () => {
    updateChama({
      chamaId: chamaData.id,
      updates: {
        name: groupName,
        description: groupDescription,
        contribution_amount: contributionAmount,
        contribution_frequency: contributionFrequency
      }
    });
  };

  const handleExportData = () => {
    exportData({ chamaId: chamaData.id });
  };

  const handleSendAnnouncement = () => {
    if (announcementTitle.trim() && announcementMessage.trim()) {
      sendAnnouncement({
        chamaId: chamaData.id,
        title: announcementTitle,
        message: announcementMessage,
        priority: announcementPriority
      });
      setAnnouncementTitle('');
      setAnnouncementMessage('');
      setAnnouncementPriority('medium');
      setIsAnnouncementOpen(false);
    }
  };

  const adminActions = [
    { 
      title: 'Export Data', 
      description: 'Download complete group data for record keeping', 
      icon: FileText, 
      action: () => handleExportData(),
      loading: isExporting,
      buttonText: isExporting ? 'Exporting...' : 'Export Now'
    },
    { 
      title: 'Archive Chama', 
      description: 'Archive this group while preserving all data', 
      icon: Shield, 
      action: () => console.log('Archive functionality coming soon'),
      loading: false,
      buttonText: 'Archive',
      variant: 'destructive' as const
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Admin Tools</h2>
        <p className="text-muted-foreground">Administrative controls and group management</p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Group Settings</CardTitle>
          <CardDescription>Customize your group's appearance and settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="groupName">Group Name</Label>
            <Input 
              id="groupName" 
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="groupDescription">Description</Label>
            <Textarea 
              id="groupDescription" 
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder="Enter group description..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contributionAmount">Contribution Amount (KES)</Label>
              <Input 
                id="contributionAmount" 
                type="number"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="contributionFrequency">Frequency</Label>
              <select 
                id="contributionFrequency"
                value={contributionFrequency}
                onChange={(e) => setContributionFrequency(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
          </div>
          <Button 
            onClick={handleSaveChanges}
            disabled={isUpdating}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {adminActions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <Card key={index} className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconComponent className="h-5 w-5" />
                  {action.title}
                </CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant={action.variant || 'default'}
                  onClick={action.action}
                  disabled={action.loading}
                  className="flex items-center gap-2"
                >
                  {action.title === 'Export Data' && <Download className="h-4 w-4" />}
                  {action.buttonText}
                </Button>
              </CardContent>
            </Card>
          );
        })}
        
        {/* Send Announcement Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Send Announcement
            </CardTitle>
            <CardDescription>Broadcast message to all members</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={isAnnouncementOpen} onOpenChange={setIsAnnouncementOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Create Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Send Announcement</DialogTitle>
                  <DialogDescription>
                    Send a message to all active members of this chama.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="announcement-title">Title</Label>
                    <Input
                      id="announcement-title"
                      value={announcementTitle}
                      onChange={(e) => setAnnouncementTitle(e.target.value)}
                      placeholder="Enter announcement title..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="announcement-message">Message</Label>
                    <Textarea
                      id="announcement-message"
                      value={announcementMessage}
                      onChange={(e) => setAnnouncementMessage(e.target.value)}
                      placeholder="Enter your message..."
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="announcement-priority">Priority</Label>
                    <select 
                      id="announcement-priority"
                      value={announcementPriority}
                      onChange={(e) => setAnnouncementPriority(e.target.value as 'high' | 'medium' | 'low')}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleSendAnnouncement}
                    disabled={isSending || !announcementTitle.trim() || !announcementMessage.trim()}
                    className="flex items-center gap-2"
                  >
                    <Bell className="h-4 w-4" />
                    {isSending ? 'Sending...' : 'Send Announcement'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminTools;
