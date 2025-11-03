
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Vote, CheckCircle, XCircle, Clock, Users, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { usePolls } from '@/hooks/usePolls';
import { useToast } from '@/hooks/use-toast';

interface VotingSystemProps {
  chamaId?: string;
}

const VotingSystem: React.FC<VotingSystemProps> = ({ chamaId = "demo-chama" }) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPoll, setNewPoll] = useState({
    title: '',
    description: '',
    deadline: ''
  });
  
  const { polls, loading, createPoll, vote } = usePolls(chamaId);
  const { toast } = useToast();

  const activeVotes = polls.filter(poll => poll.status === 'active');
  const completedVotes = polls.filter(poll => poll.status === 'closed');

  const getVoteTypeIcon = (type: string) => {
    switch (type) {
      case 'contribution_change': return '💰';
      case 'loan_approval': return '🏦';
      case 'investment': return '📈';
      case 'member_removal': return '👤';
      default: return '📊';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'expired': return 'outline';
      default: return 'outline';
    }
  };

  const handleVote = async (pollId: string, option: 'yes' | 'no' | 'not_sure') => {
    await vote(pollId, option);
  };

  const handleCreatePoll = async () => {
    if (!newPoll.title || !newPoll.description || !newPoll.deadline) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    await createPoll({
      title: newPoll.title,
      description: newPoll.description,
      options: ['Yes', 'No', 'Not Sure'], // Added "Not Sure" option
      deadline: newPoll.deadline,
      chamaId: chamaId
    });

    setNewPoll({ title: '', description: '', deadline: '' });
    setIsCreateDialogOpen(false);
  };

  const calculateProgress = (poll: any) => {
    const totalVotes = poll.total_votes;
    const participation = totalVotes > 0 ? 50 : 0; // Simple progress indicator
    return participation;
  };

  const VoteCard = ({ poll }: { poll: any }) => (
    <Card key={poll.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="text-lg flex-shrink-0">📊</span>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg leading-tight">{poll.title}</CardTitle>
              <CardDescription className="text-sm">Created {formatDistanceToNow(new Date(poll.created_at), { addSuffix: true })}</CardDescription>
            </div>
          </div>
          <Badge variant={getStatusColor(poll.status)} className="flex items-center gap-1 flex-shrink-0 self-start">
            {poll.status === 'active' ? <Clock className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
            {poll.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{poll.description}</p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Total Votes</span>
            <span>{poll.total_votes} votes</span>
          </div>
          <Progress value={calculateProgress(poll)} className="h-2" />
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>Yes: {poll.yes_votes}</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span>No: {poll.no_votes}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500 flex-shrink-0" />
              <span>Not Sure: {poll.not_sure_votes || 0}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            {poll.status === 'active' ? (
              <>Ends {formatDistanceToNow(new Date(poll.deadline), { addSuffix: true })}</>
            ) : (
              <>Ended {formatDistanceToNow(new Date(poll.deadline), { addSuffix: true })}</>
            )}
          </div>
          
          {poll.status === 'active' && !poll.user_vote ? (
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleVote(poll.id, 'no')}
                className="text-red-600 hover:text-red-700 flex-1 sm:flex-initial"
              >
                <XCircle className="h-3 w-3 mr-1" />
                No
              </Button>
              <Button 
                size="sm"
                variant="outline"
                onClick={() => handleVote(poll.id, 'not_sure')}
                className="text-yellow-600 hover:text-yellow-700 flex-1 sm:flex-initial"
              >
                <Clock className="h-3 w-3 mr-1" />
                Not Sure
              </Button>
              <Button 
                size="sm"
                onClick={() => handleVote(poll.id, 'yes')}
                className="text-green-600 hover:text-green-700 flex-1 sm:flex-initial"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Yes
              </Button>
            </div>
          ) : poll.user_vote ? (
            <Badge variant="outline" className="text-xs self-start">
              You voted: {poll.user_vote}
            </Badge>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Voting & Decisions</h2>
          <p className="text-muted-foreground">Participate in democratic decision-making</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create Poll</span>
              <span className="sm:hidden">New Poll</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Poll</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">Poll Title</Label>
                <Input
                  id="title"
                  value={newPoll.title}
                  onChange={(e) => setNewPoll({...newPoll, title: e.target.value})}
                  placeholder="What would you like to vote on?"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={newPoll.description}
                  onChange={(e) => setNewPoll({...newPoll, description: e.target.value})}
                  placeholder="Provide more details about this poll..."
                  className="w-full min-h-[100px] resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline" className="text-sm font-medium">Deadline</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={newPoll.deadline}
                  onChange={(e) => setNewPoll({...newPoll, deadline: e.target.value})}
                  className="w-full"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button onClick={handleCreatePoll} className="w-full sm:w-auto">
                  Create Poll
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Vote className="h-4 w-4" />
            Active Votes ({activeVotes.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed ({completedVotes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Loading polls...</p>
              </CardContent>
            </Card>
          ) : activeVotes.length > 0 ? (
            activeVotes.map(poll => <VoteCard key={poll.id} poll={poll} />)
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Vote className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground">No active polls at this time</p>
                <p className="text-xs text-muted-foreground mt-1">Create your first poll to get started!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Loading polls...</p>
              </CardContent>
            </Card>
          ) : completedVotes.length > 0 ? (
            completedVotes.map(poll => <VoteCard key={poll.id} poll={poll} />)
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground">No completed polls found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VotingSystem;
