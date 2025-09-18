import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, Calculator, Zap, Shield, TrendingUp, DollarSign, 
  Calendar, Target, CheckCircle, AlertTriangle, Clock, Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import AssetFinancingHub from '@/components/adaptive-credit/AssetFinancingHub';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const AdaptiveCreditPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loanAmount, setLoanAmount] = useState([50000]);
  const [loanTerm, setLoanTerm] = useState([12]);
  const [purpose, setPurpose] = useState('');
  const [repaymentPattern, setRepaymentPattern] = useState('monthly');
  const [selectedOffer, setSelectedOffer] = useState(null);

  const aiGeneratedOffers = [
    {
      id: 1,
      name: 'Optimized Personal Loan',
      amount: loanAmount[0],
      term: loanTerm[0],
      interestRate: 8.5,
      monthlyPayment: Math.round((loanAmount[0] * (8.5/100/12)) / (1 - Math.pow(1 + (8.5/100/12), -loanTerm[0]))),
      totalCost: Math.round(((loanAmount[0] * (8.5/100/12)) / (1 - Math.pow(1 + (8.5/100/12), -loanTerm[0]))) * loanTerm[0]),
      features: ['Flexible repayment', 'Early payment bonus', 'Rate reduction available'],
      riskScore: 'Low',
      approvalOdds: 95
    },
    {
      id: 2,
      name: 'Income-Synchronized Loan',
      amount: loanAmount[0],
      term: loanTerm[0],
      interestRate: 9.2,
      monthlyPayment: Math.round((loanAmount[0] * (9.2/100/12)) / (1 - Math.pow(1 + (9.2/100/12), -loanTerm[0]))),
      totalCost: Math.round(((loanAmount[0] * (9.2/100/12)) / (1 - Math.pow(1 + (9.2/100/12), -loanTerm[0]))) * loanTerm[0]),
      features: ['Payments align with salary dates', 'Grace period option', 'Seasonal adjustments'],
      riskScore: 'Low',
      approvalOdds: 88
    },
    {
      id: 3,
      name: 'Growth-Focused Credit',
      amount: loanAmount[0],
      term: loanTerm[0] + 6,
      interestRate: 7.8,
      monthlyPayment: Math.round((loanAmount[0] * (7.8/100/12)) / (1 - Math.pow(1 + (7.8/100/12), -(loanTerm[0] + 6)))),
      totalCost: Math.round(((loanAmount[0] * (7.8/100/12)) / (1 - Math.pow(1 + (7.8/100/12), -(loanTerm[0] + 6)))) * (loanTerm[0] + 6)),
      features: ['Lower rate for longer term', 'Credit limit increases', 'Investment guidance'],
      riskScore: 'Medium',
      approvalOdds: 92
    }
  ];

  const repaymentSimulation = loanTerm[0] > 0 ? Array.from({ length: Math.min(loanTerm[0], 12) }, (_, i) => ({
    month: `Month ${i + 1}`,
    principal: Math.round(loanAmount[0] / loanTerm[0]),
    interest: Math.round((loanAmount[0] * 0.085) / 12),
    balance: Math.round(loanAmount[0] - ((loanAmount[0] / loanTerm[0]) * (i + 1)))
  })) : [];

  const handleApplyForLoan = (offerId) => {
    setSelectedOffer(offerId);
    toast({
      title: "Loan Application Submitted",
      description: "Your AI-optimized loan application is being processed. You'll receive feedback within 5 minutes.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Adaptive Credit Lab
                </h1>
                <p className="text-muted-foreground text-lg">
                  AI-powered loan structuring and growth-focused lending
                </p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="assets" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="assets">Asset Financing</TabsTrigger>
              <TabsTrigger value="simulator">Loan Simulator</TabsTrigger>
              <TabsTrigger value="offers">AI Offers</TabsTrigger>
              <TabsTrigger value="microloans">Micro Loans</TabsTrigger>
            </TabsList>

            <TabsContent value="assets">
              <AssetFinancingHub />
            </TabsContent>

            <TabsContent value="simulator">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Loan Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Interactive Loan Simulator
                    </CardTitle>
                    <CardDescription>
                      Customize your loan parameters and see real-time calculations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Loan Amount: KES {loanAmount[0].toLocaleString()}</Label>
                      <Slider
                        value={loanAmount}
                        onValueChange={setLoanAmount}
                        max={500000}
                        min={1000}
                        step={1000}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>KES 1,000</span>
                        <span>KES 500,000</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Loan Term: {loanTerm[0]} months</Label>
                      <Slider
                        value={loanTerm}
                        onValueChange={setLoanTerm}
                        max={60}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1 month</span>
                        <span>60 months</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="purpose">Loan Purpose</Label>
                      <Select value={purpose} onValueChange={setPurpose}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select loan purpose" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="business">Business Expansion</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                          <SelectItem value="debt-consolidation">Debt Consolidation</SelectItem>
                          <SelectItem value="home-improvement">Home Improvement</SelectItem>
                          <SelectItem value="asset-purchase">Asset Purchase</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Repayment Pattern</Label>
                      <Select value={repaymentPattern} onValueChange={setRepaymentPattern}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="seasonal">Seasonal (for farmers)</SelectItem>
                          <SelectItem value="income-sync">Income Synchronized</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Alert>
                      <Zap className="h-4 w-4" />
                      <AlertDescription>
                        AI is analyzing your financial profile to generate personalized loan offers
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                {/* Repayment Visualization */}
                <Card>
                  <CardHeader>
                    <CardTitle>Repayment Schedule Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {repaymentSimulation.length > 0 ? (
                      <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={repaymentSimulation}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="principal" stackId="a" fill="#22c55e" />
                            <Bar dataKey="interest" stackId="a" fill="#ef4444" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-80 flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Adjust loan parameters to see repayment schedule</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="offers">
              <div className="space-y-6">
                <Alert className="border-blue-200 bg-blue-50">
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    <strong>AI Analysis Complete:</strong> Based on your financial health score of 87 and income patterns, 
                    here are your personalized loan offers with dynamic pricing.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-6">
                  {aiGeneratedOffers.map((offer) => (
                    <Card key={offer.id} className={`hover:shadow-lg transition-all ${
                      selectedOffer === offer.id ? 'ring-2 ring-blue-500' : ''
                    }`}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl">{offer.name}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{offer.riskScore} Risk</Badge>
                            <Badge className="bg-green-100 text-green-800">
                              {offer.approvalOdds}% Approval
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Loan Amount</p>
                                <p className="text-2xl font-bold">KES {offer.amount.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Interest Rate</p>
                                <p className="text-2xl font-bold text-green-600">{offer.interestRate}%</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Monthly Payment</p>
                                <p className="text-xl font-semibold">KES {offer.monthlyPayment.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Total Cost</p>
                                <p className="text-xl font-semibold">KES {offer.totalCost.toLocaleString()}</p>
                              </div>
                            </div>

                            <div>
                              <p className="text-sm text-muted-foreground mb-2">Special Features</p>
                              <div className="space-y-1">
                                {offer.features.map((feature, index) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-sm">{feature}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col justify-between">
                            <div className="space-y-3">
                              <div className="p-3 bg-muted rounded-lg">
                                <h4 className="font-medium mb-2">AI Optimization Benefits</h4>
                                <ul className="text-sm space-y-1">
                                  <li>• Rate reduced by 1.2% based on payment history</li>
                                  <li>• Flexible terms aligned with income cycle</li>
                                  <li>• Automatic rate reviews for improvements</li>
                                </ul>
                              </div>
                            </div>

                            <Button 
                              onClick={() => handleApplyForLoan(offer.id)}
                              className="w-full mt-4"
                              disabled={selectedOffer === offer.id}
                            >
                              {selectedOffer === offer.id ? (
                                <>
                                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                'Apply for This Loan'
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="microloans">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Goal-Based Micro Lending
                    </CardTitle>
                    <CardDescription>
                      Set financial goals and get automated micro-loans as needed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <Card className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <DollarSign className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Business Stock</h4>
                            <p className="text-sm text-muted-foreground">Goal: KES 15,000</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>KES 8,500 / 15,000</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '57%' }}></div>
                          </div>
                          <Button size="sm" className="w-full">
                            Request KES 2,000
                          </Button>
                        </div>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Calendar className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">School Fees</h4>
                            <p className="text-sm text-muted-foreground">Goal: KES 25,000</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>KES 18,000 / 25,000</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                          </div>
                          <Button size="sm" className="w-full">
                            Auto-loan Active
                          </Button>
                        </div>
                      </Card>

                      <Card className="p-4 border-dashed border-2">
                        <div className="flex items-center justify-center h-full">
                          <Button variant="outline" className="w-full">
                            <Target className="mr-2 h-4 w-4" />
                            Add New Goal
                          </Button>
                        </div>
                      </Card>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Automated Micro-Loan Rules</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Emergency Buffer</h4>
                          <p className="text-sm text-muted-foreground">Auto-approve up to KES 5,000 for emergencies</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Active</Badge>
                          <Button size="sm" variant="outline">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Business Opportunities</h4>
                          <p className="text-sm text-muted-foreground">Quick loans for time-sensitive business needs</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Active</Badge>
                          <Button size="sm" variant="outline">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AdaptiveCreditPage;
