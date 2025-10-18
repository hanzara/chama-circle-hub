import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface PeerLendingOffer {
  id: string;
  lender_id: string;
  borrower_email: string;
  borrower_id?: string;
  amount: number;
  interest_rate: number;
  duration_months: number;
  purpose?: string;
  offer_message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'disbursed' | 'completed';
  created_at: string;
  updated_at: string;
  accepted_at?: string;
  disbursed_at?: string;
}

interface PeerLendingTransaction {
  id: string;
  offer_id: string;
  transaction_type: 'disbursement' | 'repayment';
  amount: number;
  payment_method: string;
  transaction_reference?: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export const usePeerLending = () => {
  const [offers, setOffers] = useState<PeerLendingOffer[]>([]);
  const [transactions, setTransactions] = useState<PeerLendingTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchOffers = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('peer_lending_offers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOffers(data as any || []);
    } catch (error: any) {
      console.error('Error fetching offers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch lending offers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('peer_lending_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data as any || []);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
    }
  };

  const createOffer = async (
    borrowerEmail: string,
    amount: number,
    interestRate: number = 10,
    durationMonths: number = 6,
    purpose?: string,
    offerMessage?: string
  ) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create an offer",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('create_peer_lending_offer', {
        p_borrower_email: borrowerEmail,
        p_amount: amount,
        p_interest_rate: interestRate,
        p_duration_months: durationMonths,
        p_purpose: purpose,
        p_offer_message: offerMessage
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Loan offer of KES ${amount.toLocaleString()} sent to ${borrowerEmail}`,
      });

      await fetchOffers();
      return true;
    } catch (error: any) {
      console.error('Error creating offer:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create loan offer",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const respondToOffer = async (offerId: string, response: 'accepted' | 'rejected', userPin: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to respond to offers",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('respond_to_lending_offer', {
        p_offer_id: offerId,
        p_response: response,
        p_user_pin: userPin
      });

      if (error) throw error;

      const result = data as { success: boolean; message: string };
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        await fetchOffers();
        return true;
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      console.error('Error responding to offer:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to respond to offer",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const disburseLoan = async (offerId: string, userPin: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to disburse loans",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('disburse_peer_loan', {
        p_offer_id: offerId,
        p_user_pin: userPin
      });

      if (error) throw error;

      const result = data as { success: boolean; message: string; transaction_id?: string };
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        await fetchOffers();
        await fetchTransactions();
        return true;
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      console.error('Error disbursing loan:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to disburse loan",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOffers();
      fetchTransactions();
    }
  }, [user]);

  return {
    offers,
    transactions,
    isLoading,
    createOffer,
    respondToOffer,
    disburseLoan,
    refetchOffers: fetchOffers,
    refetchTransactions: fetchTransactions
  };
};