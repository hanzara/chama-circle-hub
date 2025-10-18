import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CreditCard, TrendingUp } from 'lucide-react';
import { useChamaLoans } from '@/hooks/useChamaLoans';
import { Progress } from '@/components/ui/progress';

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
  
  const { applyForLoan, isApplying, creditScore } = useChamaLoans(chamaId);

  const score = creditScore?.credit_score || 30;
  const maxLoanAmount = 100000; // Default, can be from chama settings
  const eligibleAmount = Math.min(maxLoanAmount, (score / 100) * maxLoanAmount);

  const handleSubmit = async () => {
    if (!amount || !purpose) return;

    const loanAmount = parseFloat(amount);
    
    if (loanAmount > eligibleAmount) {
      return;
    }
    
    try {
      await applyForLoan({
        amount: loanAmount,
        purpose,
        repaymentPeriodMonths: parseInt(repaymentPeriod)
      });
      
      // Reset form
      setAmount('');
      setPurpose('');
      setRepaymentPeriod('6');
      onClose();
    } catch (error) {
      console.error('Loan application failed:', error);
    }
  };

  const getCreditScoreLabel = () => {
    if (score >= 80) return '💪 Excellent';
    if (score >= 60) return '⭐ Good';
    if (score >= 40) return '👍 Fair';
    return '⚠️ Building';
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Request Chama Loan
            </DialogTitle>
            <DialogDescription>
              Apply for a loan from {chamaData?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Credit Score Display */}
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Your Credit Score</span>
                <span className="text-lg font-bold">{getCreditScoreLabel()}</span>
              </div>
              <Progress value={score} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground">
                Score: {score}/100
              </p>
            </div>

            {/* Eligible Amount */}
            <div className="bg-primary/10 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Eligible Loan Amount</p>
              <p className="text-xl font-bold text-primary">
                Up to KES {eligibleAmount.toLocaleString()}
              </p>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">Loan Amount (KES)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                max={eligibleAmount}
                disabled={isApplying}
              />
              {parseFloat(amount) > eligibleAmount && (
                <p className="text-xs text-destructive">
                  Amount exceeds your eligible limit
                </p>
              )}
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="period">Repayment Period</Label>
              <Select value={repaymentPeriod} onValueChange={setRepaymentPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Months</SelectItem>
                  <SelectItem value="6">6 Months</SelectItem>
                  <SelectItem value="9">9 Months</SelectItem>
                  <SelectItem value="12">12 Months</SelectItem>
                  <SelectItem value="18">18 Months</SelectItem>
                  <SelectItem value="24">24 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <Label htmlFor="purpose">Loan Purpose</Label>
              <Textarea
                id="purpose"
                placeholder="Explain why you need this loan..."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                rows={3}
                disabled={isApplying}
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isApplying}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!amount || !purpose || parseFloat(amount) > eligibleAmount || isApplying}
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LoanRequestModal;