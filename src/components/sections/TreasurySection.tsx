import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Vault, 
  TrendingUp, 
  Shield, 
  Zap, 
  Plus, 
  Settings, 
  ArrowUpDown,
  DollarSign,
  Bitcoin,
  Euro,
  PoundSterling
} from "lucide-react";

const mockWalletData = [
  { currency: "USD", balance: 125000.50, available: 124000.50, locked: 1000.00, change: +2.5, icon: DollarSign },
  { currency: "EUR", balance: 85000.25, available: 84500.25, locked: 500.00, change: +1.2, icon: Euro },
  { currency: "GBP", balance: 45000.75, available: 44800.75, locked: 200.00, change: -0.8, icon: PoundSterling },
  { currency: "BTC", balance: 2.45621, available: 2.45621, locked: 0, change: +5.2, icon: Bitcoin },
  { currency: "ETH", balance: 15.2341, available: 15.2341, locked: 0, change: +3.1, icon: Bitcoin },
];

const mockRules = [
  {
    id: "1",
    name: "Auto Convert USD Excess",
    type: "auto_convert",
    status: "active",
    description: "Convert USD over $100k to EUR",
    lastExecuted: "2 hours ago"
  },
  {
    id: "2", 
    name: "BTC Volatility Shield",
    type: "volatility_shield",
    status: "active",
    description: "Hedge 25% of BTC when volatility > 10%",
    lastExecuted: "1 day ago"
  },
  {
    id: "3",
    name: "EUR Balance Maintenance", 
    type: "balance_maintain",
    status: "inactive",
    description: "Maintain minimum 50k EUR balance",
    lastExecuted: "Never"
  }
];

export const TreasurySection = () => {
  const [selectedCurrencyFrom, setSelectedCurrencyFrom] = useState("USD");
  const [selectedCurrencyTo, setSelectedCurrencyTo] = useState("EUR");
  const [conversionAmount, setConversionAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const { wallets, convertCurrency, getTotalValue } = useWallet();

  // Use real wallet data or fallback to mock data
  const walletData = wallets.length > 0 ? wallets.map(wallet => ({
    currency: wallet.currency,
    balance: wallet.balance,
    available: wallet.balance,
    locked: 0,
    change: (Math.random() - 0.5) * 10,
    icon: wallet.currency === 'USD' ? DollarSign : 
          wallet.currency === 'EUR' ? Euro :
          wallet.currency === 'GBP' ? PoundSterling : Bitcoin
  })) : mockWalletData;

  const totalValue = getTotalValue();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Treasury Management</h1>
        <p className="text-muted-foreground">
          Intelligent multi-currency treasury with automated rules and yield optimization
        </p>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalValue.toLocaleString()}</div>
            <div className="flex items-center mt-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              +2.4% (24h)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockRules.filter(r => r.status === 'active').length}</div>
            <div className="text-sm text-muted-foreground mt-2">Automation enabled</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">Low</div>
            <div className="text-sm text-muted-foreground mt-2">Volatility: 12%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="balances" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="balances">Balances</TabsTrigger>
          <TabsTrigger value="convert">Convert</TabsTrigger>
          <TabsTrigger value="rules">Automation</TabsTrigger>
          <TabsTrigger value="yield">Yield</TabsTrigger>
        </TabsList>

        <TabsContent value="balances" className="space-y-4">
          <div className="grid gap-4">
            {walletData.map((wallet) => (
              <Card key={wallet.currency}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                        <wallet.icon className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{wallet.currency}</h3>
                        <p className="text-sm text-muted-foreground">
                          Available: {wallet.available.toLocaleString()} • 
                          Locked: {wallet.locked.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{wallet.balance.toLocaleString()}</div>
                      <div className={`text-sm ${wallet.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {wallet.change >= 0 ? '+' : ''}{wallet.change}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="convert" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5" />
                Currency Conversion
              </CardTitle>
              <CardDescription>
                Convert between your treasury currencies with real-time rates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From</Label>
                  <Select value={selectedCurrencyFrom} onValueChange={setSelectedCurrencyFrom}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {walletData.map((wallet) => (
                        <SelectItem key={wallet.currency} value={wallet.currency}>
                          {wallet.currency} - {wallet.available.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>To</Label>
                  <Select value={selectedCurrencyTo} onValueChange={setSelectedCurrencyTo}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {walletData.map((wallet) => (
                        <SelectItem key={wallet.currency} value={wallet.currency}>
                          {wallet.currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input 
                  type="number" 
                  placeholder="Enter amount"
                  value={conversionAmount}
                  onChange={(e) => setConversionAmount(e.target.value)}
                />
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Exchange Rate</div>
                <div className="text-lg font-semibold">1 {selectedCurrencyFrom} = 0.91 {selectedCurrencyTo}</div>
                <div className="text-sm text-muted-foreground">Fee: 0.25% • Est. Arrival: Instant</div>
              </div>
              <Button 
                className="w-full"
                disabled={loading || !conversionAmount}
                onClick={async () => {
                  setLoading(true);
                  try {
                    await convertCurrency(selectedCurrencyFrom, selectedCurrencyTo, parseFloat(conversionAmount));
                    setConversionAmount('');
                  } catch (error) {
                    console.error('Conversion failed:', error);
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                {loading ? 'Converting...' : `Convert ${conversionAmount || '0'} ${selectedCurrencyFrom} to ${selectedCurrencyTo}`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Automated Treasury Rules</h3>
              <p className="text-sm text-muted-foreground">Set up intelligent automation for your treasury</p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Rule
            </Button>
          </div>

          <div className="grid gap-4">
            {mockRules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{rule.name}</h4>
                        <Badge variant={rule.status === 'active' ? 'default' : 'secondary'}>
                          {rule.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                      <p className="text-xs text-muted-foreground">Last executed: {rule.lastExecuted}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={rule.status === 'active'} />
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="yield" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Yield Opportunities
              </CardTitle>
              <CardDescription>
                Earn returns on idle treasury funds through DeFi integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <h4 className="font-semibold">USDC Staking</h4>
                    <p className="text-sm text-muted-foreground">Stake your USD for 4.2% APY</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-600">4.2% APY</div>
                    <Button size="sm">Enable</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <h4 className="font-semibold">ETH Staking</h4>
                    <p className="text-sm text-muted-foreground">Ethereum 2.0 staking rewards</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-600">3.8% APY</div>
                    <Button size="sm">Enable</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};