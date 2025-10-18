import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Wifi, Clock, Database, CreditCard, 
  AlertCircle, CheckCircle2, Loader2, 
  MapPin, Star, QrCode 
} from 'lucide-react';

interface Hotspot {
  id: string;
  name: string;
  address: string;
  rating: number;
  network_ssid: string;
}

interface WifiPackage {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  data_limit_mb: number | null;
  price: number;
  commission_rate: number;
  is_stackable: boolean;
}

interface PackagePurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotspot: Hotspot;
  package: WifiPackage;
  onPurchaseComplete: () => void;
}

export const PackagePurchaseModal: React.FC<PackagePurchaseModalProps> = ({
  open,
  onOpenChange,
  hotspot,
  package: pkg,
  onPurchaseComplete
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [purchaseResult, setPurchaseResult] = useState<any>(null);
  const [step, setStep] = useState<'preview' | 'processing' | 'success'>('preview');

  useEffect(() => {
    if (open && user) {
      fetchWalletBalance();
    }
  }, [open, user]);

  const fetchWalletBalance = async () => {
    try {
      const { data, error } = await supabase
        .from('buyer_wallets')
        .select('balance')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setWalletBalance(data?.balance || 0);
    } catch (error: any) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  const formatDataLimit = (limitMb: number | null) => {
    if (!limitMb) return 'Unlimited';
    if (limitMb >= 1024) return `${(limitMb / 1024).toFixed(1)} GB`;
    return `${limitMb} MB`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes >= 1440) return `${Math.floor(minutes / 1440)} days`;
    if (minutes >= 60) return `${Math.floor(minutes / 60)} hours`;
    return `${minutes} minutes`;
  };

  const calculateFees = () => {
    const baseAmount = pkg.price;
    const commissionRate = pkg.commission_rate / 100;
    const commissionAmount = baseAmount * commissionRate;
    const platformFee = commissionAmount * 0.1;
    const sellerAmount = baseAmount - commissionAmount;

    return {
      baseAmount,
      commissionAmount,
      platformFee,
      sellerAmount,
      totalAmount: baseAmount
    };
  };

  const handlePurchase = async () => {
    if (!user) return;

    setLoading(true);
    setStep('processing');

    try {
      const fees = calculateFees();
      
      if (walletBalance < fees.totalAmount) {
        throw new Error('Insufficient wallet balance');
      }

      const idempotencyKey = `${user.id}_${pkg.id}_${Date.now()}`;

      const { data, error } = await supabase.functions.invoke('wifi-purchase-package', {
        body: {
          package_id: pkg.id,
          hotspot_id: hotspot.id,
          payment_method: 'wallet',
          idempotency_key: idempotencyKey
        }
      });

      if (error) throw error;

      if (data.success) {
        setPurchaseResult(data);
        setStep('success');
        
        // Update wallet balance
        setWalletBalance(prev => prev - fees.totalAmount);
        
        setTimeout(() => {
          onPurchaseComplete();
          onOpenChange(false);
          resetModal();
        }, 3000);
      } else {
        throw new Error(data.error || 'Purchase failed');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase package",
        variant: "destructive"
      });
      setStep('preview');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep('preview');
    setPurchaseResult(null);
    setLoading(false);
  };

  const handleClose = () => {
    if (step !== 'processing') {
      onOpenChange(false);
      resetModal();
    }
  };

  const fees = calculateFees();
  const hasInsufficientFunds = walletBalance < fees.totalAmount;

  if (step === 'success' && purchaseResult) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Purchase Successful!
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="text-center">
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <QrCode className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Session Activated</p>
              </div>
              
              <div className="space-y-2">
                <p className="font-medium">Voucher Code</p>
                <div className="bg-gray-100 p-2 rounded font-mono text-lg">
                  {purchaseResult.voucher_code}
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Hotspot:</span>
                <span className="font-medium">{hotspot.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Network:</span>
                <span className="font-medium">{hotspot.network_ssid}</span>
              </div>
              <div className="flex justify-between">
                <span>Package:</span>
                <span className="font-medium">{pkg.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="font-medium">{formatDuration(pkg.duration_minutes)}</span>
              </div>
              <div className="flex justify-between">
                <span>Data Limit:</span>
                <span className="font-medium">{formatDataLimit(pkg.data_limit_mb)}</span>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Connect to the network "{hotspot.network_ssid}" and use the voucher code to access the internet.
              </AlertDescription>
            </Alert>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Purchase WiFi Package
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Hotspot Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium">{hotspot.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    <span>{hotspot.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{hotspot.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">•</span>
                    <Wifi className="h-3 w-3" />
                    <span>{hotspot.network_ssid}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Package Details */}
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-3">Package Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium">{formatDuration(pkg.duration_minutes)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-muted-foreground">Data Limit</p>
                    <p className="font-medium">{formatDataLimit(pkg.data_limit_mb)}</p>
                  </div>
                </div>
              </div>
              
              {pkg.description && (
                <p className="text-sm text-muted-foreground mt-3">{pkg.description}</p>
              )}
              
              {pkg.is_stackable && (
                <Badge variant="secondary" className="mt-2">
                  Stackable - Can extend active sessions
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Pricing Breakdown */}
          <div className="space-y-3">
            <h3 className="font-medium">Pricing</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Package Price</span>
                <span>KES {fees.baseAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee</span>
                <span>KES {fees.platformFee.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total Amount</span>
                <span>KES {fees.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Wallet Balance */}
          <Card className={hasInsufficientFunds ? 'border-red-200 bg-red-50' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm">Wallet Balance</span>
                </div>
                <span className={`font-medium ${hasInsufficientFunds ? 'text-red-600' : ''}`}>
                  KES {walletBalance.toFixed(2)}
                </span>
              </div>
              {hasInsufficientFunds && (
                <Alert className="mt-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Insufficient funds. Please top up your wallet to continue.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleClose}
              disabled={step === 'processing'}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1"
              onClick={handlePurchase}
              disabled={hasInsufficientFunds || loading || step === 'processing'}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {step === 'processing' ? 'Processing...' : 'Loading...'}
                </>
              ) : (
                `Purchase - KES ${fees.totalAmount.toFixed(2)}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};