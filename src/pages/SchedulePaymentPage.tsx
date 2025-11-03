
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import CurrencyDisplay from '@/components/CurrencyDisplay';

const SchedulePaymentPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedChama, setSelectedChama] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState('');

  const chamas = [
    { id: '1', name: 'Unity Savings Group', requiredAmount: 5000 },
    { id: '2', name: 'School Fees Chama', requiredAmount: 3000 }
  ];

  const frequencies = [
    { id: 'weekly', name: 'Weekly', description: 'Every week' },
    { id: 'monthly', name: 'Monthly', description: 'Every month' },
    { id: 'quarterly', name: 'Quarterly', description: 'Every 3 months' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedChama && amount && frequency && startDate) {
      const selectedChamaData = chamas.find(c => c.id === selectedChama);
      const selectedFrequency = frequencies.find(f => f.id === frequency);
      
      toast({
        title: "Payment Scheduled!",
        description: `${selectedFrequency?.name} payments of ${amount} KES to ${selectedChamaData?.name} starting ${startDate}`,
      });
      navigate('/');
    }
  };

  const selectedChamaData = chamas.find(c => c.id === selectedChama);
  const today = new Date().toISOString().split('T')[0];

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
              <h1 className="text-3xl font-bold">Schedule Payment</h1>
              <p className="text-muted-foreground">Set up automatic contributions</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Payment Schedule
              </CardTitle>
              <CardDescription>
                Configure your automatic contribution schedule
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
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount per Payment (KES)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={selectedChamaData ? selectedChamaData.requiredAmount.toString() : "Enter amount"}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={today}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Payment Frequency</Label>
                  <div className="grid gap-3">
                    {frequencies.map((freq) => (
                      <div
                        key={freq.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          frequency === freq.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setFrequency(freq.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{freq.name}</p>
                            <p className="text-sm text-muted-foreground">{freq.description}</p>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            frequency === freq.id 
                              ? 'border-primary bg-primary' 
                              : 'border-border'
                          }`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedChama && amount && frequency && startDate && (
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Schedule Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p><strong>Chama:</strong> {selectedChamaData?.name}</p>
                        <p><strong>Amount:</strong> <CurrencyDisplay amount={parseFloat(amount) || 0} showToggle={false} /></p>
                        <p><strong>Frequency:</strong> {frequencies.find(f => f.id === frequency)?.name}</p>
                        <p><strong>Start Date:</strong> {new Date(startDate).toLocaleDateString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate(-1)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={!selectedChama || !amount || !frequency || !startDate}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Payment
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

export default SchedulePaymentPage;
