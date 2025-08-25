import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wallet,
  ArrowUpDown,
  TrendingUp,
  History,
  Settings,
  CreditCard
} from "lucide-react";
import { useEnhancedWallet } from "@/hooks/useEnhancedWallet";
import { WalletBalances } from "@/components/wallet/WalletBalances";
import { CurrencyConverter } from "@/components/wallet/CurrencyConverter";
import { TransactionHistory } from "@/components/wallet/TransactionHistory";

export const WalletSection = () => {
  const { 
    walletCurrencies, 
    getTotalValueUSD, 
    loading 
  } = useEnhancedWallet();

  const totalValue = getTotalValueUSD();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Multi-Currency Virtual Wallet</h1>
        <p className="text-muted-foreground">
          Professional-grade financial infrastructure with real-time conversion, live balances, and transaction processing
        </p>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-2 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Total Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${loading ? '...' : totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center mt-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              +8.3% (24h)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Currencies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{walletCurrencies.length}</div>
            <div className="text-sm text-muted-foreground">Multi-currency support</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Live Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">●</div>
            <div className="text-sm text-muted-foreground">Real-time transactions</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Wallet Interface */}
      <Tabs defaultValue="balances" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="balances" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Balances
          </TabsTrigger>
          <TabsTrigger value="convert" className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4" />
            Convert
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="balances" className="space-y-6">
          <WalletBalances />
        </TabsContent>

        <TabsContent value="convert" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CurrencyConverter />
            <Card>
              <CardHeader>
                <CardTitle>Exchange Rates</CardTitle>
                <CardDescription>Live market rates updated every minute</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>USD/EUR</span>
                    <span className="font-mono">0.92</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>USD/GBP</span>
                    <span className="font-mono">0.80</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>BTC/USD</span>
                    <span className="font-mono">43,500.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>ETH/USD</span>
                    <span className="font-mono">2,450.00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <TransactionHistory />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Wallet Settings</CardTitle>
                <CardDescription>Configure your wallet preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-convert small balances</p>
                    <p className="text-sm text-muted-foreground">Convert dust to USD automatically</p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Real-time notifications</p>
                    <p className="text-sm text-muted-foreground">Get alerts for all transactions</p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enhanced security</p>
                    <p className="text-sm text-muted-foreground">Two-factor authentication enabled</p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Status</CardTitle>
                <CardDescription>Your account security overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    ✓ Verified Account
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    ✓ 2FA Enabled
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    ✓ KYC Completed
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    ℹ Premium Tier
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};