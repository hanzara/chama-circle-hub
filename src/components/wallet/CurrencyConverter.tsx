import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown, Loader2 } from "lucide-react";
import { useEnhancedWallet } from "@/hooks/useEnhancedWallet";

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'BTC', name: 'Bitcoin', symbol: '₿' },
  { code: 'ETH', name: 'Ethereum', symbol: 'Ξ' },
  { code: 'USDT', name: 'Tether', symbol: 'USDT' },
  { code: 'USDC', name: 'USD Coin', symbol: 'USDC' }
];

export const CurrencyConverter = () => {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState('');
  const [converting, setConverting] = useState(false);
  
  const { 
    convertCurrency, 
    getExchangeRate, 
    getCurrencyBalance 
  } = useEnhancedWallet();

  const handleConvert = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    const numAmount = parseFloat(amount);
    const balance = getCurrencyBalance(fromCurrency);

    if (numAmount > balance) {
      return;
    }

    setConverting(true);
    try {
      await convertCurrency(fromCurrency, toCurrency, numAmount);
      setAmount('');
    } catch (error) {
      console.error('Conversion failed:', error);
    } finally {
      setConverting(false);
    }
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const exchangeRate = getExchangeRate(fromCurrency, toCurrency);
  const convertedAmount = amount ? (parseFloat(amount) * exchangeRate).toFixed(6) : '0';
  const fromBalance = getCurrencyBalance(fromCurrency);
  const toBalance = getCurrencyBalance(toCurrency);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowUpDown className="w-5 h-5" />
          Currency Converter
        </CardTitle>
        <CardDescription>
          Convert between supported currencies with live exchange rates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* From Currency */}
        <div className="space-y-2">
          <Label>From</Label>
          <div className="flex gap-2">
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Balance: {fromBalance.toFixed(6)} {fromCurrency}
          </p>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={swapCurrencies}
            className="rounded-full"
          >
            <ArrowUpDown className="w-4 h-4" />
          </Button>
        </div>

        {/* To Currency */}
        <div className="space-y-2">
          <Label>To</Label>
          <div className="flex gap-2">
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="text"
              value={convertedAmount}
              readOnly
              className="flex-1 bg-muted"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Balance: {toBalance.toFixed(6)} {toCurrency}
          </p>
        </div>

        {/* Exchange Rate */}
        <div className="p-3 bg-muted rounded-lg">
          <div className="text-sm text-center">
            <div className="font-medium">Live Exchange Rate</div>
            <div className="text-muted-foreground">
              1 {fromCurrency} = {exchangeRate.toFixed(6)} {toCurrency}
            </div>
          </div>
        </div>

        {/* Convert Button */}
        <Button 
          onClick={handleConvert} 
          disabled={converting || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > fromBalance}
          className="w-full"
        >
          {converting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {converting ? 'Converting...' : 'Convert Currency'}
        </Button>
      </CardContent>
    </Card>
  );
};