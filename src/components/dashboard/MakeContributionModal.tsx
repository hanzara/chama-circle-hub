import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Loader2, Users } from 'lucide-react';
import { useChamas } from '@/hooks/useChamas';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useLinkedAccounts } from '@/hooks/useLinkedAccounts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import CurrencyDisplay from '@/components/CurrencyDisplay';

interface MakeContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const MakeContributionModal: React.FC<MakeContributionModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [selectedChamaId, setSelectedChamaId] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mobile_money');
  const [isProcessing, setIsProcessing] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showTopUpPrompt, setShowTopUpPrompt] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: chamas, isLoading: loadingChamas } = useChamas();
  const { linkedAccounts } = useLinkedAccounts();

  // Filter active chamas
  const activeChamas = chamas?.filter(c => c.status === 'active') || [];
  const hasLinkedAccounts = (linkedAccounts?.length || 0) > 0;

  // Fetch wallet balance
  React.useEffect(() => {
    const fetchBalance = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('user_central_wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();
      
      if (data) setWalletBalance(data.balance || 0);
    };
    fetchBalance();
  }, [user]);

  // Check if wallet needs top-up
  React.useEffect(() => {
    const contributionAmount = parseFloat(amount) || 0;
    setShowTopUpPrompt(contributionAmount > 0 && contributionAmount > walletBalance);
  }, [amount, walletBalance]);

  const selectedChama = activeChamas.find(c => c.id === selectedChamaId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedChamaId || !amount) {
      toast({
        title: "Missing Information",
        description: "Please select a chama and enter an amount",
        variant: "destructive"
      });
      return;
    }

    const contributionAmount = parseFloat(amount);
    if (contributionAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid contribution amount",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Call the make-contribution edge function
      const { data, error } = await supabase.functions.invoke('make-contribution', {
        body: {
          chamaId: selectedChamaId,
          amount: contributionAmount,
          paymentMethod,
          notes
        }
      });

      if (error) throw error;

      toast({
        title: "✅ Contribution Successful!",
        description: (
          <div className="space-y-2">
            <p>You contributed <strong>KES {contributionAmount.toLocaleString()}</strong> to <strong>{selectedChama?.name}</strong></p>
            <p className="text-xs text-muted-foreground">Your contribution has been added to the leaderboard</p>
          </div>
        ),
      });

      // Invalidate queries to refresh data across the app
      await queryClient.invalidateQueries({ queryKey: ['chama-members', selectedChamaId] });
      await queryClient.invalidateQueries({ queryKey: ['chama-leaderboard', selectedChamaId] });
      await queryClient.invalidateQueries({ queryKey: ['chamas'] });
      await queryClient.invalidateQueries({ queryKey: ['user-chamas'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      // Small delay to allow queries to refresh before closing
      await new Promise(resolve => setTimeout(resolve, 500));

      // Reset form
      setSelectedChamaId('');
      setAmount('');
      setNotes('');
      setPaymentMethod('mobile_money');
      onSuccess?.();
      onClose();

    } catch (error: any) {
      console.error('Contribution failed:', error);
      toast({
        title: "Contribution Failed",
        description: error.message || "Failed to process contribution",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Make Contribution
          </DialogTitle>
          <DialogDescription>
            Select a chama and enter the amount you want to contribute
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Wallet Balance Display */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Wallet Balance</span>
                <CurrencyDisplay amount={walletBalance} className="text-xl font-bold" />
              </div>
            </CardContent>
          </Card>

          {/* Auto Top-Up Prompt */}
          {showTopUpPrompt && hasLinkedAccounts && (
            <Alert className="border-yellow-500/20 bg-yellow-500/5">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Insufficient wallet balance</p>
                  <p className="text-xs">Need: KES {parseFloat(amount).toLocaleString()} | Have: KES {walletBalance.toLocaleString()}</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      const topUpAmount = parseFloat(amount) - walletBalance;
                      // Auto top-up from linked account logic here
                      toast({
                        title: "Auto Top-up",
                        description: `Topping up KES ${topUpAmount.toLocaleString()} from linked account...`,
                      });
                    }}
                  >
                    Top-up from Linked Account
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {showTopUpPrompt && !hasLinkedAccounts && (
            <Alert className="border-red-500/20 bg-red-500/5">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-sm">
                Insufficient balance. Please add money to your wallet first or link a payment account.
              </AlertDescription>
            </Alert>
          )}

          {/* Chama Selection */}
          <div className="space-y-2">
            <Label htmlFor="chama">Select Chama *</Label>
            {loadingChamas ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : activeChamas.length === 0 ? (
              <Card className="bg-muted/50">
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    You're not a member of any active chamas yet.
                  </p>
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => window.location.href = '/available-chamas'}
                    className="mt-2"
                  >
                    Join a Chama
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Select value={selectedChamaId} onValueChange={setSelectedChamaId}>
                <SelectTrigger id="chama">
                  <SelectValue placeholder="Choose a chama..." />
                </SelectTrigger>
                <SelectContent>
                  {activeChamas.map((chama) => (
                    <SelectItem key={chama.id} value={chama.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{chama.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          (KES {chama.contribution_amount} / {chama.contribution_frequency})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Expected Amount Display */}
          {selectedChama && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Expected Contribution</p>
                    <p className="text-xl font-semibold text-foreground">
                      KES {selectedChama.contribution_amount?.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedChama.contribution_frequency}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(selectedChama.contribution_amount?.toString() || '')}
                  >
                    Use This
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (KES) *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isProcessing}
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="method">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="Add a note..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isProcessing}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isProcessing || !selectedChamaId || !amount || activeChamas.length === 0}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Contribute'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};