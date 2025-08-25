import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

interface WalletCurrency {
  id: string;
  user_id: string;
  currency_code: string;
  balance: number;
  locked_balance: number;
  wallet_address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface EnhancedTransaction {
  id: string;
  user_id: string;
  from_currency?: string;
  to_currency?: string;
  from_amount?: number;
  to_amount?: number;
  exchange_rate?: number;
  fee_amount: number;
  fee_currency?: string;
  transaction_type: string;
  status: string;
  description?: string;
  reference_id?: string;
  external_id?: string;
  metadata: Record<string, any>;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

interface ExchangeRate {
  from_currency: string;
  to_currency: string;
  rate: number;
  updated_at: string;
  source: string;
}

export const useEnhancedWallet = () => {
  const [walletCurrencies, setWalletCurrencies] = useState<WalletCurrency[]>([]);
  const [transactions, setTransactions] = useState<EnhancedTransaction[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch wallet currencies
  const fetchWalletCurrencies = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('wallet_currencies')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('balance', { ascending: false });

      if (error) throw error;
      setWalletCurrencies(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching wallet currencies:', err);
    }
  };

  // Fetch enhanced transactions
  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('enhanced_wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTransactions(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching transactions:', err);
    }
  };

  // Fetch exchange rates
  const fetchExchangeRates = async () => {
    try {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setExchangeRates(data || []);
    } catch (err: any) {
      console.error('Error fetching exchange rates:', err);
    }
  };

  // Get exchange rate between two currencies
  const getExchangeRate = (fromCurrency: string, toCurrency: string): number => {
    if (fromCurrency === toCurrency) return 1;

    // Try direct rate
    const directRate = exchangeRates.find(
      rate => rate.from_currency === fromCurrency && rate.to_currency === toCurrency
    );
    if (directRate) return directRate.rate;

    // Try reverse rate
    const reverseRate = exchangeRates.find(
      rate => rate.from_currency === toCurrency && rate.to_currency === fromCurrency
    );
    if (reverseRate) return 1 / reverseRate.rate;

    return 1; // Fallback
  };

  // Add funds to wallet
  const addFunds = async (currency: string, amount: number, source: string = 'demo') => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase.rpc('add_funds_to_wallet', {
        p_user_id: user.id,
        p_currency: currency,
        p_amount: amount,
        p_source: source,
        p_reference: `demo-${Date.now()}`
      });

      if (error) throw error;

      toast({
        title: "Funds Added",
        description: `Added ${amount} ${currency} to your wallet`,
      });

      // Refresh data
      await Promise.all([fetchWalletCurrencies(), fetchTransactions()]);
      
      return data;
    } catch (err: any) {
      toast({
        title: "Add Funds Failed",
        description: err.message,
        variant: "destructive",
      });
      throw err;
    }
  };

  // Convert currency
  const convertCurrency = async (
    fromCurrency: string,
    toCurrency: string,
    amount: number
  ) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase.rpc('convert_currency', {
        p_user_id: user.id,
        p_from_currency: fromCurrency,
        p_to_currency: toCurrency,
        p_amount: amount
      });

      if (error) throw error;

      const rate = getExchangeRate(fromCurrency, toCurrency);
      const convertedAmount = amount * rate;

      toast({
        title: "Currency Converted",
        description: `Converted ${amount} ${fromCurrency} to ${convertedAmount.toFixed(4)} ${toCurrency}`,
      });

      // Refresh data
      await Promise.all([fetchWalletCurrencies(), fetchTransactions()]);
      
      return data;
    } catch (err: any) {
      toast({
        title: "Conversion Failed",
        description: err.message,
        variant: "destructive",
      });
      throw err;
    }
  };

  // Send payment
  const sendPayment = async (
    recipientId: string,
    currency: string,
    amount: number,
    description?: string
  ) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase.rpc('send_payment', {
        p_sender_id: user.id,
        p_recipient_id: recipientId,
        p_currency: currency,
        p_amount: amount,
        p_description: description
      });

      if (error) throw error;

      toast({
        title: "Payment Sent",
        description: `Sent ${amount} ${currency}`,
      });

      // Refresh data
      await Promise.all([fetchWalletCurrencies(), fetchTransactions()]);
      
      return data;
    } catch (err: any) {
      toast({
        title: "Payment Failed",
        description: err.message,
        variant: "destructive",
      });
      throw err;
    }
  };

  // Calculate total portfolio value in USD
  const getTotalValueUSD = (): number => {
    return walletCurrencies.reduce((total, currency) => {
      const rate = getExchangeRate(currency.currency_code, 'USD');
      return total + (currency.balance * rate);
    }, 0);
  };

  // Get currency balance
  const getCurrencyBalance = (currencyCode: string): number => {
    const currency = walletCurrencies.find(c => c.currency_code === currencyCode);
    return currency?.balance || 0;
  };

  // Initialize demo data
  const initializeDemoData = async () => {
    if (!user || walletCurrencies.length > 0) return;

    try {
      // Add demo balances for multiple currencies
      const demoCurrencies = [
        { code: 'USD', amount: 5000 },
        { code: 'EUR', amount: 3500 },
        { code: 'GBP', amount: 2500 },
        { code: 'BTC', amount: 0.125 },
        { code: 'ETH', amount: 2.5 }
      ];

      for (const currency of demoCurrencies) {
        await addFunds(currency.code, currency.amount, 'demo-initialization');
      }

      toast({
        title: "Wallet Initialized",
        description: "Demo balances added to your multi-currency wallet",
      });
    } catch (err: any) {
      console.error('Error initializing demo data:', err);
    }
  };

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('wallet-real-time')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wallet_currencies',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchWalletCurrencies();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'enhanced_wallet_transactions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchTransactions();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'exchange_rates'
        },
        () => {
          fetchExchangeRates();
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
      await Promise.all([
        fetchWalletCurrencies(),
        fetchTransactions(),
        fetchExchangeRates()
      ]);
      setLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user]);

  // Initialize demo data on first load
  useEffect(() => {
    if (!loading && user && walletCurrencies.length === 0) {
      initializeDemoData();
    }
  }, [loading, user, walletCurrencies.length]);

  return {
    walletCurrencies,
    transactions,
    exchangeRates,
    loading,
    error,
    addFunds,
    convertCurrency,
    sendPayment,
    getTotalValueUSD,
    getCurrencyBalance,
    getExchangeRate,
    initializeDemoData,
    refreshData: () => Promise.all([fetchWalletCurrencies(), fetchTransactions(), fetchExchangeRates()]),
  };
};