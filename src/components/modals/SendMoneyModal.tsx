import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, User, AlertCircle, CreditCard, Building2, Smartphone, Phone, Mail, CheckCircle2, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { useTransactionNotification } from '@/hooks/useTransactionNotification';
import { usePaystackIntegration } from '@/hooks/usePaystackIntegration';
import { useLinkedAccounts } from '@/hooks/useLinkedAccounts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQueryClient } from '@tanstack/react-query';
import PinVerificationModal from '@/components/PinVerificationModal';
import { useUserPin } from '@/hooks/useUserPin';

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
  const queryClient = useQueryClient();
  const { showTransactionNotification } = useTransactionNotification();
  const { initializePayment, isProcessingPayment } = usePaystackIntegration();
  const { linkedAccounts } = useLinkedAccounts();
  const { verifyPin } = useUserPin();
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wallet');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingRecipient, setIsCheckingRecipient] = useState(false);
  const [isVerdioUser, setIsVerdioUser] = useState<boolean | null>(null);
  const [recipientPhone, setRecipientPhone] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [showPinVerification, setShowPinVerification] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  const hasLinkedAccounts = (linkedAccounts?.length || 0) > 0;

  // Calculate transaction fee (1% of amount, min KES 10, max KES 100)
  const calculateTransactionFee = (amount: number): number => {
    const feePercentage = 0.01; // 1%
    return Math.min(Math.max(amount * feePercentage, 10), 100);
  };

  // Check if recipient is a Verdio user
  const checkRecipient = async (email: string) => {
    setIsCheckingRecipient(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      setIsVerdioUser(!!data && !error);
    } catch (error) {
      console.error('Error checking recipient:', error);
      setIsVerdioUser(false);
    } finally {
      setIsCheckingRecipient(false);
    }
  };

  // Debounced recipient check
  React.useEffect(() => {
    if (recipient && recipient.includes('@')) {
      const timer = setTimeout(() => {
        checkRecipient(recipient);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsVerdioUser(null);
    }
  }, [recipient]);

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

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to send money",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Call wallet-transfer edge function
      const { data, error } = await supabase.functions.invoke('wallet-transfer', {
        body: {
          recipientEmail: recipient,
          amount: numericAmount,
          description: description.trim() || `Transfer to ${recipient}`
        }
      });

      if (error) {
        console.error('Transfer error:', error);
        throw new Error(error.message || 'Transfer failed');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Transfer failed');
      }

      const result = data;

      // Success handling
      const transferFee = result.fee || 0;
      const totalTransferred = result.amount_sent || numericAmount;

      // Refresh wallet balance immediately
      await queryClient.invalidateQueries({ queryKey: ['user-wallets'] });
      await queryClient.invalidateQueries({ queryKey: ['user-wallet'] });
      await queryClient.invalidateQueries({ queryKey: ['central-wallet'] });
      await queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });

      const newBalance = result.remaining_balance;
      
      // Show receipt
      setReceiptData({
        amount: numericAmount,
        fee: transferFee,
        total: totalTransferred + transferFee,
        recipient,
        description: description || `Transfer to ${recipient}`,
        newBalance,
        timestamp: new Date().toISOString(),
        transactionId: result.transaction_id || `TXN${Date.now()}`,
      });
      setShowReceipt(true);

      showTransactionNotification({
        type: 'p2p_send',
        amount: numericAmount,
        recipientName: recipient.split('@')[0],
        recipientPhone: recipient,
        newBalance,
      });

      resetForm();
      onSuccess?.();
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

  const handlePinVerify = async (pin: string): Promise<boolean> => {
    const isValid = await verifyPin(pin);
    if (isValid) {
      setShowPinVerification(false);
      await handleWalletTransfer();
    }
    return isValid;
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

      const fee = calculateTransactionFee(numericAmount);
      const totalAmount = numericAmount + fee;

      if (totalAmount > walletBalance) {
        toast({
          title: "Insufficient Balance",
          description: `You need KES ${totalAmount.toLocaleString()} (Amount: ${numericAmount} + Fee: ${fee.toFixed(2)})`,
          variant: "destructive",
        });
        return;
      }

      // Request PIN verification before transfer
      setShowPinVerification(true);
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

      // If the user has enough wallet balance and is trying to send to mobile money
      // prefer using the wallet as the funding source by calling the `withdraw-funds`
      // server function which will disburse from wallet to mobile money via Paystack.
      const fee = calculateTransactionFee(numericAmount);
      const totalAmount = numericAmount + fee;

      if ((paymentMethod === 'mpesa' || paymentMethod === 'airtel') && totalAmount <= walletBalance) {
        // Use wallet balance to fund the mobile money transfer
        setIsLoading(true);
        try {
          // Format phone number for Paystack (must be in format 254XXXXXXXXX)
          let formattedPhone = recipientPhone.replace(/\s+/g, '');
          
          // Remove leading + if present
          if (formattedPhone.startsWith('+')) {
            formattedPhone = formattedPhone.substring(1);
          }
          
          // Add 254 prefix if phone starts with 0
          if (formattedPhone.startsWith('0')) {
            formattedPhone = '254' + formattedPhone.substring(1);
          }
          
          // Ensure it starts with 254
          if (!formattedPhone.startsWith('254')) {
            formattedPhone = '254' + formattedPhone;
          }

          console.log('Formatted phone for withdrawal:', formattedPhone);

          const { data, error } = await supabase.functions.invoke('withdraw-funds', {
            body: {
              amount: numericAmount,
              paymentMethod: paymentMethod === 'mpesa' ? 'mpesa' : 'airtel',
              destinationDetails: {
                phone_number: formattedPhone,
              },
            }
          });

          if (error) throw error;

          if (!data?.success) {
            throw new Error(data?.error || 'Withdrawal failed');
          }

          // Refresh wallet balance / transactions
          await queryClient.invalidateQueries({ queryKey: ['user-wallets'] });
          await queryClient.invalidateQueries({ queryKey: ['central-wallet'] });
          await queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });

          showTransactionNotification({
            type: 'withdrawal',
            amount: numericAmount,
            recipientPhone: recipientPhone,
            newBalance: data.newBalance ?? (walletBalance - totalAmount),
          });

          toast({
            title: "✅ Transfer Initiated",
            description: `KES ${numericAmount.toLocaleString()} will be sent to ${recipientPhone}. Fee: KES ${fee.toFixed(2)}. New balance: KES ${(data.newBalance ?? (walletBalance - totalAmount)).toLocaleString()}`,
          });

          resetForm();
          onSuccess?.();
          onClose();
        } catch (error: any) {
          console.error('Wallet-funded mobile transfer failed:', error);
          toast({
            title: 'Error',
            description: error.message || 'Failed to send via wallet',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        // Fallback to Paystack Checkout (user-funded) flow
        await handlePaystackTransfer();
      }
    }
  };

  const resetForm = () => {
    setRecipient('');
    setRecipientPhone('');
    setAmount('');
    setDescription('');
  };

  const numericAmount = parseFloat(amount) || 0;
  const transactionFee = numericAmount > 0 ? calculateTransactionFee(numericAmount) : 0;
  const totalAmount = numericAmount + transactionFee;
  const remainingBalance = walletBalance - totalAmount;
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
          {/* Recipient Type Indicator */}
          {isVerdioUser !== null && recipient && (
            <Alert className={isVerdioUser ? "border-green-500/20 bg-green-500/5" : "border-yellow-500/20 bg-yellow-500/5"}>
              <AlertDescription className="flex items-center gap-2">
                {isVerdioUser ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">✅ Verdio user - Internal transfer (instant & free)</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">External transfer - Will use {hasLinkedAccounts ? 'linked account or' : ''} Paystack</span>
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}

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
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Transaction fee (1%):</span>
                  <span className="text-muted-foreground">KES {transactionFee.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>Total to be deducted:</span>
                  <span>KES {totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Remaining balance:</span>
                  <span className={remainingBalance < 0 ? "text-destructive" : "text-muted-foreground"}>
                    KES {remainingBalance.toLocaleString()}
                  </span>
                </div>
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
                <>
                  <Shield className="h-4 w-4" />
                  Verify & Send KES {numericAmount.toLocaleString()}
                </>
              ) : (
                <>Send KES {numericAmount.toLocaleString()}</>
              )}
            </Button>
          </div>
        </form>

        {/* PIN Verification Modal */}
        <PinVerificationModal
          isOpen={showPinVerification}
          onClose={() => setShowPinVerification(false)}
          onVerify={handlePinVerify}
          title="Verify Your PIN"
          description="Enter your PIN to authorize this transfer"
          required
        />
      </DialogContent>

      {/* Receipt Modal */}
      <Dialog open={showReceipt} onOpenChange={(open) => {
        setShowReceipt(open);
        if (!open) onClose();
      }}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <DialogTitle className="text-center text-2xl">Transfer Successful!</DialogTitle>
            <DialogDescription className="text-center">
              Your money has been sent successfully
            </DialogDescription>
          </DialogHeader>

          {receiptData && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="text-center border-b pb-3">
                    <div className="text-sm text-muted-foreground">Amount Sent</div>
                    <div className="text-3xl font-bold text-green-600">
                      KES {receiptData.amount.toLocaleString()}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Recipient:</span>
                      <span className="font-medium">{receiptData.recipient}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transaction Fee:</span>
                      <span>KES {receiptData.fee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Deducted:</span>
                      <span className="font-semibold">KES {receiptData.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-muted-foreground">New Balance:</span>
                      <span className="font-semibold text-primary">
                        KES {receiptData.newBalance.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transaction ID:</span>
                      <span className="text-xs font-mono">{receiptData.transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date & Time:</span>
                      <span className="text-xs">
                        {new Date(receiptData.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {receiptData.description && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Description:</span>
                        <span className="text-xs">{receiptData.description}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={() => {
                  setShowReceipt(false);
                  onClose();
                }} 
                className="w-full"
              >
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};