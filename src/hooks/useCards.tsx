import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Card {
  id: string;
  user_id: string;
  card_name: string;
  card_type: 'virtual' | 'physical';
  card_subtype?: 'single_use' | 'recurring';
  card_number?: string;
  card_holder_name?: string;
  expiry_date?: string;
  cvv?: string;
  status: 'active' | 'locked' | 'frozen' | 'expired' | 'cancelled';
  primary_currency: string;
  currency_priority: string[];
  daily_limit?: number;
  weekly_limit?: number;
  monthly_limit?: number;
  current_balance: number;
  international_enabled: boolean;
  pin_hash?: string;
  auto_expiry_date?: string;
  is_apple_pay_enabled: boolean;
  is_google_pay_enabled: boolean;
  is_paypal_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CardTransaction {
  id: string;
  card_id: string;
  user_id: string;
  merchant_name: string;
  amount: number;
  currency_used: string;
  category?: string;
  description?: string;
  status: string;
  created_at: string;
}

export interface CardNotification {
  id: string;
  card_id: string;
  notification_type: 'sms' | 'email' | 'push';
  transaction_alerts: boolean;
  declined_payments: boolean;
  suspicious_activity: boolean;
  spending_limits: boolean;
}

export interface CardKYC {
  id: string;
  card_id: string;
  user_id: string;
  document_type?: string;
  document_number?: string;
  document_image_url?: string;
  full_name?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  verification_status: string;
  shipping_address?: string;
  estimated_delivery?: string;
  tracking_number?: string;
}

export interface CardRewards {
  id: string;
  card_id: string;
  user_id: string;
  total_cashback: number;
  current_milestone: number;
  next_milestone: number;
  reward_points: number;
}

export const useCards = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [transactions, setTransactions] = useState<CardTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user cards
  const fetchCards = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCards(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching cards:', err);
    }
  };

  // Fetch card transactions
  const fetchTransactions = async (cardId?: string) => {
    if (!user) return;

    try {
      let query = supabase
        .from('card_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (cardId) {
        query = query.eq('card_id', cardId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTransactions(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching transactions:', err);
    }
  };

  // Generate card number (mock implementation)
  const generateCardNumber = (type: 'virtual' | 'physical'): string => {
    const prefix = type === 'virtual' ? '4532' : '4556';
    const middle = Math.random().toString().slice(2, 6);
    const end = Math.random().toString().slice(2, 6);
    return `${prefix} ${middle} ${end} ${Math.random().toString().slice(2, 6)}`;
  };

  // Generate CVV
  const generateCVV = (): string => {
    return Math.floor(Math.random() * 900 + 100).toString();
  };

  // Generate expiry date (3 years from now)
  const generateExpiryDate = (): string => {
    const now = new Date();
    const expiry = new Date(now.setFullYear(now.getFullYear() + 3));
    return expiry.toISOString().split('T')[0];
  };

  // Create new card
  const createCard = async (cardData: {
    card_name: string;
    card_type: 'virtual' | 'physical';
    card_subtype?: 'single_use' | 'recurring';
    primary_currency: string;
    currency_priority: string[];
    daily_limit?: number;
    weekly_limit?: number;
    monthly_limit?: number;
    international_enabled: boolean;
    auto_expiry_date?: string;
  }) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const cardNumber = generateCardNumber(cardData.card_type);
      const cvv = generateCVV();
      const expiryDate = generateExpiryDate();

      const { data, error } = await supabase
        .from('user_cards')
        .insert({
          user_id: user.id,
          card_name: cardData.card_name,
          card_type: cardData.card_type,
          card_subtype: cardData.card_subtype,
          card_number: cardNumber,
          card_holder_name: user.email?.split('@')[0] || 'Cardholder',
          expiry_date: expiryDate,
          cvv: cvv,
          primary_currency: cardData.primary_currency,
          currency_priority: cardData.currency_priority,
          daily_limit: cardData.daily_limit,
          weekly_limit: cardData.weekly_limit,
          monthly_limit: cardData.monthly_limit,
          international_enabled: cardData.international_enabled,
          auto_expiry_date: cardData.auto_expiry_date,
        })
        .select()
        .single();

      if (error) throw error;

      // Create default notification settings
      await supabase
        .from('card_notifications')
        .insert([
          {
            card_id: data.id,
            notification_type: 'email',
            transaction_alerts: true,
            declined_payments: true,
            suspicious_activity: true,
            spending_limits: true,
          },
          {
            card_id: data.id,
            notification_type: 'push',
            transaction_alerts: true,
            declined_payments: true,
            suspicious_activity: true,
            spending_limits: true,
          }
        ]);

      // Create rewards record
      await supabase
        .from('card_rewards')
        .insert({
          card_id: data.id,
          user_id: user.id,
          total_cashback: 0,
          current_milestone: 0,
          next_milestone: 100,
          reward_points: 0,
        });

      toast({
        title: "Card Created Successfully",
        description: `${cardData.card_type === 'virtual' ? 'Virtual' : 'Physical'} card "${cardData.card_name}" has been created.`,
      });

      await fetchCards();
      return data;
    } catch (err: any) {
      toast({
        title: "Card Creation Failed",
        description: err.message,
        variant: "destructive",
      });
      throw err;
    }
  };

  // Update card status
  const updateCardStatus = async (cardId: string, status: Card['status']) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('user_cards')
        .update({ status })
        .eq('id', cardId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Card Status Updated",
        description: `Card has been ${status}.`,
      });

      await fetchCards();
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err.message,
        variant: "destructive",
      });
      throw err;
    }
  };

  // Update card settings
  const updateCardSettings = async (cardId: string, settings: Partial<Card>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('user_cards')
        .update(settings)
        .eq('id', cardId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Card Settings Updated",
        description: "Your card settings have been updated successfully.",
      });

      await fetchCards();
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err.message,
        variant: "destructive",
      });
      throw err;
    }
  };

  // Top up card
  const topUpCard = async (cardId: string, amount: number, sourceWalletId?: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Get current balance first
      const { data: cardData, error: fetchError } = await supabase
        .from('user_cards')
        .select('current_balance')
        .eq('id', cardId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      // Update card balance
      const { error } = await supabase
        .from('user_cards')
        .update({
          current_balance: (cardData.current_balance || 0) + amount
        })
        .eq('id', cardId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Create transaction record
      await supabase
        .from('card_transactions')
        .insert({
          card_id: cardId,
          user_id: user.id,
          merchant_name: 'Top Up',
          amount: amount,
          currency_used: 'USD',
          category: 'top_up',
          description: sourceWalletId ? 'Top up from wallet' : 'Top up from external account',
          status: 'completed',
        });

      toast({
        title: "Top Up Successful",
        description: `$${amount} has been added to your card.`,
      });

      await Promise.all([fetchCards(), fetchTransactions(cardId)]);
    } catch (err: any) {
      toast({
        title: "Top Up Failed",
        description: err.message,
        variant: "destructive",
      });
      throw err;
    }
  };

  // Delete card
  const deleteCard = async (cardId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('user_cards')
        .delete()
        .eq('id', cardId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Card Deleted",
        description: "Card has been permanently deleted.",
      });

      await fetchCards();
    } catch (err: any) {
      toast({
        title: "Delete Failed",
        description: err.message,
        variant: "destructive",
      });
      throw err;
    }
  };

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('card-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_cards',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchCards();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'card_transactions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCards(), fetchTransactions()]);
      setLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user]);

  return {
    cards,
    transactions,
    loading,
    error,
    createCard,
    updateCardStatus,
    updateCardSettings,
    topUpCard,
    deleteCard,
    fetchTransactions,
    refreshData: () => Promise.all([fetchCards(), fetchTransactions()]),
  };
};