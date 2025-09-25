import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CreditCard, Smartphone, Building, DollarSign, Target, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSmartFinance } from '@/hooks/useSmartFinance';
import { useMpesaIntegration } from '@/hooks/useMpesaIntegration';
import CurrencyDisplay from '@/components/CurrencyDisplay';

interface GoalContributionModalProps {
  goal: any;
  isOpen: boolean;
  onClose: () => void;
}

const GoalContributionModal: React.FC<GoalContributionModalProps> = ({
  goal,
  isOpen,
  onClose
}) => {
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { addTransaction } = useSmartFinance();
  const { stkPushMutation } = useMpesaIntegration();

  const progressPercentage = goal ? (goal.current_amount / goal.target_amount) * 100 : 0;
  const remainingAmount = goal ? goal.target_amount - goal.current_amount : 0;

  const handleMpesaPayment = async () => {
    if (!amount || !phoneNumber) {
      toast({
        title: "Missing Information",
        description: "Please enter amount and phone number",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      await stkPushMutation.mutateAsync({
        phoneNumber,
        amount: parseFloat(amount),
        description: `Contribution to ${goal.title}`,
        purpose: 'other',
        chamaId: undefined
      });

      // Add transaction record
      await addTransaction({
        amount: parseFloat(amount),
        category: 'savings',
        description: `Goal contribution: ${goal.title}`,
        transaction_type: 'savings',
        payment_method: 'mpesa',
        transaction_date: new Date().toISOString().split('T')[0],
        auto_categorized: false
      });

      toast({
        title: "Payment Initiated",
        description: "Check your phone for M-Pesa prompt",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Unable to process M-Pesa payment",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAirtelPayment = async () => {
    if (!amount || !phoneNumber) {
      toast({
        title: "Missing Information",
        description: "Please enter amount and phone number",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate Airtel Money payment
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Add transaction record
      await addTransaction({
        amount: parseFloat(amount),
        category: 'savings',
        description: `Goal contribution: ${goal.title}`,
        transaction_type: 'savings',
        payment_method: 'airtel_money',
        transaction_date: new Date().toISOString().split('T')[0],
        auto_categorized: false
      });

      toast({
        title: "Payment Successful",
        description: "Airtel Money payment processed successfully",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Unable to process Airtel Money payment",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBankTransfer = async () => {
    if (!amount || !bankAccount) {
      toast({
        title: "Missing Information",
        description: "Please enter amount and bank account details",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate bank transfer
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Add transaction record
      await addTransaction({
        amount: parseFloat(amount),
        category: 'savings',
        description: `Goal contribution: ${goal.title}`,
        transaction_type: 'savings',
        payment_method: 'bank_transfer',
        transaction_date: new Date().toISOString().split('T')[0],
        auto_categorized: false
      });

      toast({
        title: "Transfer Initiated",
        description: "Bank transfer has been initiated and will be processed within 1-2 business days",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Transfer Failed",
        description: "Unable to process bank transfer",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!goal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Contribute to Goal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Goal Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{goal.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Current</p>
                  <p className="font-semibold">
                    <CurrencyDisplay amount={goal.current_amount} showToggle={false} />
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Target</p>
                  <p className="font-semibold">
                    <CurrencyDisplay amount={goal.target_amount} showToggle={false} />
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  Remaining: <CurrencyDisplay amount={remainingAmount} showToggle={false} />
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Contribution Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount in KES"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Payment Methods */}
          <Tabs defaultValue="mpesa">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="mpesa" className="flex items-center gap-1 text-xs">
                <Smartphone className="h-3 w-3" />
                M-Pesa
              </TabsTrigger>
              <TabsTrigger value="airtel" className="flex items-center gap-1 text-xs">
                <Smartphone className="h-3 w-3" />
                Airtel
              </TabsTrigger>
              <TabsTrigger value="bank" className="flex items-center gap-1 text-xs">
                <Building className="h-3 w-3" />
                Bank
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mpesa" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mpesa-phone">M-Pesa Phone Number</Label>
                <Input
                  id="mpesa-phone"
                  placeholder="254712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleMpesaPayment}
                disabled={isProcessing || !amount || !phoneNumber}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? 'Processing...' : 'Pay with M-Pesa'}
              </Button>
              <p className="text-xs text-gray-600 text-center">
                You'll receive an STK push notification on your phone
              </p>
            </TabsContent>

            <TabsContent value="airtel" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="airtel-phone">Airtel Money Number</Label>
                <Input
                  id="airtel-phone"
                  placeholder="254712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleAirtelPayment}
                disabled={isProcessing || !amount || !phoneNumber}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {isProcessing ? 'Processing...' : 'Pay with Airtel Money'}
              </Button>
              <p className="text-xs text-gray-600 text-center">
                You'll receive a payment prompt on your phone
              </p>
            </TabsContent>

            <TabsContent value="bank" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bank-account">Bank Account Number</Label>
                <Input
                  id="bank-account"
                  placeholder="Enter your account number"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleBankTransfer}
                disabled={isProcessing || !amount || !bankAccount}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? 'Processing...' : 'Initiate Bank Transfer'}
              </Button>
              <p className="text-xs text-gray-600 text-center">
                Transfer will be processed within 1-2 business days
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GoalContributionModal;