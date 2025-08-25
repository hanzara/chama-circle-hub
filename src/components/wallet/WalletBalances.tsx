import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Bitcoin, 
  DollarSign, 
  Euro, 
  PoundSterling, 
  Plus,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { useEnhancedWallet } from "@/hooks/useEnhancedWallet";

const CURRENCY_ICONS: Record<string, any> = {
  USD: DollarSign,
  EUR: Euro,
  GBP: PoundSterling,
  BTC: Bitcoin,
  ETH: Bitcoin,
  USDT: Bitcoin,
  USDC: Bitcoin,
  JPY: DollarSign,
  NGN: DollarSign,
  KES: DollarSign
};

const CURRENCY_COLORS: Record<string, string> = {
  USD: 'bg-green-500',
  EUR: 'bg-blue-500',
  GBP: 'bg-purple-500',
  BTC: 'bg-orange-500',
  ETH: 'bg-indigo-500',
  USDT: 'bg-teal-500',
  USDC: 'bg-cyan-500',
  JPY: 'bg-red-500',
  NGN: 'bg-yellow-500',
  KES: 'bg-pink-500'
};

export const WalletBalances = () => {
  const { 
    walletCurrencies, 
    getTotalValueUSD, 
    getExchangeRate, 
    addFunds 
  } = useEnhancedWallet();

  const totalValueUSD = getTotalValueUSD();

  const handleAddFunds = async (currencyCode: string) => {
    const demoAmounts: Record<string, number> = {
      USD: 1000,
      EUR: 800,
      GBP: 600,
      BTC: 0.02,
      ETH: 0.5,
      USDT: 1000,
      USDC: 1000,
      JPY: 100000,
      NGN: 500000,
      KES: 50000
    };

    try {
      await addFunds(currencyCode, demoAmounts[currencyCode] || 100, 'demo-add');
    } catch (error) {
      console.error('Failed to add funds:', error);
    }
  };

  // Sort currencies by USD value
  const sortedCurrencies = [...walletCurrencies].sort((a, b) => {
    const aValueUSD = a.balance * getExchangeRate(a.currency_code, 'USD');
    const bValueUSD = b.balance * getExchangeRate(b.currency_code, 'USD');
    return bValueUSD - aValueUSD;
  });

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Portfolio Overview</span>
            <div className="flex items-center gap-2 text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">+8.3% (24h)</span>
            </div>
          </CardTitle>
          <CardDescription>Total value across all currencies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2">
            ${totalValueUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-sm text-muted-foreground">
            {walletCurrencies.length} active currencies
          </div>
        </CardContent>
      </Card>

      {/* Currency Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedCurrencies.map((currency) => {
          const IconComponent = CURRENCY_ICONS[currency.currency_code] || DollarSign;
          const colorClass = CURRENCY_COLORS[currency.currency_code] || 'bg-gray-500';
          const usdValue = currency.balance * getExchangeRate(currency.currency_code, 'USD');
          const portfolioPercentage = totalValueUSD > 0 ? (usdValue / totalValueUSD) * 100 : 0;

          return (
            <Card key={currency.id} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center text-white`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{currency.currency_code}</h3>
                      <p className="text-sm text-muted-foreground">
                        {portfolioPercentage.toFixed(1)}% of portfolio
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddFunds(currency.currency_code)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div>
                  <div className="text-2xl font-bold">
                    {currency.balance.toFixed(currency.currency_code.includes('BTC') || currency.currency_code.includes('ETH') ? 6 : 2)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ≈ ${usdValue.toFixed(2)} USD
                  </div>
                </div>

                <Progress 
                  value={portfolioPercentage} 
                  className="h-2" 
                />

                {currency.locked_balance > 0 && (
                  <div className="flex items-center gap-2">
                    <Minus className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-orange-600">
                      {currency.locked_balance.toFixed(4)} locked
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Available</span>
                  <span>{(currency.balance - currency.locked_balance).toFixed(4)}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add New Currency */}
      {walletCurrencies.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No currencies yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first currency to start using your multi-currency wallet
            </p>
            <Button onClick={() => handleAddFunds('USD')}>
              Add Demo Funds
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};