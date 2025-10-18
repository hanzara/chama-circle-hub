import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SubAccount {
  id: string;
  name: string;
  description?: string;
  balance: number;
  currency: string;
  permissions: {
    view: boolean;
    send: boolean;
    receive: boolean;
    convert: boolean;
  };
  created_at: string;
  is_active: boolean;
}

export interface SubAccountTransaction {
  id: string;
  sub_account_id: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export const useSubAccounts = () => {
  const [subAccounts, setSubAccounts] = useState<SubAccount[]>([]);
  const [transactions, setTransactions] = useState<SubAccountTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Mock data for demonstration
  useEffect(() => {
    const mockSubAccounts: SubAccount[] = [
      {
        id: '1',
        name: 'Family Account',
        description: 'Shared family expenses',
        balance: 15000,
        currency: 'KES',
        permissions: { view: true, send: true, receive: true, convert: false },
        created_at: '2024-01-15T10:00:00Z',
        is_active: true,
      },
      {
        id: '2',
        name: 'Business Account',
        description: 'Business operations',
        balance: 45000,
        currency: 'KES',
        permissions: { view: true, send: true, receive: true, convert: true },
        created_at: '2024-02-01T10:00:00Z',
        is_active: true,
      },
      {
        id: '3',
        name: 'Savings Pool',
        description: 'Emergency fund',
        balance: 25000,
        currency: 'KES',
        permissions: { view: true, send: false, receive: true, convert: false },
        created_at: '2024-02-15T10:00:00Z',
        is_active: true,
      },
    ];

    const mockTransactions: SubAccountTransaction[] = [
      {
        id: '1',
        sub_account_id: '1',
        type: 'deposit',
        amount: 5000,
        currency: 'KES',
        description: 'Monthly allowance',
        status: 'completed',
        created_at: '2024-03-01T10:00:00Z',
      },
      {
        id: '2',
        sub_account_id: '2',
        type: 'transfer',
        amount: 10000,
        currency: 'KES',
        description: 'Business expense',
        status: 'completed',
        created_at: '2024-03-02T14:30:00Z',
      },
      {
        id: '3',
        sub_account_id: '3',
        type: 'deposit',
        amount: 3000,
        currency: 'KES',
        description: 'Emergency fund contribution',
        status: 'pending',
        created_at: '2024-03-03T09:15:00Z',
      },
    ];

    setSubAccounts(mockSubAccounts);
    setTransactions(mockTransactions);
  }, []);

  const createSubAccount = async (accountData: Omit<SubAccount, 'id' | 'created_at' | 'balance'>) => {
    setLoading(true);
    try {
      const newAccount: SubAccount = {
        ...accountData,
        id: Date.now().toString(),
        balance: 0,
        created_at: new Date().toISOString(),
      };
      
      setSubAccounts(prev => [...prev, newAccount]);
      
      toast({
        title: "Sub-account Created",
        description: `${accountData.name} has been created successfully.`,
      });
      
      return { success: true, data: newAccount };
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create sub-account. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const transferFunds = async (fromAccount: string, toAccount: string, amount: number, description: string) => {
    setLoading(true);
    try {
      // Update balances
      setSubAccounts(prev => prev.map(account => {
        if (account.id === fromAccount) {
          return { ...account, balance: account.balance - amount };
        }
        if (account.id === toAccount) {
          return { ...account, balance: account.balance + amount };
        }
        return account;
      }));

      // Add transaction record
      const newTransaction: SubAccountTransaction = {
        id: Date.now().toString(),
        sub_account_id: fromAccount,
        type: 'transfer',
        amount,
        currency: 'KES',
        description,
        status: 'completed',
        created_at: new Date().toISOString(),
      };

      setTransactions(prev => [newTransaction, ...prev]);

      toast({
        title: "Transfer Successful",
        description: `KES ${amount.toLocaleString()} transferred successfully.`,
      });

      return { success: true };
    } catch (error) {
      toast({
        title: "Transfer Failed",
        description: "Failed to complete the transfer. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const updatePermissions = async (accountId: string, permissions: SubAccount['permissions']) => {
    setLoading(true);
    try {
      setSubAccounts(prev => prev.map(account => 
        account.id === accountId ? { ...account, permissions } : account
      ));

      toast({
        title: "Permissions Updated",
        description: "Sub-account permissions have been updated successfully.",
      });

      return { success: true };
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update permissions. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const deactivateSubAccount = async (accountId: string) => {
    setLoading(true);
    try {
      setSubAccounts(prev => prev.map(account => 
        account.id === accountId ? { ...account, is_active: false } : account
      ));

      toast({
        title: "Account Deactivated",
        description: "Sub-account has been deactivated successfully.",
      });

      return { success: true };
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to deactivate account. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const sendMoney = async (accountId: string, recipient: string, amount: number, description: string) => {
    setLoading(true);
    try {
      const account = subAccounts.find(a => a.id === accountId);
      if (!account) throw new Error('Account not found');
      if (!account.permissions.send) throw new Error('Send permission not enabled');
      if (account.balance < amount) throw new Error('Insufficient balance');

      // Calculate fee (KES 5 under 1000, KES 10 above)
      const fee = amount < 1000 ? 5 : 10;
      const total = amount + fee;

      if (account.balance < total) throw new Error('Insufficient balance including fee');

      const newBalance = account.balance - total;

      // Update account balance
      setSubAccounts(prev => prev.map(acc => 
        acc.id === accountId ? { ...acc, balance: newBalance } : acc
      ));

      // Add transaction
      const newTransaction: SubAccountTransaction = {
        id: Date.now().toString(),
        sub_account_id: accountId,
        type: 'withdrawal',
        amount: total,
        currency: account.currency,
        description: `${description} (Fee: ${account.currency} ${fee})`,
        status: 'completed',
        created_at: new Date().toISOString(),
      };
      setTransactions(prev => [newTransaction, ...prev]);

      // Format notification message
      const now = new Date();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dateTime = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${now.getHours() % 12 || 12}:${now.getMinutes().toString().padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
      const txnId = `V${Math.floor(100000 + Math.random() * 900000)}`;
      const maskedPhone = recipient.length >= 7 ? `${recipient.slice(0, 4)} *** ${recipient.slice(-3)}` : recipient;

      toast({
        title: "[ChamaYangu] Money Sent 🌟",
        description: `${dateTime}\nYou sent ${account.currency} ${amount.toLocaleString()} to ${maskedPhone}.\nFee: ${account.currency} ${fee} | Bal: ${account.currency} ${newBalance.toLocaleString()}\nTxnID: ${txnId}\nThank you for using ChamaYangu 🌟`,
        duration: 8000,
      });

      return { success: true, fee, total };
    } catch (error: any) {
      toast({
        title: "Send Failed",
        description: error.message || "Failed to send money. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const receiveMoney = async (accountId: string) => {
    const account = subAccounts.find(a => a.id === accountId);
    if (!account) return { success: false, error: 'Account not found' };
    if (!account.permissions.receive) return { success: false, error: 'Receive permission not enabled' };

    // Generate payment methods
    const paybillNumber = '123456';
    const accountNumber = `${account.name.replace(/\s/g, '').toUpperCase()}${accountId.substring(0, 6)}`;
    const qrCode = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='200' height='200' fill='white'/><text x='50%' y='50%' text-anchor='middle' dy='.3em' font-size='12'>QR: ${accountNumber}</text></svg>`;

    return {
      success: true,
      paymentMethods: {
        paybillNumber,
        accountNumber,
        qrCode,
        accountName: account.name,
      }
    };
  };

  const convertMoney = async (
    fromAccountId: string, 
    toAccountId: string, 
    amount: number, 
    fromCurrency: string,
    toCurrency: string
  ) => {
    setLoading(true);
    try {
      const fromAccount = subAccounts.find(a => a.id === fromAccountId);
      const toAccount = subAccounts.find(a => a.id === toAccountId);

      if (!fromAccount || !toAccount) throw new Error('Account not found');
      if (!fromAccount.permissions.convert) throw new Error('Convert permission not enabled');
      if (fromAccount.balance < amount) throw new Error('Insufficient balance');

      // Simple exchange rates (in production, fetch from API)
      const exchangeRates: { [key: string]: { [key: string]: number } } = {
        KES: { USD: 0.0077, EUR: 0.0070, KES: 1 },
        USD: { KES: 130, EUR: 0.91, USD: 1 },
        EUR: { KES: 143, USD: 1.10, EUR: 1 },
      };

      const rate = exchangeRates[fromCurrency]?.[toCurrency] || 1;
      const convertedAmount = amount * rate;

      // Update balances
      setSubAccounts(prev => prev.map(acc => {
        if (acc.id === fromAccountId) {
          return { ...acc, balance: acc.balance - amount };
        }
        if (acc.id === toAccountId) {
          return { ...acc, balance: acc.balance + convertedAmount };
        }
        return acc;
      }));

      // Add transactions
      const withdrawTx: SubAccountTransaction = {
        id: Date.now().toString(),
        sub_account_id: fromAccountId,
        type: 'withdrawal',
        amount,
        currency: fromCurrency,
        description: `Converted to ${toAccount.name}`,
        status: 'completed',
        created_at: new Date().toISOString(),
      };

      const depositTx: SubAccountTransaction = {
        id: (Date.now() + 1).toString(),
        sub_account_id: toAccountId,
        type: 'deposit',
        amount: convertedAmount,
        currency: toCurrency,
        description: `Converted from ${fromAccount.name}`,
        status: 'completed',
        created_at: new Date().toISOString(),
      };

      setTransactions(prev => [depositTx, withdrawTx, ...prev]);

      // Format notification message
      const now = new Date();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dateTime = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${now.getHours() % 12 || 12}:${now.getMinutes().toString().padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
      const txnId = `V${Math.floor(100000 + Math.random() * 900000)}`;

      toast({
        title: "[ChamaYangu] Conversion Success 💱",
        description: `${dateTime}\nConverted ${fromCurrency} ${amount.toLocaleString()} → ${toCurrency} ${convertedAmount.toLocaleString()}\nRate: ${rate.toFixed(4)} | TxnID: ${txnId}\nSmart money moves 🚀`,
        duration: 8000,
      });

      return { success: true, convertedAmount, rate };
    } catch (error: any) {
      toast({
        title: "Conversion Failed",
        description: error.message || "Failed to convert. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    subAccounts: subAccounts.filter(account => account.is_active),
    transactions,
    loading,
    createSubAccount,
    transferFunds,
    updatePermissions,
    deactivateSubAccount,
    sendMoney,
    receiveMoney,
    convertMoney,
  };
};