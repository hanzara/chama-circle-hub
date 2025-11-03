import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useChamaWalletOps } from '@/hooks/useChamaWalletOps';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { Loader2 } from 'lucide-react';

interface TopUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chamaId: string;
  savingsBalance: number;
}

export const TopUpModal: React.FC<TopUpModalProps> = ({
  open,
  onOpenChange,
  chamaId,
  savingsBalance
}) => {
  const [amount, setAmount] = useState('');
  const { mutate: performOperation, isPending } = useChamaWalletOps();

  const handleTopUp = () => {
    const amountNum = parseFloat(amount);
    
    if (isNaN(amountNum) || amountNum <= 0) {
      return;
    }
    
    if (amountNum > savingsBalance) {
      return;
    }

    performOperation({
      operation: 'topup',
      chamaId,
      amount: amountNum
    }, {
      onSuccess: (data) => {
        console.log('Top-up successful:', data);
        onOpenChange(false);
        setAmount('');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Top Up Merry-Go-Round Wallet</DialogTitle>
          <DialogDescription>
            Transfer funds from your Chama Savings to your Merry-Go-Round wallet
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Available in Savings</Label>
            <CurrencyDisplay amount={savingsBalance} className="text-lg font-semibold" />
          </div>

          <div>
            <Label htmlFor="amount">Amount to Transfer</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              max={savingsBalance}
              step="0.01"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleTopUp}
            disabled={isPending || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > savingsBalance}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Top Up
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
