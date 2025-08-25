import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wallet,
  Plus,
  ArrowUpDown,
  TrendingUp,
  Shield,
  Settings,
  Bitcoin,
  DollarSign,
  Euro,
  PoundSterling,
  CreditCard,
  Smartphone,
  Building,
  Globe,
  QrCode
} from "lucide-react";

// Sample currencies data
const fiatCurrencies = [
  { code: "USD", name: "US Dollar", balance: 125000.50, icon: DollarSign },
  { code: "EUR", name: "Euro", balance: 85000.25, icon: Euro },
  { code: "GBP", name: "British Pound", balance: 45000.75, icon: PoundSterling },
  { code: "JPY", name: "Japanese Yen", balance: 12500000, icon: DollarSign },
  { code: "NGN", name: "Nigerian Naira", balance: 52000000, icon: DollarSign },
  { code: "KES", name: "Kenyan Shilling", balance: 13500000, icon: DollarSign },
];

const cryptocurrencies = [
  { code: "BTC", name: "Bitcoin", balance: 2.45621, icon: Bitcoin },
  { code: "ETH", name: "Ethereum", balance: 15.2341, icon: Bitcoin },
  { code: "USDT", name: "Tether", balance: 50000, icon: Bitcoin },
  { code: "USDC", name: "USD Coin", balance: 75000, icon: Bitcoin },
];

// Input/Output methods
const inputMethods = [
  { name: "Bank Cards", icon: CreditCard, methods: ["Visa", "Mastercard", "American Express", "Discover"] },
  { name: "Payment Gateways", icon: Globe, methods: ["Stripe", "PayPal", "Flutterwave", "Wise"] },
  { name: "Mobile Money", icon: Smartphone, methods: ["Orange Money", "MTN MoMo", "M-Pesa", "Airtel Money"] },
  { name: "Cryptocurrencies", icon: Bitcoin, methods: ["Bitcoin", "Ethereum", "USDT", "USDC"] },
];

const outputMethods = [
  { name: "Bank Accounts", icon: Building, methods: ["SEPA", "SWIFT", "Local Transfers"] },
  { name: "Mobile Money", icon: Smartphone, methods: ["Orange Money", "MTN MoMo", "M-Pesa"] },
  { name: "Digital Wallets", icon: Wallet, methods: ["PayPal", "Google Pay", "Apple Pay"] },
  { name: "Cryptocurrencies", icon: Bitcoin, methods: ["BTC", "ETH", "USDT", "USDC"] },
];

export const WalletSection = () => {
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [selectedInput, setSelectedInput] = useState("");
  const [selectedOutput, setSelectedOutput] = useState("");
  const [swapping, setSwapping] = useState(false);

  const allCurrencies = [...fiatCurrencies, ...cryptocurrencies];
  const totalValue = allCurrencies.reduce((acc, curr) => acc + (curr.balance * (curr.code === 'USD' ? 1 : 0.9)), 0);

  const handleDemoFlow = (type: 'input' | 'output' | 'swap', method: string) => {
    if (type === 'input') {
      setSelectedInput(method);
    } else if (type === 'output') {
      setSelectedOutput(method);
    } else if (type === 'swap') {
      setSwapping(true);
      setTimeout(() => setSwapping(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Multi-Currency Virtual Wallet</h1>
        <p className="text-muted-foreground">
          Single account for all currencies with real-time conversion between FIAT and crypto
        </p>
      </div>

      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-2 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Total Portfolio Value
            </CardTitle>
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
          <CardHeader>
            <CardTitle className="text-sm">FIAT Currencies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fiatCurrencies.length}</div>
            <div className="text-sm text-muted-foreground">Active balances</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Cryptocurrencies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cryptocurrencies.length}</div>
            <div className="text-sm text-muted-foreground">Digital assets</div>
          </CardContent>
        </Card>
      </div>

      {/* Demo Flow Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 1. INPUTS */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">💰 Deposit From</CardTitle>
            <CardDescription>Add money to wallet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {inputMethods.map((method) => (
              <Button
                key={method.name}
                variant={selectedInput === method.name ? "default" : "outline"}
                className="w-full justify-start h-auto py-3 px-4"
                onClick={() => handleDemoFlow('input', method.name)}
              >
                <method.icon className="w-4 h-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-sm">{method.name.replace("Pay with ", "Deposit from ")}</div>
                  <div className="text-xs text-muted-foreground">
                    {method.methods.slice(0, 2).join(', ')}
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* 2. PROCESSING */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🏦 Multi-Currency Wallet</CardTitle>
            <CardDescription>Live balances</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-3">
              <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Value</div>
              </div>
              
              <div className="space-y-2">
                {allCurrencies.slice(0, 4).map((currency) => (
                  <div key={currency.code} className="flex items-center justify-between text-sm">
                    <span>{currency.code}</span>
                    <span className="font-medium">{currency.balance.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleDemoFlow('swap', 'currency')}
                disabled={swapping}
              >
                {swapping ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    Converting...
                  </div>
                ) : (
                  <>
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    Instant Swap
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 3. OUTPUTS */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📤 Withdraw To</CardTitle>
            <CardDescription>Send money out</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {outputMethods.map((method) => (
              <Button
                key={method.name}
                variant={selectedOutput === method.name ? "default" : "outline"}
                className="w-full justify-start h-auto py-3 px-4"
                onClick={() => handleDemoFlow('output', method.name)}
              >
                <method.icon className="w-4 h-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-sm">{method.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {method.methods.slice(0, 2).join(', ')}
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* 4. CURRENCIES */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">💱 Currency Swap</CardTitle>
            <CardDescription>Instant conversion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label className="text-sm">From Currency</Label>
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allCurrencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center gap-2">
                        <currency.icon className="w-4 h-4" />
                        {currency.code}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center">
              <ArrowUpDown className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">To Currency</Label>
              <Select defaultValue="EUR">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allCurrencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center gap-2">
                        <currency.icon className="w-4 h-4" />
                        {currency.code}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm text-center">
                <div className="font-medium">Live Rate</div>
                <div className="text-muted-foreground">1 USD = 0.92 EUR</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Balances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              FIAT Currencies
            </CardTitle>
            <CardDescription>180+ traditional currencies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {fiatCurrencies.map((currency) => (
              <div key={currency.code} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <currency.icon className="w-5 h-5" />
                  <div>
                    <p className="font-medium">{currency.code}</p>
                    <p className="text-sm text-muted-foreground">{currency.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{currency.balance.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bitcoin className="w-5 h-5" />
              Cryptocurrencies
            </CardTitle>
            <CardDescription>50+ digital assets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {cryptocurrencies.map((currency) => (
              <div key={currency.code} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <currency.icon className="w-5 h-5" />
                  <div>
                    <p className="font-medium">{currency.code}</p>
                    <p className="text-sm text-muted-foreground">{currency.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{currency.balance.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};