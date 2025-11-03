import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Database, Upload, Target, DollarSign, TrendingUp } from 'lucide-react';
import { useAIServices } from '@/hooks/useAIServices';

export const DataCollectionInterface: React.FC = () => {
  const { collectTrainingDataMutation } = useAIServices();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Financial Profile
    monthlyIncome: '',
    primaryIncomeSource: '',
    secondaryIncome: '',
    monthlyExpenses: '',
    savingsGoals: '',
    debtAmount: '',
    
    // Behavior Patterns
    spendingCategories: [] as string[],
    paymentMethods: [] as string[],
    financialPriorities: [] as string[],
    riskTolerance: '',
    
    // Goals & Preferences
    shortTermGoals: '',
    longTermGoals: '',
    investmentExperience: '',
    preferredInvestmentTypes: [] as string[],
    
    // Consent
    dataConsent: false,
    analyticsConsent: false,
    improvementConsent: false,
  });

  const steps = [
    { title: 'Financial Profile', icon: DollarSign },
    { title: 'Behavior Patterns', icon: TrendingUp },
    { title: 'Goals & Preferences', icon: Target },
    { title: 'Consent & Privacy', icon: Database },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
        ? [...(prev[field as keyof typeof prev] as string[]), value]
        : (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
    }));
  };

  const handleSubmit = async () => {
    try {
      await collectTrainingDataMutation.mutateAsync({
        userId: 'current-user',
        transactionHistory: [],
        behaviorPatterns: [{
          spendingCategories: formData.spendingCategories,
          paymentMethods: formData.paymentMethods,
          riskTolerance: formData.riskTolerance,
        }],
        financialGoals: [{
          shortTermGoals: formData.shortTermGoals,
          longTermGoals: formData.longTermGoals,
          savingsTargets: formData.savingsGoals,
        }],
        riskProfile: {
          tolerance: formData.riskTolerance,
          experience: formData.investmentExperience,
          preferences: formData.preferredInvestmentTypes,
        },
        demographics: {
          monthlyIncome: parseFloat(formData.monthlyIncome),
          primaryIncomeSource: formData.primaryIncomeSource,
          monthlyExpenses: parseFloat(formData.monthlyExpenses),
        },
      });
      
      // Reset form or show success
      setCurrentStep(0);
      setFormData({
        monthlyIncome: '',
        primaryIncomeSource: '',
        secondaryIncome: '',
        monthlyExpenses: '',
        savingsGoals: '',
        debtAmount: '',
        spendingCategories: [],
        paymentMethods: [],
        financialPriorities: [],
        riskTolerance: '',
        shortTermGoals: '',
        longTermGoals: '',
        investmentExperience: '',
        preferredInvestmentTypes: [],
        dataConsent: false,
        analyticsConsent: false,
        improvementConsent: false,
      });
    } catch (error) {
      console.error('Failed to submit training data:', error);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Database className="h-5 w-5" />
          <div>
            <CardTitle>AI Training Data Collection</CardTitle>
            <CardDescription>
              Help improve our AI models by sharing your financial patterns
            </CardDescription>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={currentStep.toString()} className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <TabsTrigger
                  key={index}
                  value={index.toString()}
                  disabled={index > currentStep}
                  className="flex items-center space-x-1"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{step.title}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Financial Profile */}
          <TabsContent value="0" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyIncome">Monthly Income (KSh)</Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  value={formData.monthlyIncome}
                  onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                  placeholder="e.g., 50000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="primaryIncomeSource">Primary Income Source</Label>
                <Select onValueChange={(value) => handleInputChange('primaryIncomeSource', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select income source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salary">Salary/Employment</SelectItem>
                    <SelectItem value="business">Business/Self-employed</SelectItem>
                    <SelectItem value="farming">Farming/Agriculture</SelectItem>
                    <SelectItem value="freelance">Freelance/Gig work</SelectItem>
                    <SelectItem value="investments">Investments</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="monthlyExpenses">Monthly Expenses (KSh)</Label>
                <Input
                  id="monthlyExpenses"
                  type="number"
                  value={formData.monthlyExpenses}
                  onChange={(e) => handleInputChange('monthlyExpenses', e.target.value)}
                  placeholder="e.g., 35000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="debtAmount">Current Debt (KSh)</Label>
                <Input
                  id="debtAmount"
                  type="number"
                  value={formData.debtAmount}
                  onChange={(e) => handleInputChange('debtAmount', e.target.value)}
                  placeholder="e.g., 100000"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="savingsGoals">Savings Goals</Label>
              <Textarea
                id="savingsGoals"
                value={formData.savingsGoals}
                onChange={(e) => handleInputChange('savingsGoals', e.target.value)}
                placeholder="Describe your savings goals (e.g., emergency fund, house deposit, education)"
              />
            </div>
          </TabsContent>

          {/* Behavior Patterns */}
          <TabsContent value="1" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Spending Categories (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Food & Groceries', 'Transportation', 'Housing/Rent', 'Healthcare',
                    'Education', 'Entertainment', 'Shopping', 'Utilities',
                    'Insurance', 'Savings', 'Investments', 'Family Support'
                  ].map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.spendingCategories.includes(category)}
                        onCheckedChange={(checked) => 
                          handleArrayChange('spendingCategories', category, checked as boolean)
                        }
                      />
                      <Label className="text-sm">{category}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Payment Methods (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'M-Pesa', 'Bank Transfer', 'Cash', 'Credit Card',
                    'Debit Card', 'Mobile Banking', 'Cheque', 'Digital Wallet'
                  ].map((method) => (
                    <div key={method} className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.paymentMethods.includes(method)}
                        onCheckedChange={(checked) => 
                          handleArrayChange('paymentMethods', method, checked as boolean)
                        }
                      />
                      <Label className="text-sm">{method}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="riskTolerance">Risk Tolerance</Label>
                <Select onValueChange={(value) => handleInputChange('riskTolerance', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your risk tolerance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="very-low">Very Low - I prefer guaranteed returns</SelectItem>
                    <SelectItem value="low">Low - I prefer stable, predictable investments</SelectItem>
                    <SelectItem value="medium">Medium - I'm willing to take some risk for better returns</SelectItem>
                    <SelectItem value="high">High - I'm comfortable with significant risk for high returns</SelectItem>
                    <SelectItem value="very-high">Very High - I actively seek high-risk investments</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* Goals & Preferences */}
          <TabsContent value="2" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shortTermGoals">Short-term Goals (1-2 years)</Label>
                <Textarea
                  id="shortTermGoals"
                  value={formData.shortTermGoals}
                  onChange={(e) => handleInputChange('shortTermGoals', e.target.value)}
                  placeholder="e.g., Build emergency fund, buy a car, take a vacation"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="longTermGoals">Long-term Goals (5+ years)</Label>
                <Textarea
                  id="longTermGoals"
                  value={formData.longTermGoals}
                  onChange={(e) => handleInputChange('longTermGoals', e.target.value)}
                  placeholder="e.g., Buy a house, retire comfortably, children's education"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="investmentExperience">Investment Experience</Label>
                <Select onValueChange={(value) => handleInputChange('investmentExperience', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No experience</SelectItem>
                    <SelectItem value="beginner">Beginner (less than 1 year)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (1-5 years)</SelectItem>
                    <SelectItem value="experienced">Experienced (5+ years)</SelectItem>
                    <SelectItem value="expert">Expert (10+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Preferred Investment Types (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Savings Account', 'Fixed Deposits', 'Government Bonds', 'Stocks',
                    'Mutual Funds', 'Real Estate', 'Cryptocurrency', 'SACCOs',
                    'Chama/Group Savings', 'Business Investment', 'Agriculture', 'Gold/Commodities'
                  ].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.preferredInvestmentTypes.includes(type)}
                        onCheckedChange={(checked) => 
                          handleArrayChange('preferredInvestmentTypes', type, checked as boolean)
                        }
                      />
                      <Label className="text-sm">{type}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Consent & Privacy */}
          <TabsContent value="3" className="space-y-4">
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">Data Usage & Privacy</h3>
                <p className="text-sm text-muted-foreground">
                  Your data will be used to improve our AI models and provide better financial recommendations. 
                  All data is anonymized and encrypted. You can withdraw consent at any time.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    checked={formData.dataConsent}
                    onCheckedChange={(checked) => handleInputChange('dataConsent', checked)}
                  />
                  <div>
                    <Label className="text-sm font-medium">Data Collection Consent</Label>
                    <p className="text-xs text-muted-foreground">
                      I consent to my financial data being used to train AI models
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    checked={formData.analyticsConsent}
                    onCheckedChange={(checked) => handleInputChange('analyticsConsent', checked)}
                  />
                  <div>
                    <Label className="text-sm font-medium">Analytics Consent</Label>
                    <p className="text-xs text-muted-foreground">
                      I consent to usage analytics for app improvement
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    checked={formData.improvementConsent}
                    onCheckedChange={(checked) => handleInputChange('improvementConsent', checked)}
                  />
                  <div>
                    <Label className="text-sm font-medium">Product Improvement</Label>
                    <p className="text-xs text-muted-foreground">
                      I consent to my feedback being used for product improvements
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button onClick={() => setCurrentStep(currentStep + 1)}>
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!formData.dataConsent || collectTrainingDataMutation.isPending}
            >
              {collectTrainingDataMutation.isPending ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Submit Data
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};