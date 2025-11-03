
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, FileText, Shield, Bell, Download, Save, Lock, Unlock, Image } from 'lucide-react';
import { useAdminTools } from '@/hooks/useAdminTools';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminToolsProps {
  chamaData: any;
  userRole: 'admin' | 'treasurer' | 'secretary' | 'member';
}

const AdminTools: React.FC<AdminToolsProps> = ({ chamaData, userRole }) => {
  const { updateChama, isUpdating, exportData, isExporting, sendAnnouncement, isSending } = useAdminTools();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [groupName, setGroupName] = useState(chamaData.name);
  const [groupDescription, setGroupDescription] = useState(chamaData.description || '');
  const [groupRules, setGroupRules] = useState(chamaData.rules || '');
  const [logoUrl, setLogoUrl] = useState(chamaData.logo_url || '');
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
        rules: groupRules,
        logo_url: logoUrl,
        contribution_amount: contributionAmount,
        contribution_frequency: contributionFrequency
      }
    });
  };

  const { mutate: toggleFundLock, isPending: isTogglingLock } = useMutation({
    mutationFn: async (lockStatus: boolean) => {
      const { data, error } = await supabase.rpc('toggle_chama_fund_lock', {
        p_chama_id: chamaData.id,
        p_lock_status: lockStatus
      });
      if (error) throw error;
      return data as { success: boolean; locked: boolean };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chama', chamaData.id] });
      toast({
        title: "Success",
        description: `Funds ${data.locked ? 'locked' : 'unlocked'} successfully`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

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

  const { mutate: deleteChama, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('delete_chama', {
        p_chama_id: chamaData.id
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Chama deleted successfully"
      });
      window.location.href = '/chamas';
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleDeleteChama = () => {
    if (window.confirm(`Are you sure you want to delete "${chamaData.name}"? This action cannot be undone.`)) {
      deleteChama();
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
      title: 'Delete Chama', 
      description: 'Permanently delete this chama and all its data', 
      icon: Shield, 
      action: handleDeleteChama,
      loading: isDeleting,
      buttonText: isDeleting ? 'Deleting...' : 'Delete Chama',
      variant: 'destructive' as const
    }
  ];

  const isAdmin = userRole === 'admin';
  const isTreasurer = userRole === 'treasurer';
  const isSecretary = userRole === 'secretary';
  const canEdit = isAdmin;
  const canViewFundStatus = isAdmin || isTreasurer;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          {isAdmin ? 'Admin Settings' : 'Chama Information'}
        </h2>
        <p className="text-muted-foreground">
          {isAdmin ? 'Administrative controls and group management' : 'View chama details and information'}
        </p>
      </div>

      {/* Chama Details Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Chama Details</CardTitle>
          <CardDescription>
            {canEdit ? 'Customize your group\'s appearance and settings' : 'Group information and settings'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="logoUrl">Chama Logo URL</Label>
            {canEdit ? (
              <div className="flex gap-2">
                <Input 
                  id="logoUrl" 
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
                <Button variant="outline" size="icon">
                  <Image className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">{logoUrl || 'No logo set'}</div>
            )}
          </div>

          <div>
            <Label htmlFor="groupName">Group Name</Label>
            {canEdit ? (
              <Input 
                id="groupName" 
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            ) : (
              <div className="text-sm text-muted-foreground">{groupName}</div>
            )}
          </div>

          <div>
            <Label htmlFor="groupDescription">Description</Label>
            {canEdit ? (
              <Textarea 
                id="groupDescription" 
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="Enter group description..."
              />
            ) : (
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                {groupDescription || 'No description'}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="groupRules">Chama Rules</Label>
            {canEdit ? (
              <Textarea 
                id="groupRules" 
                value={groupRules}
                onChange={(e) => setGroupRules(e.target.value)}
                placeholder="Enter group rules..."
                rows={6}
              />
            ) : (
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                {groupRules || 'No rules set'}
              </div>
            )}
          </div>

          {canEdit && (
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
          )}

          {canEdit && (
            <Button 
              onClick={handleSaveChanges}
              disabled={isUpdating}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Fund Control Card - Admin Only */}
      {canViewFundStatus && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Fund Controls
            </CardTitle>
            <CardDescription>
              {isAdmin 
                ? 'Manage member withdrawal permissions' 
                : 'View fund status (admin-only controls)'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Current Status</p>
                <p className="text-sm text-muted-foreground">
                  Funds are currently {chamaData.funds_locked ? 'locked' : 'unlocked'}
                </p>
              </div>
              {chamaData.funds_locked ? (
                <Lock className="h-8 w-8 text-destructive" />
              ) : (
                <Unlock className="h-8 w-8 text-green-600" />
              )}
            </div>

            {isAdmin && (
              <div className="flex gap-2">
                <Button
                  variant={chamaData.funds_locked ? "outline" : "default"}
                  onClick={() => toggleFundLock(false)}
                  disabled={isTogglingLock || !chamaData.funds_locked}
                  className="flex-1"
                >
                  <Unlock className="h-4 w-4 mr-2" />
                  Unlock Funds
                </Button>
                <Button
                  variant={chamaData.funds_locked ? "default" : "outline"}
                  onClick={() => toggleFundLock(true)}
                  disabled={isTogglingLock || chamaData.funds_locked}
                  className="flex-1"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Lock Funds
                </Button>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              {chamaData.funds_locked 
                ? '⚠️ Members cannot withdraw from savings or Merry-Go-Round wallets'
                : '✓ Members can freely withdraw from their wallets'
              }
            </div>
          </CardContent>
        </Card>
      )}

      {isAdmin && (
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
      )}
    </div>
  );
};

export default AdminTools;
