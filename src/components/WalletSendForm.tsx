import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, AlertCircle, CheckCircle2, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const WalletSendForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Fetch wallet balance
  const { data: walletData } = useQuery({
    queryKey: ['user-wallet', user?.id],
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

  const walletBalance = walletData?.balance || 0;

  // Calculate transaction fee (1% of amount, min KES 10, max KES 100)
  const calculateFee = (amt: number): number => {
    const feePercentage = 0.01;
    return Math.min(Math.max(amt * feePercentage, 10), 100);
  };

  const numericAmount = parseFloat(amount) || 0;
  const transactionFee = numericAmount > 0 ? calculateFee(numericAmount) : 0;
  const totalCost = numericAmount + transactionFee;
  const remainingBalance = walletBalance - totalCost;
  const hasInsufficientBalance = totalCost > walletBalance;


  const handleSendClick = () => {
    if (!recipientEmail || !numericAmount || numericAmount <= 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (hasInsufficientBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You need KES ${totalCost.toFixed(2)} but only have KES ${walletBalance.toFixed(2)}. Please top up your wallet first.`,
        variant: "destructive",
      });
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmSend = async () => {
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
      // Find recipient user ID by email using RPC function
      const { data: recipientId, error: lookupError } = await supabase.rpc('find_user_by_email', {
        p_email: recipientEmail
      });
      
      if (lookupError) {
        console.error('User lookup error:', lookupError);
        throw new Error('Unable to find recipient. Please try again.');
      }

      if (!recipientId) {
        toast({
          title: "Recipient Not Found",
          description: `No user found with email: ${recipientEmail}`,
          variant: "destructive",
        });
        return;
      }

      if (recipientId === user.id) {
        toast({
          title: "Invalid Transaction",
          description: "You cannot send money to yourself",
          variant: "destructive",
        });
        return;
      }

      // Call atomic transfer RPC function directly
      const { data, error } = await supabase.rpc('atomic_wallet_transfer', {
        p_sender_id: user.id,
        p_receiver_id: recipientId,
        p_amount: numericAmount,
        p_fee: transactionFee,
        p_description: description.trim() || `Transfer to ${recipientEmail}`
      });

      if (error) {
        console.error('RPC error:', error);
        throw new Error(error.message || 'Transfer failed');
      }

      // Parse JSON response
      const result = typeof data === 'string' ? JSON.parse(data) : data;

      if (!result?.success) {
        if (result?.error?.includes('Insufficient balance')) {
          toast({
            title: "Insufficient Balance",
            description: `You need KES ${totalCost.toFixed(2)} but only have KES ${result.balance?.toFixed(2) || walletBalance.toFixed(2)}`,
            variant: "destructive",
          });
        } else if (result?.error?.includes('Duplicate transaction')) {
          toast({
            title: "Duplicate Transaction",
            description: "This transaction was recently processed. Please wait before retrying.",
            variant: "destructive",
          });
        } else {
          throw new Error(result?.error || 'Transfer failed');
        }
        return;
      }

      // Refresh wallet balance from database
      await queryClient.invalidateQueries({ queryKey: ['user-wallet'] });

      toast({
        title: "✅ Transaction Successful!",
        description: `KES ${result.amount_sent.toLocaleString()} sent to ${recipientEmail}. Fee: KES ${result.fee.toFixed(2)}. New balance: KES ${result.remaining_balance.toFixed(2)}`,
      });

      // Reset form
      setRecipientEmail('');
      setAmount('');
      setDescription('');
      setShowConfirmation(false);
    } catch (error: any) {
      console.error('Send money error:', error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to complete transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Send Money from Wallet
        </CardTitle>
        <CardDescription>
          Transfer funds to another user instantly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Wallet Balance Display */}
        <Alert>
          <Wallet className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Your Wallet Balance</span>
              <Badge variant="outline" className="text-lg">
                KES {walletBalance.toLocaleString()}
              </Badge>
            </div>
          </AlertDescription>
        </Alert>

        {!showConfirmation ? (
          <>
            {/* Recipient Email */}
            <div className="space-y-2">
              <Label htmlFor="recipientEmail">Recipient Email *</Label>
              <Input
                id="recipientEmail"
                type="email"
                placeholder="recipient@example.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                required
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (KES) *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                step="1"
                required
              />
              
              {numericAmount > 0 && (
                <div className="space-y-1 p-3 bg-muted rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount:</span>
                    <span>KES {numericAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Transaction Fee (1%):</span>
                    <span>KES {transactionFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold border-t pt-1 mt-1">
                    <span>Total Cost:</span>
                    <span>KES {totalCost.toFixed(2)}</span>
                  </div>
                  <div className={`flex justify-between text-sm font-semibold ${remainingBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <span>Remaining Balance:</span>
                    <span>KES {remainingBalance.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Description (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="What's this for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Insufficient Balance Warning */}
            {hasInsufficientBalance && numericAmount > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Insufficient balance. You need KES {totalCost.toFixed(2)} but only have KES {walletBalance.toFixed(2)}.
                </AlertDescription>
              </Alert>
            )}

            {/* Pay to Send Button */}
            <Button
              type="button"
              onClick={handleSendClick}
              className="w-full"
              size="lg"
              disabled={isLoading || !recipientEmail || numericAmount <= 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send KES {totalCost.toFixed(2)}
                </>
              )}
            </Button>
            
            {numericAmount > 0 && (
              <p className="text-xs text-center text-muted-foreground">
                Includes KES {transactionFee.toFixed(2)} transaction fee
              </p>
            )}
          </>
        ) : (
          <>
            {/* Confirmation Screen */}
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">Confirm Transaction</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Recipient:</span>
                      <span>{recipientEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span>KES {numericAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fee:</span>
                      <span>KES {transactionFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                      <span>Total:</span>
                      <span>KES {totalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-green-600">
                      <span>Remaining Balance:</span>
                      <span>KES {remainingBalance.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmSend}
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Confirm Send'
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
