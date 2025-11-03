
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Smartphone, CreditCard, Building2, CheckCircle, Clock, AlertTriangle, PiggyBank, Crown } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import CurrencyDisplay from '@/components/CurrencyDisplay';
import ContributionTracker from './ContributionTracker';
import MultipleSavingsAccounts from './MultipleSavingsAccounts';
import PremiumFeaturesHub from '../premium/PremiumFeaturesHub';

interface EnhancedSavingsContributionsProps {
  chamaData: any;
}

const EnhancedSavingsContributions: React.FC<EnhancedSavingsContributionsProps> = ({ chamaData }) => {
  const [contributionAmount, setContributionAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('mpesa');
  const [paymentReference, setPaymentReference] = useState('');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleContribution = async () => {
    if (!contributionAmount || !phoneNumber) {
      toast({
        title: "Missing Information",
        description: "Please enter both amount and phone number",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/contributions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          chamaId: chamaData.id,
          amount: parseFloat(contributionAmount),
          paymentMethod: selectedMethod,
          paymentReference,
          notes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Contribution Recorded! 🎉",
          description: "Your contribution has been successfully recorded",
        });
        
        // Reset form
        setContributionAmount('');
        setPhoneNumber('');
        setPaymentReference('');
        setNotes('');
      } else {
        throw new Error(data.error || 'Failed to record contribution');
      }
    } catch (error: any) {
      console.error('Contribution failed:', error);
      toast({
        title: "Contribution Failed",
        description: error.message || "Failed to record contribution",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getNextContributionDue = () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return nextMonth.toLocaleDateString();
  };

  const contributionStatus = {
    thisMonth: true, // This would come from actual data
    amount: chamaData.contributionAmount || 15000,
    dueDate: getNextContributionDue(),
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Enhanced Savings & Contributions</h2>
        <p className="text-muted-foreground">Advanced contribution management and tracking</p>
      </div>

      <Tabs defaultValue="contribute" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="contribute">Make Contribution</TabsTrigger>
          <TabsTrigger value="tracker">Contribution Tracker</TabsTrigger>
          <TabsTrigger value="savings">Multiple Savings</TabsTrigger>
          <TabsTrigger value="premium">Premium Features</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="contribute" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Enhanced Contribution Form */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Record Contribution
                </CardTitle>
                <CardDescription>
                  Record your monthly contribution with detailed tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contribution Status Alert */}
                <div className={`p-3 rounded-lg border ${
                  contributionStatus.thisMonth 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-orange-50 border-orange-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {contributionStatus.thisMonth ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                    )}
                    <span className="text-sm font-medium">
                      {contributionStatus.thisMonth 
                        ? 'This month\'s contribution: Complete' 
                        : 'This month\'s contribution: Pending'
                      }
                    </span>
                  </div>
                  <p className="text-xs mt-1">
                    Expected: <CurrencyDisplay amount={contributionStatus.amount} /> | 
                    Due: {contributionStatus.dueDate}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Contribution Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount (KES)"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended: <CurrencyDisplay amount={chamaData.contributionAmount || 15000} />
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Payment Method *</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={selectedMethod === 'mpesa' ? 'default' : 'outline'}
                      onClick={() => setSelectedMethod('mpesa')}
                      className="flex flex-col items-center h-16"
                    >
                      <Smartphone className="h-4 w-4" />
                      <span className="text-xs">M-Pesa</span>
                    </Button>
                    <Button
                      variant={selectedMethod === 'bank_transfer' ? 'default' : 'outline'}
                      onClick={() => setSelectedMethod('bank_transfer')}
                      className="flex flex-col items-center h-16"
                    >
                      <Building2 className="h-4 w-4" />
                      <span className="text-xs">Bank</span>
                    </Button>
                    <Button
                      variant={selectedMethod === 'cash' ? 'default' : 'outline'}
                      onClick={() => setSelectedMethod('cash')}
                      className="flex flex-col items-center h-16"
                    >
                      <CreditCard className="h-4 w-4" />
                      <span className="text-xs">Cash</span>
                    </Button>
                  </div>
                </div>

                {selectedMethod === 'mpesa' && (
                  <div className="space-y-2">
                    <Label htmlFor="phone">M-Pesa Phone Number *</Label>
                    <Input
                      id="phone"
                      placeholder="254712345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="reference">Payment Reference</Label>
                  <Input
                    id="reference"
                    placeholder="Transaction ID or reference number"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Additional notes or comments"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={handleContribution} 
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Recording...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Record Contribution
                    </>
                  )}
                </Button>

                <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium mb-1">Recording Process:</p>
                  <p>1. Enter contribution details</p>
                  <p>2. Contribution is recorded immediately</p>
                  <p>3. Your balance and member stats are updated</p>
                  <p>4. Activity is logged for transparency</p>
                </div>
              </CardContent>
            </Card>

            {/* Contribution Summary */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Your Contribution Summary</CardTitle>
                <CardDescription>Track your contribution progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Monthly Target:</span>
                    <span className="font-bold">
                      <CurrencyDisplay amount={chamaData.contributionAmount || 15000} />
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>This Month:</span>
                    <span className="font-bold text-green-600">
                      <CurrencyDisplay amount={15000} />
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Contributed:</span>
                    <span className="font-bold">
                      <CurrencyDisplay amount={125000} />
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Status:</span>
                    <Badge className="bg-green-100 text-green-800">Up to Date</Badge>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Recent Contributions</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Dec 2024</span>
                      <span><CurrencyDisplay amount={15000} /></span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Nov 2024</span>
                      <span><CurrencyDisplay amount={15000} /></span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Oct 2024</span>
                      <span><CurrencyDisplay amount={15000} /></span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Contribution Streak</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">8 months</Badge>
                    <span className="text-sm text-muted-foreground">Keep it up!</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tracker">
          <ContributionTracker chamaData={chamaData} />
        </TabsContent>

        <TabsContent value="savings" className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <PiggyBank className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Multiple Savings Accounts</h3>
          </div>
          <MultipleSavingsAccounts chamaId={chamaData?.id} />
        </TabsContent>

        <TabsContent value="premium" className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="h-5 w-5 text-purple-500" />
            <h3 className="text-lg font-semibold">Premium Features</h3>
          </div>
          <PremiumFeaturesHub />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contribution Analytics</CardTitle>
              <CardDescription>Detailed analysis of contribution patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Advanced analytics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedSavingsContributions;
