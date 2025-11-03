import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, Filter, Calendar, Users, MapPin, Star, 
  Eye, Heart, MessageCircle, Video, Play, Plus,
  UserPlus, Send, Trophy, Award, Clock, Check
} from 'lucide-react';
import { useCommunityNetworking } from '@/hooks/useCommunityNetworking';
import { useChamaDiscovery } from '@/hooks/useChamaDiscovery';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const CommunityNetworkingPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Use our custom hooks
  const {
    events,
    stories,
    loading: communityLoading,
    createEvent,
    rsvpToEvent,
    toggleChamaFollow,
    createSpotlightStory,
    incrementStoryViews,
    hasRSVPToEvent,
    isFollowingChama
  } = useCommunityNetworking();

  const {
    chamas,
    stats,
    loading: discoveryLoading,
    searchQuery,
    selectedCategory,
    getRecommendedChamas,
    getCategoryCounts,
    updateSearchQuery,
    updateSelectedCategory
  } = useChamaDiscovery();

  // Modal states
  const [showEventModal, setShowEventModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);

  // Event form state
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    event_type: 'webinar',
    event_date: '',
    event_time: '',
    location: '',
    meeting_link: '',
    is_online: true,
    max_attendees: 100
  });

  // Story form state
  const [storyForm, setStoryForm] = useState({
    title: '',
    description: '',
    content_type: 'article' as 'article' | 'video',
    content_url: '',
    thumbnail_url: '',
    duration: 0
  });

  const filters = [
    { id: 'all', label: 'All', count: stats.total_chamas },
    { id: 'investment', label: 'Investment', count: getCategoryCounts().investment || 0 },
    { id: 'youth', label: 'Youth', count: getCategoryCounts().youth || 0 },
    { id: 'women', label: 'Women', count: getCategoryCounts().women || 0 },
    { id: 'diaspora', label: 'Diaspora', count: getCategoryCounts().diaspora || 0 },
    { id: 'agriculture', label: 'Agriculture', count: getCategoryCounts().agriculture || 0 }
  ];

  const handleCreateEvent = async () => {
    if (!eventForm.title || !eventForm.event_date || !eventForm.event_time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const success = await createEvent(eventForm);
    if (success) {
      setShowEventModal(false);
      setEventForm({
        title: '',
        description: '',
        event_type: 'webinar',
        event_date: '',
        event_time: '',
        location: '',
        meeting_link: '',
        is_online: true,
        max_attendees: 100
      });
      toast({
        title: "Success",
        description: "Event created successfully!",
      });
    }
  };

  const handleCreateStory = async () => {
    if (!storyForm.title || !storyForm.description) {
      toast({
        title: "Error",
        description: "Please fill in title and description",
        variant: "destructive",
      });
      return;
    }

    const success = await createSpotlightStory(storyForm);
    if (success) {
      setShowStoryModal(false);
      setStoryForm({
        title: '',
        description: '',
        content_type: 'article',
        content_url: '',
        thumbnail_url: '',
        duration: 0
      });
      toast({
        title: "Success",
        description: "Your story has been published!",
      });
    }
  };

  const handleViewStory = (storyId: string) => {
    incrementStoryViews(storyId);
    // Could navigate to a detailed story view
  };

  const handleRSVP = async (eventId: string) => {
    await rsvpToEvent(eventId, 'attending');
  };

  const featuredChamas = getRecommendedChamas();

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-kenyan-navy to-kenyan-red bg-clip-text text-transparent">
          Community Network
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Connect with chamas, share success stories, and build meaningful relationships across Kenya's savings community
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-6">
            <Trophy className="h-8 w-8 text-kenyan-red mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.total_chamas}</div>
            <p className="text-sm text-muted-foreground">Active Chamas</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-6">
            <Users className="h-8 w-8 text-kenyan-green mx-auto mb-2" />
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-sm text-muted-foreground">Community Events</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-6">
            <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stories.length}</div>
            <p className="text-sm text-muted-foreground">Success Stories</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-6">
            <MessageCircle className="h-8 w-8 text-kenyan-navy mx-auto mb-2" />
            <div className="text-2xl font-bold">150+</div>
            <p className="text-sm text-muted-foreground">Active Connections</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="discover" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="discover" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Discover
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="spotlight" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Spotlight
          </TabsTrigger>
          <TabsTrigger value="connections" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Connections
          </TabsTrigger>
        </TabsList>

        {/* Discover Tab */}
        <TabsContent value="discover" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search chamas by name, location, or focus area..."
                  value={searchQuery}
                  onChange={(e) => updateSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 flex-wrap">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={selectedCategory === filter.id ? "default" : "outline"}
                size="sm"
                onClick={() => updateSelectedCategory(filter.id)}
                className="gap-2"
              >
                {filter.label}
                <Badge variant="secondary" className="ml-1">
                  {filter.count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Featured Chamas */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Featured Chamas</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredChamas.slice(0, 6).map((chama, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${chama.name}`} />
                          <AvatarFallback>{chama.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{chama.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {chama.current_members} members
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={isFollowingChama(chama.id) ? "secondary" : "outline"}
                        onClick={() => toggleChamaFollow(chama.id)}
                        disabled={communityLoading}
                      >
                        {isFollowingChama(chama.id) ? "Following" : "Follow"}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{chama.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Est. 2023</span>
                      <span>Nairobi, Kenya</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Community Events</h2>
            <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Community Event</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="event-title">Event Title</Label>
                    <Input
                      id="event-title"
                      value={eventForm.title}
                      onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter event title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="event-description">Description</Label>
                    <Textarea
                      id="event-description"
                      value={eventForm.description}
                      onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your event..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="event-date">Date</Label>
                      <Input
                        id="event-date"
                        type="date"
                        value={eventForm.event_date}
                        onChange={(e) => setEventForm(prev => ({ ...prev, event_date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="event-time">Time</Label>
                      <Input
                        id="event-time"
                        type="time"
                        value={eventForm.event_time}
                        onChange={(e) => setEventForm(prev => ({ ...prev, event_time: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="event-type">Event Type</Label>
                    <Select 
                      value={eventForm.event_type} 
                      onValueChange={(value) => setEventForm(prev => ({ ...prev, event_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="webinar">Webinar</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="meetup">Meetup</SelectItem>
                        <SelectItem value="conference">Conference</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreateEvent}
                      disabled={communityLoading}
                      className="flex-1"
                    >
                      {communityLoading ? 'Creating...' : 'Create Event'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowEventModal(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Badge variant="outline">{event.event_type}</Badge>
                    <div className="text-xs text-muted-foreground">
                      {event.current_attendees}/{event.max_attendees} attending
                    </div>
                  </div>
                  <h3 className="font-medium mb-2">{event.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(event.event_date).toLocaleDateString()} at {event.event_time}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    variant={hasRSVPToEvent(event.id) ? "secondary" : "default"}
                    onClick={() => handleRSVP(event.id)}
                    disabled={communityLoading}
                  >
                    {hasRSVPToEvent(event.id) ? "Attending" : "RSVP"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Spotlight Tab */}
        <TabsContent value="spotlight" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Success Stories</h2>
            <Dialog open={showStoryModal} onOpenChange={setShowStoryModal}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Share Your Story
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Share Your Success Story</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="story-title">Title</Label>
                    <Input
                      id="story-title"
                      value={storyForm.title}
                      onChange={(e) => setStoryForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter story title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="story-description">Description</Label>
                    <Textarea
                      id="story-description"
                      value={storyForm.description}
                      onChange={(e) => setStoryForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Tell your success story..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="content-type">Content Type</Label>
                    <Select 
                      value={storyForm.content_type} 
                      onValueChange={(value) => setStoryForm(prev => ({ ...prev, content_type: value as 'article' | 'video' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="article">Article</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {storyForm.content_type === 'video' && (
                    <div>
                      <Label htmlFor="content-url">Video URL</Label>
                      <Input
                        id="content-url"
                        value={storyForm.content_url}
                        onChange={(e) => setStoryForm(prev => ({ ...prev, content_url: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreateStory}
                      disabled={communityLoading}
                      className="flex-1"
                    >
                      {communityLoading ? 'Publishing...' : 'Publish Story'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowStoryModal(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <Card 
                key={story.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewStory(story.id)}
              >
                <CardContent className="p-4">
                  <div className="relative mb-3">
                    <div className="bg-muted rounded-lg p-6 text-center">
                      {story.content_type === 'video' ? (
                        <Play className="h-8 w-8 text-primary mx-auto" />
                      ) : (
                        <div className="text-2xl">{story.thumbnail_url || '📖'}</div>
                      )}
                    </div>
                    {story.duration && (
                      <Badge className="absolute top-2 right-2 text-xs">
                        {Math.floor(story.duration / 60)}:{(story.duration % 60).toString().padStart(2, '0')}
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-medium mb-2 line-clamp-2">{story.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{story.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{story.views} views</span>
                    <span>{new Date(story.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Connections Tab */}
        <TabsContent value="connections" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Your Connections</h2>
            <Button 
              className="gap-2"
              onClick={() => navigate('/available-chamas')}
            >
              <Plus className="h-4 w-4" />
              Connect with Chama
            </Button>
          </div>

          {/* Placeholder for connections */}
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No connections yet</h3>
              <p className="text-muted-foreground mb-4">
                Start connecting with other chamas to collaborate and share opportunities
              </p>
              <Button onClick={() => navigate('/available-chamas')}>
                Browse Available Chamas
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityNetworkingPage;