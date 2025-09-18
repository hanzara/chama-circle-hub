
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, DollarSign, CreditCard, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { useMpesaIntegration } from '@/hooks/useMpesaIntegration';

const MakeContributionPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { stkPushMutation, isProcessingPayment } = useMpesaIntegration();
  
  const [selectedChama, setSelectedChama] = useState('');
  const [amount, setAmount] = useState('0.00');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const chamas = [
    { id: '1', name: 'Unity Savings Group', requiredAmount: 5000 },
    { id: '2', name: 'School Fees Chama', requiredAmount: 3000 }
  ];

  const paymentMethods = [
    { id: 'mpesa', name: 'M-Pesa', icon: '📱', description: 'Fast and secure mobile payment' },
    { id: 'bank', name: 'Bank Transfer', icon: '🏦', description: 'Direct bank transfer' },
    { id: 'card', name: 'Debit/Credit Card', icon: '💳', description: 'Visa, Mastercard accepted' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedChama || !amount || !paymentMethod) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const selectedChamaData = chamas.find(c => c.id === selectedChama);

    if (paymentMethod === 'mpesa') {
      if (!phoneNumber) {
        toast({
          title: "Phone Number Required",
          description: "Please enter your M-Pesa phone number",
          variant: "destructive",
        });
        return;
      }

      try {
        console.log('Initiating M-Pesa payment:', {
          phoneNumber,
          amount: Number(amount),
          chama: selectedChamaData?.name
        });

        await stkPushMutation.mutateAsync({
          phoneNumber: phoneNumber,
          amount: Number(amount),
          description: `Contribution to ${selectedChamaData?.name}`,
          purpose: 'contribution',
          chamaId: selectedChama
        });

        // Success is handled by the mutation's onSuccess callback
      } catch (error) {
        console.error('M-Pesa payment failed:', error);
        // Error is handled by the mutation's onError callback
      }
    } else {
      // Handle other payment methods
      toast({
        title: "Payment Method Not Available",
        description: `${paymentMethods.find(p => p.id === paymentMethod)?.name} integration coming soon`,
        variant: "destructive",
      });
    }
  };

  const selectedChamaData = chamas.find(c => c.id === selectedChama);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Make Contribution</h1>
              <p className="text-muted-foreground">Contribute to your Chama</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Contribution Details
              </CardTitle>
              <CardDescription>
                Select your Chama and contribution amount
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="chama">Select Chama</Label>
                  <Select value={selectedChama} onValueChange={setSelectedChama}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a Chama" />
                    </SelectTrigger>
                    <SelectContent>
                      {chamas.map((chama) => (
                        <SelectItem key={chama.id} value={chama.id}>
                          <div className="flex justify-between items-center w-full">
                            <span>{chama.name}</span>
                            <CurrencyDisplay amount={chama.requiredAmount} showToggle={false} className="text-sm text-muted-foreground ml-2" />
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedChamaData && (
                    <p className="text-sm text-muted-foreground">
                      Required contribution: <CurrencyDisplay amount={selectedChamaData.requiredAmount} showToggle={false} className="font-medium" />
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Contribution Amount (KES)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={selectedChamaData ? selectedChamaData.requiredAmount.toString() : "Enter amount"}
                    min="1"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <div className="grid gap-3">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          paymentMethod === method.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setPaymentMethod(method.id)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{method.icon}</span>
                          <div>
                            <p className="font-medium">{method.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {method.description}
                            </p>
                          </div>
                          <div className="ml-auto">
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              paymentMethod === method.id 
                                ? 'border-primary bg-primary' 
                                : 'border-border'
                            }`} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {paymentMethod === 'mpesa' && (
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">M-Pesa Phone Number</Label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="e.g., 254712345678 or 0712345678"
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter your phone number in format: 254XXXXXXXXX or 07XXXXXXXX
                    </p>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate(-1)}
                    className="flex-1"
                    disabled={isProcessingPayment}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={!selectedChama || !amount || !paymentMethod || isProcessingPayment || (paymentMethod === 'mpesa' && !phoneNumber)}
                  >
                    {isProcessingPayment ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Make Contribution
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MakeContributionPage;
