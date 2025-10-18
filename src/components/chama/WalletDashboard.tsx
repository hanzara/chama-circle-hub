import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Wallet, Lock, RotateCcw, Target, DollarSign, Send, 
  Download, TrendingUp, Eye, EyeOff, Users, Calendar, ArrowUp, ArrowDown
} from 'lucide-react';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { useToast } from '@/hooks/use-toast';
import { useChamaMembers } from '@/hooks/useChamaMembers';
import { useWalletOperations, useCentralWallet } from '@/hooks/useWalletOperations';
import { usePersonalSavings } from '@/hooks/usePersonalSavings';
import { WalletOperationModal } from './WalletOperationModal';
import { PersonalSavingsContent } from './PersonalSavingsContent';
import { CentralWalletOverview } from './CentralWalletOverview';

interface WalletDashboardProps {
  user: any;
  chamaId: string;
  userRole?: string;
}

const WalletDashboard: React.FC<WalletDashboardProps> = ({ user, chamaId, userRole }) => {
  const [showBalances, setShowBalances] = useState(true);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { data: members } = useChamaMembers(chamaId);
  const { data: centralWallet } = useCentralWallet();
  const { walletData } = usePersonalSavings();
  
  const myMembership = members?.find(m => m.user_id === user?.id);
  const savingsBalance = myMembership?.savings_balance || 0;
  const mgrBalance = myMembership?.mgr_balance || 0;
  const withdrawalLocked = myMembership?.withdrawal_locked ?? true;
  
  // Calculate chama totals (for admin/treasurer view)
  const chamaTotalSavings = members?.reduce((sum, m) => sum + (m.savings_balance || 0), 0) || 0;
  const chamaTotalMGR = members?.reduce((sum, m) => sum + (m.mgr_balance || 0), 0) || 0;
  
  const isAdminOrTreasurer = userRole === 'admin' || userRole === 'treasurer';
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'send':
        setSendOpen(true);
        break;
      case 'withdraw':
        if (withdrawalLocked) {
          toast({
            title: "Withdrawal Locked",
            description: "MGR withdrawals are locked. Contact admin to unlock.",
            variant: "destructive",
          });
        } else {
          setWithdrawOpen(true);
        }
        break;
      case 'topup':
        setTopUpOpen(true);
        break;
    }
  };

  const SavingsWalletCard = () => (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-blue-600" />
            <CardTitle>Chama Savings Wallet</CardTitle>
          </div>
          <Badge variant="secondary">Locked</Badge>
        </div>
        <CardDescription>Your accumulated savings in this chama</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Balance:</span>
          <CurrencyDisplay 
            amount={showBalances ? savingsBalance : 0} 
            className="text-3xl font-bold text-blue-600"
            showToggle={false}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Funds locked until contribution period ends
        </div>
      </CardContent>
    </Card>
  );

  const MGRWalletCard = () => (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-green-600" />
            <CardTitle>Merry-Go-Round Wallet</CardTitle>
          </div>
          {withdrawalLocked ? (
            <Badge variant="destructive" className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Locked
            </Badge>
          ) : (
            <Badge variant="default" className="flex items-center gap-1">
              Active
            </Badge>
          )}
        </div>
        <CardDescription>Your payout wallet for merry-go-round turns</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Balance:</span>
          <CurrencyDisplay 
            amount={showBalances ? mgrBalance : 0} 
            className="text-3xl font-bold text-green-600"
            showToggle={false}
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <Button 
            onClick={() => handleQuickAction('topup')} 
            variant="outline" 
            className="w-full justify-start"
            size="sm"
          >
            <ArrowUp className="h-4 w-4 mr-2" />
            Top Up from Central Wallet
          </Button>
          
          <Button 
            onClick={() => handleQuickAction('withdraw')} 
            disabled={withdrawalLocked || mgrBalance === 0}
            variant="outline" 
            className="w-full justify-start"
            size="sm"
          >
            <ArrowDown className="h-4 w-4 mr-2" />
            Withdraw to M-Pesa / Bank
          </Button>
          
          <Button 
            onClick={() => handleQuickAction('send')} 
            disabled={mgrBalance === 0}
            variant="outline" 
            className="w-full justify-start"
            size="sm"
          >
            <Send className="h-4 w-4 mr-2" />
            Send to Member
          </Button>
        </div>

        {withdrawalLocked && (
          <div className="text-xs text-muted-foreground bg-yellow-50 p-2 rounded">
            🔒 Withdrawals locked until it's your turn or admin unlocks
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
        <TabsList className={`grid w-full ${isAdminOrTreasurer ? 'grid-cols-4' : 'grid-cols-3'}`}>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="chama">Chama Wallets</TabsTrigger>
          <TabsTrigger value="savings">Personal Savings</TabsTrigger>
          {isAdminOrTreasurer && <TabsTrigger value="central">Central Wallet</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Total Balance Summary */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-muted-foreground">Total Net Worth</h3>
                  <CurrencyDisplay 
                    amount={showBalances ? (savingsBalance + mgrBalance) : 0}
                    className="text-4xl font-bold"
                    showToggle={false}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBalances(!showBalances)}
                    className="mt-2"
                  >
                    {showBalances ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {showBalances ? 'Hide' : 'Show'} Balances
                  </Button>
                </div>
                <Wallet className="h-12 w-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          {/* Wallet Overview Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <SavingsWalletCard />
            <MGRWalletCard />
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Savings Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <CurrencyDisplay amount={savingsBalance} className="text-xl font-bold" showToggle={false} />
                <p className="text-xs text-muted-foreground mt-1">Locked until sharing</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">MGR Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <CurrencyDisplay amount={mgrBalance} className="text-xl font-bold" showToggle={false} />
                <p className="text-xs text-muted-foreground mt-1">{withdrawalLocked ? 'Locked' : 'Available'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Central Wallet</CardTitle>
              </CardHeader>
              <CardContent>
                <CurrencyDisplay amount={centralWallet?.balance || 0} className="text-xl font-bold" showToggle={false} />
                <p className="text-xs text-muted-foreground mt-1">Available for top-up</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="chama" className="space-y-6">
          <div className="grid gap-6">
            <SavingsWalletCard />
            <MGRWalletCard />
          </div>
        </TabsContent>

        <TabsContent value="savings" className="space-y-6">
          <PersonalSavingsContent />
          
          <CentralWalletOverview />
        </TabsContent>

        {isAdminOrTreasurer && (
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
                      amount={chamaTotalSavings} 
                      className="text-2xl font-bold text-green-600"
                      showToggle={false}
                    />
                    <p className="text-sm text-muted-foreground">Total Savings</p>
                  </div>
                  <div className="text-center">
                    <CurrencyDisplay 
                      amount={chamaTotalMGR} 
                      className="text-2xl font-bold text-amber-600"
                      showToggle={false}
                    />
                    <p className="text-sm text-muted-foreground">Total MGR</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{members?.length || 0}</div>
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
                    Download Report
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/chamas/' + chamaId + '/members')}>
                    <Users className="h-4 w-4 mr-2" />
                    Manage Members
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Modals */}
      <WalletOperationModal
        open={topUpOpen}
        onOpenChange={setTopUpOpen}
        chamaId={chamaId}
        operation="topup"
        currentMGRBalance={mgrBalance}
      />

      <WalletOperationModal
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        chamaId={chamaId}
        operation="withdraw"
        currentMGRBalance={mgrBalance}
      />

      <WalletOperationModal
        open={sendOpen}
        onOpenChange={setSendOpen}
        chamaId={chamaId}
        operation="send"
        currentMGRBalance={mgrBalance}
        members={members}
      />
    </div>
  );
};

export default WalletDashboard;