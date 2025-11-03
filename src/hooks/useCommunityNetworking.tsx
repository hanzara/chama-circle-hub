import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  event_type: string;
  event_date: string;
  event_time: string;
  location?: string;
  meeting_link?: string;
  is_online: boolean;
  max_attendees?: number;
  current_attendees: number;
  created_by: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ChamaFollow {
  id: string;
  follower_id: string;
  chama_id: string;
  created_at: string;
}

interface EventRSVP {
  id: string;
  event_id: string;
  user_id: string;
  status: string;
  rsvp_date: string;
}

interface SpotlightStory {
  id: string;
  title: string;
  description: string;
  chama_id?: string;
  author_id: string;
  content_type: string;
  content_url?: string;
  thumbnail_url?: string;
  duration?: number;
  views: number;
  likes: number;
  featured: boolean;
  status: string;
  created_at: string;
}

export const useCommunityNetworking = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [follows, setFollows] = useState<ChamaFollow[]>([]);
  const [rsvps, setRsvps] = useState<EventRSVP[]>([]);
  const [stories, setStories] = useState<SpotlightStory[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [recommendedChamas, setRecommendedChamas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch community events
  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('community_events')
        .select('*')
        .eq('status', 'upcoming')
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      console.error('Error fetching events:', error);
    }
  };

  // Fetch user's chama follows
  const fetchFollows = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('chama_follows')
        .select('*')
        .eq('follower_id', user.id);

      if (error) throw error;
      setFollows(data || []);
    } catch (error: any) {
      console.error('Error fetching follows:', error);
    }
  };

  // Fetch user's RSVPs
  const fetchRSVPs = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('event_rsvps')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setRsvps(data || []);
    } catch (error: any) {
      console.error('Error fetching RSVPs:', error);
    }
  };

  // Fetch spotlight stories
  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from('spotlight_stories')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setStories(data || []);
    } catch (error: any) {
      console.error('Error fetching stories:', error);
    }
  };

  // Create a new community event
  const createEvent = async (eventData: {
    title: string;
    description: string;
    event_type: string;
    event_date: string;
    event_time: string;
    location?: string;
    meeting_link?: string;
    is_online: boolean;
    max_attendees?: number;
  }) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create events",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('community_events')
        .insert({
          ...eventData,
          created_by: user.id,
          current_attendees: 0,
          status: 'upcoming'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event created successfully",
      });
      
      await fetchEvents();
      return true;
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // RSVP to an event
  const rsvpToEvent = async (eventId: string, status: 'attending' | 'not_attending' = 'attending') => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to RSVP",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('event_rsvps')
        .upsert({
          event_id: eventId,
          user_id: user.id,
          status
        }, { onConflict: 'event_id,user_id' });

      if (error) throw error;

      // Update event attendee count - using direct update instead of RPC
      if (status === 'attending') {
        const { error: updateError } = await supabase
          .from('community_events')
          .update({ current_attendees: events.find(e => e.id === eventId)?.current_attendees + 1 || 1 })
          .eq('id', eventId);
        
        if (updateError) console.warn('Failed to update attendee count:', updateError);
      }

      toast({
        title: "Success",
        description: status === 'attending' ? "RSVP confirmed!" : "RSVP cancelled",
      });
      
      await fetchRSVPs();
      await fetchEvents();
      return true;
    } catch (error: any) {
      console.error('Error updating RSVP:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update RSVP",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Follow/unfollow a chama
  const toggleChamaFollow = async (chamaId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to follow chamas",
        variant: "destructive",
      });
      return false;
    }

    const existingFollow = follows.find(f => f.chama_id === chamaId);
    setLoading(true);

    try {
      if (existingFollow) {
        // Unfollow
        const { error } = await supabase
          .from('chama_follows')
          .delete()
          .eq('id', existingFollow.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Unfollowed chama",
        });
      } else {
        // Follow
        const { error } = await supabase
          .from('chama_follows')
          .insert({
            follower_id: user.id,
            chama_id: chamaId
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Following chama",
        });
      }
      
      await fetchFollows();
      return true;
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update follow status",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Create a spotlight story
  const createSpotlightStory = async (storyData: {
    title: string;
    description: string;
    content_type: 'article' | 'video';
    chama_id?: string;
    content_url?: string;
    thumbnail_url?: string;
    duration?: number;
  }) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create stories",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('spotlight_stories')
        .insert({
          ...storyData,
          author_id: user.id,
          views: 0,
          likes: 0,
          featured: false,
          status: 'published'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Story created successfully",
      });
      
      await fetchStories();
      return true;
    } catch (error: any) {
      console.error('Error creating story:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create story",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update story views
  const incrementStoryViews = async (storyId: string) => {
    try {
      const { error } = await supabase
        .from('spotlight_stories')
        .update({ views: stories.find(s => s.id === storyId)?.views + 1 || 1 })
        .eq('id', storyId);

      if (error) throw error;
      await fetchStories();
    } catch (error: any) {
      console.error('Error updating story views:', error);
    }
  };

  // Check if user is following a chama
  const isFollowingChama = (chamaId: string) => {
    return follows.some(f => f.chama_id === chamaId);
  };

  // Check if user has RSVP'd to an event
  const hasRSVPToEvent = (eventId: string) => {
    return rsvps.find(r => r.event_id === eventId && r.status === 'attending');
  };

  useEffect(() => {
    fetchEvents();
    fetchStories();
    if (user) {
      fetchFollows();
      fetchRSVPs();
      fetchConnections();
    }
  }, [user]);

  // Fetch connections and recommended chamas
  const fetchConnections = async () => {
    if (!user) return;
    
    try {
      // Get chamas that user follows
      const { data: followsData, error: followsError } = await supabase
        .from('chama_follows')
        .select('chama_id')
        .eq('follower_id', user.id);

      if (followsError) {
        setConnections([]);
      } else {
        // Get chama details for followed chamas
        if (followsData && followsData.length > 0) {
          const chamaIds = followsData.map(f => f.chama_id);
          const { data: chamasData } = await supabase
            .from('chamas')
            .select('*')
            .in('id', chamaIds);
          
          setConnections(chamasData?.map(chama => ({
            ...chama,
            connection_status: 'connected'
          })) || []);
        } else {
          setConnections([]);
        }
      }

      // Get recommended chamas
      const { data: allChamas } = await supabase
        .from('chamas')
        .select('*')
        .limit(10);

      const followedIds = followsData?.map(f => f.chama_id) || [];
      const recommended = allChamas?.filter(chama => !followedIds.includes(chama.id)) || [];
      setRecommendedChamas(recommended.map(chama => ({
        ...chama,
        connection_status: 'none'
      })));
    } catch (error) {
      console.error('Error fetching connections:', error);
      setConnections([]);
      setRecommendedChamas([]);
    }
  };

  return {
    events,
    follows,
    rsvps,
    stories,
    connections,
    recommendedChamas,
    loading,
    createEvent,
    rsvpToEvent,
    toggleChamaFollow,
    createSpotlightStory,
    incrementStoryViews,
    isFollowingChama,
    hasRSVPToEvent,
    refetch: () => {
      fetchEvents();
      fetchStories();
      if (user) {
        fetchFollows();
        fetchRSVPs();
        fetchConnections();
      }
    }
  };
};