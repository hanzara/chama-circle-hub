import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, CreditCard, Building2, Smartphone, Banknote, Info } from 'lucide-react';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { useTransactionNotification } from '@/hooks/useTransactionNotification';
import { usePaystackIntegration } from '@/hooks/usePaystackIntegration';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';

type BudgetCategory = Database['public']['Tables']['budget_categories']['Row'];

interface CategoryTopUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: BudgetCategory | null;
  onTopUp: (data: any) => Promise<any>;
  isProcessing: boolean;
}

const CategoryTopUpModal: React.FC<CategoryTopUpModalProps> = ({
  open,
  onOpenChange,
  category,
  onTopUp,
  isProcessing,
}) => {
  const { showTransactionNotification } = useTransactionNotification();
  const { initializePayment, isProcessingPayment } = usePaystackIntegration();
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notes, setNotes] = useState('');

  const handlePaymentSuccess = async (paymentData: any) => {
    const numericAmount = parseFloat(amount);
    
    if (!category || numericAmount <= 0) return;

    // Process the top-up after successful payment
    await onTopUp({
      category: category.category,
      amount: numericAmount,
      payment_method: 'paystack',
      payment_reference: paymentData.reference,
      notes: notes || undefined,
    });

    // Show success notification
    const newBalance = (category?.remaining_balance || 0) + numericAmount;
    showTransactionNotification({
      type: 'deposit',
      amount: numericAmount,
      newBalance,
    });

    // Reset form
    setAmount('');
    setPhoneNumber('');
    setNotes('');
    onOpenChange(false);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = parseFloat(amount);
    
    if (!category || numericAmount <= 0 || !email) return;

    try {
      const result = await initializePayment.mutateAsync({
        email,
        phoneNumber: phoneNumber || undefined,
        amount: numericAmount,
        purpose: 'other',
        description: `Top-up for ${category.category} budget`,
        metadata: {
          budget_category_id: category.id,
          category_name: category.category,
          notes: notes || undefined,
        }
      });

      if (result.success && result.authorization_url) {
        // Open Paystack payment page in new tab
        window.open(result.authorization_url, '_blank');
        
        // Handle success callback
        handlePaymentSuccess({
          reference: result.reference,
          authorization_url: result.authorization_url,
        });
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Top-Up {category?.category} Budget
          </DialogTitle>
        </DialogHeader>

        {category && (
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Allocated:</span>
              <CurrencyDisplay 
                amount={category.allocated_amount} 
                className="font-medium" 
                showToggle={false} 
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Remaining:</span>
              <CurrencyDisplay 
                amount={category.remaining_balance} 
                className={`font-semibold ${
                  category.remaining_balance <= 0 ? 'text-red-600' : 'text-green-600'
                }`}
                showToggle={false} 
              />
            </div>
          </div>
        )}

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Pay securely using Paystack - Supports cards, bank transfers, mobile money and more.
          </AlertDescription>
        </Alert>

        {/* Payment Methods Available */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Available Payment Methods</Label>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1">
              <CreditCard className="h-3 w-3" />
              Cards
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Building2 className="h-3 w-3" />
              Bank Transfer
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Smartphone className="h-3 w-3" />
              Mobile Money
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Banknote className="h-3 w-3" />
              USSD
            </Badge>
          </div>
        </div>

        <form onSubmit={handlePayment} className="space-y-4">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Top-Up Amount (KES) *</Label>
            <Input
              id="amount"
              type="number"
              placeholder="5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="1"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Payment confirmation will be sent to this email
            </p>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="254712345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              For mobile money payments
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="e.g., Monthly food budget top-up"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isProcessingPayment || isProcessing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isProcessingPayment || isProcessing || !amount || !email}
              className="gap-2"
            >
              {(isProcessingPayment || isProcessing) ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Pay with Paystack
                </>
              )}
            </Button>
          </div>

          {/* Security Note */}
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-center text-muted-foreground">
              🔒 Secured by Paystack. Your payment information is encrypted and secure.
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryTopUpModal;