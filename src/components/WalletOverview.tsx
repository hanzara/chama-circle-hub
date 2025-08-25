import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, RefreshCw, ArrowUpRight, ArrowDownLeft, TrendingUp } from "lucide-react";
import { SendReceiveModal } from "./SendReceiveModal";
import { useWallet } from "@/hooks/useWallet";

interface Currency {
  code: string;
  amount: string;
  usdValue: string;
  change24h: string;
  changePercentage: number;
}

interface WalletOverviewProps {
  totalUsdValue: string;
  currencies: Currency[];
}

export const WalletOverview = ({ totalUsdValue, currencies }: WalletOverviewProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'send' | 'receive'>('receive');
  const { refreshData } = useWallet();

  const handleRefresh = async () => {
    await refreshData();
  };

  const openModal = (mode: 'send' | 'receive') => {
    setModalMode(mode);
    setModalOpen(true);
  };

  return (
    <Card className="p-6 bg-gradient-primary text-primary-foreground shadow-primary">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Universal Wallet</h2>
            <p className="text-primary-foreground/80">Multi-currency balance</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary-foreground hover:bg-white/20"
          onClick={handleRefresh}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="mb-6">
        <div className="text-3xl font-bold mb-2">{totalUsdValue}</div>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-4 w-4 text-accent" />
          <span className="text-sm">+5.2% from yesterday</span>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {currencies.map((currency, index) => (
          <div key={currency.code} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                {currency.code}
              </div>
              <div>
                <div className="font-semibold">{currency.amount}</div>
                <div className="text-xs text-primary-foreground/80">{currency.usdValue}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-sm font-semibold ${
                currency.changePercentage >= 0 ? 'text-accent' : 'text-destructive'
              }`}>
                {currency.changePercentage >= 0 ? '+' : ''}{currency.changePercentage}%
              </div>
              <div className="text-xs text-primary-foreground/80">{currency.change24h}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex space-x-3">
        <Button 
          variant="secondary" 
          className="flex-1"
          onClick={() => openModal('receive')}
        >
          <ArrowDownLeft className="h-4 w-4 mr-2" />
          Receive
        </Button>
        <Button 
          variant="secondary" 
          className="flex-1"
          onClick={() => openModal('send')}
        >
          <ArrowUpRight className="h-4 w-4 mr-2" />
          Send
        </Button>
      </div>

      <SendReceiveModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
      />
    </Card>
  );
};