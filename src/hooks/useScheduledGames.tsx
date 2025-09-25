// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface GameCategory {
  id: string;
  name: string;
  description: string;
  entry_fee: number;
  max_winnings: number;
  is_premium: boolean;
  created_at: string;
}

interface ScheduledGame {
  id: string;
  category_id: string;
  title: string;
  description?: string;
  scheduled_start: string;
  scheduled_end: string;
  registration_deadline: string;
  max_players: number;
  min_players: number;
  entry_fee: number;
  max_winnings: number;
  prize_pool: number;
  status: 'scheduled' | 'registering' | 'running' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  game_categories?: GameCategory;
}

interface GameRegistration {
  id: string;
  game_id: string;
  user_id: string;
  entry_fee_paid: number;
  registered_at: string;
  scheduled_games?: ScheduledGame;
}

export const useScheduledGames = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [games, setGames] = useState<ScheduledGame[]>([]);
  const [userRegistrations, setUserRegistrations] = useState<GameRegistration[]>([]);
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
        .from('scheduled_games')
        .select(`
          *,
          game_categories (*)
        `)
        .in('status', ['scheduled', 'registering'])
        .order('scheduled_start', { ascending: true });

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
        .from('game_registrations')
        .select(`
          *,
          scheduled_games (
            *,
            game_categories (*)
          )
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
      // Get game details
      const { data: game, error: gameError } = await supabase
        .from('scheduled_games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (gameError || !game) {
        return { success: false, message: 'Game not found' };
      }

      // Check if user has enough balance
      if (userBalance < game.entry_fee) {
        return { success: false, message: 'Insufficient balance' };
      }

      // Check for scheduling conflicts
      const { data: conflictData, error: conflictError } = await supabase
        .rpc('check_game_scheduling_conflict', {
          p_user_id: user.id,
          p_game_start: game.scheduled_start,
          p_game_end: game.scheduled_end
        });

      if (conflictError) {
        console.error('Conflict check error:', conflictError);
        return { success: false, message: 'Error checking schedule conflicts' };
      }

      if (conflictData) {
        return { success: false, message: 'You have a scheduling conflict with another registered game' };
      }

      // Check if registration deadline has passed
      const now = new Date();
      const deadline = new Date(game.registration_deadline);
      if (now > deadline) {
        return { success: false, message: 'Registration deadline has passed' };
      }

      // Register for the game
      const { error: registrationError } = await supabase
        .from('game_registrations')
        .insert({
          game_id: gameId,
          user_id: user.id,
          entry_fee_paid: game.entry_fee
        });

      if (registrationError) {
        console.error('Registration error:', registrationError);
        return { success: false, message: 'Failed to register for game' };
      }

      // Refresh registrations
      await fetchUserRegistrations();

      toast({
        title: "Registration Successful!",
        description: `You're registered for ${game.title}. Entry fee: KSh ${game.entry_fee}`,
      });

      return { success: true, message: 'Successfully registered for game!' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'An error occurred during registration' };
    }
  };

  const isUserRegistered = (gameId: string) => {
    return userRegistrations.some(reg => reg.game_id === gameId);
  };

  const getTimeUntilStart = (scheduledStart: string) => {
    const now = new Date();
    const start = new Date(scheduledStart);
    const diff = start.getTime() - now.getTime();

    if (diff <= 0) {
      return { expired: true, timeString: 'Game Starting!' };
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