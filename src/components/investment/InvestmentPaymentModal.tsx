import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, TrendingUp } from 'lucide-react';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import MpesaPaymentModal from '@/components/shared/MpesaPaymentModal';

interface InvestmentPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  investmentType: string;
  minimumAmount?: number;
}

const InvestmentPaymentModal: React.FC<InvestmentPaymentModalProps> = ({
  isOpen,
  onClose,
  investmentType,
  minimumAmount = 1000
}) => {
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('12');
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const calculateReturns = () => {
    const principal = parseFloat(amount) || 0;
    const months = parseInt(duration);
    const annualRate = getAnnualRate();
    const monthlyRate = annualRate / 12 / 100;
    
    // Compound interest calculation
    const futureValue = principal * Math.pow(1 + monthlyRate, months);
    return futureValue - principal;
  };

  const getAnnualRate = () => {
    switch (investmentType) {
      case 'bonds':
        return 12;
      case 'stocks':
        return 15;
      case 'real_estate':
        return 18;
      case 'crypto':
        return 25;
      default:
        return 10;
    }
  };

  const handleInvestment = async () => {
    setIsProcessing(true);
    try {
      // Simulate investment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset form
      setAmount('');
      setDuration('12');
      onClose();
    } catch (error) {
      console.error('Investment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const investmentAmount = parseFloat(amount) || 0;
  const expectedReturns = calculateReturns();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              {investmentType.charAt(0).toUpperCase() + investmentType.slice(1)} Investment
            </DialogTitle>
            <DialogDescription>
              Make an investment and earn returns
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Investment Amount (KES)</Label>
              <Input
                id="amount"
                type="number"
                placeholder={`Minimum: ${minimumAmount}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isProcessing}
              />
              {investmentAmount > 0 && investmentAmount < minimumAmount && (
                <p className="text-sm text-red-600">
                  Minimum investment amount is {minimumAmount} KES
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Investment Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 months</SelectItem>
                  <SelectItem value="12">12 months</SelectItem>
                  <SelectItem value="18">18 months</SelectItem>
                  <SelectItem value="24">24 months</SelectItem>
                  <SelectItem value="36">36 months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {investmentAmount >= minimumAmount && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-800 mb-3">Investment Projection:</p>
                <div className="space-y-2 text-sm text-green-700">
                  <div className="flex justify-between">
                    <span>Initial Investment:</span>
                    <CurrencyDisplay amount={investmentAmount} showToggle={false} />
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Returns ({getAnnualRate()}% p.a.):</span>
                    <CurrencyDisplay amount={expectedReturns} showToggle={false} />
                  </div>
                  <div className="flex justify-between font-medium border-t border-green-300 pt-2">
                    <span>Total Value:</span>
                    <CurrencyDisplay amount={investmentAmount + expectedReturns} showToggle={false} />
                  </div>
                  <p className="text-xs text-green-600 mt-2">
                    *Returns are projected based on historical performance and market conditions.
                  </p>
                </div>
              </div>
            )}

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Investment Features:</strong>
              </p>
              <ul className="text-xs text-blue-700 mt-1 list-disc list-inside space-y-1">
                <li>Professional portfolio management</li>
                <li>Diversified investment strategy</li>
                <li>Regular performance updates</li>
                <li>Early withdrawal options (with fees)</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={() => setShowMpesaModal(true)}
              disabled={!amount || investmentAmount < minimumAmount || isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              Invest via M-Pesa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MpesaPaymentModal
        isOpen={showMpesaModal}
        onClose={() => setShowMpesaModal(false)}
        amount={investmentAmount}
        description={`${investmentType} investment`}
        purpose="investment"
        onSuccess={handleInvestment}
      />
    </>
  );
};

export default InvestmentPaymentModal;