import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useChamaVotes = (chamaId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch votes
  const votesQuery = useQuery({
    queryKey: ['chama-votes', chamaId],
    queryFn: async () => {
      console.log('Fetching votes for chama:', chamaId);

      const { data, error } = await supabase
        .from('chama_votes')
        .select('*')
        .eq('chama_id', chamaId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching chama votes:', error);
        throw error;
      }

      console.log('Fetched chama votes:', data);
      return data || [];
    },
    enabled: !!chamaId,
  });

  // Cast vote mutation
  const castVoteMutation = useMutation({
    mutationFn: async ({ voteId, response }: { voteId: string; response: boolean }) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Casting vote:', { voteId, response });

      // Get current user's member ID
      const { data: memberData, error: memberError } = await supabase
        .from('chama_members')
        .select('id')
        .eq('chama_id', chamaId)
        .eq('user_id', user.id)
        .single();

      if (memberError || !memberData) {
        console.error('Error getting member data:', memberError);
        throw new Error('You must be a member to vote');
      }

      // Cast vote (assuming we have a vote_responses table)
      const { error } = await supabase
        .from('vote_responses')
        .insert({
          vote_id: voteId,
          voter_id: memberData.id,
          response
        });

      if (error) {
        console.error('Error casting vote:', error);
        throw error;
      }

      // Vote counts will be updated by triggers or calculated on query
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chama-votes'] });
      toast({
        title: "Vote Cast! 🗳️",
        description: "Your vote has been recorded",
      });
    },
    onError: (error: any) => {
      console.error('Vote casting failed:', error);
      toast({
        title: "Vote Failed",
        description: error.message || "Failed to cast vote",
        variant: "destructive",
      });
    },
  });

  return {
    votes: votesQuery.data || [],
    isLoading: votesQuery.isLoading,
    castVote: castVoteMutation.mutate,
    isCasting: castVoteMutation.isPending,
  };
};