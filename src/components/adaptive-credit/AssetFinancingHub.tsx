import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { 
  Truck, Laptop, Zap, Hammer, Wrench, Factory, 
  TrendingUp, DollarSign, Calendar, Target, 
  Brain, Shield, CheckCircle, AlertTriangle,
  BarChart3, PieChart, Activity, Smartphone,
  Camera, Home, Car, Briefcase, Coffee, Scissors
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMpesaIntegration } from '@/hooks/useMpesaIntegration';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface AssetData {
  id: string;
  name: string;
  category: string;
  price: number;
  monthlyPayment: number;
  duration: number;
  earning: number;
  roi: number;
  riskScore: number;
  maintenanceCost: number;
  depreciationRate: number;
  marketDemand: number;
  seasonalFactor: number;
  icon: React.ReactNode;
  description: string;
  specifications: string[];
  financingOptions: FinancingOption[];
  iotFeatures: string[];
  predictiveMetrics: PredictiveMetric[];
}

interface FinancingOption {
  name: string;
  downPayment: number;
  interestRate: number;
  duration: number;
  benefits: string[];
}

interface PredictiveMetric {
  metric: string;
  current: number;
  predicted: number;
  trend: 'up' | 'down' | 'stable';
}

const AssetFinancingHub = () => {
  const { toast } = useToast();
  const { stkPushMutation, isProcessingPayment } = useMpesaIntegration();
  const [selectedAsset, setSelectedAsset] = useState<AssetData | null>(null);
  const [customAmount, setCustomAmount] = useState([50000]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [riskTolerance, setRiskTolerance] = useState([5]);
  const [timeHorizon, setTimeHorizon] = useState([12]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedFinancing, setSelectedFinancing] = useState<{asset: AssetData, option: FinancingOption} | null>(null);

  const handleAssetFinancing = async (asset: AssetData, financingOption: FinancingOption) => {
    if (!phoneNumber) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number to proceed with payment.",
        variant: "destructive"
      });
      return;
    }

    const downPaymentAmount = (asset.price * financingOption.downPayment) / 100;
    
    try {
      await stkPushMutation.mutateAsync({
        phoneNumber,
        amount: downPaymentAmount,
        description: `Down payment for ${asset.name} - ${financingOption.name} plan`,
        purpose: 'other'
      });

      toast({
        title: "Payment initiated",
        description: "Please check your phone for the M-Pesa prompt to complete the down payment.",
      });

      // Route to appropriate partner
      const partner = getAssetPartner(asset.category);
      toast({
        title: "Application forwarded",
        description: `Your application has been sent to ${partner} for processing.`,
      });

      setShowPaymentDialog(false);
      setSelectedAsset(null);
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "Unable to process payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getAssetPartner = (category: string) => {
    const partnerMap: Record<string, string> = {
      transport: 'Watu Credit',
      energy: 'SunKing Solar',
      technology: 'Safaricom Device Finance',
      manufacturing: 'Equity Bank Equipment Finance',
      food: 'Equity Bank Equipment Finance',
      services: 'Equity Bank Equipment Finance'
    };
    return partnerMap[category] || 'Equity Bank Equipment Finance';
  };

  const assetCategories = [
    { id: 'all', name: 'All Assets', count: 24 },
    { id: 'transport', name: 'Transportation', count: 6 },
    { id: 'technology', name: 'Technology', count: 5 },
    { id: 'energy', name: 'Energy & Solar', count: 4 },
    { id: 'manufacturing', name: 'Manufacturing', count: 4 },
    { id: 'food', name: 'Food & Beverage', count: 3 },
    { id: 'services', name: 'Services', count: 2 }
  ];

  const premiumAssets: AssetData[] = [
    {
      id: 'smart-delivery-bike',
      name: 'Smart Delivery Motorbike',
      category: 'transport',
      price: 180000,
      monthlyPayment: 16200,
      duration: 18,
      earning: 35000,
      roi: 195,
      riskScore: 3,
      maintenanceCost: 2500,
      depreciationRate: 15,
      marketDemand: 92,
      seasonalFactor: 1.2,
      icon: <Truck className="h-8 w-8" />,
      description: 'AI-powered delivery motorbike with GPS tracking, maintenance alerts, and earning optimization',
      specifications: ['125cc Engine', 'GPS Tracking', 'Smart Lock System', '50L Cargo Box', 'Mobile App Control'],
      financingOptions: [
        { name: 'Standard', downPayment: 20, interestRate: 12, duration: 18, benefits: ['Fixed monthly payments', 'Maintenance included'] },
        { name: 'Premium', downPayment: 30, interestRate: 10, duration: 24, benefits: ['Lower interest', 'Insurance included', 'Upgrade option'] },
        { name: 'Flex', downPayment: 15, interestRate: 14, duration: 15, benefits: ['Lower down payment', 'Seasonal payment breaks'] }
      ],
      iotFeatures: ['Real-time location tracking', 'Engine diagnostics', 'Fuel efficiency monitoring', 'Route optimization'],
      predictiveMetrics: [
        { metric: 'Monthly Earnings', current: 35000, predicted: 42000, trend: 'up' },
        { metric: 'Maintenance Cost', current: 2500, predicted: 2200, trend: 'down' },
        { metric: 'Market Demand', current: 92, predicted: 95, trend: 'up' }
      ]
    },
    {
      id: 'ai-sewing-station',
      name: 'AI-Powered Sewing Station',
      category: 'manufacturing',
      price: 85000,
      monthlyPayment: 7650,
      duration: 15,
      earning: 18000,
      roi: 212,
      riskScore: 2,
      maintenanceCost: 1200,
      depreciationRate: 10,
      marketDemand: 88,
      seasonalFactor: 1.4,
      icon: <Scissors className="h-8 w-8" />,
      description: 'Professional sewing machine with AI pattern recognition and automated cutting',
      specifications: ['Computer-controlled', 'Pattern recognition', '500+ built-in stitches', 'Automatic threading', 'Fabric sensor'],
      financingOptions: [
        { name: 'Artisan', downPayment: 25, interestRate: 9, duration: 15, benefits: ['Training included', 'Pattern library access'] },
        { name: 'Business', downPayment: 35, interestRate: 8, duration: 18, benefits: ['Commercial warranty', 'Marketing support'] }
      ],
      iotFeatures: ['Production tracking', 'Quality monitoring', 'Maintenance scheduling', 'Order management'],
      predictiveMetrics: [
        { metric: 'Production Output', current: 45, predicted: 60, trend: 'up' },
        { metric: 'Quality Score', current: 94, predicted: 97, trend: 'up' }
      ]
    },
    {
      id: 'solar-power-system',
      name: 'Smart Solar Power System',
      category: 'energy',
      price: 120000,
      monthlyPayment: 10800,
      duration: 20,
      earning: 15000,
      roi: 138,
      riskScore: 1,
      maintenanceCost: 800,
      depreciationRate: 5,
      marketDemand: 96,
      seasonalFactor: 0.8,
      icon: <Zap className="h-8 w-8" />,
      description: 'Complete solar installation with battery storage and smart grid integration',
      specifications: ['5kW Solar Panels', '10kWh Battery Storage', 'Smart Inverter', 'Grid-tie capability', 'Mobile monitoring'],
      financingOptions: [
        { name: 'Green', downPayment: 20, interestRate: 7, duration: 20, benefits: ['Government rebates', 'Carbon credits'] },
        { name: 'Premium', downPayment: 30, interestRate: 6, duration: 25, benefits: ['Extended warranty', 'Free maintenance'] }
      ],
      iotFeatures: ['Energy production monitoring', 'Weather integration', 'Grid optimization', 'Predictive maintenance'],
      predictiveMetrics: [
        { metric: 'Energy Savings', current: 15000, predicted: 18000, trend: 'up' },
        { metric: 'System Efficiency', current: 89, predicted: 85, trend: 'down' }
      ]
    },
    {
      id: 'smart-food-cart',
      name: 'IoT-Enabled Food Cart',
      category: 'food',
      price: 65000,
      monthlyPayment: 5850,
      duration: 12,
      earning: 25000,
      roi: 285,
      riskScore: 4,
      maintenanceCost: 1800,
      depreciationRate: 20,
      marketDemand: 85,
      seasonalFactor: 1.1,
      icon: <Coffee className="h-8 w-8" />,
      description: 'Mobile food cart with POS system, inventory tracking, and customer analytics',
      specifications: ['Stainless steel construction', 'POS integration', 'Inventory sensors', 'Customer app', 'Payment processing'],
      financingOptions: [
        { name: 'Starter', downPayment: 15, interestRate: 15, duration: 12, benefits: ['Quick approval', 'Training included'] },
        { name: 'Pro', downPayment: 25, interestRate: 12, duration: 15, benefits: ['Marketing support', 'Supplier network'] }
      ],
      iotFeatures: ['Sales tracking', 'Inventory management', 'Customer analytics', 'Location optimization'],
      predictiveMetrics: [
        { metric: 'Daily Sales', current: 800, predicted: 950, trend: 'up' },
        { metric: 'Customer Retention', current: 65, predicted: 72, trend: 'up' }
      ]
    },
    {
      id: 'professional-laptop',
      name: 'AI Business Laptop Pro',
      category: 'technology',
      price: 95000,
      monthlyPayment: 8550,
      duration: 14,
      earning: 28000,
      roi: 294,
      riskScore: 2,
      maintenanceCost: 1000,
      depreciationRate: 25,
      marketDemand: 90,
      seasonalFactor: 1.0,
      icon: <Laptop className="h-8 w-8" />,
      description: 'High-performance laptop optimized for AI development and digital services',
      specifications: ['Intel i7 Processor', '32GB RAM', '1TB SSD', 'RTX Graphics', 'AI Development Tools'],
      financingOptions: [
        { name: 'Developer', downPayment: 20, interestRate: 11, duration: 14, benefits: ['Software included', 'Cloud credits'] },
        { name: 'Enterprise', downPayment: 30, interestRate: 9, duration: 18, benefits: ['Extended warranty', 'Priority support'] }
      ],
      iotFeatures: ['Performance monitoring', 'Usage analytics', 'Security tracking', 'Productivity insights'],
      predictiveMetrics: [
        { metric: 'Project Revenue', current: 28000, predicted: 35000, trend: 'up' },
        { metric: 'Utilization Rate', current: 75, predicted: 82, trend: 'up' }
      ]
    },
    {
      id: 'poultry-automation',
      name: 'Smart Poultry System',
      category: 'manufacturing',
      price: 75000,
      monthlyPayment: 6750,
      duration: 15,
      earning: 16000,
      roi: 213,
      riskScore: 3,
      maintenanceCost: 1500,
      depreciationRate: 12,
      marketDemand: 82,
      seasonalFactor: 0.9,
      icon: <Home className="h-8 w-8" />,
      description: 'Automated poultry management system with environmental controls and health monitoring',
      specifications: ['Climate control', 'Automated feeding', 'Health monitoring', 'Egg collection', 'Mobile alerts'],
      financingOptions: [
        { name: 'Farmer', downPayment: 25, interestRate: 10, duration: 15, benefits: ['Training program', 'Vet support'] },
        { name: 'Commercial', downPayment: 35, interestRate: 8, duration: 18, benefits: ['Scaling support', 'Market connections'] }
      ],
      iotFeatures: ['Temperature monitoring', 'Feed optimization', 'Health tracking', 'Production analytics'],
      predictiveMetrics: [
        { metric: 'Egg Production', current: 85, predicted: 92, trend: 'up' },
        { metric: 'Mortality Rate', current: 3, predicted: 2, trend: 'down' }
      ]
    }
  ];

  const filteredAssets = selectedCategory === 'all' 
    ? premiumAssets 
    : premiumAssets.filter(asset => asset.category === selectedCategory);

  const calculateFinancingDetails = (asset: AssetData, option: FinancingOption) => {
    const downPaymentAmount = (asset.price * option.downPayment) / 100;
    const loanAmount = asset.price - downPaymentAmount;
    const monthlyInterest = option.interestRate / 100 / 12;
    const monthlyPayment = (loanAmount * monthlyInterest * Math.pow(1 + monthlyInterest, option.duration)) / 
                          (Math.pow(1 + monthlyInterest, option.duration) - 1);
    const totalPayment = monthlyPayment * option.duration + downPaymentAmount;
    const totalInterest = totalPayment - asset.price;
    const netMonthlyProfit = asset.earning - monthlyPayment;
    const paybackPeriod = Math.ceil(downPaymentAmount / netMonthlyProfit);
    
    return {
      downPaymentAmount,
      loanAmount,
      monthlyPayment,
      totalPayment,
      totalInterest,
      netMonthlyProfit,
      paybackPeriod
    };
  };

  const getAssetRecommendations = () => {
    return filteredAssets
      .map(asset => ({
        ...asset,
        score: (asset.roi * 0.3) + ((100 - asset.riskScore * 10) * 0.2) + (asset.marketDemand * 0.3) + (asset.seasonalFactor * 20)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };

  const roiData = filteredAssets.map(asset => ({
    name: asset.name.split(' ').slice(0, 2).join(' '),
    roi: asset.roi,
    risk: asset.riskScore,
    earning: asset.earning
  }));

  const categoryData = assetCategories.filter(cat => cat.id !== 'all').map(cat => ({
    name: cat.name,
    value: cat.count,
    assets: premiumAssets.filter(asset => asset.category === cat.id).length
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="space-y-8">
      {/* Header with AI Insights */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Brain className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">AI Asset Financing Lab</h2>
              <p className="text-blue-100">Next-generation asset financing powered by machine learning</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5" />
                <span className="font-medium">Market Analysis</span>
              </div>
              <p className="text-2xl font-bold">94% Success Rate</p>
              <p className="text-sm text-blue-100">AI-predicted asset performance</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5" />
                <span className="font-medium">Risk Management</span>
              </div>
              <p className="text-2xl font-bold">Real-time Monitoring</p>
              <p className="text-sm text-blue-100">IoT-enabled asset tracking</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5" />
                <span className="font-medium">ROI Optimization</span>
              </div>
              <p className="text-2xl font-bold">Average 180% ROI</p>
              <p className="text-sm text-blue-100">Across all asset categories</p>
            </div>
          </div>
        </div>
        
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-white/10 rounded-full blur-lg"></div>
      </div>

      <Tabs defaultValue="marketplace" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="marketplace">Asset Marketplace</TabsTrigger>
          <TabsTrigger value="analytics">AI Analytics</TabsTrigger>
          <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
          <TabsTrigger value="calculator">ROI Calculator</TabsTrigger>
          <TabsTrigger value="insights">Market Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="space-y-6">
          {/* Filters and Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Smart Asset Discovery
              </CardTitle>
              <CardDescription>AI-powered asset recommendations based on your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Investment Amount (KES)</Label>
                  <Slider
                    value={customAmount}
                    onValueChange={setCustomAmount}
                    max={500000}
                    min={10000}
                    step={5000}
                    className="w-full"
                  />
                  <div className="text-center font-medium">KES {customAmount[0].toLocaleString()}</div>
                </div>
                
                <div className="space-y-2">
                  <Label>Risk Tolerance (1-10)</Label>
                  <Slider
                    value={riskTolerance}
                    onValueChange={setRiskTolerance}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-center font-medium">Level {riskTolerance[0]}</div>
                </div>
                
                <div className="space-y-2">
                  <Label>Time Horizon (months)</Label>
                  <Slider
                    value={timeHorizon}
                    onValueChange={setTimeHorizon}
                    max={60}
                    min={6}
                    step={3}
                    className="w-full"
                  />
                  <div className="text-center font-medium">{timeHorizon[0]} months</div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                {assetCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center gap-2"
                  >
                    {category.name}
                    <Badge variant="secondary" className="ml-1">{category.count}</Badge>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                AI Recommendations
              </CardTitle>
              <CardDescription>Personalized asset suggestions based on your preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {getAssetRecommendations().map((asset, index) => (
                  <div key={asset.id} className="relative">
                    <Badge 
                      className={`absolute -top-2 -right-2 z-10 ${
                        index === 0 ? 'bg-gold text-black' : 
                        index === 1 ? 'bg-gray-400 text-white' : 
                        'bg-orange-600 text-white'
                      }`}
                    >
                      {index === 0 ? '🥇 Best Match' : index === 1 ? '🥈 Good Fit' : '🥉 Alternative'}
                    </Badge>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedAsset(asset)}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-purple-100 rounded-lg">{asset.icon}</div>
                          <div>
                            <h4 className="font-semibold text-sm">{asset.name}</h4>
                            <p className="text-xs text-muted-foreground">Match Score: {Math.round(asset.score)}/100</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span>ROI:</span>
                            <span className="font-semibold text-green-600">{asset.roi}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Risk:</span>
                            <span className={`font-semibold ${
                              asset.riskScore <= 2 ? 'text-green-600' : 
                              asset.riskScore <= 4 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {asset.riskScore <= 2 ? 'Low' : asset.riskScore <= 4 ? 'Medium' : 'High'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Asset Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssets.map((asset) => (
              <Card key={asset.id} className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-white to-gray-50" onClick={() => setSelectedAsset(asset)}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white group-hover:scale-110 transition-transform">
                        {asset.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{asset.name}</CardTitle>
                        <CardDescription className="capitalize">{asset.category}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className={`${
                      asset.riskScore <= 2 ? 'border-green-500 text-green-700' : 
                      asset.riskScore <= 4 ? 'border-yellow-500 text-yellow-700' : 
                      'border-red-500 text-red-700'
                    }`}>
                      Risk: {asset.riskScore}/10
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{asset.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-blue-600 font-medium">Asset Price</p>
                      <p className="text-lg font-bold text-blue-900">KES {asset.price.toLocaleString()}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-xs text-green-600 font-medium">Monthly Earning</p>
                      <p className="text-lg font-bold text-green-900">KES {asset.earning.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>ROI</span>
                      <span className="font-bold text-green-600">{asset.roi}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Market Demand</span>
                      <span className="font-semibold">{asset.marketDemand}%</span>
                    </div>
                    <Progress value={asset.marketDemand} className="h-2" />
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex flex-wrap gap-1 mb-3">
                      {asset.iotFeatures.slice(0, 2).map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {asset.iotFeatures.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{asset.iotFeatures.length - 2} more
                        </Badge>
                      )}
                    </div>
                    
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Explore Financing Options
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>ROI vs Risk Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={roiData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="roi" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Asset Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          <Alert>
            <Activity className="h-4 w-4" />
            <AlertDescription>
              Your smart portfolio tracks all financed assets with real-time performance metrics and predictive analytics.
            </AlertDescription>
          </Alert>
          
          <div className="text-center py-12 text-muted-foreground">
            <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Assets Yet</h3>
            <p>Start building your asset portfolio with AI-powered financing options.</p>
            <Button className="mt-4" onClick={() => setSelectedAsset(premiumAssets[0])}>
              Explore Assets
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced ROI Calculator</CardTitle>
              <CardDescription>Calculate detailed financial projections with AI insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Select an asset from the marketplace to see detailed calculations</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium">Delivery Services</p>
                      <p className="text-sm text-muted-foreground">High demand growth</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">+23%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">Solar Energy</p>
                      <p className="text-sm text-muted-foreground">Steady growth</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">+15%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium">Food Services</p>
                      <p className="text-sm text-muted-foreground">Moderate growth</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">+8%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Brain className="h-4 w-4" />
                    <AlertDescription>
                      Transportation assets are predicted to see 35% ROI increase in the next 6 months due to rising delivery demand.
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                      Solar panel installations are expected to benefit from new government incentives starting next quarter.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <AssetDetailModal 
          asset={selectedAsset} 
          onClose={() => setSelectedAsset(null)}
          onApply={(assetId, financingOption) => {
            const asset = premiumAssets.find(a => a.id === assetId);
            if (asset) {
              setSelectedFinancing({ asset, option: financingOption });
              setShowPaymentDialog(true);
            }
          }}
        />
      )}

      {/* Payment Dialog */}
      {showPaymentDialog && selectedFinancing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Complete Down Payment</CardTitle>
              <CardDescription>
                Pay KES {Math.round((selectedFinancing.asset.price * selectedFinancing.option.downPayment) / 100).toLocaleString()} to secure your {selectedFinancing.asset.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="0712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Asset:</span>
                  <span className="font-medium">{selectedFinancing.asset.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Plan:</span>
                  <span className="font-medium">{selectedFinancing.option.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Down Payment:</span>
                  <span className="font-bold">KES {Math.round((selectedFinancing.asset.price * selectedFinancing.option.downPayment) / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Partner:</span>
                  <span className="font-medium">{getAssetPartner(selectedFinancing.asset.category)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPaymentDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleAssetFinancing(selectedFinancing.asset, selectedFinancing.option)}
                  disabled={isProcessingPayment || !phoneNumber}
                  className="flex-1"
                >
                  {isProcessingPayment ? "Processing..." : "Pay Now"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// Asset Detail Modal Component
const AssetDetailModal = ({ asset, onClose, onApply }: {
  asset: AssetData;
  onClose: () => void;
  onApply: (assetId: string, financingOption: FinancingOption) => void;
}) => {
  const [selectedOption, setSelectedOption] = useState(asset.financingOptions[0]);
  const [activeTab, setActiveTab] = useState('overview');
  
  const financingDetails = calculateFinancingDetails(asset, selectedOption);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg">{asset.icon}</div>
              <div>
                <CardTitle className="text-2xl">{asset.name}</CardTitle>
                <CardDescription className="text-blue-100">{asset.description}</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
              ×
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="financing">Financing</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="iot">IoT Features</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Asset Specifications</h3>
                  <ul className="space-y-2">
                    {asset.specifications.map((spec, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Financial Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Asset Price:</span>
                      <span className="font-semibold">KES {asset.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Earning:</span>
                      <span className="font-semibold text-green-600">KES {asset.earning.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ROI:</span>
                      <span className="font-semibold text-green-600">{asset.roi}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Risk Score:</span>
                      <span className={`font-semibold ${
                        asset.riskScore <= 2 ? 'text-green-600' : 
                        asset.riskScore <= 4 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {asset.riskScore}/10
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Market Analysis</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Market Demand</span>
                        <span className="text-sm font-semibold">{asset.marketDemand}%</span>
                      </div>
                      <Progress value={asset.marketDemand} className="h-2" />
                    </div>
                    <div className="flex justify-between">
                      <span>Seasonal Factor:</span>
                      <span className="font-semibold">{asset.seasonalFactor}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Depreciation:</span>
                      <span className="font-semibold">{asset.depreciationRate}%/year</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="financing" className="space-y-6 mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Financing Options</h3>
                  <div className="space-y-3">
                    {asset.financingOptions.map((option, index) => (
                      <Card 
                        key={index} 
                        className={`cursor-pointer transition-all ${
                          selectedOption.name === option.name ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedOption(option)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{option.name} Plan</h4>
                            <Badge variant={selectedOption.name === option.name ? "default" : "outline"}>
                              {option.interestRate}% APR
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>Down Payment: {option.downPayment}%</div>
                            <div>Duration: {option.duration} months</div>
                          </div>
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground">Benefits:</p>
                            <ul className="text-xs">
                              {option.benefits.slice(0, 2).map((benefit, i) => (
                                <li key={i}>• {benefit}</li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Payment Breakdown</h3>
                  <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between">
                        <span>Down Payment:</span>
                        <span className="font-bold">KES {Math.round(financingDetails.downPaymentAmount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Loan Amount:</span>
                        <span className="font-semibold">KES {Math.round(financingDetails.loanAmount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Payment:</span>
                        <span className="font-bold text-blue-600">KES {Math.round(financingDetails.monthlyPayment).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Profit:</span>
                        <span className="font-bold text-green-600">KES {Math.round(financingDetails.netMonthlyProfit).toLocaleString()}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between">
                          <span>Total Investment:</span>
                          <span className="font-bold">KES {Math.round(financingDetails.totalPayment).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Payback Period:</span>
                          <span className="font-bold">{financingDetails.paybackPeriod} months</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6 mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Predictive Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {asset.predictiveMetrics.map((metric, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">{metric.metric}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{metric.current}</span>
                              <span className="text-xs text-muted-foreground">→</span>
                              <span className={`text-sm font-semibold ${
                                metric.trend === 'up' ? 'text-green-600' : 
                                metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                              }`}>
                                {metric.predicted}
                              </span>
                              {metric.trend === 'up' ? <TrendingUp className="h-3 w-3 text-green-600" /> :
                               metric.trend === 'down' ? <AlertTriangle className="h-3 w-3 text-red-600" /> :
                               <Activity className="h-3 w-3 text-gray-600" />}
                            </div>
                          </div>
                          <Progress 
                            value={metric.trend === 'up' ? 75 : metric.trend === 'down' ? 25 : 50} 
                            className="h-1"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>5-Year Projection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={[
                        { year: 'Year 1', value: asset.earning * 12 },
                        { year: 'Year 2', value: asset.earning * 12 * 1.1 },
                        { year: 'Year 3', value: asset.earning * 12 * 1.2 },
                        { year: 'Year 4', value: asset.earning * 12 * 1.25 },
                        { year: 'Year 5', value: asset.earning * 12 * 1.3 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="iot" className="space-y-6 mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5" />
                      IoT Capabilities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {asset.iotFeatures.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <Activity className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Real-time Monitoring</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Alert>
                        <Shield className="h-4 w-4" />
                        <AlertDescription>
                          24/7 asset monitoring with instant alerts for maintenance, security, and performance optimization.
                        </AlertDescription>
                      </Alert>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">99.2%</p>
                          <p className="text-sm text-muted-foreground">Uptime</p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">Real-time</p>
                          <p className="text-sm text-muted-foreground">Updates</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-4 pt-6 border-t">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Close
            </Button>
            <Button 
              onClick={() => onApply(asset.id, selectedOption)} 
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Apply for {selectedOption.name} Financing
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function moved outside component to avoid recreation
const calculateFinancingDetails = (asset: AssetData, option: FinancingOption) => {
  const downPaymentAmount = (asset.price * option.downPayment) / 100;
  const loanAmount = asset.price - downPaymentAmount;
  const monthlyInterest = option.interestRate / 100 / 12;
  const monthlyPayment = (loanAmount * monthlyInterest * Math.pow(1 + monthlyInterest, option.duration)) / 
                        (Math.pow(1 + monthlyInterest, option.duration) - 1);
  const totalPayment = monthlyPayment * option.duration + downPaymentAmount;
  const totalInterest = totalPayment - asset.price;
  const netMonthlyProfit = asset.earning - monthlyPayment;
  const paybackPeriod = Math.ceil(downPaymentAmount / netMonthlyProfit);
  
  return {
    downPaymentAmount,
    loanAmount,
    monthlyPayment,
    totalPayment,
    totalInterest,
    netMonthlyProfit,
    paybackPeriod
  };
};

export default AssetFinancingHub;
