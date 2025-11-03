import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { DollarSign } from 'lucide-react';

interface RepayLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: any;
  chamaId: string;
}

export const RepayLoanModal: React.FC<RepayLoanModalProps> = ({
  isOpen,
  onClose,
  loan,
  chamaId
}) => {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const remaining = loan.amount - (loan.repaid_amount || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const repayAmount = parseFloat(amount);
    if (isNaN(repayAmount) || repayAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    if (repayAmount > remaining) {
      toast({
        title: "Amount Too High",
        description: `Maximum repayment amount is KES ${remaining.toLocaleString()}`,
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('repay-chama-loan', {
        body: {
          loanId: loan.id,
          chamaId,
          amount: repayAmount
        }
      });

      if (error) throw error;

      toast({
        title: "Repayment Successful! 💸",
        description: data.message || `Repayment of KES ${repayAmount.toLocaleString()} successful`
      });

      onClose();
      setAmount('');
      
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error: any) {
      console.error('Repayment error:', error);
      toast({
        title: "Repayment Failed",
        description: error.message || "Failed to process repayment",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Repay Loan</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Loan Amount:</span>
              <span className="font-medium">KES {loan.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount Paid:</span>
              <span className="font-medium">KES {(loan.repaid_amount || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Remaining Balance:</span>
              <span className="font-medium text-primary">KES {remaining.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Repayment Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="pl-10"
                min="1"
                max={remaining}
                step="0.01"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the amount you want to repay (max: KES {remaining.toLocaleString()})
            </p>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isProcessing} className="flex-1">
              {isProcessing ? 'Processing...' : 'Repay'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};