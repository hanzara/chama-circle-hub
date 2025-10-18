import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWalletOperations, useCentralWallet } from '@/hooks/useWalletOperations';
import { Loader2 } from 'lucide-react';

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
  const [payoutMethod, setPayoutMethod] = useState<'mpesa' | 'airtel' | 'bank' | 'internal'>('internal');
  const [recipientMemberId, setRecipientMemberId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');

  const { mutate: executeOperation, isPending } = useWalletOperations();
  const { data: centralWallet } = useCentralWallet();

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      return;
    }

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
            <div className="text-sm text-muted-foreground">
              Central Wallet Balance: {centralWallet?.balance || 0}
            </div>
          )}

          {(operation === 'withdraw' || operation === 'send') && (
            <div className="text-sm text-muted-foreground">
              MGR Balance: {currentMGRBalance}
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

          <Button onClick={handleSubmit} disabled={isPending} className="w-full">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {operation === 'topup' && 'Top Up'}
            {operation === 'withdraw' && 'Withdraw'}
            {operation === 'send' && 'Send'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
