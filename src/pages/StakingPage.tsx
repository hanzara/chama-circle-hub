import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, TrendingUp, Coins, Zap, Clock, Plus, Minus, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';

const StakingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [stakeDialogOpen, setStakeDialogOpen] = useState(false);
  const [unstakeDialogOpen, setUnstakeDialogOpen] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [selectedPool, setSelectedPool] = useState<string | null>(null);
  const [selectedRisk, setSelectedRisk] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showMyStakes, setShowMyStakes] = useState(false);

  const stakingPools = [
    {
      id: '1',
      name: 'ETH Staking Pool',
      token: 'ETH',
      apy: 12.5,
      tvl: '1.2M',
      risk: 'low',
      type: 'flexible',
      lockPeriod: 'Flexible',
      minStake: 0.1,
      userStake: 5.2,
    },
    {
      id: '2',
      name: 'BTC Validator Pool',
      token: 'BTC',
      apy: 9.8,
      tvl: '850K',
      risk: 'medium',
      type: 'validator',
      lockPeriod: '90 Days',
      minStake: 0.01,
      userStake: 0.00,
    },
    {
      id: '3',
      name: 'USDC Yield Farm',
      token: 'USDC',
      apy: 18.0,
      tvl: '2.5M',
      risk: 'high',
      type: 'farming',
      lockPeriod: '30 Days',
      minStake: 100,
      userStake: 1250,
    },
    {
      id: '4',
      name: 'DOT Staking Pool',
      token: 'DOT',
      apy: 14.2,
      tvl: '980K',
      risk: 'low',
      type: 'flexible',
      lockPeriod: 'Flexible',
      minStake: 1,
      userStake: 220,
    },
    {
      id: '5',
      name: 'ADA Validator Pool',
      token: 'ADA',
      apy: 11.5,
      tvl: '720K',
      risk: 'medium',
      type: 'validator',
      lockPeriod: '60 Days',
      minStake: 50,
      userStake: 0,
    },
    {
      id: '6',
      name: 'SOL Yield Farm',
      token: 'SOL',
      apy: 21.0,
      tvl: '3.1M',
      risk: 'high',
      type: 'farming',
      lockPeriod: '45 Days',
      minStake: 5,
      userStake: 60,
    },
  ];

  const filteredPools = stakingPools.filter((pool) => {
    if (selectedRisk !== 'all' && pool.risk !== selectedRisk) {
      return false;
    }
    if (selectedType !== 'all' && pool.type !== selectedType) {
      return false;
    }
    if (showMyStakes && pool.userStake === 0) {
      return false;
    }
    return true;
  });

  const handleStakeClick = (poolId: string) => {
    setSelectedPool(poolId);
    setStakeDialogOpen(true);
  };

  const handleUnstakeClick = (poolId: string) => {
    setSelectedPool(poolId);
    setUnstakeDialogOpen(true);
  };

  const handleStake = () => {
    if (!selectedPool || !stakeAmount) return;
    
    const pool = stakingPools.find(p => p.id === selectedPool);
    if (!pool) return;

    // Simulate staking
    toast({
      title: "Staking Successful",
      description: `Successfully staked ${stakeAmount} ${pool.token}`,
    });

    setStakeDialogOpen(false);
    setStakeAmount('');
  };

  const handleUnstake = () => {
    if (!selectedPool || !unstakeAmount) return;
    
    const pool = stakingPools.find(p => p.id === selectedPool);
    if (!pool) return;

    toast({
      title: "Unstaking Initiated",
      description: `Unstaking ${unstakeAmount} ${pool.token}. Funds will be available after the lock period.`,
    });

    setUnstakeDialogOpen(false);
    setUnstakeAmount('');
  };

  const calculateRewards = (principal: number, apy: number, days: number) => {
    return (principal * (apy / 100) * days) / 365;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Staking Pools
              </h1>
              <p className="text-muted-foreground text-lg">
                Earn passive rewards by staking your tokens
              </p>
            </div>
          </div>

          {/* Portfolio Overview */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Staked</p>
                    <p className="text-2xl font-bold">$12,450</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Coins className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Rewards</p>
                    <p className="text-2xl font-bold">$892.50</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Zap className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg APY</p>
                    <p className="text-2xl font-bold">15.2%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Pools</p>
                    <p className="text-2xl font-bold">6</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Select value={selectedRisk} onValueChange={setSelectedRisk}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risks</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
                <SelectItem value="fixed">Fixed Term</SelectItem>
                <SelectItem value="validator">Validator</SelectItem>
                <SelectItem value="farming">Yield Farming</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={showMyStakes ? "default" : "outline"}
              onClick={() => setShowMyStakes(!showMyStakes)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              My Stakes Only
            </Button>
          </div>

          {/* Staking Pools Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPools.map((pool) => (
              <Card key={pool.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {pool.token.slice(0, 2)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{pool.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{pool.token}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={pool.risk === 'low' ? 'secondary' : pool.risk === 'medium' ? 'default' : 'destructive'}
                    >
                      {pool.risk} risk
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">APY</p>
                      <p className="text-2xl font-bold text-green-600">{pool.apy}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">TVL</p>
                      <p className="text-lg font-semibold">${pool.tvl}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Lock Period</span>
                      <span className="font-medium">{pool.lockPeriod}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Min Stake</span>
                      <span className="font-medium">{pool.minStake} {pool.token}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Your Stake</span>
                      <span className="font-medium">${pool.userStake}</span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <Button 
                      onClick={() => handleStakeClick(pool.id)}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Stake
                    </Button>
                    {pool.userStake > 0 && (
                      <Button 
                        variant="outline"
                        onClick={() => handleUnstakeClick(pool.id)}
                        className="w-full"
                      >
                        <Minus className="h-4 w-4 mr-2" />
                        Unstake
                      </Button>
                    )}
                  </div>

                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Estimated Daily Rewards</p>
                    <p className="font-semibold">
                      ${calculateRewards(pool.userStake, pool.apy, 1).toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stake Dialog */}
          <Dialog open={stakeDialogOpen} onOpenChange={setStakeDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Stake Tokens</DialogTitle>
                <DialogDescription>
                  Choose the amount you want to stake in this pool
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="stakeAmount">Amount to Stake</Label>
                  <Input
                    id="stakeAmount"
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleStake} className="flex-1">
                    Confirm Stake
                  </Button>
                  <Button variant="outline" onClick={() => setStakeDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Unstake Dialog */}
          <Dialog open={unstakeDialogOpen} onOpenChange={setUnstakeDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Unstake Tokens</DialogTitle>
                <DialogDescription>
                  Choose the amount you want to unstake from this pool
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="unstakeAmount">Amount to Unstake</Label>
                  <Input
                    id="unstakeAmount"
                    type="number"
                    value={unstakeAmount}
                    onChange={(e) => setUnstakeAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleUnstake} className="flex-1">
                    Confirm Unstake
                  </Button>
                  <Button variant="outline" onClick={() => setUnstakeDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
};

export default StakingPage;
