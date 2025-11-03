import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useWithdrawals } from '@/hooks/useWithdrawals';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { Loader2, ArrowDown, Info, Building2, Smartphone } from 'lucide-react';

interface WithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chamaId: string;
  mgrBalance: number;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  open,
  onOpenChange,
  chamaId,
  mgrBalance
}) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { calculateFee } = useWithdrawals();

  // Calculate fee and net amount
  const withdrawalFee = useMemo(() => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return 0;
    return calculateFee(amountNum, paymentMethod);
  }, [amount, paymentMethod, calculateFee]);

  const netAmount = useMemo(() => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum)) return 0;
    return amountNum - withdrawalFee;
  }, [amount, withdrawalFee]);

  const handleWithdraw = async () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;
    if (amountNum > mgrBalance) {
      toast({
        title: "Insufficient MGR Balance",
        description: `You only have KES ${mgrBalance.toLocaleString()} available in your MGR wallet`,
        variant: "destructive",
      });
      return;
    }
    
    // Validation based on payment method (skip for internal transfers)
    if (paymentMethod !== 'internal') {
      if (paymentMethod === 'bank') {
        if (!phoneNumber || !bankName || !accountName) {
          toast({
            title: "Missing Information",
            description: "Please provide account number, bank name, and account name",
            variant: "destructive",
          });
          return;
        }
      } else {
        if (!phoneNumber) {
          toast({
            title: "Missing Information",
            description: "Please provide phone number",
            variant: "destructive",
          });
          return;
        }
      }
    }

    setIsProcessing(true);

    try {
      // Handle internal wallet transfer differently
      if (paymentMethod === 'internal') {
        const { data, error } = await supabase.functions.invoke('chama-wallet-ops', {
          body: {
            operation: 'withdraw',
            chamaId,
            amount: amountNum,
            paymentMethod: 'internal',
          }
        });

        if (error) throw error;

        if (data.success) {
          toast({
            title: "✅ Transfer Complete",
            description: `KES ${amountNum.toLocaleString()} transferred to your internal wallet`,
          });

          onOpenChange(false);
          setAmount('');
        } else {
          throw new Error(data.error || 'Transfer failed');
        }
      } else {
        // External withdrawal: First transfer MGR to central wallet, then withdraw
        // Step 1: Transfer from MGR to central wallet
        const { data: transferData, error: transferError } = await supabase.functions.invoke('chama-wallet-ops', {
          body: {
            operation: 'withdraw',
            chamaId,
            amount: amountNum,
            paymentMethod: 'internal',
          }
        });

        if (transferError) throw transferError;
        if (!transferData.success) throw new Error(transferData.error || 'Failed to transfer funds');

        // Step 2: Withdraw from central wallet
        const destinationDetails = paymentMethod === 'bank' 
          ? {
              account_number: phoneNumber,
              bank_name: bankName,
              account_name: accountName,
            }
          : {
              phone_number: phoneNumber,
            };

        const { data, error } = await supabase.functions.invoke('withdraw-funds', {
          body: {
            amount: amountNum,
            paymentMethod,
            destinationDetails,
          }
        });

        if (error) throw error;

        if (data.success) {
          toast({
            title: "✅ Withdrawal Initiated",
            description: `KES ${netAmount.toLocaleString()} will be sent to ${paymentMethod === 'bank' ? bankName : phoneNumber}. Fee: KES ${withdrawalFee}`,
          });

          onOpenChange(false);
          setAmount('');
          setPhoneNumber('');
          setBankName('');
          setAccountName('');
        } else {
          throw new Error(data.error || 'Withdrawal failed');
        }
      }
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to process withdrawal",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ArrowDown className="h-5 w-5 text-green-600" />
            Withdraw Funds
          </DialogTitle>
          <DialogDescription>
            Withdraw funds to your mobile money or bank account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <Label className="text-sm text-muted-foreground">Available Balance</Label>
            <CurrencyDisplay amount={mgrBalance} className="text-2xl font-bold text-green-600" />
          </div>

          <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-900 dark:text-blue-100">
              Withdraw directly to M-Pesa agent, Airtel agent, or your bank account. Funds are typically available within minutes.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="payment-method" className="text-sm font-medium">Withdrawal Method</Label>
            <Select value={paymentMethod} onValueChange={(value) => {
              setPaymentMethod(value);
              setPhoneNumber('');
              setBankName('');
              setAccountName('');
            }}>
              <SelectTrigger id="payment-method" className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">
                  <div className="flex items-center gap-3">
                    <ArrowDown className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="font-medium">Internal Wallet</div>
                      <div className="text-xs text-muted-foreground">Transfer to your personal wallet</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="mpesa">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="font-medium">M-Pesa Agent</div>
                      <div className="text-xs text-muted-foreground">Withdraw at any M-Pesa agent</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="airtel">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-4 w-4 text-red-600" />
                    <div>
                      <div className="font-medium">Airtel Money Agent</div>
                      <div className="text-xs text-muted-foreground">Withdraw at any Airtel agent</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="bank">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Bank Account</div>
                      <div className="text-xs text-muted-foreground">Direct bank transfer</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="withdraw-amount" className="text-sm font-medium">Amount to Withdraw</Label>
            <Input
              id="withdraw-amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              max={mgrBalance}
              step="0.01"
              className="h-12 text-lg"
            />
            <p className="text-xs text-muted-foreground">Maximum: KES {mgrBalance.toFixed(2)}</p>
          </div>

          {paymentMethod === 'internal' ? (
            <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-900 dark:text-blue-100">
                Funds will be instantly transferred to your personal wallet. No fees apply for internal transfers.
              </AlertDescription>
            </Alert>
          ) : paymentMethod === 'bank' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="account-number" className="text-sm font-medium">Account Number</Label>
                <Input
                  id="account-number"
                  type="text"
                  placeholder="Enter bank account number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bank-name" className="text-sm font-medium">Bank Name</Label>
                <Input
                  id="bank-name"
                  type="text"
                  placeholder="e.g., Equity Bank, KCB, Co-operative Bank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account-name" className="text-sm font-medium">Account Name</Label>
                <Input
                  id="account-name"
                  type="text"
                  placeholder="Account holder name"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="h-12"
                />
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                {paymentMethod === 'mpesa' ? 'M-Pesa' : 'Airtel Money'} Phone Number
              </Label>
              <Input
                id="phone"
                type="text"
                placeholder="0712345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">Format: 07XXXXXXXX or 254XXXXXXXXX</p>
            </div>
          )}

          {withdrawalFee > 0 && parseFloat(amount) > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg border border-amber-200 dark:border-amber-800 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Withdrawal Amount:</span>
                <span className="font-medium">KES {parseFloat(amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transaction Fee:</span>
                <span className="font-medium text-amber-600">- KES {withdrawalFee.toLocaleString()}</span>
              </div>
              <div className="border-t border-amber-300 dark:border-amber-700 pt-2 flex justify-between">
                <span className="font-semibold">You'll Receive:</span>
                <span className="font-bold text-green-600">KES {netAmount.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleWithdraw}
            disabled={
              isProcessing || 
              !amount || 
              parseFloat(amount) <= 0 || 
              parseFloat(amount) > mgrBalance ||
              (paymentMethod !== 'internal' && !phoneNumber) ||
              (paymentMethod === 'bank' && (!bankName || !accountName))
            }
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isProcessing ? 'Processing...' : paymentMethod === 'internal' ? `Transfer KES ${parseFloat(amount) > 0 ? parseFloat(amount).toLocaleString() : '0'}` : `Withdraw KES ${netAmount > 0 ? netAmount.toLocaleString() : '0'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
