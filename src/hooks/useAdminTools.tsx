
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from './use-toast';

export const useAdminTools = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateChamaMutation = useMutation({
    mutationFn: async ({ chamaId, updates }: { chamaId: string; updates: any }) => {
      console.log('=== Updating Chama ===');
      console.log('Chama ID:', chamaId);
      console.log('Updates:', updates);

      // Mock implementation - replace with actual table when available
      const { error } = await supabase
        .from('profiles')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chamaId);

      if (error) throw error;

      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Chama Updated! ✅",
        description: "Chama settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['chamas'] });
    },
    onError: (error: any) => {
      console.error('Error updating chama:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update chama",
        variant: "destructive",
      });
    },
  });

  const saveRulesMutation = useMutation({
    mutationFn: async ({ chamaId, rules }: { chamaId: string; rules: any }) => {
      console.log('=== Saving Rules ===');
      console.log('Chama ID:', chamaId);
      console.log('Rules:', rules);

      // Mock implementation - replace with actual table when available
      const { error } = await supabase
        .from('profiles')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chamaId);

      if (error) throw error;

      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Rules Updated! ✅",
        description: "Chama rules have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['chama-settings'] });
    },
    onError: (error: any) => {
      console.error('Error saving rules:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save rules",
        variant: "destructive",
      });
    },
  });

  const exportDataMutation = useMutation({
    mutationFn: async ({ chamaId }: { chamaId: string }) => {
      console.log('=== Exporting Data ===');
      console.log('Chama ID:', chamaId);

      const { data, error } = await supabase.functions.invoke('export-chama-data', {
        body: { chamaId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Create download link for the exported data
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chama_data_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Data Exported! 📊",
        description: "Chama data has been exported successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Error exporting data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to export data",
        variant: "destructive",
      });
    },
  });

  const sendAnnouncementMutation = useMutation({
    mutationFn: async ({ chamaId, title, message, priority }: {
      chamaId: string;
      title: string;
      message: string;
      priority: 'high' | 'medium' | 'low';
    }) => {
      console.log('=== Sending Announcement ===');
      console.log('Chama ID:', chamaId);
      console.log('Title:', title);
      console.log('Message:', message);
      console.log('Priority:', priority);

      const { data, error } = await supabase.functions.invoke('send-announcement', {
        body: {
          chamaId,
          title,
          message,
          priority
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Announcement Sent! 📢",
        description: "Your announcement has been sent to all members.",
      });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      console.error('Error sending announcement:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send announcement",
        variant: "destructive",
      });
    },
  });

  return {
    updateChama: updateChamaMutation.mutate,
    isUpdating: updateChamaMutation.isPending,
    saveRules: saveRulesMutation.mutate,
    isSavingRules: saveRulesMutation.isPending,
    exportData: exportDataMutation.mutate,
    isExporting: exportDataMutation.isPending,
    sendAnnouncement: sendAnnouncementMutation.mutate,
    isSending: sendAnnouncementMutation.isPending,
  };
};
