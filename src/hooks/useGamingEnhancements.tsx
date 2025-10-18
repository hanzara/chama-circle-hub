import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Tournament {
  id: string;
  name: string;
  description: string;
  game_type: 'trivia' | 'prediction' | 'simulation';
  entry_fee: number;
  prize_pool: number;
  max_participants: number;
  current_participants: number;
  start_time: string;
  end_time: string;
  registration_deadline: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
}

export interface PredictionGame {
  id: string;
  title: string;
  description: string;
  category: string;
  prediction_type: 'binary' | 'multiple_choice' | 'numeric';
  options: any;
  deadline: string;
  minimum_bet: number;
  maximum_bet: number;
  total_pool: number;
  house_edge: number;
  status: 'active' | 'closed' | 'resolved';
}

export interface LearningChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questions: any[];
  time_limit: number;
  reward_points: number;
  reward_amount: number;
  completion_count: number;
}

export const useGamingEnhancements = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch active tournaments
  const { data: tournaments = [], isLoading: tournamentsLoading } = useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('game_tournaments')
        .select('*')
        .in('status', ['upcoming', 'active'])
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      return data as Tournament[];
    }
  });

  // Fetch prediction games
  const { data: predictionGames = [], isLoading: predictionsLoading } = useQuery({
    queryKey: ['prediction-games'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prediction_games')
        .select('*')
        .eq('status', 'active')
        .gt('deadline', new Date().toISOString())
        .order('deadline', { ascending: true });
      
      if (error) throw error;
      return data as PredictionGame[];
    }
  });

  // Fetch learning challenges
  const { data: learningChallenges = [], isLoading: challengesLoading } = useQuery({
    queryKey: ['learning-challenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_challenges')
        .select('*')
        .eq('is_active', true)
        .order('difficulty', { ascending: true });
      
      if (error) throw error;
      return data as LearningChallenge[];
    }
  });

  // Join tournament
  const joinTournamentMutation = useMutation({
    mutationFn: async (tournamentId: string) => {
      if (!user) throw new Error('Please log in to join tournaments');

      const tournament = tournaments.find(t => t.id === tournamentId);
      if (!tournament) throw new Error('Tournament not found');

      // Calculate fee with gaming fee structure
      const { data: feeData } = await supabase.rpc('calculate_transaction_fee', {
        p_transaction_type: 'game_entry',
        p_amount: tournament.entry_fee
      });
      
      const fee = Number(feeData || 0);
      const totalCost = tournament.entry_fee + fee;

      const { data, error } = await supabase
        .from('tournament_participants')
        .insert({
          tournament_id: tournamentId,
          user_id: user.id,
          entry_fee_paid: totalCost
        })
        .select()
        .single();

      if (error) throw error;

      // Record the fee
      if (fee > 0) {
        await supabase
          .from('transaction_fees')
          .insert({
            transaction_type: 'game_entry',
            amount: tournament.entry_fee,
            fee_amount: fee,
            user_id: user.id
          });
      }

      // Update tournament participant count
      await supabase
        .from('game_tournaments')
        .update({ current_participants: tournament.current_participants + 1 })
        .eq('id', tournamentId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      toast({
        title: "Tournament Joined! 🎯",
        description: "Good luck in the competition!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Join Tournament",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Place prediction bet
  const placePredictionBetMutation = useMutation({
    mutationFn: async ({ predictionId, betAmount, predictedOption }: {
      predictionId: string;
      betAmount: number;
      predictedOption: any;
    }) => {
      if (!user) throw new Error('Please log in to place bets');

      const prediction = predictionGames.find(p => p.id === predictionId);
      if (!prediction) throw new Error('Prediction not found');

      if (betAmount < prediction.minimum_bet || betAmount > prediction.maximum_bet) {
        throw new Error(`Bet amount must be between KES ${prediction.minimum_bet} and KES ${prediction.maximum_bet}`);
      }

      // Calculate potential payout (simplified odds calculation)
      const houseEdge = prediction.house_edge;
      const potentialPayout = betAmount * (1 + (1 - houseEdge));

      const { data, error } = await supabase
        .from('prediction_bets')
        .insert({
          prediction_id: predictionId,
          user_id: user.id,
          bet_amount: betAmount,
          predicted_option: predictedOption,
          potential_payout: potentialPayout
        })
        .select()
        .single();

      if (error) throw error;

      // Update total pool
      await supabase
        .from('prediction_games')
        .update({ total_pool: prediction.total_pool + betAmount })
        .eq('id', predictionId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prediction-games'] });
      toast({
        title: "Bet Placed! 🎲",
        description: "Your prediction has been recorded. Good luck!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Place Bet",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Complete learning challenge
  const completeChallengeMutation = useMutation({
    mutationFn: async ({ challengeId, answers, timeTaken }: {
      challengeId: string;
      answers: any[];
      timeTaken: number;
    }) => {
      if (!user) throw new Error('Please log in to complete challenges');

      const challenge = learningChallenges.find(c => c.id === challengeId);
      if (!challenge) throw new Error('Challenge not found');

      // Calculate score
      const correctAnswers = answers.filter((answer, index) => 
        answer === challenge.questions[index]?.correct
      ).length;
      const score = Math.round((correctAnswers / challenge.questions.length) * 100);

      const { data, error } = await supabase
        .from('user_challenge_completions')
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          score,
          time_taken: timeTaken,
          answers,
          points_earned: challenge.reward_points,
          reward_earned: score >= 80 ? challenge.reward_amount : 0 // 80% minimum for cash reward
        })
        .select()
        .single();

      if (error) throw error;

      // Update completion count
      await supabase
        .from('learning_challenges')
        .update({ completion_count: challenge.completion_count + 1 })
        .eq('id', challengeId);

      return { ...data, score, correctAnswers, totalQuestions: challenge.questions.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['learning-challenges'] });
      const percentage = (data.correctAnswers / data.totalQuestions) * 100;
      toast({
        title: `Challenge Completed! ${percentage >= 80 ? '🏆' : '📚'}`,
        description: `Score: ${data.score}% ${percentage >= 80 ? `(+KES ${data.reward_earned})` : ''}`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Challenge Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Get user's gaming statistics
  const { data: userGamingStats } = useQuery({
    queryKey: ['user-gaming-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get tournament participations
      const { data: tournamentStats } = await supabase
        .from('tournament_participants')
        .select('*, game_tournaments!inner(*)')
        .eq('user_id', user.id);

      // Get prediction bets
      const { data: predictionStats } = await supabase
        .from('prediction_bets')
        .select('*')
        .eq('user_id', user.id);

      // Get challenge completions
      const { data: challengeStats } = await supabase
        .from('user_challenge_completions')
        .select('*')
        .eq('user_id', user.id);

      const totalTournaments = tournamentStats?.length || 0;
      const totalBets = predictionStats?.length || 0;
      const totalChallenges = challengeStats?.length || 0;
      const totalWinnings = (predictionStats?.reduce((sum, bet) => sum + (bet.actual_payout || 0), 0) || 0) +
                          (challengeStats?.reduce((sum, completion) => sum + completion.reward_earned, 0) || 0);

      return {
        totalTournaments,
        totalBets,
        totalChallenges,
        totalWinnings,
        averageScore: challengeStats?.length ? 
          challengeStats.reduce((sum, c) => sum + c.score, 0) / challengeStats.length : 0
      };
    },
    enabled: !!user
  });

  return {
    // Data
    tournaments,
    predictionGames,
    learningChallenges,
    userGamingStats,
    
    // Loading states
    tournamentsLoading,
    predictionsLoading,
    challengesLoading,
    
    // Mutations
    joinTournament: joinTournamentMutation.mutate,
    placePredictionBet: placePredictionBetMutation.mutate,
    completeChallenge: completeChallengeMutation.mutate,
    
    // Loading states for mutations
    isJoiningTournament: joinTournamentMutation.isPending,
    isPlacingBet: placePredictionBetMutation.isPending,
    isCompletingChallenge: completeChallengeMutation.isPending
  };
};