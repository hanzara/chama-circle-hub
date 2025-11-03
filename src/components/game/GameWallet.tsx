
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Star,
  DollarSign,
  CreditCard,
  Smartphone,
  History,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GameWalletProps {
  balance: number;
  points: number;
  onBalanceUpdate: (newBalance: number) => void;
}

const GameWallet: React.FC<GameWalletProps> = ({ balance, points, onBalanceUpdate }) => {
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [mpesaPin, setMpesaPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // MOCK DATA - For testing purposes only
  const MOCK_BALANCE = 5000; // KSh 5,000 mock balance
  const MOCK_POINTS = 250; // 250 mock points
  const currentBalance = balance || MOCK_BALANCE;
  const currentPoints = points || MOCK_POINTS;

  const transactions = [
    { id: 1, type: 'deposit', amount: 1000, date: '2024-01-20', method: 'MOCK Deposit', status: 'completed' },
    { id: 2, type: 'earning', amount: 350, date: '2024-01-19', method: 'Game Win', status: 'completed' },
    { id: 3, type: 'earning', amount: 200, date: '2024-01-18', method: 'Tournament Prize', status: 'completed' },
    { id: 4, type: 'withdraw', amount: 500, date: '2024-01-17', method: 'MOCK M-Pesa', status: 'completed' },
    { id: 5, type: 'earning', amount: 150, date: '2024-01-16', method: 'Game Win', status: 'completed' },
    { id: 6, type: 'deposit', amount: 2000, date: '2024-01-15', method: 'MOCK Deposit', status: 'completed' },
  ];

  const handleDeposit = async () => {
    if (!depositAmount || !mpesaNumber || !mpesaPin) {
      toast({
        title: "Missing Information",
        description: "Please fill in all deposit details.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(depositAmount);
    if (amount < 10) {
      toast({
        title: "Invalid Amount",
        description: "Minimum deposit is KSh 10.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // MOCK TRANSACTION - Simulate M-Pesa integration
    setTimeout(() => {
      onBalanceUpdate(currentBalance + amount);
      setDepositAmount('');
      setMpesaPin('');
      setIsLoading(false);
      
      toast({
        title: "🎮 MOCK Deposit Successful!",
        description: `KSh ${amount} has been added to your wallet. (This is test money - not real)`,
      });
    }, 1500);
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !mpesaNumber || !mpesaPin) {
      toast({
        title: "Missing Information",
        description: "Please fill in all withdrawal details.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (amount < 50) {
      toast({
        title: "Invalid Amount",
        description: "Minimum withdrawal is KSh 50.",
        variant: "destructive",
      });
      return;
    }

    if (amount > currentBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough funds for this withdrawal.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // MOCK TRANSACTION - Simulate M-Pesa integration
    setTimeout(() => {
      onBalanceUpdate(currentBalance - amount);
      setWithdrawAmount('');
      setMpesaPin('');
      setIsLoading(false);
      
      toast({
        title: "🎮 MOCK Withdrawal Successful!",
        description: `KSh ${amount} has been sent to ${mpesaNumber}. (This is test money - not real)`,
      });
    }, 1500);
  };

  const convertPointsToMoney = () => {
    if (currentPoints < 100) {
      toast({
        title: "Not Enough Points",
        description: "You need at least 100 points to convert to money.",
        variant: "destructive",
      });
      return;
    }

    const moneyEarned = Math.floor(currentPoints * 0.1); // 10 points = 1 KSh
    onBalanceUpdate(currentBalance + moneyEarned);
    
    toast({
      title: "🎮 Points Converted! (MOCK)",
      description: `${currentPoints} points converted to KSh ${moneyEarned}. (This is test money)`,
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowUpCircle className="h-4 w-4 text-green-600" />;
      case 'withdraw':
        return <ArrowDownCircle className="h-4 w-4 text-red-600" />;
      case 'earning':
        return <Star className="h-4 w-4 text-yellow-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* MOCK TESTING NOTICE */}
      <Card className="border-2 border-yellow-500/50 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 animate-fade-in">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-full">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">🎮 Demo Mode - Test Money</h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                This is a testing environment with mock money. All transactions are simulated and not real. 
                You have <strong>KSh {MOCK_BALANCE.toLocaleString()}</strong> mock balance to play with!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Balance */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance (MOCK)</CardTitle>
            <Wallet className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">KSh {currentBalance.toLocaleString()}</div>
            <p className="text-xs text-green-600 dark:text-green-500">Test money for games</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-950/20 dark:to-amber-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Game Points (MOCK)</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{currentPoints.toLocaleString()}</div>
            <p className="text-xs text-yellow-600 dark:text-yellow-500">Convert to test money</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">KSh {Math.floor(currentPoints * 0.1)}</div>
            <p className="text-xs text-blue-600 dark:text-blue-500">From current points</p>
          </CardContent>
        </Card>
      </div>

      {/* Points Conversion */}
      {currentPoints >= 100 && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold">Convert Points to Money (MOCK)</h3>
              <p className="text-sm text-muted-foreground">
                You have {currentPoints.toLocaleString()} points worth KSh {Math.floor(currentPoints * 0.1)}
              </p>
              <Button 
                onClick={convertPointsToMoney}
                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
              >
                <Star className="h-4 w-4 mr-2" />
                Convert {currentPoints} Points → KSh {Math.floor(currentPoints * 0.1)}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deposit & Withdraw */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Deposit Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5 text-green-600" />
              Deposit Funds
            </CardTitle>
            <CardDescription>
              Add money to your game wallet via M-Pesa
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deposit-amount">Amount (KSh)</Label>
              <Input
                id="deposit-amount"
                type="number"
                placeholder="Enter amount (min. 10)"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                min="10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mpesa-number">M-Pesa Number</Label>
              <Input
                id="mpesa-number"
                type="tel"
                placeholder="07XXXXXXXX"
                value={mpesaNumber}
                onChange={(e) => setMpesaNumber(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mpesa-pin">M-Pesa PIN</Label>
              <Input
                id="mpesa-pin"
                type="password"
                placeholder="Enter your PIN"
                value={mpesaPin}
                onChange={(e) => setMpesaPin(e.target.value)}
                maxLength={4}
              />
            </div>
            
            <Button 
              onClick={handleDeposit} 
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                "Processing..."
              ) : (
                <>
                  <Smartphone className="h-4 w-4 mr-2" />
                  Deposit (MOCK TEST)
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Withdraw Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownCircle className="h-5 w-5 text-blue-600" />
              Withdraw Funds
            </CardTitle>
            <CardDescription>
              Withdraw your winnings to M-Pesa
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="withdraw-amount">Amount (KSh)</Label>
              <Input
                id="withdraw-amount"
                type="number"
                placeholder="Enter amount (min. 50)"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                min="50"
                max={currentBalance}
              />
              <p className="text-xs text-muted-foreground">
                Available: KSh {currentBalance.toLocaleString()} (MOCK)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="withdraw-mpesa">M-Pesa Number</Label>
              <Input
                id="withdraw-mpesa"
                type="tel"
                placeholder="07XXXXXXXX"
                value={mpesaNumber}
                onChange={(e) => setMpesaNumber(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="withdraw-pin">M-Pesa PIN</Label>
              <Input
                id="withdraw-pin"
                type="password"
                placeholder="Enter your PIN"
                value={mpesaPin}
                onChange={(e) => setMpesaPin(e.target.value)}
                maxLength={4}
              />
            </div>
            
            <Button 
              onClick={handleWithdraw} 
              disabled={isLoading || currentBalance < 50}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                "Processing..."
              ) : (
                <>
                  <Smartphone className="h-4 w-4 mr-2" />
                  Withdraw (MOCK TEST)
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaction History
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div 
                key={transaction.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getTransactionIcon(transaction.type)}
                  <div>
                    <div className="font-medium capitalize">
                      {transaction.type === 'earning' ? 'Game Earning' : transaction.type}
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.date} • {transaction.method}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`font-semibold ${
                    transaction.type === 'withdraw' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {transaction.type === 'withdraw' ? '-' : '+'}KSh {transaction.amount}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameWallet;
