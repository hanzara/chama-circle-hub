
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Brain, Settings, Save, RotateCcw, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminCreditEngine: React.FC = () => {
  const { toast } = useToast();
  
  // Credit scoring algorithm weights
  const [weights, setWeights] = useState({
    walletUsage: 25,
    loanHistory: 30,
    chamaParticipation: 20,
    repaymentConsistency: 15,
    socialConnections: 10
  });

  // Default thresholds
  const [thresholds, setThresholds] = useState({
    excellent: 750,
    good: 650,
    fair: 550,
    poor: 450
  });

  const handleWeightChange = (category: string, value: number[]) => {
    setWeights(prev => ({
      ...prev,
      [category]: value[0]
    }));
  };

  const handleThresholdChange = (threshold: string, value: string) => {
    setThresholds(prev => ({
      ...prev,
      [threshold]: parseInt(value) || 0
    }));
  };

  const handleSaveSettings = () => {
    console.log('Saving credit engine settings:', { weights, thresholds });
    toast({
      title: "Settings Saved! ✅",
      description: "Credit scoring algorithm has been updated successfully.",
    });
  };

  const handleResetDefaults = () => {
    setWeights({
      walletUsage: 25,
      loanHistory: 30,
      chamaParticipation: 20,
      repaymentConsistency: 15,
      socialConnections: 10
    });
    setThresholds({
      excellent: 750,
      good: 650,
      fair: 550,
      poor: 450
    });
    toast({
      title: "Reset Complete",
      description: "Credit scoring settings restored to defaults.",
    });
  };

  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Credit Score Engine Configuration
          </CardTitle>
          <CardDescription>
            Adjust the algorithm weights and thresholds that determine user credit scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Algorithm Weights */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Algorithm Weights
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Wallet Usage & Activity</Label>
                    <span className="text-sm font-medium">{weights.walletUsage}%</span>
                  </div>
                  <Slider
                    value={[weights.walletUsage]}
                    onValueChange={(value) => handleWeightChange('walletUsage', value)}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Frequency and volume of wallet transactions, savings habits
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Loan History & Performance</Label>
                    <span className="text-sm font-medium">{weights.loanHistory}%</span>
                  </div>
                  <Slider
                    value={[weights.loanHistory]}
                    onValueChange={(value) => handleWeightChange('loanHistory', value)}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Previous loan repayment history, defaults, early payments
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Chama Participation</Label>
                    <span className="text-sm font-medium">{weights.chamaParticipation}%</span>
                  </div>
                  <Slider
                    value={[weights.chamaParticipation]}
                    onValueChange={(value) => handleWeightChange('chamaParticipation', value)}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Active membership, contribution consistency, leadership roles
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Repayment Consistency</Label>
                    <span className="text-sm font-medium">{weights.repaymentConsistency}%</span>
                  </div>
                  <Slider
                    value={[weights.repaymentConsistency]}
                    onValueChange={(value) => handleWeightChange('repaymentConsistency', value)}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    On-time payments, payment frequency, missed payments
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Social Connections</Label>
                    <span className="text-sm font-medium">{weights.socialConnections}%</span>
                  </div>
                  <Slider
                    value={[weights.socialConnections]}
                    onValueChange={(value) => handleWeightChange('socialConnections', value)}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Network size, referrals, community engagement
                  </p>
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${totalWeight === 100 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <p className={`text-sm font-medium ${totalWeight === 100 ? 'text-green-800' : 'text-red-800'}`}>
                  Total Weight: {totalWeight}% {totalWeight !== 100 && '(Must equal 100%)'}
                </p>
              </div>
            </div>

            {/* Score Thresholds */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Score Thresholds
              </h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="excellent">Excellent Credit (Green)</Label>
                  <Input
                    id="excellent"
                    type="number"
                    value={thresholds.excellent}
                    onChange={(e) => handleThresholdChange('excellent', e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum score for excellent credit rating
                  </p>
                </div>

                <div>
                  <Label htmlFor="good">Good Credit (Blue)</Label>
                  <Input
                    id="good"
                    type="number"
                    value={thresholds.good}
                    onChange={(e) => handleThresholdChange('good', e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum score for good credit rating
                  </p>
                </div>

                <div>
                  <Label htmlFor="fair">Fair Credit (Yellow)</Label>
                  <Input
                    id="fair"
                    type="number"
                    value={thresholds.fair}
                    onChange={(e) => handleThresholdChange('fair', e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum score for fair credit rating
                  </p>
                </div>

                <div>
                  <Label htmlFor="poor">Poor Credit (Red)</Label>
                  <Input
                    id="poor"
                    type="number"
                    value={thresholds.poor}
                    onChange={(e) => handleThresholdChange('poor', e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum score for poor credit rating
                  </p>
                </div>
              </div>

              {/* Credit Score Preview */}
              <div className="space-y-3">
                <h4 className="font-medium">Credit Score Ranges</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                    <span className="text-green-800 font-medium">Excellent</span>
                    <span className="text-green-700">{thresholds.excellent}+ points</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200">
                    <span className="text-blue-800 font-medium">Good</span>
                    <span className="text-blue-700">{thresholds.good} - {thresholds.excellent - 1} points</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded border border-yellow-200">
                    <span className="text-yellow-800 font-medium">Fair</span>
                    <span className="text-yellow-700">{thresholds.fair} - {thresholds.good - 1} points</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200">
                    <span className="text-red-800 font-medium">Poor</span>
                    <span className="text-red-700">Below {thresholds.fair} points</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <Button variant="outline" onClick={handleResetDefaults}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
            <Button 
              onClick={handleSaveSettings}
              disabled={totalWeight !== 100}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Impact Preview */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Algorithm Impact Preview</CardTitle>
          <CardDescription>
            See how current settings would affect sample user credit scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Impact simulation coming soon...</p>
            <p className="text-sm">Preview how algorithm changes affect existing user scores</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCreditEngine;
