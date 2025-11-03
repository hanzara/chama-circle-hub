import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export const useAnnouncementInteractions = (announcementId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch likes
  const likesQuery = useQuery({
    queryKey: ['announcement-likes', announcementId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chama_announcement_likes')
        .select('*')
        .eq('announcement_id', announcementId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!announcementId
  });

  // Fetch comments with user profiles
  const commentsQuery = useQuery({
    queryKey: ['announcement-comments', announcementId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chama_announcement_comments')
        .select(`
          *,
          user_profiles!inner(display_name, avatar_url)
        `)
        .eq('announcement_id', announcementId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!announcementId
  });

  // Fetch shares
  const sharesQuery = useQuery({
    queryKey: ['announcement-shares', announcementId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chama_announcement_shares')
        .select('*')
        .eq('announcement_id', announcementId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!announcementId
  });

  // Toggle like
  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const existingLike = likesQuery.data?.find(like => like.user_id === user.id);

      if (existingLike) {
        const { error } = await supabase
          .from('chama_announcement_likes')
          .delete()
          .eq('id', existingLike.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('chama_announcement_likes')
          .insert({
            announcement_id: announcementId,
            user_id: user.id
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcement-likes', announcementId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update like',
        variant: 'destructive'
      });
    }
  });

  // Add comment
  const addComment = useMutation({
    mutationFn: async (comment_text: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('chama_announcement_comments')
        .insert({
          announcement_id: announcementId,
          user_id: user.id,
          comment_text
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcement-comments', announcementId] });
      toast({
        title: 'Success',
        description: 'Comment added successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add comment',
        variant: 'destructive'
      });
    }
  });

  // Delete comment
  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('chama_announcement_comments')
        .delete()
        .eq('id', commentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcement-comments', announcementId] });
      toast({
        title: 'Success',
        description: 'Comment deleted successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete comment',
        variant: 'destructive'
      });
    }
  });

  // Share announcement
  const shareAnnouncement = useMutation({
    mutationFn: async (shareType: 'internal' | 'external' | 'copy_link') => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('chama_announcement_shares')
        .insert({
          announcement_id: announcementId,
          user_id: user.id,
          share_type: shareType
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcement-shares', announcementId] });
      toast({
        title: 'Success',
        description: 'Announcement shared successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to share announcement',
        variant: 'destructive'
      });
    }
  });

  const isLikedByUser = likesQuery.data?.some(like => like.user_id === user?.id) || false;
  const likesCount = likesQuery.data?.length || 0;
  const commentsCount = commentsQuery.data?.length || 0;
  const sharesCount = sharesQuery.data?.length || 0;

  return {
    likes: likesQuery.data || [],
    comments: commentsQuery.data || [],
    shares: sharesQuery.data || [],
    isLikedByUser,
    likesCount,
    commentsCount,
    sharesCount,
    isLoading: likesQuery.isLoading || commentsQuery.isLoading || sharesQuery.isLoading,
    toggleLike,
    addComment,
    deleteComment,
    shareAnnouncement
  };
};

// Hook for email subscriptions
export const useEmailSubscription = (chamaId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const subscriptionQuery = useQuery({
    queryKey: ['email-subscription', chamaId, user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('chama_email_subscriptions')
        .select('*')
        .eq('chama_id', chamaId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!chamaId
  });

  const updateSubscription = useMutation({
    mutationFn: async (preferences: {
      subscribed_to_announcements?: boolean;
      subscribed_to_contributions?: boolean;
      subscribed_to_loans?: boolean;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Get user email
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser?.email) throw new Error('User email not found');

      // First, try to get existing subscription
      const { data: existingSubscription } = await supabase
        .from('chama_email_subscriptions')
        .select('*')
        .eq('chama_id', chamaId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingSubscription) {
        // Update existing subscription
        const { error } = await supabase
          .from('chama_email_subscriptions')
          .update(preferences)
          .eq('id', existingSubscription.id);
        
        if (error) throw error;
      } else {
        // Insert new subscription
        const { error } = await supabase
          .from('chama_email_subscriptions')
          .insert({
            chama_id: chamaId,
            user_id: user.id,
            email_address: authUser.email,
            ...preferences
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-subscription', chamaId, user?.id] });
      toast({
        title: 'Success',
        description: 'Email subscription updated'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update subscription',
        variant: 'destructive'
      });
    }
  });

  return {
    subscription: subscriptionQuery.data,
    isLoading: subscriptionQuery.isLoading,
    updateSubscription
  };
};
