import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DollarSign, Loader2, Wallet, Smartphone, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  chamaId: string;
  chamaName: string;
  expectedAmount?: number;
}

export const ContributeModal: React.FC<ContributeModalProps> = ({
  isOpen,
  onClose,
  chamaId,
  chamaName,
  expectedAmount
}) => {
  const [formData, setFormData] = useState({
    amount: expectedAmount?.toString() || '',
    notes: '',
    paymentMethod: 'wallet' as 'wallet' | 'paystack'
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user central wallet balance
  const { data: walletData } = useQuery({
    queryKey: ['user-central-wallet', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('user_central_wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Wallet contribution mutation
  const walletContributionMutation = useMutation({
    mutationFn: async ({ amount, notes }: { amount: number; notes: string }) => {
      const { data, error } = await supabase.functions.invoke('make-contribution', {
        body: {
          chamaId,
          amount,
          paymentMethod: 'wallet',
          notes
        }
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Contribution failed');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-central-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['chama-contributions'] });
      toast({
        title: "Contribution Successful ✅",
        description: "Your contribution has been recorded",
      });
      onClose();
      setFormData({
        amount: expectedAmount?.toString() || '',
        notes: '',
        paymentMethod: 'wallet'
      });
    },
    onError: (error: any) => {
      toast({
        title: "Contribution Failed ❌",
        description: error.message || "Failed to make contribution",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid contribution amount",
        variant: "destructive"
      });
      return;
    }

    if (formData.paymentMethod === 'wallet') {
      const currentBalance = walletData?.balance || 0;
      if (currentBalance === 0) {
        toast({
          title: "Insufficient Balance",
          description: "Your central wallet balance is zero. Please add funds first.",
          variant: "destructive"
        });
        return;
      }
      
      if (currentBalance < amount) {
        toast({
          title: "Insufficient Balance",
          description: `You need KES ${amount.toFixed(2)} but have KES ${currentBalance.toFixed(2)}`,
          variant: "destructive"
        });
        return;
      }

      await walletContributionMutation.mutateAsync({
        amount,
        notes: formData.notes
      });
    } else {
      toast({
        title: "Coming Soon",
        description: "Paystack integration will be available soon. Use wallet for now.",
        variant: "default"
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const walletBalance = walletData?.balance || 0;
  const amount = parseFloat(formData.amount) || 0;
  const isProcessing = walletContributionMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Contribute to {chamaName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Central Wallet Balance Display */}
          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Central Wallet Balance</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(walletBalance)}
                    </p>
                  </div>
                </div>
                {(walletBalance === 0 || (walletBalance < amount && amount > 0)) && (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Expected Amount Display */}
          {expectedAmount && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Expected Contribution</p>
                  <p className="text-xl font-semibold text-foreground">
                    {formatCurrency(expectedAmount)}
                  </p>
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
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                disabled={isProcessing}
              />
              {amount > walletBalance && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Insufficient balance. You need {formatCurrency(amount - walletBalance)} more.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={formData.paymentMethod === 'wallet' ? 'default' : 'outline'}
                  className="h-auto py-3"
                  onClick={() => handleInputChange('paymentMethod', 'wallet')}
                  disabled={isProcessing}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Wallet className="h-5 w-5" />
                    <span className="text-xs">Wallet</span>
                  </div>
                </Button>
                <Button
                  type="button"
                  variant={formData.paymentMethod === 'paystack' ? 'default' : 'outline'}
                  className="h-auto py-3"
                  onClick={() => handleInputChange('paymentMethod', 'paystack')}
                  disabled={isProcessing}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Smartphone className="h-5 w-5" />
                    <span className="text-xs">Card/M-Pesa</span>
                  </div>
                </Button>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add a note for this contribution"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                disabled={isProcessing}
                rows={3}
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
              disabled={isProcessing || !formData.amount || (formData.paymentMethod === 'wallet' && amount > walletBalance)}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Contribute ${formatCurrency(amount)}`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};