import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Receipt, Loader2 } from 'lucide-react';
import { useDealsAndBills, BillProvider } from '@/hooks/useDealsAndBills';
import CurrencyDisplay from '@/components/CurrencyDisplay';

interface BillPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: BillProvider | null;
}

const BillPaymentModal: React.FC<BillPaymentModalProps> = ({ open, onOpenChange, provider }) => {
  const { payBill, isPayingBill } = useDealsAndBills();
  const [formData, setFormData] = useState({
    accountNumber: '',
    amount: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!provider) return;

    await payBill({
      providerId: provider.id,
      accountNumber: formData.accountNumber,
      amount: parseFloat(formData.amount),
    });

    onOpenChange(false);
    setFormData({ accountNumber: '', amount: '' });
  };

  const calculateFee = () => {
    const amount = parseFloat(formData.amount) || 0;
    return Math.max(amount * 0.02, 5);
  };

  const getTotalAmount = () => {
    const amount = parseFloat(formData.amount) || 0;
    return amount + calculateFee();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Pay {provider?.name} Bill
          </DialogTitle>
        </DialogHeader>

        {provider && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number *</Label>
              <Input
                id="accountNumber"
                placeholder="Enter your account number"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (KES) *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="1000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                min="1"
                step="1"
                required
              />
            </div>

            {formData.amount && (
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Bill Amount:</span>
                  <CurrencyDisplay 
                    amount={parseFloat(formData.amount)} 
                    className="font-medium" 
                    showToggle={false} 
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span>Processing Fee:</span>
                  <CurrencyDisplay 
                    amount={calculateFee()} 
                    className="font-medium" 
                    showToggle={false} 
                  />
                </div>
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total Amount:</span>
                  <CurrencyDisplay 
                    amount={getTotalAmount()} 
                    className="font-semibold" 
                    showToggle={false} 
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isPayingBill || !formData.accountNumber || !formData.amount}
                className="gap-2"
              >
                {isPayingBill ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Receipt className="h-4 w-4" />
                    Pay Bill
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BillPaymentModal;