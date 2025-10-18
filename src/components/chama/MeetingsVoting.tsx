
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Users, Vote, Video, MapPin, Plus, CheckCircle, XCircle, Clock3 } from 'lucide-react';
import { useGoogleMeet } from '@/hooks/useGoogleMeet';
import { usePolls } from '@/hooks/usePolls';
import { useToast } from '@/hooks/use-toast';
import { useChamaMeetings } from '@/hooks/useChamaMeetings';

interface MeetingsVotingProps {
  chamaData: any;
}

const MeetingsVoting: React.FC<MeetingsVotingProps> = ({ chamaData }) => {
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingType, setMeetingType] = useState<'physical' | 'virtual' | 'hybrid'>('virtual');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [meetingDescription, setMeetingDescription] = useState('');
  const [pollTitle, setPollTitle] = useState('');
  const [pollDescription, setPollDescription] = useState('');
  const [pollDeadline, setPollDeadline] = useState('');
  
  const { createMeeting, isCreating } = useGoogleMeet();
  const { polls, createPoll, vote, loading } = usePolls(chamaData.id);
  const { toast } = useToast();
  
  const {
    meetings,
    isLoading: meetingsLoading,
    scheduleMeeting,
    isScheduling,
    updateAttendance,
    isUpdatingAttendance
  } = useChamaMeetings(chamaData.id);

  // Mock data for meetings
  const upcomingMeetings = [
    {
      id: '1',
      title: 'Monthly General Meeting',
      date: '2024-02-15',
      time: '14:00',
      type: 'General Meeting',
      location: 'Community Hall',
      attendees: 18,
      status: 'scheduled'
    },
    {
      id: '2',
      title: 'Loan Committee Review',
      date: '2024-02-20',
      time: '16:00',
      type: 'Committee Meeting',
      location: 'Virtual (Google Meet)',
      attendees: 5,
      status: 'scheduled'
    },
    {
      id: '3',
      title: 'Investment Strategy Discussion',
      date: '2024-02-25',
      time: '15:30',
      type: 'Special Meeting',
      location: 'Chairman\'s Office',
      attendees: 12,
      status: 'scheduled'
    }
  ];

  const meetingHistory = [
    {
      id: '1',
      title: 'January General Meeting',
      date: '2024-01-15',
      attendance: '22/25',
      decisions: ['Approved new loan policy', 'Elected new treasurer'],
      status: 'completed'
    },
    {
      id: '2',
      title: 'Emergency Meeting - Policy Changes',
      date: '2024-01-22',
      attendance: '19/25',
      decisions: ['Updated contribution schedule', 'Approved emergency fund'],
      status: 'completed'
    }
  ];

  const handleCreateMeeting = async () => {
    if (!meetingTitle || !meetingDate || !meetingTime) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all meeting details",
        variant: "destructive",
      });
      return;
    }

    try {
      const scheduledDate = new Date(`${meetingDate}T${meetingTime}`).toISOString();
      
      // Schedule the meeting in the backend
      scheduleMeeting({
        title: meetingTitle,
        description: meetingDescription,
        scheduledDate,
        meetingType,
        location: meetingLocation || undefined
      });
      
      // Also create Google Meet if virtual
      if (meetingType === 'virtual' || meetingType === 'hybrid') {
        try {
          const meetLink = await createMeeting(meetingTitle, scheduledDate, 120); // 2 hours duration
          
          if (meetLink) {
            toast({
              title: "Meeting Scheduled! 📅",
              description: `${meetingTitle} has been scheduled with Google Meet link created`,
            });
          }
        } catch (error) {
          console.error('Failed to create Google Meet:', error);
        }
      }
      
      // Reset form
      setMeetingTitle('');
      setMeetingDate('');
      setMeetingTime('');
      setMeetingType('virtual');
      setMeetingLocation('');
      setMeetingDescription('');
    } catch (error) {
      console.error('Failed to schedule meeting:', error);
    }
  };

  const handleCreatePoll = async () => {
    if (!pollTitle || !pollDescription || !pollDeadline) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all poll details",
        variant: "destructive",
      });
      return;
    }

    await createPoll({
      title: pollTitle,
      description: pollDescription,
      options: ['Yes', 'No'], // Simple yes/no poll
      deadline: pollDeadline,
      chamaId: chamaData.id
    });

    // Reset form
    setPollTitle('');
    setPollDescription('');
    setPollDeadline('');
  };

  const handleVote = async (pollId: string, option: 'yes' | 'no') => {
    await vote(pollId, option);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800"><Calendar className="h-3 w-3 mr-1" />Scheduled</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><Vote className="h-3 w-3 mr-1" />Active</Badge>;
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-800"><XCircle className="h-3 w-3 mr-1" />Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Meetings & Voting</h2>
        <p className="text-muted-foreground">Schedule meetings and create polls for member decisions</p>
      </div>

      <Tabs defaultValue="meetings" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="schedule">Schedule Meeting</TabsTrigger>
          <TabsTrigger value="voting">Active Polls</TabsTrigger>
          <TabsTrigger value="create-poll">Create Poll</TabsTrigger>
        </TabsList>

        <TabsContent value="meetings" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Upcoming Meetings</CardTitle>
                <CardDescription>Scheduled chama meetings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingMeetings.map((meeting, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{meeting.title}</h4>
                        {getStatusBadge(meeting.status)}
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{meeting.date} at {meeting.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{meeting.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{meeting.attendees} expected attendees</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline">
                          <Video className="h-3 w-3 mr-1" />
                          Join Meeting
                        </Button>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Meeting History</CardTitle>
                <CardDescription>Past meeting records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {meetingHistory.map((meeting, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{meeting.title}</h4>
                        {getStatusBadge(meeting.status)}
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{meeting.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>Attendance: {meeting.attendance}</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-medium">Key Decisions:</p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {meeting.decisions.map((decision, idx) => (
                            <li key={idx}>{decision}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card className="border-0 shadow-lg max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Schedule New Meeting</CardTitle>
              <CardDescription>Create a new meeting for your chama</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Meeting Title</label>
                <Input
                  placeholder="Enter meeting title"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time</label>
                  <Input
                    type="time"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Meeting Type</label>
                <Select value={meetingType} onValueChange={(value) => setMeetingType(value as 'physical' | 'virtual' | 'hybrid')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select meeting type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="virtual">Virtual Meeting</SelectItem>
                    <SelectItem value="physical">Physical Meeting</SelectItem>
                    <SelectItem value="hybrid">Hybrid Meeting</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description (Optional)</label>
                <Textarea
                  placeholder="Meeting agenda or description"
                  value={meetingDescription}
                  onChange={(e) => setMeetingDescription(e.target.value)}
                />
              </div>

              {(meetingType === 'physical' || meetingType === 'hybrid') && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    placeholder="Meeting location"
                    value={meetingLocation}
                    onChange={(e) => setMeetingLocation(e.target.value)}
                  />
                </div>
              )}

              <Button 
                onClick={handleCreateMeeting} 
                className="w-full" 
                disabled={isCreating || isScheduling}
              >
                {isCreating || isScheduling ? (
                  <>Scheduling Meeting...</>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Meeting
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voting" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Active Polls</CardTitle>
              <CardDescription>Vote on important chama decisions</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading polls...</div>
              ) : polls.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Vote className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active polls at the moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {polls.map((poll, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{poll.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{poll.description}</p>
                        </div>
                        {getStatusBadge(poll.status)}
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Yes votes: {poll.yes_votes}</span>
                          <span>No votes: {poll.no_votes}</span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Yes ({poll.yes_votes})</span>
                            <span>No ({poll.no_votes})</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ 
                                width: `${poll.total_votes > 0 ? (poll.yes_votes / poll.total_votes) * 100 : 0}%` 
                              }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Total votes: {poll.total_votes}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            Deadline: {new Date(poll.deadline).toLocaleDateString()}
                          </span>
                        </div>

                        {poll.status === 'active' && !poll.user_vote && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleVote(poll.id, 'yes')}
                              className="flex-1"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Vote Yes
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVote(poll.id, 'no')}
                              className="flex-1"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Vote No
                            </Button>
                          </div>
                        )}

                        {poll.user_vote && (
                          <div className="text-center p-2 bg-green-50 rounded text-sm text-green-800">
                            You voted: {poll.user_vote.toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create-poll" className="space-y-6">
          <Card className="border-0 shadow-lg max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Create New Poll</CardTitle>
              <CardDescription>Create a poll for member voting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Poll Title</label>
                <Input
                  placeholder="Enter poll title"
                  value={pollTitle}
                  onChange={(e) => setPollTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Describe what members are voting on"
                  value={pollDescription}
                  onChange={(e) => setPollDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Voting Deadline</label>
                <Input
                  type="datetime-local"
                  value={pollDeadline}
                  onChange={(e) => setPollDeadline(e.target.value)}
                />
              </div>

              <Button onClick={handleCreatePoll} className="w-full">
                <Vote className="h-4 w-4 mr-2" />
                Create Poll
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MeetingsVoting;
