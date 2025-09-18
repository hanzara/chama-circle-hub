import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CreditCard } from 'lucide-react';
import { useChamaLoans } from '@/hooks/useChamaLoans';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import MpesaPaymentModal from '@/components/shared/MpesaPaymentModal';

interface LoanRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  chamaId: string;
  chamaData: any;
}

const LoanRequestModal: React.FC<LoanRequestModalProps> = ({
  isOpen,
  onClose,
  chamaId,
  chamaData
}) => {
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [repaymentPeriod, setRepaymentPeriod] = useState('6');
  const [collateral, setCollateral] = useState('');
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  
  const { applyForLoan, isApplying } = useChamaLoans(chamaId);

  const handleSubmit = async () => {
    if (!amount || !purpose) return;

    const loanAmount = parseFloat(amount);
    
    try {
      await applyForLoan({
        amount: loanAmount,
        purpose,
        repaymentPeriodMonths: parseInt(repaymentPeriod),
        collateral
      });
      
      // Reset form
      setAmount('');
      setPurpose('');
      setRepaymentPeriod('6');
      setCollateral('');
      onClose();
    } catch (error) {
      console.error('Loan application failed:', error);
    }
  };

  const processingFee = parseFloat(amount) * 0.02; // 2% processing fee

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Apply for Loan
            </DialogTitle>
            <DialogDescription>
              Request a loan from {chamaData?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Loan Amount (KES)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="10000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isApplying}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Textarea
                id="purpose"
                placeholder="Describe what you need the loan for..."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                disabled={isApplying}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="period">Repayment Period</Label>
              <Select value={repaymentPeriod} onValueChange={setRepaymentPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 months</SelectItem>
                  <SelectItem value="6">6 months</SelectItem>
                  <SelectItem value="9">9 months</SelectItem>
                  <SelectItem value="12">12 months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="collateral">Collateral (Optional)</Label>
              <Textarea
                id="collateral"
                placeholder="Describe any collateral you can provide..."
                value={collateral}
                onChange={(e) => setCollateral(e.target.value)}
                disabled={isApplying}
              />
            </div>

            {amount && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-800 mb-2">Loan Summary:</p>
                <div className="space-y-1 text-sm text-blue-700">
                  <div className="flex justify-between">
                    <span>Loan Amount:</span>
                    <CurrencyDisplay amount={parseFloat(amount) || 0} showToggle={false} />
                  </div>
                  <div className="flex justify-between">
                    <span>Processing Fee (2%):</span>
                    <CurrencyDisplay amount={processingFee || 0} showToggle={false} />
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>You'll Receive:</span>
                    <CurrencyDisplay amount={(parseFloat(amount) || 0) - processingFee} showToggle={false} />
                  </div>
                </div>
              </div>
            )}

            {processingFee > 0 && (
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>Processing Fee Required:</strong> Pay the processing fee via M-Pesa to submit your loan application.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isApplying}>
              Cancel
            </Button>
            {processingFee > 0 ? (
              <Button 
                onClick={() => setShowMpesaModal(true)}
                disabled={!amount || !purpose || isApplying}
                className="bg-green-600 hover:bg-green-700"
              >
                Pay Processing Fee
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={!amount || !purpose || isApplying}
              >
                {isApplying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Applying...
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MpesaPaymentModal
        isOpen={showMpesaModal}
        onClose={() => setShowMpesaModal(false)}
        amount={processingFee}
        description={`Loan processing fee for ${chamaData?.name}`}
        purpose="loan_payment"
        chamaId={chamaId}
        onSuccess={handleSubmit}
      />
    </>
  );
};

export default LoanRequestModal;