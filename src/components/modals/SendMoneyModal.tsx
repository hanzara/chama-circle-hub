import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, User, AlertCircle, CreditCard, Building2, Smartphone, Phone, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { useTransactionNotification } from '@/hooks/useTransactionNotification';
import { usePaystackIntegration } from '@/hooks/usePaystackIntegration';

interface SendMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  walletBalance?: number;
}

type PaymentMethod = 'wallet' | 'mpesa' | 'airtel' | 'card_bank';

export const SendMoneyModal: React.FC<SendMoneyModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  walletBalance = 0 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { showTransactionNotification } = useTransactionNotification();
  const { initializePayment, isProcessingPayment } = usePaystackIntegration();
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wallet');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recipientPhone, setRecipientPhone] = useState('');
  const [email, setEmail] = useState(user?.email || '');

  const handleWalletTransfer = async () => {
    const numericAmount = parseFloat(amount);
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipient)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-money', {
        body: {
          senderId: user?.id,
          recipientEmail: recipient,
          amount: numericAmount,
          description: description.trim() || undefined,
        }
      });

      if (error) throw error;

      const newBalance = walletBalance - numericAmount;
      showTransactionNotification({
        type: 'p2p_send',
        amount: numericAmount,
        recipientName: recipient.split('@')[0],
        recipientPhone: recipient,
        newBalance,
      });

      toast({
        title: "✅ Money Sent!",
        description: `KES ${numericAmount.toLocaleString()} sent to ${recipient}`,
      });

      resetForm();
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Send money error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send money",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaystackTransfer = async () => {
    const numericAmount = parseFloat(amount);
    
    if (!email) {
      toast({
        title: "Error",
        description: "Email is required for payment",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await initializePayment.mutateAsync({
        email,
        phoneNumber: recipientPhone || undefined,
        amount: numericAmount,
        purpose: 'other',
        description: `Send money to ${recipientPhone || recipient}`,
        metadata: {
          payment_type: 'send_money',
          recipient: recipientPhone || recipient,
          notes: description || undefined,
        }
      });

      if (result.success && result.authorization_url) {
        window.open(result.authorization_url, '_blank');
        
        toast({
          title: "Payment Initiated 💳",
          description: "Complete the payment in the new window",
        });

        showTransactionNotification({
          type: 'p2p_send',
          amount: numericAmount,
          recipientPhone: recipientPhone || recipient,
          newBalance: walletBalance,
        });

        resetForm();
        onSuccess?.();
        onClose();
      }
    } catch (error: any) {
      console.error('Paystack transfer error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to initiate payment",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const numericAmount = parseFloat(amount);
    if (numericAmount <= 0) {
      toast({
        title: "Error",
        description: "Amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === 'wallet') {
      if (!recipient) {
        toast({
          title: "Error",
          description: "Please enter recipient email",
          variant: "destructive",
        });
        return;
      }

      if (numericAmount > walletBalance) {
        toast({
          title: "Insufficient Balance",
          description: "You don't have enough funds in your wallet",
          variant: "destructive",
        });
        return;
      }

      await handleWalletTransfer();
    } else {
      // M-Pesa, Airtel, or Card/Bank via Paystack
      if (!recipientPhone && paymentMethod !== 'card_bank') {
        toast({
          title: "Error",
          description: "Please enter recipient phone number",
          variant: "destructive",
        });
        return;
      }

      await handlePaystackTransfer();
    }
  };

  const resetForm = () => {
    setRecipient('');
    setRecipientPhone('');
    setAmount('');
    setDescription('');
  };

  const numericAmount = parseFloat(amount) || 0;
  const remainingBalance = walletBalance - numericAmount;
  const showWalletBalance = paymentMethod === 'wallet';

  const paymentMethods = [
    {
      id: 'wallet' as const,
      label: 'Wallet Transfer',
      description: 'Send from your wallet balance',
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      id: 'mpesa' as const,
      label: 'M-Pesa',
      description: 'Pay via M-Pesa mobile money',
      icon: <Smartphone className="h-4 w-4" />,
    },
    {
      id: 'airtel' as const,
      label: 'Airtel Money',
      description: 'Pay via Airtel Money',
      icon: <Phone className="h-4 w-4" />,
    },
    {
      id: 'card_bank' as const,
      label: 'Card / Bank',
      description: 'Pay with card or bank transfer',
      icon: <Building2 className="h-4 w-4" />,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Money
          </DialogTitle>
          <DialogDescription>
            Send money via multiple payment methods - M-Pesa, Airtel, Cards, Bank
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current Balance - Only show for wallet transfers */}
          {showWalletBalance && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Wallet Balance</span>
                  <CurrencyDisplay amount={walletBalance} className="font-semibold" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label>Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}>
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value={method.id} id={method.id} />
                  <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{method.label}</div>
                        <div className="text-xs text-muted-foreground">{method.description}</div>
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Recipient Info */}
          {paymentMethod === 'wallet' ? (
            <div className="space-y-2">
              <Label htmlFor="recipient">
                <Mail className="inline h-4 w-4 mr-1" />
                Recipient Email
              </Label>
              <Input
                id="recipient"
                type="email"
                placeholder="recipient@example.com"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                required
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="recipientPhone">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Recipient Phone Number
                </Label>
                <Input
                  id="recipientPhone"
                  type="tel"
                  placeholder="254712345678"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  required={paymentMethod !== 'card_bank'}
                />
                <p className="text-xs text-muted-foreground">
                  {paymentMethod === 'mpesa' && 'Enter Safaricom M-Pesa number'}
                  {paymentMethod === 'airtel' && 'Enter Airtel Money number'}
                  {paymentMethod === 'card_bank' && 'Recipient phone (optional)'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Your Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Payment confirmation will be sent here
                </p>
              </div>
            </>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (KES)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              max={showWalletBalance ? walletBalance : undefined}
              step="1"
              required
            />
            {showWalletBalance && numericAmount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Remaining balance:</span>
                <span className={remainingBalance < 0 ? "text-destructive" : "text-muted-foreground"}>
                  KES {remainingBalance.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="What's this payment for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={2}
            />
          </div>

          {/* Warning for insufficient wallet balance */}
          {showWalletBalance && remainingBalance < 0 && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">
                Insufficient wallet balance
              </span>
            </div>
          )}

          {/* Payment Methods Info */}
          {paymentMethod !== 'wallet' && (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-center text-muted-foreground">
                🔒 Secured by Paystack. Supports {paymentMethod === 'mpesa' ? 'M-Pesa' : paymentMethod === 'airtel' ? 'Airtel Money' : 'Cards, Bank Transfers & USSD'}
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {paymentMethod === 'card_bank' && (
                  <>
                    <Badge variant="outline" className="text-xs">
                      <CreditCard className="h-3 w-3 mr-1" />
                      Cards
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Building2 className="h-3 w-3 mr-1" />
                      Bank Transfer
                    </Badge>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              disabled={isLoading || isProcessingPayment}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={
                isLoading || 
                isProcessingPayment ||
                numericAmount <= 0 ||
                (showWalletBalance && remainingBalance < 0)
              } 
              className="flex-1 gap-2"
            >
              {(isLoading || isProcessingPayment) && <Loader2 className="h-4 w-4 animate-spin" />}
              {paymentMethod === 'wallet' ? (
                <>Send KES {numericAmount.toLocaleString()}</>
              ) : (
                <>Pay KES {numericAmount.toLocaleString()}</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};