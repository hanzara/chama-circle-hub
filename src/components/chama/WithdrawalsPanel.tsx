import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Download, Lock, Smartphone, Building2, CreditCard, 
  AlertCircle, CheckCircle, Clock, Calendar, Wallet,
  Eye, EyeOff, ArrowRight, Shield
} from 'lucide-react';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { useToast } from '@/hooks/use-toast';
import { useWithdrawals } from '@/hooks/useWithdrawals';

interface WithdrawalsPanelProps {
  userWallets: {
    chamaViewOnly: any;
    mgrWallet: any;
    personalSavings: any[];
  };
  userRole?: string;
}

const WithdrawalsPanel: React.FC<WithdrawalsPanelProps> = ({ userWallets, userRole }) => {
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'mpesa' | 'bank' | 'card' | 'airtel'>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bankDetails, setBankDetails] = useState({ accountNumber: '', bankName: '', branch: '' });
  const [pin, setPin] = useState('');
  const [showBalance, setShowBalance] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { withdrawals, limits, calculateFee: calcFee, createWithdrawal, isCreating } = useWithdrawals();

  const getWalletStatus = (wallet: any) => {
    if (wallet.type === 'chama_view_locked') {
      return {
        canWithdraw: false,
        reason: 'Withdrawals locked until next sharing event',
        nextUnlock: wallet.nextUnlock,
        icon: <Lock className="h-4 w-4 text-amber-500" />
      };
    }
    return {
      canWithdraw: true,
      reason: 'Available for withdrawal',
      icon: <CheckCircle className="h-4 w-4 text-green-500" />
    };
  };


  const handleWithdrawal = async () => {
    if (!selectedWallet || !withdrawAmount || !pin) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(withdrawAmount);
    const status = getWalletStatus(selectedWallet);
    
    if (!status.canWithdraw) {
      toast({
        title: "Withdrawal Not Allowed",
        description: status.reason,
        variant: "destructive",
      });
      return;
    }

    if (amount <= 0 || amount > selectedWallet.balance) {
      toast({
        title: "Invalid Amount",
        description: `Amount must be between KES 1 and KES ${selectedWallet.balance.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }

    // Check daily limit
    const remainingDaily = limits.daily.limit - limits.daily.used;
    if (amount > remainingDaily) {
      toast({
        title: "Daily Limit Exceeded",
        description: `You can only withdraw KES ${remainingDaily.toLocaleString()} more today`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare destination details
      const destinationDetails = withdrawMethod === 'mpesa' || withdrawMethod === 'airtel'
        ? { phoneNumber }
        : { bankName: bankDetails.bankName, accountNumber: bankDetails.accountNumber, branch: bankDetails.branch };

      // Create withdrawal request
      await createWithdrawal({
        walletId: selectedWallet.id,
        amount,
        method: withdrawMethod,
        destinationDetails,
        currency: 'KES'
      });

      // Reset form
      setSelectedWallet(null);
      setWithdrawAmount('');
      setPin('');
      setPhoneNumber('');
      setBankDetails({ accountNumber: '', bankName: '', branch: '' });
      setIsDialogOpen(false);
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'mpesa':
        return <Smartphone className="h-4 w-4" />;
      case 'bank':
        return <Building2 className="h-4 w-4" />;
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  const WalletCard = ({ wallet }: { wallet: any }) => {
    const status = getWalletStatus(wallet);
    
    return (
      <Card 
        className={`cursor-pointer border-2 transition-all ${
          selectedWallet?.id === wallet.id 
            ? 'border-blue-500 bg-blue-50' 
            : status.canWithdraw 
              ? 'border-gray-200 hover:border-gray-300' 
              : 'border-amber-200 bg-amber-50'
        }`}
        onClick={() => status.canWithdraw && setSelectedWallet(wallet)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet className="h-8 w-8 text-blue-500" />
              <div>
                <h4 className="font-medium">{wallet.name}</h4>
                <div className="flex items-center gap-2">
                  {status.icon}
                  <span className="text-xs text-muted-foreground">{status.reason}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <CurrencyDisplay 
                  amount={showBalance ? wallet.balance : 0}
                  className="text-lg font-bold"
                  showToggle={false}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowBalance(!showBalance);
                  }}
                >
                  {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {!status.canWithdraw && status.nextUnlock && (
                <p className="text-xs text-amber-600 mt-1">
                  Unlock: {status.nextUnlock}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Withdrawals</h2>
        <p className="text-muted-foreground">Withdraw funds to your mobile money or bank account</p>
      </div>

      {/* Withdrawal Limits */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Withdrawal Limits
          </CardTitle>
          <CardDescription>Your current withdrawal usage and limits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Daily Limit</span>
                <span>
                  <CurrencyDisplay amount={limits.daily.used} showToggle={false} /> / 
                  <CurrencyDisplay amount={limits.daily.limit} showToggle={false} />
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(limits.daily.used / limits.daily.limit) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Weekly Limit</span>
                <span>
                  <CurrencyDisplay amount={limits.weekly.used} showToggle={false} /> / 
                  <CurrencyDisplay amount={limits.weekly.limit} showToggle={false} />
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${(limits.weekly.used / limits.weekly.limit) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Monthly Limit</span>
                <span>
                  <CurrencyDisplay amount={limits.monthly.used} showToggle={false} /> / 
                  <CurrencyDisplay amount={limits.monthly.limit} showToggle={false} />
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${(limits.monthly.used / limits.monthly.limit) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Wallet Selection & Withdrawal Form */}
        <div className="space-y-6">
          {/* Available Wallets */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Select Wallet</CardTitle>
              <CardDescription>Choose which wallet to withdraw from</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <WalletCard wallet={userWallets.mgrWallet} />
              <WalletCard wallet={userWallets.chamaViewOnly} />
              {userWallets.personalSavings.map((savings: any) => (
                <WalletCard key={savings.id} wallet={savings} />
              ))}
            </CardContent>
          </Card>

          {/* Withdrawal Form */}
          {selectedWallet && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Withdrawal Details</CardTitle>
                <CardDescription>Enter withdrawal amount and destination</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (KES)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount to withdraw"
                    max={selectedWallet.balance}
                  />
                  <p className="text-xs text-muted-foreground">
                    Available: <CurrencyDisplay amount={selectedWallet.balance} showToggle={false} />
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Withdrawal Method</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={withdrawMethod === 'mpesa' ? 'default' : 'outline'}
                      onClick={() => setWithdrawMethod('mpesa')}
                      className="flex flex-col items-center h-16"
                    >
                      <Smartphone className="h-4 w-4" />
                      <span className="text-xs">M-Pesa</span>
                    </Button>
                    <Button
                      variant={withdrawMethod === 'bank' ? 'default' : 'outline'}
                      onClick={() => setWithdrawMethod('bank')}
                      className="flex flex-col items-center h-16"
                    >
                      <Building2 className="h-4 w-4" />
                      <span className="text-xs">Bank</span>
                    </Button>
                    <Button
                      variant={withdrawMethod === 'card' ? 'default' : 'outline'}
                      onClick={() => setWithdrawMethod('card')}
                      className="flex flex-col items-center h-16"
                      disabled
                    >
                      <CreditCard className="h-4 w-4" />
                      <span className="text-xs">Card</span>
                    </Button>
                  </div>
                </div>

                {withdrawMethod === 'mpesa' && (
                  <div className="space-y-2">
                    <Label htmlFor="phone">M-Pesa Phone Number</Label>
                    <Input
                      id="phone"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="254712345678"
                    />
                  </div>
                )}

                {withdrawMethod === 'bank' && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="bank">Bank Name</Label>
                      <Input
                        id="bank"
                        value={bankDetails.bankName}
                        onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                        placeholder="e.g., KCB Bank"
                      />
                    </div>
                    <div>
                      <Label htmlFor="account">Account Number</Label>
                      <Input
                        id="account"
                        value={bankDetails.accountNumber}
                        onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                        placeholder="Account number"
                      />
                    </div>
                  </div>
                )}

                {withdrawAmount && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Withdrawal amount:</span>
                      <CurrencyDisplay amount={parseFloat(withdrawAmount) || 0} showToggle={false} />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Transaction fee:</span>
                      <CurrencyDisplay amount={calcFee(parseFloat(withdrawAmount) || 0, withdrawMethod)} showToggle={false} />
                    </div>
                    <div className="flex justify-between text-sm font-medium border-t border-blue-300 pt-2 mt-2">
                      <span>You will receive:</span>
                      <CurrencyDisplay 
                        amount={(parseFloat(withdrawAmount) || 0) - calcFee(parseFloat(withdrawAmount) || 0, withdrawMethod)} 
                        showToggle={false} 
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="pin">PIN *</Label>
                  <Input
                    id="pin"
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter your PIN"
                    maxLength={4}
                  />
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full" 
                      disabled={!withdrawAmount || !pin || (withdrawMethod === 'mpesa' && !phoneNumber)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Withdraw Funds
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Withdrawal</DialogTitle>
                      <DialogDescription>
                        Please review the withdrawal details before confirming
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <span>From:</span>
                          <span className="font-medium">{selectedWallet?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Amount:</span>
                          <CurrencyDisplay amount={parseFloat(withdrawAmount) || 0} showToggle={false} />
                        </div>
                        <div className="flex justify-between">
                          <span>Fee:</span>
                          <CurrencyDisplay amount={calcFee(parseFloat(withdrawAmount) || 0, withdrawMethod)} showToggle={false} />
                        </div>
                        <div className="flex justify-between">
                          <span>Method:</span>
                          <span className="flex items-center gap-2">
                            {getMethodIcon(withdrawMethod)}
                            {withdrawMethod.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>To:</span>
                          <span className="font-medium">
                            {withdrawMethod === 'mpesa' ? phoneNumber : `${bankDetails.bankName} - ${bankDetails.accountNumber}`}
                          </span>
                        </div>
                      </div>
                      
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Withdrawal processing may take 1-24 hours depending on the method selected.
                        </AlertDescription>
                      </Alert>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleWithdrawal} disabled={isProcessing}>
                        {isProcessing ? 'Processing...' : 'Confirm Withdrawal'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Withdrawals */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Recent Withdrawals</CardTitle>
            <CardDescription>Your last withdrawal transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {withdrawals.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No withdrawal history yet</p>
              ) : (
                withdrawals.slice(0, 10).map((withdrawal) => (
                  <div key={withdrawal.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        {getMethodIcon(withdrawal.withdrawal_method)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CurrencyDisplay amount={withdrawal.amount} showToggle={false} className="font-medium" />
                          {getStatusBadge(withdrawal.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {withdrawal.withdrawal_method === 'mpesa' || withdrawal.withdrawal_method === 'airtel'
                            ? withdrawal.destination_details?.phoneNumber
                            : `${withdrawal.destination_details?.bankName} - ${withdrawal.destination_details?.accountNumber}`
                          }
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(withdrawal.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        Fee: <CurrencyDisplay amount={withdrawal.fee_amount} showToggle={false} />
                      </p>
                      <p className="text-xs text-muted-foreground">Ref: {withdrawal.id.slice(0, 8)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WithdrawalsPanel;