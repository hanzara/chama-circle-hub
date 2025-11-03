import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface DisburseLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: any;
  chamaId: string;
}

export const DisburseLoanModal: React.FC<DisburseLoanModalProps> = ({
  isOpen,
  onClose,
  loan,
  chamaId
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDisburse = async () => {
    setIsProcessing(true);

    try {
      console.log('Disbursing loan:', { loanId: loan.id, chamaId });

      const { data, error } = await supabase.functions.invoke('disburse-loan', {
        body: {
          loanId: loan.id,
          chamaId
        }
      });

      console.log('Disburse response:', { data, error });

      if (error) {
        console.error('Disburse error:', error);
        throw new Error(error.message || 'Failed to disburse loan');
      }

      // Invalidate queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: ['chama-loans', chamaId] });
      await queryClient.invalidateQueries({ queryKey: ['chama-activities', chamaId] });

      toast({
        title: "Loan Disbursed! ✅",
        description: "Member has been notified to provide payment details"
      });

      // Close modal after a short delay to show success
      setTimeout(() => {
        onClose();
      }, 500);

    } catch (error: any) {
      console.error('Disbursement error:', error);
      toast({
        title: "Disbursement Failed",
        description: error.message || "Failed to disburse loan. Please try again.",
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
          <DialogTitle>Disburse Loan</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              This will mark the loan as disbursed and notify the member to provide their payment details.
            </p>
          </div>

          <div className="space-y-2">
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
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleDisburse} disabled={isProcessing} className="flex-1">
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Disburse Loan
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};