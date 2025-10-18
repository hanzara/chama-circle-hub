// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Tournament {
  id: string;
  name: string;
  description?: string;
  game_type: string;
  entry_fee: number;
  prize_pool: number;
  max_participants: number;
  current_participants: number;
  start_time: string;
  end_time: string;
  registration_deadline: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  tournament_type: string;
  created_at: string;
  updated_at: string;
}

interface TournamentParticipant {
  id: string;
  tournament_id: string;
  user_id: string;
  entry_fee_paid: number;
  registered_at: string;
  game_tournaments?: Tournament;
}

export const useScheduledGames = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [games, setGames] = useState<Tournament[]>([]);
  const [userRegistrations, setUserRegistrations] = useState<TournamentParticipant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScheduledGames();
    if (user) {
      fetchUserRegistrations();
    }
  }, [user]);

  const fetchScheduledGames = async () => {
    try {
      const { data, error } = await supabase
        .from('game_tournaments')
        .select('*')
        .in('status', ['upcoming', 'active'])
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching games:', error);
        toast({
          title: "Error",
          description: "Failed to load scheduled games",
          variant: "destructive",
        });
      } else {
        setGames(data || []);
      }
    } catch (error) {
      console.error('Games fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRegistrations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tournament_participants')
        .select(`
          *,
          game_tournaments (*)
        `)
        .eq('user_id', user.id)
        .order('registered_at', { ascending: false });

      if (error) {
        console.error('Error fetching registrations:', error);
      } else {
        setUserRegistrations(data || []);
      }
    } catch (error) {
      console.error('Registrations fetch error:', error);
    }
  };

  const registerForGame = async (gameId: string, userBalance: number) => {
    if (!user) return { success: false, message: 'Please login first' };

    try {
      // Get tournament details
      const { data: tournament, error: tournamentError } = await supabase
        .from('game_tournaments')
        .select('*')
        .eq('id', gameId)
        .single();

      if (tournamentError || !tournament) {
        return { success: false, message: 'Tournament not found' };
      }

      // Check if user has enough balance
      if (userBalance < tournament.entry_fee) {
        return { success: false, message: 'Insufficient balance' };
      }

      // Check if registration deadline has passed
      const now = new Date();
      const deadline = new Date(tournament.registration_deadline);
      if (now > deadline) {
        return { success: false, message: 'Registration deadline has passed' };
      }

      // Check if tournament is full
      if (tournament.current_participants >= tournament.max_participants) {
        return { success: false, message: 'Tournament is full' };
      }

      // Register for the tournament
      const { error: registrationError } = await supabase
        .from('tournament_participants')
        .insert({
          tournament_id: gameId,
          user_id: user.id,
          entry_fee_paid: tournament.entry_fee
        });

      if (registrationError) {
        console.error('Registration error:', registrationError);
        return { success: false, message: 'Failed to register for tournament' };
      }

      // Refresh registrations
      await fetchUserRegistrations();

      toast({
        title: "Registration Successful!",
        description: `You're registered for ${tournament.name}. Entry fee: KSh ${tournament.entry_fee}`,
      });

      return { success: true, message: 'Successfully registered for tournament!' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'An error occurred during registration' };
    }
  };

  const isUserRegistered = (gameId: string) => {
    return userRegistrations.some(reg => reg.tournament_id === gameId);
  };

  const getTimeUntilStart = (startTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const diff = start.getTime() - now.getTime();

    if (diff <= 0) {
      return { expired: true, timeString: 'Tournament Starting!' };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    let timeString = '';
    if (days > 0) {
      timeString = `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      timeString = `${hours}h ${minutes}m ${seconds}s`;
    } else {
      timeString = `${minutes}m ${seconds}s`;
    }

    return { expired: false, timeString };
  };

  return {
    games,
    userRegistrations,
    loading,
    fetchScheduledGames,
    fetchUserRegistrations,
    registerForGame,
    isUserRegistered,
    getTimeUntilStart,
  };
};