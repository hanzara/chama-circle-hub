
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import { 
  Shield, 
  TrendingUp, 
  Coins, 
  Calculator,
  Lock,
  Clock,
  AlertCircle,
  CheckCircle,
  Wallet,
  Zap
} from 'lucide-react';

const BlockchainLendingPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loanAmount, setLoanAmount] = useState('');
  const [collateralAsset, setCollateralAsset] = useState('BTC');
  const [loanTerm, setLoanTerm] = useState(30);
  const [ltv, setLtv] = useState([60]);

  const collateralAssets = [
    { symbol: 'BTC', name: 'Bitcoin', price: 8520000, apy: 12.5, maxLTV: 70 },
    { symbol: 'ETH', name: 'Ethereum', price: 620000, apy: 15.2, maxLTV: 65 },
    { symbol: 'USDC', name: 'USD Coin', price: 154.50, apy: 8.5, maxLTV: 85 },
    { symbol: 'USDT', name: 'Tether', price: 154.30, apy: 8.8, maxLTV: 85 },
  ];

  const activeLoanPools = [
    {
      id: 1,
      name: 'DeFi Yield Pool',
      totalValue: 125000000,
      apy: 12.8,
      utilization: 78,
      availableLiquidity: 27500000,
      riskScore: 'Low'
    },
    {
      id: 2,
      name: 'Stable Lending Pool',
      totalValue: 89000000,
      apy: 9.2,
      utilization: 65,
      availableLiquidity: 31150000,
      riskScore: 'Very Low'
    },
  ];

  const myLoans = [
    {
      id: 1,
      amount: 50000,
      collateralAsset: 'BTC',
      collateralAmount: 0.008,
      currentLTV: 58,
      liquidationPrice: 7200000,
      interestRate: 12.5,
      dueDate: '2024-12-25',
      status: 'active'
    },
  ];

  const calculateCollateralNeeded = () => {
    if (!loanAmount || !collateralAsset) return 0;
    const asset = collateralAssets.find(a => a.symbol === collateralAsset);
    if (!asset) return 0;
    return (parseFloat(loanAmount) / (ltv[0] / 100)) / asset.price;
  };

  const calculateLiquidationPrice = () => {
    if (!loanAmount || !collateralAsset) return 0;
    const asset = collateralAssets.find(a => a.symbol === collateralAsset);
    if (!asset) return 0;
    const collateralNeeded = calculateCollateralNeeded();
    return (parseFloat(loanAmount) * 1.1) / collateralNeeded; // 10% buffer for liquidation
  };

  const handleApplyLoan = () => {
    if (!loanAmount || !collateralAsset) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Loan Application Submitted! 🚀",
      description: `Your collateralized loan for KES ${parseFloat(loanAmount).toLocaleString()} is being processed`,
    });
  };

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Blockchain Lending</h1>
          <p className="text-muted-foreground">Secure loans backed by cryptocurrency collateral</p>
        </div>

        <Tabs defaultValue="borrow" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="borrow">Borrow</TabsTrigger>
            <TabsTrigger value="lend">Lend</TabsTrigger>
            <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
          </TabsList>

          <TabsContent value="borrow" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Loan Application */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="w-5 h-5" />
                    Apply for Collateralized Loan
                  </CardTitle>
                  <CardDescription>Borrow against your crypto assets</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Loan Amount (KES)</Label>
                      <Input 
                        type="number" 
                        placeholder="Enter amount"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Collateral Asset</Label>
                      <Select value={collateralAsset} onValueChange={setCollateralAsset}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {collateralAssets.map((asset) => (
                            <SelectItem key={asset.symbol} value={asset.symbol}>
                              {asset.name} ({asset.symbol})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Loan-to-Value Ratio: {ltv[0]}%</Label>
                      <Badge variant="outline">Max: {collateralAssets.find(a => a.symbol === collateralAsset)?.maxLTV || 70}%</Badge>
                    </div>
                    <Slider
                      value={ltv}
                      onValueChange={setLtv}
                      max={collateralAssets.find(a => a.symbol === collateralAsset)?.maxLTV || 70}
                      min={30}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label>Loan Term (Days)</Label>
                    <Select value={loanTerm.toString()} onValueChange={(value) => setLoanTerm(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 Days</SelectItem>
                        <SelectItem value="60">60 Days</SelectItem>
                        <SelectItem value="90">90 Days</SelectItem>
                        <SelectItem value="180">180 Days</SelectItem>
                        <SelectItem value="365">365 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleApplyLoan} className="w-full">
                    Apply for Loan
                  </Button>
                </CardContent>
              </Card>

              {/* Loan Calculator */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Loan Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loanAmount && collateralAsset && (
                    <>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Collateral Required</div>
                        <div className="font-semibold">
                          {calculateCollateralNeeded().toFixed(6)} {collateralAsset}
                        </div>
                      </div>

                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Liquidation Price</div>
                        <div className="font-semibold text-red-600">
                          KES {calculateLiquidationPrice().toLocaleString()}
                        </div>
                      </div>

                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Interest Rate</div>
                        <div className="font-semibold text-green-600">
                          {collateralAssets.find(a => a.symbol === collateralAsset)?.apy || 0}% APY
                        </div>
                      </div>

                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Total Repayment</div>
                        <div className="font-semibold">
                          KES {(parseFloat(loanAmount) * (1 + ((collateralAssets.find(a => a.symbol === collateralAsset)?.apy || 0) / 100) * (loanTerm / 365))).toLocaleString()}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="lend" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeLoanPools.map((pool) => (
                <Card key={pool.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {pool.name}
                      <Badge variant={pool.riskScore === 'Low' ? 'default' : 'secondary'}>
                        {pool.riskScore} Risk
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Earn {pool.apy}% APY by providing liquidity
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Total Value</div>
                        <div className="font-semibold">KES {pool.totalValue.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Available</div>
                        <div className="font-semibold">KES {pool.availableLiquidity.toLocaleString()}</div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Utilization</span>
                        <span>{pool.utilization}%</span>
                      </div>
                      <Progress value={pool.utilization} className="h-2" />
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1">
                        Deposit
                      </Button>
                      <Button variant="outline" className="flex-1">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  My Active Loans
                </CardTitle>
              </CardHeader>
              <CardContent>
                {myLoans.length > 0 ? (
                  <div className="space-y-4">
                    {myLoans.map((loan) => (
                      <div key={loan.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="font-semibold">
                              KES {loan.amount.toLocaleString()} Loan
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Collateral: {loan.collateralAmount} {loan.collateralAsset}
                            </div>
                          </div>
                          <Badge variant={loan.status === 'active' ? 'default' : 'secondary'}>
                            {loan.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Current LTV</div>
                            <div className="font-semibold">{loan.currentLTV}%</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Interest Rate</div>
                            <div className="font-semibold">{loan.interestRate}%</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Liquidation Price</div>
                            <div className="font-semibold text-red-600">
                              KES {loan.liquidationPrice.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Due Date</div>
                            <div className="font-semibold">{loan.dueDate}</div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Add Collateral
                          </Button>
                          <Button size="sm" variant="outline">
                            Partial Repay
                          </Button>
                          <Button size="sm">
                            Full Repayment
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No active loans</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default BlockchainLendingPage;
