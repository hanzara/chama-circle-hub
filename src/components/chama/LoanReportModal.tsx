import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { FileText, Phone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface LoanReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: any;
  chamaId: string;
}

export const LoanReportModal: React.FC<LoanReportModalProps> = ({
  isOpen,
  onClose,
  loan,
  chamaId
}) => {
  const [paymentNumber, setPaymentNumber] = useState(loan.member_payment_number || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Check if current user is the borrower
  const isBorrower = loan.chama_members?.user_id === user?.id;

  const handleSubmitPaymentDetails = async () => {
    if (!paymentNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter your payment number",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await (supabase as any)
        .from('chama_loans')
        .update({ 
          member_payment_number: paymentNumber,
          metadata: {
            ...loan.metadata,
            payment_number: paymentNumber,
            payment_details_provided_at: new Date().toISOString()
          }
        })
        .eq('id', loan.id);

      if (error) throw error;

      toast({
        title: "Payment Details Submitted! ✅",
        description: "The admin can now send your loan funds"
      });

      onClose();
      window.location.reload();
    } catch (error: any) {
      console.error('Submit payment details error:', error);
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
          <DialogTitle>Loan Report & Payment Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Comprehensive Loan Report */}
          {loan.metadata?.loan_report && (
            <div className="bg-primary/5 p-4 rounded-lg space-y-4 border">
              <h3 className="font-semibold text-lg">📋 Loan Disbursement Report</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Principal Amount</Label>
                  <p className="font-semibold">KES {loan.metadata.loan_report.loan_details.principal_amount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-xs">Interest Rate</Label>
                  <p className="font-semibold">{loan.metadata.loan_report.loan_details.interest_rate}% p.a.</p>
                </div>
                <div>
                  <Label className="text-xs">Duration</Label>
                  <p className="font-semibold">{loan.metadata.loan_report.loan_details.duration_months} months</p>
                </div>
                <div>
                  <Label className="text-xs">Monthly Payment</Label>
                  <p className="font-semibold text-primary">KES {loan.metadata.loan_report.loan_details.monthly_payment.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-xs">Total Interest</Label>
                  <p className="font-semibold">KES {loan.metadata.loan_report.loan_details.total_interest.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-xs">Total Repayment</Label>
                  <p className="font-semibold">KES {loan.metadata.loan_report.loan_details.total_repayment.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <Label className="text-xs">Loan Purpose</Label>
                <p className="text-sm mt-1">{loan.metadata.loan_report.loan_details.loan_purpose}</p>
              </div>

              {/* Repayment Schedule */}
              <div className="border-t pt-3">
                <h4 className="font-medium mb-2 text-sm">Repayment Schedule</h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {loan.metadata.loan_report.repayment_schedule.map((payment: any) => (
                    <div key={payment.month} className="bg-background p-2 rounded text-xs grid grid-cols-4 gap-2">
                      <div>
                        <p className="font-medium">Month {payment.month}</p>
                        <p className="text-muted-foreground">{new Date(payment.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Principal</p>
                        <p className="font-medium">KES {payment.principalAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Interest</p>
                        <p className="font-medium">KES {payment.interestAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Balance</p>
                        <p className="font-medium">KES {payment.remainingBalance.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                <p>📅 Disbursed: {new Date(loan.metadata.loan_report.disbursed_at).toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Basic Loan Details (fallback if no report) */}
          {!loan.metadata?.loan_report && (
            <div className="space-y-3">
              <div>
                <Label>Loan Amount</Label>
                <Input
                  value={`KES ${loan.amount.toLocaleString()}`}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div>
                <Label>Purpose</Label>
                <Input
                  value={loan.purpose}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div>
                <Label>Status</Label>
                <Input
                  value={loan.status}
                  disabled
                  className="bg-muted capitalize"
                />
              </div>
            </div>
          )}

          {/* Payment Details Section */}
          {loan.disbursement_status && (
            <div className="border-t pt-4 space-y-3">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Your loan has been disbursed! {isBorrower && !loan.member_payment_number && 'Please provide your payment details below.'}
                </p>
              </div>

              {isBorrower && !loan.member_payment_number ? (
                <>
                  <div>
                    <Label htmlFor="paymentNumber">
                      Payment Number (Phone/Wallet ID) *
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="paymentNumber"
                        placeholder="e.g., 0712345678"
                        value={paymentNumber}
                        onChange={(e) => setPaymentNumber(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter your M-Pesa number or wallet ID to receive funds
                    </p>
                  </div>

                  <Button
                    onClick={handleSubmitPaymentDetails}
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Payment Details'}
                  </Button>
                </>
              ) : loan.member_payment_number ? (
                <div>
                  <Label>Member Payment Number</Label>
                  <Input
                    value={loan.member_payment_number}
                    disabled
                    className="bg-muted"
                  />
                  {loan.funds_sent_at && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      ✅ Funds sent on {new Date(loan.funds_sent_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    Waiting for member to provide payment details
                  </p>
                </div>
              )}
            </div>
          )}

          {!loan.disbursement_status && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Waiting for loan disbursement approval
              </p>
            </div>
          )}

          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};