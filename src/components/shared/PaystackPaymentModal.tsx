import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePaystackIntegration } from '@/hooks/usePaystackIntegration';
import { CreditCard, Building2, Smartphone, Banknote, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Database } from '@/lib/database.types';

type PaymentPurpose = Database['public']['Enums']['payment_purpose'];

interface PaystackPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  purpose: PaymentPurpose;
  description?: string;
  chamaId?: string;
  metadata?: Record<string, any>;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function PaystackPaymentModal({
  open,
  onOpenChange,
  amount,
  purpose,
  description,
  chamaId,
  metadata,
  onSuccess,
  onError
}: PaystackPaymentModalProps) {
  const { initializePayment, isProcessingPayment } = usePaystackIntegration();
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handlePayment = async () => {
    try {
      const result = await initializePayment.mutateAsync({
        email,
        phoneNumber,
        amount,
        purpose,
        description,
        chamaId,
        metadata
      });

      if (result.success && result.authorization_url) {
        // Open Paystack payment page
        window.open(result.authorization_url, '_blank');
        onSuccess?.(result);
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      onError?.(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            Pay securely with Paystack - Multiple payment options available
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Amount Display */}
          <div className="bg-primary/5 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Amount to Pay</p>
            <p className="text-3xl font-bold text-primary">
              KES {amount.toLocaleString()}
            </p>
            {description && (
              <p className="text-sm text-muted-foreground mt-2">{description}</p>
            )}
          </div>

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

          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              You'll receive payment confirmation via email
            </p>
          </div>

          {/* Phone Number Input */}
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

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isProcessingPayment}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handlePayment}
              disabled={!email || isProcessingPayment}
            >
              {isProcessingPayment ? (
                'Processing...'
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay Now
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
