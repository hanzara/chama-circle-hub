import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Send } from 'lucide-react';

interface SendFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: any;
  chamaId: string;
}

export const SendFundsModal: React.FC<SendFundsModalProps> = ({
  isOpen,
  onClose,
  loan,
  chamaId
}) => {
  const [amount, setAmount] = useState(loan.amount.toString());
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    const sendAmount = parseFloat(amount);
    if (isNaN(sendAmount) || sendAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-loan-funds', {
        body: {
          loanId: loan.id,
          chamaId,
          amount: sendAmount,
          memberPaymentNumber: loan.member_payment_number
        }
      });

      if (error) throw error;

      toast({
        title: "Funds Sent Successfully! 💸",
        description: `KES ${sendAmount.toLocaleString()} sent to member's wallet`
      });

      onClose();
      
      // Refresh the page
      window.location.reload();
    } catch (error: any) {
      console.error('Send funds error:', error);
      toast({
        title: "Failed to Send Funds",
        description: error.message || "An error occurred",
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
          <DialogTitle>Send Loan Funds</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSend} className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Member Payment Number:</span>
              <span className="font-medium">{loan.member_payment_number || 'Not provided'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Loan Amount:</span>
              <span className="font-medium">KES {loan.amount.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Send</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
              step="0.01"
              required
            />
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              ⚠️ This will deduct funds from the chama central wallet and credit the member's wallet.
            </p>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isProcessing} className="flex-1">
              {isProcessing ? 'Sending...' : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Funds
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};