import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Phone, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface ProvideLoanPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: any;
  chamaId: string;
}

export const ProvideLoanPaymentModal: React.FC<ProvideLoanPaymentModalProps> = ({
  isOpen,
  onClose,
  loan,
  chamaId
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Update loan with payment number - cast to any to avoid type checking
      const { error } = await (supabase as any)
        .from('chama_loans')
        .update({ 
          member_payment_number: phoneNumber
        })
        .eq('id', loan.id);

      if (error) throw error;

      // Invalidate queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: ['chama-loans', chamaId] });

      toast({
        title: "Payment Details Submitted! ✅",
        description: "Your payment details have been submitted to the chairman for fund disbursement"
      });

      onClose();
      setPhoneNumber('');
    } catch (error: any) {
      console.error('Error submitting payment details:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit payment details",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Provide Payment Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Your loan of KES {loan.amount.toLocaleString()} has been approved! 
              Please provide your phone number to receive the funds via M-Pesa or Airtel Money.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="e.g., 254712345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter phone number with country code (e.g., 254 for Kenya)
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
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !phoneNumber} 
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Details'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
