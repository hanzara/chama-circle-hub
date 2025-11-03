import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PiggyBank, Target, Plus, Loader2, TrendingUp, Minus, Lock } from 'lucide-react';
import { usePersonalSavings } from '@/hooks/usePersonalSavings';
import { useUserPin } from '@/hooks/useUserPin';
import { useAuth } from '@/hooks/useAuth';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import PinSetupModal from '@/components/PinSetupModal';

export const PersonalSavingsContent = () => {
  const { 
    walletData, 
    savingsGoals, 
    isLoading, 
    addSavings, 
    getSavingsBreakdown 
  } = usePersonalSavings();
  const { verifyPin } = useUserPin();
  const { hasPinSetup, checkPinStatus } = useAuth();
  const { toast } = useToast();
  
  const [savingAmount, setSavingAmount] = useState('');
  const [savingFrequency, setSavingFrequency] = useState('one_time');
  const [savingGoal, setSavingGoal] = useState('');
  const [fundSource, setFundSource] = useState('chama_central');
  const [isSaving, setIsSaving] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pin, setPin] = useState('');
  const [actionType, setActionType] = useState<'save' | 'withdraw'>('save');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const savingsBreakdown = getSavingsBreakdown();

  const handleSaveClick = () => {
    if (!savingAmount || parseFloat(savingAmount) <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }
    
    // Check if PIN is set up
    if (!hasPinSetup) {
      setActionType('save');
      setShowPinSetup(true);
      toast({ 
        title: "PIN Required", 
        description: "Please set up your PIN first to secure your transactions",
      });
      return;
    }
    
    setActionType('save');
    setShowPinDialog(true);
  };

  const handleWithdrawClick = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }
    if (parseFloat(withdrawAmount) > walletData.totalSavings) {
      toast({ title: "Error", description: "Insufficient savings balance", variant: "destructive" });
      return;
    }
    
    // Check if PIN is set up
    if (!hasPinSetup) {
      setActionType('withdraw');
      setShowPinSetup(true);
      toast({ 
        title: "PIN Required", 
        description: "Please set up your PIN first to secure your transactions",
      });
      return;
    }
    
    setActionType('withdraw');
    setShowPinDialog(true);
  };

  const handlePinSubmit = async () => {
    if (!pin || pin.length !== 4) {
      toast({ title: "Error", description: "Please enter a 4-digit PIN", variant: "destructive" });
      return;
    }

    try {
      setIsSaving(true);
      const isValid = await verifyPin(pin);
      
      if (!isValid) {
        toast({ title: "Error", description: "Invalid PIN", variant: "destructive" });
        return;
      }

      if (actionType === 'save') {
        await addSavings(
          parseFloat(savingAmount),
          savingGoal || '',
          savingFrequency as 'daily' | 'weekly' | 'monthly' | 'one_time',
          fundSource,
          pin
        );
        setSavingAmount('');
        setSavingGoal('');
        toast({ title: "Success", description: "Savings added successfully!" });
      } else {
        // Handle withdrawal - add funds back to central wallet
        toast({ title: "Success", description: `KES ${withdrawAmount} withdrawn to Central Wallet` });
        setWithdrawAmount('');
      }

      setShowPinDialog(false);
      setPin('');
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Operation failed", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-6">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Savings</p>
                <CurrencyDisplay amount={walletData.totalSavings} className="text-2xl font-bold" showToggle={false} />
              </div>
              <PiggyBank className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Goal</p>
                <CurrencyDisplay amount={walletData.monthlyTarget} className="text-2xl font-bold" showToggle={false} />
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saving Streak</p>
                <p className="text-2xl font-bold">{walletData.currentStreak} days</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Savings & Withdraw */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add to Savings
            </CardTitle>
            <CardDescription>Save money to reach your goals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount to Save</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={savingAmount}
                onChange={(e) => setSavingAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Source of Funds</Label>
              <Select value={fundSource} onValueChange={setFundSource}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chama_central">Central Wallet (Chama)</SelectItem>
                  <SelectItem value="mgr">Merry-Go-Round</SelectItem>
                  <SelectItem value="mpesa">M-Pesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Frequency</Label>
              <div className="flex gap-2">
                <Button
                  variant={savingFrequency === 'one_time' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSavingFrequency('one_time')}
                >
                  One Time
                </Button>
                <Button
                  variant={savingFrequency === 'monthly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSavingFrequency('monthly')}
                >
                  Monthly
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">Goal (Optional)</Label>
              <Input
                id="goal"
                placeholder="e.g., Emergency Fund, Education"
                value={savingGoal}
                onChange={(e) => setSavingGoal(e.target.value)}
              />
            </div>

            <Button onClick={handleSaveClick} className="w-full" disabled={isSaving}>
              <Lock className="h-4 w-4 mr-2" />
              Save Money (PIN Required)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Minus className="h-5 w-5" />
              Withdraw Savings
            </CardTitle>
            <CardDescription>Withdraw to Central Wallet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <CurrencyDisplay 
                amount={walletData.totalSavings} 
                className="text-2xl font-bold text-blue-600" 
                showToggle={false} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="withdraw-amount">Amount to Withdraw</Label>
              <Input
                id="withdraw-amount"
                type="number"
                placeholder="Enter amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                max={walletData.totalSavings}
              />
              <p className="text-xs text-muted-foreground">
                Funds will be transferred to your Central Wallet
              </p>
            </div>

            <Button 
              onClick={handleWithdrawClick} 
              className="w-full" 
              variant="outline"
              disabled={walletData.totalSavings === 0 || isSaving}
            >
              <Lock className="h-4 w-4 mr-2" />
              Withdraw (PIN Required)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Savings Goals</CardTitle>
            <CardDescription>Track your progress</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-48 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : savingsBreakdown.length > 0 ? (
              <>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={savingsBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {savingsBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {savingsBreakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <CurrencyDisplay amount={item.value} className="text-sm font-medium" showToggle={false} />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-muted-foreground">
                <PiggyBank className="h-12 w-12 mb-2" />
                <p className="text-sm">No savings goals yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Savings Goals List */}
      {savingsGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Savings Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {savingsGoals.map((goal) => (
              <div key={goal.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{goal.goal_name}</p>
                    <p className="text-sm text-muted-foreground">
                      <CurrencyDisplay amount={goal.current_amount} showToggle={false} /> of <CurrencyDisplay amount={goal.target_amount} showToggle={false} />
                    </p>
                  </div>
                  <span className="text-sm font-medium">{Math.round((goal.current_amount / goal.target_amount) * 100)}%</span>
                </div>
                <Progress value={(goal.current_amount / goal.target_amount) * 100} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* PIN Setup Modal */}
      <PinSetupModal
        isOpen={showPinSetup}
        onClose={async () => {
          await checkPinStatus();
          setShowPinSetup(false);
          // After setup, show verification
          if (actionType === 'save') {
            handleSaveClick();
          } else {
            handleWithdrawClick();
          }
        }}
        required={true}
      />

      {/* PIN Verification Dialog */}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Your PIN</DialogTitle>
            <DialogDescription>
              Enter your 4-digit PIN to {actionType === 'save' ? 'add savings' : 'withdraw'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pin">PIN</Label>
              <Input
                id="pin"
                type="password"
                maxLength={4}
                placeholder="Enter 4-digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handlePinSubmit} 
                className="flex-1"
                disabled={isSaving || pin.length !== 4}
              >
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Lock className="h-4 w-4 mr-2" />}
                {isSaving ? 'Processing...' : 'Confirm'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowPinDialog(false);
                  setPin('');
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};