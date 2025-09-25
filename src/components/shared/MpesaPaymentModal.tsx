import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, Loader2 } from 'lucide-react';
import { useMpesaIntegration } from '@/hooks/useMpesaIntegration';
import CurrencyDisplay from '@/components/CurrencyDisplay';

interface MpesaPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  description: string;
  purpose: 'contribution' | 'loan_payment' | 'investment' | 'general';
  chamaId?: string;
  onSuccess?: () => void;
}

const MpesaPaymentModal: React.FC<MpesaPaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  description,
  purpose,
  chamaId,
  onSuccess
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const { stkPushMutation, isProcessingPayment } = useMpesaIntegration();

  const handlePayment = async () => {
    if (!phoneNumber.trim()) {
      return;
    }

    try {
      await stkPushMutation.mutateAsync({
        phoneNumber,
        amount,
        description,
        purpose: purpose as any,
        chamaId
      });
      
      onSuccess?.();
      setPhoneNumber('');
      onClose();
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove any non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    
    // Format as 0XXX XXX XXX or 254XXX XXX XXX
    if (cleaned.startsWith('254')) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
    } else if (cleaned.startsWith('0')) {
      return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{3})/, '$1$2 $3 $4');
    }
    return cleaned;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-green-600" />
            M-Pesa Payment
          </DialogTitle>
          <DialogDescription>
            Complete your payment using M-Pesa STK Push
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">{description}</p>
              <CurrencyDisplay 
                amount={amount} 
                className="text-2xl font-bold text-green-600" 
                showToggle={false} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">M-Pesa Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="0712 345 678 or 254712 345 678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
              disabled={isProcessingPayment}
            />
            <p className="text-xs text-gray-500">
              Enter the phone number registered with M-Pesa
            </p>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>How it works:</strong>
            </p>
            <ol className="text-xs text-blue-700 mt-1 list-decimal list-inside space-y-1">
              <li>Click "Send Payment Request" below</li>
              <li>Check your phone for M-Pesa STK push notification</li>
              <li>Enter your M-Pesa PIN to complete payment</li>
              <li>You'll receive a confirmation SMS with receipt</li>
            </ol>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isProcessingPayment}>
            Cancel
          </Button>
          <Button 
            onClick={handlePayment} 
            disabled={!phoneNumber.trim() || isProcessingPayment}
            className="bg-green-600 hover:bg-green-700"
          >
            {isProcessingPayment ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Send Payment Request'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MpesaPaymentModal;