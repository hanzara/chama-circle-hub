import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Smartphone, CreditCard, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { usePaystackIntegration } from '@/hooks/usePaystackIntegration';
import { useAirtelMoney } from '@/hooks/useAirtelMoney';
import { useLinkedAccounts } from '@/hooks/useLinkedAccounts';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LinkAccountModal } from './LinkAccountModal';
import { LinkedAccountsManager } from './LinkedAccountsManager';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AddMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const paymentMethods = [
  { id: 'mobile_money', name: 'M-Pesa', icon: Smartphone, description: 'Pay with M-Pesa mobile money', channel: 'mobile_money' },
  { id: 'airtel_money', name: 'Airtel Money', icon: Smartphone, description: 'Pay with Airtel mobile money', channel: 'mobile_money' },
  { id: 'card', name: 'Card', icon: CreditCard, description: 'Pay with debit/credit card', channel: 'card' },
];

export const AddMoneyModal: React.FC<AddMoneyModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { initializePayment: initializePaystackPayment, isProcessingPayment: isProcessingPaystack } = usePaystackIntegration();
  const { linkedAccounts, isLoading: loadingAccounts } = useLinkedAccounts();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [useLinkedAccount, setUseLinkedAccount] = useState(false);
  const [selectedLinkedAccount, setSelectedLinkedAccount] = useState('');
  const [showLinkAccountModal, setShowLinkAccountModal] = useState(false);

  const hasLinkedAccounts = (linkedAccounts?.length || 0) > 0;
  const primaryAccount = linkedAccounts?.find(acc => acc.is_primary);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !paymentMethod) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number for mobile money (M-Pesa and Airtel)
    if ((paymentMethod === 'mobile_money' || paymentMethod === 'airtel_money') && !phoneNumber) {
      toast({
        title: "Error",
        description: "Phone number is required for mobile money payments",
        variant: "destructive",
      });
      return;
    }

    // Format phone number to international format (254...)
    let formattedPhone = phoneNumber;
    if (paymentMethod === 'mobile_money' || paymentMethod === 'airtel_money') {
      // Remove any spaces, dashes, or plus signs
      formattedPhone = phoneNumber.replace(/[\s\-+]/g, '');
      
      // Convert 07... to 2547... or 01... to 2541...
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '254' + formattedPhone.substring(1);
      }
      
      // Ensure it starts with 254
      if (!formattedPhone.startsWith('254')) {
        formattedPhone = '254' + formattedPhone;
      }

      // Validate it's a valid Kenyan number (should be 254 + 9 digits = 12 digits)
      if (formattedPhone.length !== 12 || !formattedPhone.match(/^254[0-9]{9}$/)) {
        toast({
          title: "Invalid Phone Number",
          description: "Please enter a valid Kenyan phone number (e.g., 0712345678)",
          variant: "destructive",
        });
        return;
      }
    }

    const numericAmount = parseFloat(amount);
    if (numericAmount <= 0 || numericAmount > 100000) {
      toast({
        title: "Error",
        description: "Amount must be between KES 1 and KES 100,000",
        variant: "destructive",
      });
      return;
    }

    try {
      const selectedMethod = paymentMethods.find(m => m.id === paymentMethod);
      
      // Route all mobile money (M-Pesa & Airtel) and cards through Paystack
      await initializePaystackPayment.mutateAsync({
        email: user?.email,
        amount: numericAmount,
        purpose: 'other',
        description: `Wallet top-up via ${selectedMethod?.name}`,
        phoneNumber: formattedPhone || undefined,
        channels: (paymentMethod === 'mobile_money' || paymentMethod === 'airtel_money')
          ? ['mobile_money'] 
          : ['card', 'bank', 'ussd', 'bank_transfer']
      });

      toast({
        title: "Payment Initiated",
        description: paymentMethod === 'card' 
          ? "Complete payment on the Paystack page"
          : `Check ${formattedPhone} for ${selectedMethod?.name} payment prompt`,
      });

      setAmount('');
      setPaymentMethod('');
      setPhoneNumber('');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Add money error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add money. Please try again.",
        variant: "destructive",
      });
    }
  };

  const selectedMethod = paymentMethods.find(method => method.id === paymentMethod);
  const isLoading = isProcessingPaystack;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Add Money to Wallet</DialogTitle>
            <DialogDescription>
              Deposit funds via M-Pesa, Airtel, cards, or bank transfer. Money appears in your wallet balance instantly after payment.
            </DialogDescription>
          </DialogHeader>

          {/* Smart Payment Source Selection */}
          {hasLinkedAccounts && (
            <Alert className="border-primary/20 bg-primary/5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    Use linked {primaryAccount?.provider || 'account'} ({primaryAccount?.phone_number || primaryAccount?.account_number})
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setUseLinkedAccount(!useLinkedAccount)}
                  >
                    {useLinkedAccount ? 'Use Paystack Instead' : 'Use Linked Account'}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="pay" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pay">Deposit Money</TabsTrigger>
              <TabsTrigger value="linked">Payment Methods</TabsTrigger>
            </TabsList>

            <TabsContent value="pay" className="space-y-4 mt-4">
            
            {!hasLinkedAccounts && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  💡 <strong>Tip:</strong> Link your M-Pesa, bank, or card for faster future deposits. Go to "Payment Methods" tab.
                </AlertDescription>
              </Alert>
            )}
        
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (KES)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                max="100000"
                step="1"
                required
              />
            </div>

            <div className="space-y-3">
              <Label>Select Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <Card key={method.id} className={`cursor-pointer transition-colors ${paymentMethod === method.id ? 'border-primary bg-primary/5' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value={method.id} id={method.id} />
                          <Icon className="h-6 w-6 text-primary" />
                          <div className="flex-1">
                            <label htmlFor={method.id} className="font-medium cursor-pointer">
                              {method.name}
                            </label>
                            <p className="text-xs text-muted-foreground">{method.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </RadioGroup>
            </div>

            {(paymentMethod === 'mobile_money' || paymentMethod === 'airtel_money') && (
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0712345678 or 254712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Enter your {paymentMethod === 'airtel_money' ? 'Airtel Money' : 'M-Pesa'} number. You'll receive a prompt to enter your PIN.
                </p>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">
                  💳 You'll be redirected to enter your card details securely on Paystack
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Processing...' : 'Add Money'}
              </Button>
            </div>
          </form>
          </TabsContent>

          <TabsContent value="linked" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Your Payment Methods</h3>
                  <p className="text-sm text-muted-foreground">
                    Save payment methods for faster deposits (balance shown on dashboard)
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLinkAccountModal(true)}
                  className="gap-2"
                >
                  <LinkIcon className="h-4 w-4" />
                  Link New
                </Button>
              </div>

              <LinkedAccountsManager />
            </div>
          </TabsContent>
        </Tabs>
        </DialogContent>
      </Dialog>

      <LinkAccountModal
        isOpen={showLinkAccountModal}
        onClose={() => setShowLinkAccountModal(false)}
      />
    </>
  );
};