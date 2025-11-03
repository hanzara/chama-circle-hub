import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Loader2 } from 'lucide-react';
import { usePaystackIntegration } from '@/hooks/usePaystackIntegration';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { useAuth } from '@/hooks/useAuth';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  description: string;
  purpose: 'contribution' | 'loan_payment' | 'investment' | 'other';
  chamaId?: string;
  onSuccess?: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  description,
  purpose,
  chamaId,
  onSuccess
}) => {
  const [email, setEmail] = useState('');
  const { user } = useAuth();
  const { initializePayment, isProcessingPayment } = usePaystackIntegration();

  const handlePayment = async () => {
    const userEmail = email.trim() || user?.email;
    if (!userEmail) {
      return;
    }

    try {
      await initializePayment.mutateAsync({
        email: userEmail,
        amount,
        metadata: { description },
        purpose: purpose as any,
        chamaId
      });
      
      onSuccess?.();
      setEmail('');
      onClose();
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Payment
          </DialogTitle>
          <DialogDescription>
            Complete your payment via Paystack - supports cards, mobile money, bank transfers, and USSD
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">{description}</p>
              <CurrencyDisplay 
                amount={amount} 
                className="text-2xl font-bold text-primary" 
                showToggle={false} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder={user?.email || "your@email.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isProcessingPayment}
            />
            <p className="text-xs text-muted-foreground">
              {user?.email ? "Using your account email by default" : "Enter your email address"}
            </p>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Payment Options:</strong>
            </p>
            <ul className="text-xs text-blue-700 mt-1 list-disc list-inside space-y-1">
              <li>💳 Card (Visa, Mastercard, Verve)</li>
              <li>📱 Mobile Money (M-Pesa, MTN, Airtel, etc.)</li>
              <li>🏦 Bank Transfer</li>
              <li>📞 USSD</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isProcessingPayment}>
            Cancel
          </Button>
          <Button 
            onClick={handlePayment} 
            disabled={(!email.trim() && !user?.email) || isProcessingPayment}
          >
            {isProcessingPayment ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Continue to Payment'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;