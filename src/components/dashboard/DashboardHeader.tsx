import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Plus, Settings, Wifi, WifiOff, Wallet, CheckCircle2, CreditCard, Smartphone, RefreshCw } from 'lucide-react';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { useToast } from '@/hooks/use-toast';
import { usePaystackBalanceSync } from '@/hooks/usePaystackBalanceSync';

interface DashboardHeaderProps {
  walletBalance: number;
  isOffline: boolean;
  lastUpdated: Date;
  onAddMoney: () => void;
  onSettings: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  walletBalance,
  isOffline,
  lastUpdated,
  onAddMoney,
  onSettings,
}) => {
  const { toast } = useToast();
  const [showPaystackInfo, setShowPaystackInfo] = useState(false);
  const isPaystackConnected = true; // Always connected since we're using Paystack
  const { syncBalance, isSyncing } = usePaystackBalanceSync();

  return (
    <>
      <Card className="border-0 shadow-lg bg-gradient-to-r from-primary to-primary/90 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">Wallet Balance</h2>
              {isOffline ? (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <WifiOff className="h-3 w-3" />
                  Offline
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1 text-primary">
                  <Wifi className="h-3 w-3" />
                  Online
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => syncBalance()}
                disabled={isOffline || isSyncing}
                className="text-white hover:bg-white/20 flex items-center gap-2"
                title="Sync Paystack Balance"
              >
                <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync'}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={onAddMoney}
                disabled={isOffline}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Money
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onSettings}
                className="text-white hover:bg-white/20"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <CurrencyDisplay 
              amount={walletBalance} 
              className="text-4xl font-bold text-white" 
              showToggle={false} 
            />
          </div>

          {/* Live Payment Status */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/80 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Live • Updates automatically
            </p>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowPaystackInfo(true)}
              className="text-white hover:bg-white/20 flex items-center gap-2 bg-green-600/20 border border-green-400/30"
            >
              <CheckCircle2 className="h-4 w-4 text-green-300" />
              <span className="text-xs">All Payments Active</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Paystack Info Modal */}
      <Dialog open={showPaystackInfo} onOpenChange={setShowPaystackInfo}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-green-600" />
              Paystack Payment Gateway
            </DialogTitle>
            <DialogDescription>
              Your unified payment solution for cards, bank transfers, and mobile money
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Connection Status */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-900">Active & Connected</span>
              </div>
              <p className="text-sm text-green-700">
                Your Chama Hub is connected to Paystack for seamless payments
              </p>
            </div>

            {/* Supported Payment Methods */}
            <div>
              <h3 className="font-semibold mb-3">Live Payment Channels ⚡</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <Smartphone className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">M-Pesa & Airtel Money</p>
                    <p className="text-xs text-muted-foreground">Instant mobile money deposits</p>
                  </div>
                  <span className="text-xs text-green-600 font-semibold">LIVE</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Cards</p>
                    <p className="text-xs text-muted-foreground">Visa, Mastercard, Verve</p>
                  </div>
                  <span className="text-xs text-blue-600 font-semibold">LIVE</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-purple-50 border border-purple-200 rounded-lg">
                  <Wallet className="h-5 w-5 text-purple-600" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Bank Transfer</p>
                    <p className="text-xs text-muted-foreground">Direct bank deposits</p>
                  </div>
                  <span className="text-xs text-purple-600 font-semibold">LIVE</span>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-gradient-to-br from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2 text-blue-900">⚡ Real-Time Updates</h4>
              <ul className="text-xs text-blue-700 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Send money via M-Pesa, Airtel, card, or bank transfer</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Your wallet updates automatically within seconds</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>2.5% platform fee on all transactions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Get instant notifications when money arrives</span>
                </li>
              </ul>
            </div>

            <Button 
              onClick={() => {
                setShowPaystackInfo(false);
                onAddMoney();
              }}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Make a Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};