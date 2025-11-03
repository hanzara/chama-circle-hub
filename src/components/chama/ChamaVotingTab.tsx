import React, { useState } from 'react';
import { Vote, Users, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useChamaVotes } from '@/hooks/useChamaVotes';
import { useToast } from '@/hooks/use-toast';

interface ChamaVotingTabProps {
  chamaId: string;
  userRole?: string;
  isAdmin?: boolean;
}

export const ChamaVotingTab: React.FC<ChamaVotingTabProps> = ({ 
  chamaId, 
  userRole = 'member',
  isAdmin = false 
}) => {
  const [selectedFilter, setSelectedFilter] = useState('active');
  
  const { votes, isLoading, castVote, isCasting } = useChamaVotes(chamaId);
  const { toast } = useToast();

  const handleVote = async (voteId: string, response: boolean) => {
    try {
      await castVote({ voteId, response });
      toast({
        title: "Vote Cast! 🗳️",
        description: `Your ${response ? 'YES' : 'NO'} vote has been recorded`,
      });
    } catch (error: any) {
      toast({
        title: "Vote Failed",
        description: error.message || "Failed to cast vote",
        variant: "destructive",
      });
    }
  };

  const filteredVotes = votes?.filter(vote => {
    switch (selectedFilter) {
      case 'active':
        return vote.status === 'active';
      case 'completed':
        return vote.status === 'completed';
      case 'expired':
        return vote.status === 'expired';
      default:
        return true;
    }
  }) || [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      completed: "secondary",
      expired: "destructive"
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </Badge>
    );
  };

  const calculateVotePercentage = (yesVotes: number, noVotes: number) => {
    const total = yesVotes + noVotes;
    if (total === 0) return { yesPercent: 0, noPercent: 0 };
    
    return {
      yesPercent: (yesVotes / total) * 100,
      noPercent: (noVotes / total) * 100
    };
  };

  const getTimeRemaining = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`;
    return 'Less than 1 hour left';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Voting</h3>
          <p className="text-sm text-muted-foreground">
            Participate in group decisions and proposals
          </p>
        </div>
        {isAdmin && (
          <Button>
            Create Vote
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b">
        <Button
          variant={selectedFilter === 'active' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedFilter('active')}
        >
          Active ({votes?.filter(v => v.status === 'active').length || 0})
        </Button>
        <Button
          variant={selectedFilter === 'completed' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedFilter('completed')}
        >
          Completed ({votes?.filter(v => v.status === 'completed').length || 0})
        </Button>
        <Button
          variant={selectedFilter === 'expired' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedFilter('expired')}
        >
          Expired ({votes?.filter(v => v.status === 'expired').length || 0})
        </Button>
      </div>

      {/* Votes List */}
      <div className="space-y-4">
        {filteredVotes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Vote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-2">No votes found</h3>
              <p className="text-sm text-muted-foreground">
                {selectedFilter === 'active' 
                  ? 'No active votes at the moment.' 
                  : `No ${selectedFilter} votes to display.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredVotes.map((vote) => {
            const { yesPercent, noPercent } = calculateVotePercentage(vote.yes_votes, vote.no_votes);
            
            return (
              <Card key={vote.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Vote Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-foreground">{vote.title}</h4>
                          {getStatusBadge(vote.status)}
                        </div>
                        
                        {vote.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {vote.description}
                          </p>
                        )}

                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div>
                            <p className="text-muted-foreground">Initiated by</p>
                            <p className="font-medium">Admin</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Type</p>
                            <p className="font-medium capitalize">{vote.vote_type}</p>
                          </div>
                          {vote.deadline && (
                            <div>
                              <p className="text-muted-foreground">Deadline</p>
                              <p className="font-medium">{getTimeRemaining(vote.deadline)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Vote Progress */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Votes: {vote.yes_votes + vote.no_votes} of {vote.total_eligible_voters}
                        </span>
                        <span className="text-muted-foreground">
                          {vote.total_eligible_voters > 0 
                            ? Math.round(((vote.yes_votes + vote.no_votes) / vote.total_eligible_voters) * 100)
                            : 0
                          }% participation
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">YES: {vote.yes_votes}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {Math.round(yesPercent)}%
                          </span>
                        </div>
                        <Progress value={yesPercent} className="h-2" />
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="text-sm">NO: {vote.no_votes}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {Math.round(noPercent)}%
                          </span>
                        </div>
                        <Progress value={noPercent} className="h-2" />
                      </div>
                    </div>

                    {/* Vote Actions */}
                    {vote.status === 'active' && (
                      <div className="flex gap-3 pt-2">
                        <Button
                          size="sm"
                          onClick={() => handleVote(vote.id, true)}
                          disabled={isCasting}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Vote YES
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVote(vote.id, false)}
                          disabled={isCasting}
                          className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Vote NO
                        </Button>
                      </div>
                    )}

                    {/* Vote Result */}
                    {vote.status === 'completed' && (
                      <div className="pt-2">
                        <div className={`p-3 rounded-lg ${
                          vote.yes_votes > vote.no_votes 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-red-50 border border-red-200'
                        }`}>
                          <p className={`text-sm font-medium ${
                            vote.yes_votes > vote.no_votes ? 'text-green-800' : 'text-red-800'
                          }`}>
                            Vote {vote.yes_votes > vote.no_votes ? 'PASSED' : 'FAILED'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};