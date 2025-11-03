
// @ts-nocheck

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Smartphone, CreditCard, TrendingUp, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Navigation from '@/components/Navigation';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { useMobileMoneyData } from '@/hooks/useMobileMoneyData';

const MobileMoneyPage = () => {
  const navigate = useNavigate();
  const { 
    data, 
    isLoading, 
    addAccountMutation, 
    depositMutation, 
    withdrawMutation,
    isAddingAccount,
    isProcessingDeposit,
    isProcessingWithdrawal
  } = useMobileMoneyData();

  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccount, setNewAccount] = useState({
    provider: '',
    phoneNumber: '',
    accountName: ''
  });

  const [transactionForm, setTransactionForm] = useState({
    amount: '',
    description: '',
    phoneNumber: ''
  });

  const handleAddAccount = async () => {
    if (!newAccount.provider || !newAccount.phoneNumber) return;
    
    await addAccountMutation.mutateAsync({
      provider: newAccount.provider,
      phoneNumber: newAccount.phoneNumber,
      accountName: newAccount.accountName
    });
    
    setNewAccount({ provider: '', phoneNumber: '', accountName: '' });
    setShowAddAccount(false);
  };

  const handleDeposit = async () => {
    if (!transactionForm.amount || !transactionForm.phoneNumber) return;
    
    await depositMutation.mutateAsync({
      amount: parseFloat(transactionForm.amount),
      description: transactionForm.description,
      phoneNumber: transactionForm.phoneNumber
    });
    
    setTransactionForm({ amount: '', description: '', phoneNumber: '' });
  };

  const handleWithdraw = async () => {
    if (!transactionForm.amount || !transactionForm.phoneNumber) return;
    
    const amount = parseFloat(transactionForm.amount);
    if (amount < 10) {
      return;
    }
    
    await withdrawMutation.mutateAsync({
      amount,
      description: transactionForm.description,
      phoneNumber: transactionForm.phoneNumber
    });
    
    setTransactionForm({ amount: '', description: '', phoneNumber: '' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading mobile money data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Mobile Money Integration</h1>
            <p className="text-muted-foreground">Real M-Pesa payments for your chama</p>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <CurrencyDisplay amount={data?.statistics.totalDeposits || 0} className="text-2xl font-bold text-green-600" showToggle={false} />
              <p className="text-xs text-muted-foreground">Money added via M-Pesa</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
              <ArrowDownLeft className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <CurrencyDisplay amount={data?.statistics.totalWithdrawals || 0} className="text-2xl font-bold text-red-600" showToggle={false} />
              <p className="text-xs text-muted-foreground">Money withdrawn</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.statistics.successRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">M-Pesa success rate</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connected Accounts</CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.accounts.length || 0}</div>
              <p className="text-xs text-muted-foreground">M-Pesa accounts</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          {/* Transaction Trends */}
          <Card className="border-0 shadow-lg lg:col-span-2">
            <CardHeader>
              <CardTitle>Transaction Trends</CardTitle>
              <CardDescription>Daily M-Pesa deposits and withdrawals over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.transactionTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="deposits" fill="#00C49F" name="Deposits" />
                  <Bar dataKey="withdrawals" fill="#FF8042" name="Withdrawals" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>M-Pesa Transactions</CardTitle>
              <CardDescription>Real M-Pesa payments</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="deposit" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="deposit">Deposit</TabsTrigger>
                  <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                </TabsList>
                <TabsContent value="deposit" className="space-y-4">
                  <div>
                    <Label htmlFor="deposit-phone">Phone Number</Label>
                    <Input
                      id="deposit-phone"
                      type="tel"
                      value={transactionForm.phoneNumber}
                      onChange={(e) => setTransactionForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="0712345678"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deposit-amount">Amount (KES)</Label>
                    <Input
                      id="deposit-amount"
                      type="number"
                      value={transactionForm.amount}
                      onChange={(e) => setTransactionForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="1000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deposit-description">Description (Optional)</Label>
                    <Input
                      id="deposit-description"
                      value={transactionForm.description}
                      onChange={(e) => setTransactionForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Chama contribution"
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleDeposit}
                    disabled={isProcessingDeposit || !transactionForm.amount || !transactionForm.phoneNumber}
                  >
                    {isProcessingDeposit ? 'Processing...' : 'Send M-Pesa Request'}
                  </Button>
                </TabsContent>
                <TabsContent value="withdraw" className="space-y-4">
                  <div>
                    <Label htmlFor="withdraw-phone">Phone Number</Label>
                    <Input
                      id="withdraw-phone"
                      type="tel"
                      value={transactionForm.phoneNumber}
                      onChange={(e) => setTransactionForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="0712345678"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Funds will be sent to this M-Pesa number</p>
                  </div>
                  <div>
                    <Label htmlFor="withdraw-amount">Amount (KES)</Label>
                    <Input
                      id="withdraw-amount"
                      type="number"
                      min="10"
                      step="10"
                      value={transactionForm.amount}
                      onChange={(e) => setTransactionForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="500"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Minimum: KES 10</p>
                  </div>
                  <div>
                    <Label htmlFor="withdraw-description">Description (Optional)</Label>
                    <Input
                      id="withdraw-description"
                      value={transactionForm.description}
                      onChange={(e) => setTransactionForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Emergency withdrawal"
                    />
                  </div>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Withdrawal will be processed within 24 hours. Transaction fee applies.
                    </p>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleWithdraw}
                    disabled={isProcessingWithdrawal || !transactionForm.amount || !transactionForm.phoneNumber}
                  >
                    {isProcessingWithdrawal ? 'Processing...' : 'Request Withdrawal'}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Money Accounts */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Mobile Money Accounts</CardTitle>
              <CardDescription>Manage your connected M-Pesa accounts</CardDescription>
            </div>
            <Button onClick={() => setShowAddAccount(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Account
            </Button>
          </CardHeader>
          <CardContent>
            {showAddAccount && (
              <div className="mb-6 p-4 border rounded-lg bg-white/50">
                <h3 className="font-medium mb-4">Add New M-Pesa Account</h3>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="provider">Provider</Label>
                    <select
                      id="provider"
                      value={newAccount.provider}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, provider: e.target.value }))}
                      className="w-full p-2 border rounded-md bg-background"
                    >
                      <option value="">Select provider</option>
                      <option value="M-PESA">M-PESA (Safaricom)</option>
                      <option value="Airtel Money">Airtel Money</option>
                      <option value="T-Kash">T-Kash (Telkom)</option>
                      <option value="Equitel">Equitel</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={newAccount.phoneNumber}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="0712345678"
                    />
                  </div>
                  <div>
                    <Label htmlFor="account-name">Account Name (Optional)</Label>
                    <Input
                      id="account-name"
                      value={newAccount.accountName}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, accountName: e.target.value }))}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAddAccount}
                      disabled={isAddingAccount || !newAccount.provider || !newAccount.phoneNumber}
                    >
                      {isAddingAccount ? 'Adding...' : 'Add Account'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddAccount(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {data?.accounts.map((account) => (
                <div key={account.id} className="p-4 border rounded-lg bg-white/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Smartphone className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{account.provider}</h3>
                      <p className="text-sm text-muted-foreground">{account.phone_number}</p>
                      {account.account_name && (
                        <p className="text-sm text-muted-foreground">{account.account_name}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={account.is_verified ? 'secondary' : 'default'}>
                      {account.is_verified ? 'Verified' : 'Unverified'}
                    </Badge>
                    <Badge variant={account.is_active ? 'secondary' : 'destructive'}>
                      {account.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              ))}
              
              {(!data?.accounts || data.accounts.length === 0) && !showAddAccount && (
                <div className="text-center py-8 text-muted-foreground">
                  <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No M-Pesa accounts connected yet</p>
                  <p className="text-sm">Add an account to start making real payments</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Recent M-Pesa Transactions</CardTitle>
            <CardDescription>Your latest M-Pesa transaction history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg bg-white/50">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'deposit' ? 
                        <ArrowUpRight className="h-4 w-4 text-green-600" /> :
                        <ArrowDownLeft className="h-4 w-4 text-red-600" />
                      }
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description || `M-Pesa ${transaction.type}`}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'deposit' ? '+' : '-'}
                      <CurrencyDisplay amount={Math.abs(transaction.amount)} showToggle={false} />
                    </p>
                    <Badge variant={
                      transaction.status === 'completed' ? 'secondary' :
                      transaction.status === 'pending' ? 'default' : 'destructive'
                    }>
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
              
              {(!data?.transactions || data.transactions.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No M-Pesa transactions yet</p>
                  <p className="text-sm">Your M-Pesa transactions will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MobileMoneyPage;
