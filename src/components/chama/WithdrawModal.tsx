import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useChamaWalletOps } from '@/hooks/useChamaWalletOps';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { Loader2, ArrowDown } from 'lucide-react';

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
  const { mutate: performOperation, isPending } = useChamaWalletOps();

  const handleWithdraw = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;
    if (amountNum > mgrBalance) return;
    if (!phoneNumber) return;

    performOperation({
      operation: 'withdraw',
      chamaId,
      amount: amountNum,
      paymentMethod,
      recipient: phoneNumber
    }, {
      onSuccess: () => {
        onOpenChange(false);
        setAmount('');
        setPhoneNumber('');
      }
    });
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
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
            <Label className="text-sm text-muted-foreground">Available Balance</Label>
            <CurrencyDisplay amount={mgrBalance} className="text-2xl font-bold text-green-600" />
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
            <p className="text-xs text-muted-foreground">Maximum: {mgrBalance.toFixed(2)}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-method" className="text-sm font-medium">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="payment-method" className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mpesa">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 font-semibold">M</span>
                    <span>M-Pesa</span>
                  </div>
                </SelectItem>
                <SelectItem value="airtel">
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 font-semibold">A</span>
                    <span>Airtel Money</span>
                  </div>
                </SelectItem>
                <SelectItem value="bank">
                  <div className="flex items-center gap-2">
                    <span>🏦</span>
                    <span>Bank Transfer</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              {paymentMethod === 'bank' ? 'Account Number' : 'Phone Number'}
            </Label>
            <Input
              id="phone"
              type="text"
              placeholder={paymentMethod === 'bank' ? 'Enter account number' : '0712345678'}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="h-12"
            />
            {paymentMethod !== 'bank' && (
              <p className="text-xs text-muted-foreground">Format: 07XXXXXXXX or 254XXXXXXXXX</p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleWithdraw}
            disabled={isPending || !amount || !phoneNumber || parseFloat(amount) <= 0 || parseFloat(amount) > mgrBalance}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Processing...' : 'Withdraw Funds'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
