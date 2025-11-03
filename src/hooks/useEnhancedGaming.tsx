import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Tournament {
  id: string;
  name: string;
  description: string;
  game_type: string;
  tournament_type: string;
  entry_fee: number;
  prize_pool: number;
  max_participants: number;
  current_participants: number;
  start_time: string;
  end_time: string;
  registration_deadline: string;
  status: string;
  rules: any;
}

interface PredictionGame {
  id: string;
  title: string;
  description: string;
  category: string;
  prediction_type: string;
  options: any[];
  deadline: string;
  minimum_bet: number;
  maximum_bet: number;
  total_pool: number;
  house_edge: number;
  status: string;
}

interface LearningChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  questions: any[];
  time_limit: number;
  reward_points: number;
  reward_amount: number;
  completion_count: number;
}

export const useEnhancedGaming = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // MOCK DATA for testing - Fetch tournaments
  const { data: tournaments = [], isLoading: tournamentsLoading } = useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      // Return mock data instead of real database query
      return [
        {
          id: '1',
          name: 'Weekly Finance Quiz Championship',
          description: 'Test your financial knowledge and win cash prizes!',
          game_type: 'quiz',
          tournament_type: 'weekly',
          entry_fee: 0, // Free entry for testing
          prize_pool: 2000,
          max_participants: 50,
          current_participants: 12,
          start_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
          end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          registration_deadline: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          status: 'upcoming',
          rules: {}
        },
        {
          id: '2',
          name: 'Crypto Prediction Challenge',
          description: 'Predict Bitcoin price movements for the week',
          game_type: 'prediction',
          tournament_type: 'weekly',
          entry_fee: 0, // Free entry for testing
          prize_pool: 4000,
          max_participants: 100,
          current_participants: 35,
          start_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          registration_deadline: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
          status: 'upcoming',
          rules: {}
        },
        {
          id: '3',
          name: 'Investment Simulation Battle',
          description: 'Virtual trading competition with real rewards',
          game_type: 'simulation',
          tournament_type: 'monthly',
          entry_fee: 0, // Free entry for testing
          prize_pool: 3000,
          max_participants: 75,
          current_participants: 8,
          start_time: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          registration_deadline: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          status: 'upcoming',
          rules: {}
        }
      ] as Tournament[];
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
        .order('deadline');
      
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

  // Fetch user's tournament participations
  const { data: userTournaments = [] } = useQuery({
    queryKey: ['user-tournaments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('tournament_participants')
        .select(`
          *,
          game_tournaments(*)
        `)
        .eq('user_id', user.id)
        .order('registration_time', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch user's prediction bets
  const { data: userBets = [] } = useQuery({
    queryKey: ['user-bets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('prediction_bets')
        .select(`
          *,
          prediction_games(*)
        `)
        .eq('user_id', user.id)
        .order('placed_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Join tournament
  const joinTournamentMutation = useMutation({
    mutationFn: async (tournamentId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const tournament = tournaments.find(t => t.id === tournamentId);
      if (!tournament) throw new Error('Tournament not found');

      // Calculate fee with processing
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

      // Record fee
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

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['user-tournaments'] });
      toast({
        title: "Tournament Joined! 🎯",
        description: "Good luck in the competition!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Place prediction bet
  const placeBetMutation = useMutation({
    mutationFn: async ({
      predictionId,
      betAmount,
      predictedOption
    }: {
      predictionId: string;
      betAmount: number;
      predictedOption: any;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const prediction = predictionGames.find(p => p.id === predictionId);
      if (!prediction) throw new Error('Prediction game not found');

      // Calculate potential payout
      const potentialPayout = betAmount * (1 / prediction.house_edge);

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
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prediction-games'] });
      queryClient.invalidateQueries({ queryKey: ['user-bets'] });
      toast({
        title: "Bet Placed! 🎲",
        description: "Your prediction has been recorded!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Bet Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Complete learning challenge
  const completeChallengeeMutation = useMutation({
    mutationFn: async ({
      challengeId,
      answers,
      timeTaken
    }: {
      challengeId: string;
      answers: any[];
      timeTaken: number;
    }) => {
      if (!user) throw new Error('User not authenticated');

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
          reward_earned: challenge.reward_amount
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['learning-challenges'] });
      toast({
        title: "Challenge Completed! 🏆",
        description: `You scored ${data.score}% and earned KES ${data.reward_earned}!`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Get gaming statistics
  const getGamingStats = () => {
    const totalTournaments = userTournaments.length;
    const totalBets = userBets.length;
    const totalBetAmount = userBets.reduce((sum, bet) => sum + bet.bet_amount, 0);
    const potentialWinnings = userBets.reduce((sum, bet) => sum + (bet.potential_payout || 0), 0);
    
    return {
      totalTournaments,
      totalBets,
      totalBetAmount,
      potentialWinnings,
      isActive: totalTournaments > 0 || totalBets > 0
    };
  };

  return {
    // Data
    tournaments,
    predictionGames,
    learningChallenges,
    userTournaments,
    userBets,
    
    // Loading states
    tournamentsLoading,
    predictionsLoading,
    challengesLoading,
    
    // Mutations
    joinTournament: joinTournamentMutation.mutate,
    placeBet: placeBetMutation.mutate,
    completeChallenge: completeChallengeeMutation.mutate,
    
    // Loading states for mutations
    isJoiningTournament: joinTournamentMutation.isPending,
    isPlacingBet: placeBetMutation.isPending,
    isCompletingChallenge: completeChallengeeMutation.isPending,
    
    // Utilities
    getGamingStats
  };
};