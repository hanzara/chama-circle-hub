import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Send, Loader2, Phone } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface SendLoanFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: any;
  chamaId: string;
}

export const SendLoanFundsModal: React.FC<SendLoanFundsModalProps> = ({
  isOpen,
  onClose,
  loan,
  chamaId
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'airtel'>('mpesa');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSendFunds = async () => {
    setIsSending(true);

    try {
      console.log('Sending loan funds:', { loanId: loan.id, chamaId, amount: loan.amount, phoneNumber: loan.member_payment_number });

      const { data, error } = await supabase.functions.invoke('send-loan-funds', {
        body: {
          loanId: loan.id,
          chamaId: chamaId,
          amount: loan.amount,
          memberPaymentNumber: loan.member_payment_number,
          paymentMethod: paymentMethod
        }
      });

      console.log('Send funds response:', { data, error });

      if (error) {
        console.error('Send funds error:', error);
        throw new Error(error.message || 'Failed to send loan funds');
      }

      // Invalidate queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: ['chama-loans', chamaId] });
      await queryClient.invalidateQueries({ queryKey: ['chama-activities', chamaId] });

      toast({
        title: "Loan Funds Sent! ✅",
        description: `KES ${loan.amount.toLocaleString()} has been sent to ${loan.member_payment_number} via ${paymentMethod.toUpperCase()}`
      });

      onClose();
    } catch (error: any) {
      console.error('Error sending loan funds:', error);
      toast({
        title: "Failed to Send Funds",
        description: error.message || "Failed to send loan funds. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Loan Funds</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400">
              This will send KES {loan.amount.toLocaleString()} to the borrower's phone number via mobile money.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Recipient Phone Number</p>
                <p className="text-sm text-muted-foreground">{loan.member_payment_number}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mpesa">M-Pesa</SelectItem>
                <SelectItem value="airtel">Airtel Money</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Loan Amount:</span>
              <span className="font-medium">KES {loan.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Duration:</span>
              <span className="font-medium">{loan.duration_months} months</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Interest Rate:</span>
              <span className="font-medium">{loan.interest_rate}%</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendFunds} 
              disabled={isSending} 
              className="flex-1"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Funds
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
