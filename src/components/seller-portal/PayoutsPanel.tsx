import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  TrendingUp
} from 'lucide-react';

interface Payout {
  id: string;
  amount: number;
  fee: number;
  status: 'requested' | 'processing' | 'completed' | 'failed';
  payout_method: string;
  reference_number: string | null;
  created_at: string;
  processed_at: string | null;
}

interface WalletBalance {
  balance: number;
  total_earned: number;
  total_withdrawn: number;
}

interface PayoutsPanelProps {
  sellerId: string;
}

export function PayoutsPanel({ sellerId }: PayoutsPanelProps) {
  const { toast } = useToast();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [wallet, setWallet] = useState<WalletBalance>({ balance: 0, total_earned: 0, total_withdrawn: 0 });
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [requesting, setRequesting] = useState(false);

  const MINIMUM_PAYOUT = 100; // KES 100 minimum

  useEffect(() => {
    fetchPayoutData();
  }, [sellerId]);

  const fetchPayoutData = async () => {
    try {
      // Fetch wallet balance
      const { data: walletData, error: walletError } = await supabase
        .from('seller_wallets')
        .select('*')
        .eq('seller_id', sellerId)
        .single();

      if (walletError && walletError.code !== 'PGRST116') throw walletError;
      
      if (walletData) {
        setWallet(walletData);
      }

      // Fetch payout history
      const { data: payoutsData, error: payoutsError } = await supabase
        .from('payouts')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (payoutsError) throw payoutsError;
      setPayouts((payoutsData || []) as Payout[]);
    } catch (error: any) {
      console.error('Error fetching payout data:', error);
      toast({
        title: "Error",
        description: "Failed to load payout data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(requestAmount);
    if (amount < MINIMUM_PAYOUT) {
      toast({
        title: "Invalid Amount",
        description: `Minimum payout amount is KES ${MINIMUM_PAYOUT}`,
        variant: "destructive",
      });
      return;
    }

    if (amount > wallet.balance / 100) {
      toast({
        title: "Insufficient Balance",
        description: "Requested amount exceeds available balance",
        variant: "destructive",
      });
      return;
    }

    setRequesting(true);
    try {
      const { error } = await supabase
        .from('payouts')
        .insert({
          seller_id: sellerId,
          amount: amount * 100, // Convert to cents
          fee: Math.max(amount * 0.02, 5) * 100, // 2% fee, minimum KES 5
          status: 'requested',
          payout_method: 'mpesa',
        });

      if (error) throw error;

      // Update wallet balance
      await supabase
        .from('seller_wallets')
        .update({ 
          balance: wallet.balance - (amount * 100),
          total_withdrawn: wallet.total_withdrawn + (amount * 100)
        })
        .eq('seller_id', sellerId);

      toast({
        title: "Payout Requested",
        description: "Your payout request has been submitted for processing",
      });

      setShowRequestModal(false);
      setRequestAmount('');
      fetchPayoutData();
    } catch (error: any) {
      console.error('Error requesting payout:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to request payout",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'processing':
        return <Badge variant="outline" className="text-blue-600"><Clock className="h-3 w-3 mr-1" />Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline" className="text-yellow-600"><Clock className="h-3 w-3 mr-1" />Requested</Badge>;
    }
  };

  const formatCurrency = (amountInCents: number) => {
    return `KES ${(amountInCents / 100).toFixed(0)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payouts</h2>
          <p className="text-muted-foreground">Manage your earnings and withdrawal requests</p>
        </div>
        
        <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
          <DialogTrigger asChild>
            <Button 
              className="flex items-center space-x-2"
              disabled={wallet.balance < MINIMUM_PAYOUT * 100}
            >
              <Plus className="h-4 w-4" />
              <span>Request Payout</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Request Payout</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div className="space-y-2">
                <Label>Available Balance</Label>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(wallet.balance)}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Payout Amount (KES) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min={MINIMUM_PAYOUT}
                  max={wallet.balance / 100}
                  step="1"
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                  placeholder={`Minimum ${MINIMUM_PAYOUT}`}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Fee: 2% (minimum KES 5)
                </p>
              </div>

              <div className="space-y-2">
                <Label>Payout Method</Label>
                <div className="p-3 border rounded-lg bg-muted">
                  <p className="font-medium">M-Pesa</p>
                  <p className="text-sm text-muted-foreground">
                    Funds will be sent to your registered M-Pesa number
                  </p>
                </div>
              </div>

              <Button type="submit" disabled={requesting} className="w-full">
                {requesting ? 'Processing...' : 'Request Payout'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Available Balance</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(wallet.balance)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Ready for withdrawal
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Earned</p>
              <p className="text-2xl font-bold">{formatCurrency(wallet.total_earned)}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Lifetime earnings
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Withdrawn</p>
              <p className="text-2xl font-bold">{formatCurrency(wallet.total_withdrawn)}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <CreditCard className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Previous payouts
          </p>
        </Card>
      </div>

      {/* Payout History */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Payout History</h3>
        
        {payouts.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h4 className="text-lg font-semibold mb-2">No Payouts Yet</h4>
            <p className="text-muted-foreground">
              Your payout history will appear here once you request withdrawals.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {payouts.map((payout) => (
              <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <CreditCard className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{formatCurrency(payout.amount)}</span>
                      {getStatusBadge(payout.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Fee: {formatCurrency(payout.fee)} • Method: {payout.payout_method.toUpperCase()}
                    </p>
                    {payout.reference_number && (
                      <p className="text-sm text-muted-foreground">
                        Ref: {payout.reference_number}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    Requested: {new Date(payout.created_at).toLocaleDateString()}
                  </p>
                  {payout.processed_at && (
                    <p className="text-sm text-muted-foreground">
                      Processed: {new Date(payout.processed_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {wallet.balance < MINIMUM_PAYOUT * 100 && (
        <Card className="p-4 border-yellow-200 bg-yellow-50">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <h4 className="font-semibold text-yellow-800">Minimum Payout Not Met</h4>
              <p className="text-sm text-yellow-600">
                You need at least KES {MINIMUM_PAYOUT} to request a payout. 
                Keep selling to reach the minimum threshold!
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}