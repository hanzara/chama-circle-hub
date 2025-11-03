import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWalletOperations, useCentralWallet } from '@/hooks/useWalletOperations';
import { useMpesaIntegration } from '@/hooks/useMpesaIntegration';
import { usePaystackIntegration } from '@/hooks/usePaystackIntegration';
import { Loader2, Wallet, Smartphone, CreditCard } from 'lucide-react';

interface WalletOperationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chamaId: string;
  operation: 'topup' | 'withdraw' | 'send';
  currentMGRBalance: number;
  members?: any[];
}

export const WalletOperationModal = ({
  open,
  onOpenChange,
  chamaId,
  operation,
  currentMGRBalance,
  members = []
}: WalletOperationModalProps) => {
  const [amount, setAmount] = useState('');
  const [paymentSource, setPaymentSource] = useState<'central_wallet' | 'mpesa' | 'airtel' | 'paystack'>('central_wallet');
  const [payoutMethod, setPayoutMethod] = useState<'mpesa' | 'airtel' | 'bank' | 'internal'>('internal');
  const [recipientMemberId, setRecipientMemberId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');

  const { mutate: executeOperation, isPending } = useWalletOperations();
  const { data: centralWallet } = useCentralWallet();
  const { stkPushMutation } = useMpesaIntegration();
  const { initializePayment } = usePaystackIntegration();

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      return;
    }

    // Handle top-up with different payment sources
    if (operation === 'topup') {
      if (paymentSource === 'central_wallet') {
        // Use central wallet
        executeOperation({
          operation: 'topup',
          chamaId,
          amount: numAmount
        }, {
          onSuccess: () => {
            onOpenChange(false);
            setAmount('');
          }
        });
      } else if (paymentSource === 'mpesa') {
        // M-Pesa STK Push
        if (!phoneNumber) {
          return;
        }
        stkPushMutation.mutate({
          phoneNumber,
          amount: numAmount,
          description: `Top up chama MGR wallet`,
          purpose: 'contribution',
          chamaId
        }, {
          onSuccess: () => {
            onOpenChange(false);
            setAmount('');
            setPhoneNumber('');
          }
        });
      } else if (paymentSource === 'airtel') {
        // Airtel Money via Paystack
        if (!phoneNumber) {
          return;
        }
        initializePayment.mutate({
          phoneNumber,
          amount: numAmount,
          description: `Top up chama MGR wallet`,
          purpose: 'contribution',
          chamaId,
          channels: ['mobile_money']
        }, {
          onSuccess: () => {
            onOpenChange(false);
            setAmount('');
            setPhoneNumber('');
          }
        });
      } else if (paymentSource === 'paystack') {
        // Paystack (cards, banks, USSD, etc.)
        initializePayment.mutate({
          amount: numAmount,
          description: `Top up chama MGR wallet`,
          purpose: 'contribution',
          chamaId,
          phoneNumber,
          channels: ['card', 'bank', 'ussd', 'mobile_money', 'bank_transfer']
        }, {
          onSuccess: () => {
            onOpenChange(false);
            setAmount('');
            setPhoneNumber('');
          }
        });
      }
      return;
    }

    // Handle other operations (withdraw, send)
    const payload: any = {
      operation,
      chamaId,
      amount: numAmount
    };

    if (operation === 'send') {
      payload.recipientMemberId = recipientMemberId;
      payload.payoutMethod = payoutMethod;
    }

    if (operation === 'withdraw') {
      payload.payoutMethod = payoutMethod;
    }

    if (payoutMethod !== 'internal') {
      payload.payoutDetails = {
        phoneNumber,
        accountNumber,
        bankName
      };
    }

    executeOperation(payload, {
      onSuccess: () => {
        onOpenChange(false);
        setAmount('');
        setRecipientMemberId('');
        setPhoneNumber('');
        setAccountNumber('');
        setBankName('');
      }
    });
  };

  const getTitle = () => {
    switch (operation) {
      case 'topup':
        return 'Top Up MGR Wallet';
      case 'withdraw':
        return 'Withdraw from MGR Wallet';
      case 'send':
        return 'Send Funds';
      default:
        return 'Wallet Operation';
    }
  };

  const getMaxAmount = () => {
    if (operation === 'topup') {
      return centralWallet?.balance || 0;
    }
    return currentMGRBalance;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {operation === 'topup' && (
            <>
              <div>
                <Label htmlFor="payment-source">Payment Source</Label>
                <Select value={paymentSource} onValueChange={(v: any) => setPaymentSource(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="central_wallet">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        <span>Central Wallet (Balance: KES {centralWallet?.balance || 0})</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="mpesa">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        <span>M-Pesa</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="airtel">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        <span>Airtel Money</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="paystack">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span>Paystack (Cards, Banks, USSD)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentSource !== 'central_wallet' && (
                <>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="254XXXXXXXXX"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {paymentSource === 'paystack' 
                        ? 'Optional - for mobile money payments'
                        : 'Required for mobile money payments'}
                    </p>
                  </div>
                  
                  {paymentSource === 'paystack' && (
                    <div>
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="Enter account number"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Required for card payments
                      </p>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {(operation === 'withdraw' || operation === 'send') && (
            <div className="text-sm text-muted-foreground">
              MGR Balance: KES {currentMGRBalance}
            </div>
          )}

          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              max={getMaxAmount()}
            />
          </div>

          {operation === 'send' && (
            <div>
              <Label htmlFor="recipient">Recipient</Label>
              <Select value={recipientMemberId} onValueChange={setRecipientMemberId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {members?.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.user_id || 'Unknown Member'}
                    </SelectItem>
                  )) || []}
                </SelectContent>
              </Select>
            </div>
          )}

          {(operation === 'withdraw' || operation === 'send') && (
            <>
              <div>
                <Label htmlFor="method">Payout Method</Label>
                <Select value={payoutMethod} onValueChange={(v: any) => setPayoutMethod(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Internal (Central Wallet)</SelectItem>
                    <SelectItem value="mpesa">M-Pesa</SelectItem>
                    <SelectItem value="airtel">Airtel Money</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {payoutMethod === 'mpesa' || payoutMethod === 'airtel' ? (
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="254XXXXXXXXX"
                  />
                </div>
              ) : payoutMethod === 'bank' ? (
                <>
                  <div>
                    <Label htmlFor="account">Account Number</Label>
                    <Input
                      id="account"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Account number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bank">Bank Name</Label>
                    <Input
                      id="bank"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="Bank name"
                    />
                  </div>
                </>
              ) : null}
            </>
          )}

          <Button 
            onClick={handleSubmit} 
            disabled={
              isPending || 
              stkPushMutation.isPending || 
              initializePayment.isPending ||
              (operation === 'topup' && paymentSource !== 'central_wallet' && !phoneNumber && paymentSource !== 'paystack')
            } 
            className="w-full"
          >
            {(isPending || stkPushMutation.isPending || initializePayment.isPending) && 
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            }
            {operation === 'topup' && 'Top Up'}
            {operation === 'withdraw' && 'Withdraw'}
            {operation === 'send' && 'Send'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
