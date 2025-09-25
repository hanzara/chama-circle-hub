import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Wallet, Lock, RotateCcw, Target, DollarSign, Send, 
  Download, TrendingUp, Eye, EyeOff, Users, Calendar
} from 'lucide-react';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { useToast } from '@/hooks/use-toast';

interface WalletDashboardProps {
  user: any;
  chamaId?: string;
  userRole?: string;
}

const WalletDashboard: React.FC<WalletDashboardProps> = ({ user, chamaId, userRole }) => {
  const [showBalances, setShowBalances] = useState(true);
  const { toast } = useToast();

  // Mock wallet data - would come from backend
  const walletData = {
    chamaViewOnly: {
      id: 'wallet-chama-view',
      name: 'Chama Savings',
      balance: 125000,
      isLocked: true,
      type: 'chama_view_locked',
      monthlyContribution: 15000,
      totalContributed: 125000,
      nextUnlock: '2024-06-15'
    },
    mgrWallet: {
      id: 'wallet-mgr',
      name: 'Merry-Go-Round',
      balance: 45000,
      isLocked: false,
      type: 'mgr',
      monthlyPayout: 75000,
      nextPayoutDate: '2024-02-15',
      rank: 3
    },
    personalSavings: [
      {
        id: 'savings-emergency',
        name: 'Emergency Fund',
        balance: 85000,
        target: 200000,
        monthlyGoal: 10000
      },
      {
        id: 'savings-business',
        name: 'Business Capital',
        balance: 150000,
        target: 500000,
        monthlyGoal: 25000
      }
    ]
  };

  const chamaWallet = userRole === 'treasurer' || userRole === 'admin' ? {
    centralBalance: 2850000,
    pendingContributions: 45000,
    monthlyTarget: 300000,
    totalMembers: 20,
    disbursementsThisMonth: 180000
  } : null;

  const handleQuickAction = (action: string, walletId?: string) => {
    switch (action) {
      case 'send':
        toast({
          title: "Send Money",
          description: "Opening send money interface...",
        });
        break;
      case 'withdraw':
        if (walletId === 'wallet-chama-view') {
          toast({
            title: "Withdrawal Locked",
            description: "Chama savings are locked until next sharing event",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Withdraw Funds",
            description: "Opening withdrawal interface...",
          });
        }
        break;
      case 'topup':
        toast({
          title: "Top Up Wallet",
          description: "Opening top-up interface...",
        });
        break;
      default:
        break;
    }
  };

  const WalletCard = ({ wallet, actions = true }: { wallet: any; actions?: boolean }) => (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {wallet.type === 'chama_view_locked' && <Lock className="h-4 w-4 text-amber-500" />}
            {wallet.type === 'mgr' && <RotateCcw className="h-4 w-4 text-green-500" />}
            <Wallet className="h-4 w-4" />
            {wallet.name}
          </CardTitle>
          <Badge variant={wallet.isLocked ? "secondary" : "default"}>
            {wallet.isLocked ? 'Locked' : 'Active'}
          </Badge>
        </div>
        <CardDescription>
          {wallet.type === 'chama_view_locked' && 'Savings ledger visible, withdrawals locked until sharing event'}
          {wallet.type === 'mgr' && 'Monthly rotating payouts and transfers'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Balance:</span>
          <div className="flex items-center gap-2">
            <CurrencyDisplay 
              amount={showBalances ? wallet.balance : 0} 
              className="text-2xl font-bold"
              showToggle={false}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBalances(!showBalances)}
            >
              {showBalances ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {wallet.type === 'chama_view_locked' && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Monthly contribution:</span>
              <CurrencyDisplay amount={wallet.monthlyContribution} showToggle={false} />
            </div>
            <div className="flex justify-between text-sm">
              <span>Total contributed:</span>
              <CurrencyDisplay amount={wallet.totalContributed} showToggle={false} />
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">
                <Calendar className="h-4 w-4 inline mr-2" />
                Next unlock: {wallet.nextUnlock}
              </p>
            </div>
          </div>
        )}

        {wallet.type === 'mgr' && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Monthly payout:</span>
              <CurrencyDisplay amount={wallet.monthlyPayout} showToggle={false} />
            </div>
            <div className="flex justify-between text-sm">
              <span>Your rank:</span>
              <Badge variant="outline">#{wallet.rank}</Badge>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <Calendar className="h-4 w-4 inline mr-2" />
                Next payout: {wallet.nextPayoutDate}
              </p>
            </div>
          </div>
        )}

        {actions && (
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              size="sm" 
              onClick={() => handleQuickAction('send', wallet.id)}
              disabled={wallet.isLocked}
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleQuickAction('withdraw', wallet.id)}
            >
              <Download className="h-4 w-4 mr-2" />
              Withdraw
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleQuickAction('topup', wallet.id)}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Top Up
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Wallet Dashboard</h2>
          <p className="text-muted-foreground">Manage your chama and personal wallets</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="chama">Chama Wallets</TabsTrigger>
          <TabsTrigger value="savings">Personal Savings</TabsTrigger>
          {chamaWallet && <TabsTrigger value="central">Central Wallet</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Total Balance Summary */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-muted-foreground">Total Net Worth</h3>
                  <CurrencyDisplay 
                    amount={showBalances ? 405000 : 0}
                    className="text-4xl font-bold"
                    showToggle={false}
                  />
                  <div className="flex items-center gap-1 text-green-600 mt-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">+12.5% this month</span>
                  </div>
                </div>
                <Wallet className="h-12 w-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          {/* Wallet Overview Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <WalletCard wallet={walletData.chamaViewOnly} />
            <WalletCard wallet={walletData.mgrWallet} />
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Monthly Contributions</CardTitle>
              </CardHeader>
              <CardContent>
                <CurrencyDisplay amount={15000} className="text-xl font-bold" showToggle={false} />
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Savings Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress value={67} className="h-2" />
                  <p className="text-xs text-muted-foreground">67% of monthly target</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">MGR Position</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">#3</div>
                <p className="text-xs text-muted-foreground">Next payout in 12 days</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="chama" className="space-y-6">
          <div className="grid gap-6">
            <WalletCard wallet={walletData.chamaViewOnly} />
            <WalletCard wallet={walletData.mgrWallet} />
          </div>
        </TabsContent>

        <TabsContent value="savings" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {walletData.personalSavings.map((savings) => (
              <Card key={savings.id} className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    {savings.name}
                  </CardTitle>
                  <CardDescription>Personal savings goal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress:</span>
                      <span>{Math.round((savings.balance / savings.target) * 100)}%</span>
                    </div>
                    <Progress value={(savings.balance / savings.target) * 100} />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Current:</span>
                      <CurrencyDisplay amount={savings.balance} showToggle={false} />
                    </div>
                    <div className="flex justify-between">
                      <span>Target:</span>
                      <CurrencyDisplay amount={savings.target} showToggle={false} />
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly goal:</span>
                      <CurrencyDisplay amount={savings.monthlyGoal} showToggle={false} />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button size="sm">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Add Funds
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Withdraw
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Create New Savings Goal</CardTitle>
              <CardDescription>Set up a new personal savings account</CardDescription>
            </CardHeader>
            <CardContent>
              <Button>
                <Target className="h-4 w-4 mr-2" />
                Create Savings Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {chamaWallet && (
          <TabsContent value="central" className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Chama Central Wallet
                </CardTitle>
                <CardDescription>Treasurer view - manage group funds</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <CurrencyDisplay 
                      amount={chamaWallet.centralBalance} 
                      className="text-2xl font-bold text-green-600"
                      showToggle={false}
                    />
                    <p className="text-sm text-muted-foreground">Total Balance</p>
                  </div>
                  <div className="text-center">
                    <CurrencyDisplay 
                      amount={chamaWallet.pendingContributions} 
                      className="text-2xl font-bold text-amber-600"
                      showToggle={false}
                    />
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{chamaWallet.totalMembers}</div>
                    <p className="text-sm text-muted-foreground">Members</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button>
                    <Send className="h-4 w-4 mr-2" />
                    Disburse Funds
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Payout Report
                  </Button>
                  <Button variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Member Balances
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default WalletDashboard;