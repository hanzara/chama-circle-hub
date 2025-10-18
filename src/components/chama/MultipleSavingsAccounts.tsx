import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useMultipleSavingsAccounts } from '@/hooks/useMultipleSavingsAccounts';
import { usePremiumFeatures } from '@/hooks/usePremiumFeatures';
import { PiggyBank, Plus, TrendingUp, Target, Shield, Star, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import CurrencyDisplay from '../CurrencyDisplay';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MultipleSavingsAccountsProps {
  chamaId: string;
}

const MultipleSavingsAccounts: React.FC<MultipleSavingsAccountsProps> = ({ chamaId }) => {
  const { toast } = useToast();
  const {
    savingsAccounts,
    savingsTransactions,
    isLoadingAccounts,
    createAccount,
    isCreatingAccount,
    deposit,
    isDepositing,
    updateAccount,
    getTotalBalance,
    getAccountByType,
    getMonthlyEarnings,
  } = useMultipleSavingsAccounts(chamaId);

  const { hasFeature, hasActiveSubscription } = usePremiumFeatures();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [formData, setFormData] = useState({
    account_name: '',
    account_type: 'regular',
    target_amount: '',
    monthly_target: '',
    deposit_amount: '',
    withdraw_amount: '',
    payment_method: 'mobile_money',
    payment_reference: '',
  });

  const accountTypes = [
    { 
      value: 'regular', 
      label: 'Regular Savings', 
      description: 'Basic savings with 5% annual interest',
      icon: PiggyBank,
      premium: false 
    },
    { 
      value: 'emergency', 
      label: 'Emergency Fund', 
      description: 'Quick access savings for emergencies',
      icon: Shield,
      premium: false 
    },
    { 
      value: 'goal-based', 
      label: 'Goal-Based Savings', 
      description: 'Save for specific targets with milestones',
      icon: Target,
      premium: true 
    },
    { 
      value: 'premium', 
      label: 'Premium Savings', 
      description: '8% annual interest with lower fees',
      icon: Star,
      premium: true 
    },
  ];

  const handleCreateAccount = () => {
    createAccount({
      account_name: formData.account_name,
      account_type: formData.account_type,
      target_amount: formData.target_amount ? parseFloat(formData.target_amount) : undefined,
      monthly_target: formData.monthly_target ? parseFloat(formData.monthly_target) : undefined,
    });
    setShowCreateDialog(false);
    setFormData({
      account_name: '',
      account_type: 'regular',
      target_amount: '',
      monthly_target: '',
      deposit_amount: '',
      withdraw_amount: '',
      payment_method: 'mobile_money',
      payment_reference: '',
    });
  };

  const handleDeposit = () => {
    if (selectedAccount && formData.deposit_amount) {
      deposit({
        accountId: selectedAccount,
        amount: parseFloat(formData.deposit_amount),
        paymentMethod: formData.payment_method,
        reference: formData.payment_reference,
      });
      setShowDepositDialog(false);
      setFormData({ ...formData, deposit_amount: '', payment_reference: '' });
    }
  };

  const handleWithdraw = async () => {
    if (selectedAccount && formData.withdraw_amount) {
      try {
        const { data, error } = await supabase.rpc('withdraw_from_savings_account', {
          p_account_id: selectedAccount,
          p_amount: parseFloat(formData.withdraw_amount),
          p_payment_method: formData.payment_method,
          p_payment_reference: formData.payment_reference,
        });

        if (error) throw error;

        const result = data as any;
        toast({
          title: "Withdrawal Successful",
          description: `Withdrew KES ${result?.net_withdrawn || 0}. Fee: KES ${result?.fee_charged || 0}`,
        });

        setShowWithdrawDialog(false);
        setFormData({ ...formData, withdraw_amount: '', payment_reference: '' });
      } catch (error: any) {
        toast({
          title: "Withdrawal Failed",
          description: error.message || "Failed to process withdrawal",
          variant: "destructive",
        });
      }
    }
  };

  const getAccountTypeInfo = (type: string) => {
    return accountTypes.find(t => t.value === type) || accountTypes[0];
  };

  if (isLoadingAccounts) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold">
                  <CurrencyDisplay amount={getTotalBalance()} />
                </p>
              </div>
              <PiggyBank className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Earnings</p>
                <p className="text-2xl font-bold text-green-600">
                  <CurrencyDisplay amount={getMonthlyEarnings()} />
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Accounts</p>
                <p className="text-2xl font-bold">{savingsAccounts.length}</p>
              </div>
              <div className="flex items-center gap-1">
                {savingsAccounts.slice(0, 3).map((account, index) => {
                  const typeInfo = getAccountTypeInfo(account.account_type);
                  const Icon = typeInfo.icon;
                  return <Icon key={index} className="h-4 w-4 text-muted-foreground" />;
                })}
                {savingsAccounts.length > 3 && (
                  <span className="text-xs text-muted-foreground">+{savingsAccounts.length - 3}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Savings Account</DialogTitle>
              <DialogDescription>
                Set up a new savings account to diversify your savings strategy.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="account_name">Account Name</Label>
                <Input
                  id="account_name"
                  value={formData.account_name}
                  onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                  placeholder="e.g., Vacation Fund, House Deposit"
                />
              </div>
              
              <div>
                <Label htmlFor="account_type">Account Type</Label>
                <Select
                  value={formData.account_type}
                  onValueChange={(value) => setFormData({ ...formData, account_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypes.map((type) => (
                      <SelectItem 
                        key={type.value} 
                        value={type.value}
                        disabled={type.premium && !hasActiveSubscription()}
                      >
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span>{type.label}</span>
                              {type.premium && <Badge variant="outline">Premium</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground">{type.description}</p>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target_amount">Target Amount (Optional)</Label>
                  <Input
                    id="target_amount"
                    type="number"
                    value={formData.target_amount}
                    onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                    placeholder="50000"
                  />
                </div>
                <div>
                  <Label htmlFor="monthly_target">Monthly Target (Optional)</Label>
                  <Input
                    id="monthly_target"
                    type="number"
                    value={formData.monthly_target}
                    onChange={(e) => setFormData({ ...formData, monthly_target: e.target.value })}
                    placeholder="5000"
                  />
                </div>
              </div>

              <Button 
                onClick={handleCreateAccount} 
                disabled={isCreatingAccount || !formData.account_name}
                className="w-full"
              >
                {isCreatingAccount ? 'Creating...' : 'Create Account'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showDepositDialog} onOpenChange={setShowDepositDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200">
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Make Deposit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Deposit to Savings Account</DialogTitle>
              <DialogDescription>
                Choose an account and enter the amount to deposit.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="account_select">Select Account</Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose savings account" />
                  </SelectTrigger>
                  <SelectContent>
                    {savingsAccounts.map((account) => {
                      const typeInfo = getAccountTypeInfo(account.account_type);
                      const Icon = typeInfo.icon;
                      return (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <div>
                              <span>{account.account_name}</span>
                              <p className="text-xs text-muted-foreground">
                                Balance: <CurrencyDisplay amount={account.current_balance} />
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="deposit_amount">Amount</Label>
                <Input
                  id="deposit_amount"
                  type="number"
                  value={formData.deposit_amount}
                  onChange={(e) => setFormData({ ...formData, deposit_amount: e.target.value })}
                  placeholder="1000"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mobile_money">M-Pesa</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="payment_reference">Reference (Optional)</Label>
                  <Input
                    id="payment_reference"
                    value={formData.payment_reference}
                    onChange={(e) => setFormData({ ...formData, payment_reference: e.target.value })}
                    placeholder="Transaction ID"
                  />
                </div>
              </div>

              <Button
                onClick={handleDeposit} 
                disabled={isDepositing || !selectedAccount || !formData.deposit_amount}
                className="w-full"
              >
                {isDepositing ? 'Processing...' : 'Deposit'}
              </Button>
            </div>
            </DialogContent>
        </Dialog>

        <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200">
              <ArrowDownLeft className="h-4 w-4 mr-2" />
              Withdraw Funds
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Withdraw from Savings Account</DialogTitle>
              <DialogDescription>
                Choose an account and enter the amount to withdraw.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="withdraw_account_select">Select Account</Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose savings account" />
                  </SelectTrigger>
                  <SelectContent>
                    {savingsAccounts.map((account) => {
                      const typeInfo = getAccountTypeInfo(account.account_type);
                      const Icon = typeInfo.icon;
                      return (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <div>
                              <span>{account.account_name}</span>
                              <p className="text-xs text-muted-foreground">
                                Balance: <CurrencyDisplay amount={account.current_balance} />
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="withdraw_amount">Amount</Label>
                <Input
                  id="withdraw_amount"
                  type="number"
                  value={formData.withdraw_amount}
                  onChange={(e) => setFormData({ ...formData, withdraw_amount: e.target.value })}
                  placeholder="1000"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="withdraw_payment_method">Payment Method</Label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mobile_money">M-Pesa</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="withdraw_payment_reference">Account/Phone</Label>
                  <Input
                    id="withdraw_payment_reference"
                    value={formData.payment_reference}
                    onChange={(e) => setFormData({ ...formData, payment_reference: e.target.value })}
                    placeholder="254712345678"
                  />
                </div>
              </div>

              <Button 
                onClick={handleWithdraw} 
                disabled={!selectedAccount || !formData.withdraw_amount || !formData.payment_reference}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Withdraw
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Savings Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {savingsAccounts.map((account) => {
          const typeInfo = getAccountTypeInfo(account.account_type);
          const Icon = typeInfo.icon;
          const progress = account.target_amount 
            ? (account.current_balance / account.target_amount) * 100 
            : 0;

          return (
            <Card key={account.id} className="relative overflow-hidden">
              {account.account_type === 'premium' && (
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{account.account_name}</CardTitle>
                </div>
                <CardDescription>{typeInfo.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-muted-foreground">Current Balance</span>
                    <span className="text-lg font-semibold">
                      <CurrencyDisplay amount={account.current_balance} />
                    </span>
                  </div>
                  
                  {account.target_amount && (
                    <>
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{progress.toFixed(1)}% of target</span>
                        <span>Target: <CurrencyDisplay amount={account.target_amount} /></span>
                      </div>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Interest Rate</span>
                    <p className="font-medium text-green-600">{account.interest_rate}% p.a.</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Monthly Target</span>
                    <p className="font-medium">
                      {account.monthly_target ? 
                        <CurrencyDisplay amount={account.monthly_target} /> : 
                        'None'
                      }
                    </p>
                  </div>
                </div>

                {account.auto_save_enabled && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Auto-save</span>
                    <Badge variant="outline" className="text-green-600">
                      <CurrencyDisplay amount={account.auto_save_amount} /> monthly
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {savingsAccounts.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <PiggyBank className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Savings Accounts Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first savings account to start building your financial future.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Account
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MultipleSavingsAccounts;