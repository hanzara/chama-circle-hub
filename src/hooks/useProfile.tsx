import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  username: string;
  phone?: string;
  balance: number;
  total_points: number;
  games_played: number;
  games_won: number;
  current_streak: number;
  best_streak: number;
  total_earnings: number;
  is_premium: boolean;
  premium_expires_at?: string;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
      } else {
        setProfile(data as any);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive",
        });
        return false;
      }

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    }
  };

  const addFunds = async (amount: number, description?: string) => {
    if (!user || !profile) return false;

    try {
      const { error: transactionError } = await (supabase as any)
        .from('wallet_transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'deposit',
          amount,
          balance_after: profile.balance + amount,
          description: description || 'Wallet deposit',
        });

      if (transactionError) {
        console.error('Error creating transaction:', transactionError);
        return false;
      }

      const success = await updateProfile({ balance: profile.balance + amount });
      
      if (success) {
        toast({
          title: "Funds Added",
          description: `KSh ${amount} added to your wallet`,
        });
      }

      return success;
    } catch (error) {
      console.error('Add funds error:', error);
      return false;
    }
  };

  const deductFunds = async (amount: number, description?: string, gameId?: string) => {
    if (!user || !profile || profile.balance < amount) return false;

    try {
      const { error: transactionError } = await (supabase as any)
        .from('wallet_transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'game_entry',
          amount: -amount,
          balance_after: profile.balance - amount,
          description: description || 'Game entry fee',
          game_id: gameId,
        });

      if (transactionError) {
        console.error('Error creating transaction:', transactionError);
        return false;
      }

      const success = await updateProfile({ balance: profile.balance - amount });
      return success;
    } catch (error) {
      console.error('Deduct funds error:', error);
      return false;
    }
  };

  return {
    profile,
    loading,
    fetchProfile,
    updateProfile,
    addFunds,
    deductFunds,
  };
};