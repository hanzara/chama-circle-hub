import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { usePremiumFeatures } from '@/hooks/usePremiumFeatures';
import { 
  Crown, 
  TrendingUp, 
  Users, 
  Zap, 
  Shield, 
  BarChart3, 
  MessageSquare, 
  Smartphone,
  Check,
  Star,
  Target,
  DollarSign,
  UserCheck,
  Building2
} from 'lucide-react';
import CurrencyDisplay from '../CurrencyDisplay';

const PremiumFeaturesHub: React.FC = () => {
  const {
    subscriptions,
    advisoryRequests,
    premiumFeatures,
    subscriptionPricing,
    isLoadingSubscriptions,
    subscribe,
    isSubscribing,
    requestAdvisory,
    isRequestingAdvisory,
    hasActiveSubscription,
    hasFeature,
    getActiveSubscription,
    getTotalMonthlyRevenue,
    getAdvisoryRevenue,
  } = usePremiumFeatures();

  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [showAdvisoryDialog, setShowAdvisoryDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'individual' | 'chama_admin' | 'enterprise'>('individual');
  const [advisoryForm, setAdvisoryForm] = useState({
    advisoryType: 'ai_recommendation' as 'ai_recommendation' | 'expert_consultation' | 'portfolio_review',
    investmentAmount: '',
    riskProfile: 'medium' as 'low' | 'medium' | 'high',
  });

  const subscriptionPlans = [
    {
      type: 'individual' as const,
      name: 'Individual Premium',
      price: subscriptionPricing.individual,
      icon: UserCheck,
      color: 'from-blue-500 to-purple-600',
      popular: false,
      features: premiumFeatures.individual,
      description: 'Perfect for personal financial growth',
    },
    {
      type: 'chama_admin' as const,
      name: 'Chama Admin',
      price: subscriptionPricing.chama_admin,
      icon: Users,
      color: 'from-purple-500 to-pink-600',
      popular: true,
      features: premiumFeatures.chama_admin,
      description: 'Essential tools for chama management',
    },
    {
      type: 'enterprise' as const,
      name: 'Enterprise',
      price: subscriptionPricing.enterprise,
      icon: Building2,
      color: 'from-pink-500 to-red-600',
      popular: false,
      features: premiumFeatures.enterprise,
      description: 'Advanced features for large organizations',
    },
  ];

  const advisoryOptions = [
    {
      type: 'ai_recommendation' as const,
      name: 'AI Investment Recommendations',
      description: 'Get personalized investment suggestions powered by AI',
      icon: TrendingUp,
      minFee: 99,
      feePercentage: 0.1,
    },
    {
      type: 'expert_consultation' as const,
      name: 'Expert Consultation',
      description: 'One-on-one session with certified financial advisors',
      icon: MessageSquare,
      minFee: 499,
      feePercentage: 0.5,
    },
    {
      type: 'portfolio_review' as const,
      name: 'Portfolio Review',
      description: 'Comprehensive analysis of your investment portfolio',
      icon: BarChart3,
      minFee: 999,
      feePercentage: 1.0,
    },
  ];

  const handleSubscribe = () => {
    subscribe({ subscriptionType: selectedPlan });
    setShowSubscriptionDialog(false);
  };

  const handleRequestAdvisory = () => {
    requestAdvisory({
      advisoryType: advisoryForm.advisoryType,
      investmentAmount: parseFloat(advisoryForm.investmentAmount),
      riskProfile: advisoryForm.riskProfile,
    });
    setShowAdvisoryDialog(false);
    setAdvisoryForm({
      advisoryType: 'ai_recommendation',
      investmentAmount: '',
      riskProfile: 'medium',
    });
  };

  const calculateAdvisoryFee = () => {
    const option = advisoryOptions.find(opt => opt.type === advisoryForm.advisoryType);
    if (!option || !advisoryForm.investmentAmount) return 0;
    
    const amount = parseFloat(advisoryForm.investmentAmount);
    return Math.max(option.minFee, amount * (option.feePercentage / 100));
  };

  const activeSubscription = getActiveSubscription();

  if (isLoadingSubscriptions) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Premium Status Header */}
      {activeSubscription ? (
        <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Crown className="h-8 w-8" />
                <div>
                  <h2 className="text-xl font-bold">Premium Active</h2>
                  <p className="opacity-90">
                    {subscriptionPlans.find(p => p.type === activeSubscription.subscription_type)?.name}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  <CurrencyDisplay amount={activeSubscription.monthly_fee} />
                </p>
                <p className="opacity-90">per month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-2 border-purple-300">
          <CardContent className="p-6 text-center">
            <Crown className="h-12 w-12 mx-auto text-purple-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Unlock Premium Features</h2>
            <p className="text-muted-foreground mb-4">
              Get access to advanced analytics, priority support, and exclusive features.
            </p>
            <Button onClick={() => setShowSubscriptionDialog(true)}>
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="features" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="advisory">Investment Advisory</TabsTrigger>
          <TabsTrigger value="analytics">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => {
              const Icon = plan.icon;
              const isActive = activeSubscription?.subscription_type === plan.type;
              
              return (
                <Card key={plan.type} className={`relative ${isActive ? 'ring-2 ring-purple-500' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${plan.color} flex items-center justify-center mb-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="flex items-center justify-between">
                      <span>{plan.name}</span>
                      {isActive && <Check className="h-5 w-5 text-green-500" />}
                    </CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="text-2xl font-bold">
                      <CurrencyDisplay amount={plan.price} />
                      <span className="text-sm font-normal text-muted-foreground">/month</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className="w-full"
                      variant={isActive ? "outline" : "default"}
                      disabled={isActive}
                      onClick={() => {
                        setSelectedPlan(plan.type);
                        setShowSubscriptionDialog(true);
                      }}
                    >
                      {isActive ? 'Current Plan' : 'Subscribe'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="advisory" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {advisoryOptions.map((option) => {
              const Icon = option.icon;
              
              return (
                <Card key={option.type}>
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle>{option.name}</CardTitle>
                    <CardDescription>{option.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      <p>Fee: {option.feePercentage}% (min. <CurrencyDisplay amount={option.minFee} />)</p>
                    </div>
                    
                    <Button 
                      className="w-full"
                      onClick={() => {
                        setAdvisoryForm({ ...advisoryForm, advisoryType: option.type });
                        setShowAdvisoryDialog(true);
                      }}
                    >
                      Request Advisory
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Recent Advisory Requests */}
          {advisoryRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Advisory Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {advisoryRequests.slice(0, 5).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{request.advisory_type.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">
                          Investment: <CurrencyDisplay amount={request.investment_amount} />
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={
                            request.status === 'completed' ? 'default' :
                            request.status === 'in_progress' ? 'secondary' : 'outline'
                          }
                        >
                          {request.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          Fee: <CurrencyDisplay amount={request.advisor_fee} />
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Monthly Subscription Revenue</p>
                    <p className="text-2xl font-bold text-green-600">
                      <CurrencyDisplay amount={getTotalMonthlyRevenue()} />
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Advisory Revenue</p>
                    <p className="text-2xl font-bold text-blue-600">
                      <CurrencyDisplay amount={getAdvisoryRevenue()} />
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Subscribers</p>
                    <p className="text-2xl font-bold">
                      {subscriptions.filter(sub => 
                        sub.status === 'active' && 
                        new Date(sub.expires_at) > new Date()
                      ).length}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription History</CardTitle>
            </CardHeader>
            <CardContent>
              {subscriptions.length > 0 ? (
                <div className="space-y-3">
                  {subscriptions.map((subscription) => (
                    <div key={subscription.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{subscription.subscription_type.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">
                          Created: {new Date(subscription.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={subscription.status === 'active' ? 'default' : 'secondary'}
                        >
                          {subscription.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          <CurrencyDisplay amount={subscription.monthly_fee} />/month
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No subscription history yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Subscription Dialog */}
      <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subscribe to Premium</DialogTitle>
            <DialogDescription>
              Unlock advanced features and take your financial journey to the next level.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Selected Plan</Label>
              <div className="mt-2 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {subscriptionPlans.find(p => p.type === selectedPlan)?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {subscriptionPlans.find(p => p.type === selectedPlan)?.description}
                    </p>
                  </div>
                  <p className="text-xl font-bold">
                    <CurrencyDisplay amount={subscriptionPricing[selectedPlan]} />
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleSubscribe} 
              disabled={isSubscribing}
              className="w-full"
            >
              {isSubscribing ? 'Processing...' : 'Subscribe Now'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Advisory Dialog */}
      <Dialog open={showAdvisoryDialog} onOpenChange={setShowAdvisoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Investment Advisory</DialogTitle>
            <DialogDescription>
              Get professional investment advice tailored to your goals.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Advisory Type</Label>
              <Select
                value={advisoryForm.advisoryType}
                onValueChange={(value: any) => 
                  setAdvisoryForm({ ...advisoryForm, advisoryType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {advisoryOptions.map((option) => (
                    <SelectItem key={option.type} value={option.type}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Investment Amount</Label>
              <Input
                type="number"
                value={advisoryForm.investmentAmount}
                onChange={(e) => 
                  setAdvisoryForm({ ...advisoryForm, investmentAmount: e.target.value })
                }
                placeholder="50000"
              />
            </div>

            <div>
              <Label>Risk Profile</Label>
              <Select
                value={advisoryForm.riskProfile}
                onValueChange={(value: any) => 
                  setAdvisoryForm({ ...advisoryForm, riskProfile: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Conservative (Low Risk)</SelectItem>
                  <SelectItem value="medium">Moderate (Medium Risk)</SelectItem>
                  <SelectItem value="high">Aggressive (High Risk)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {advisoryForm.investmentAmount && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  Estimated Fee: <span className="font-medium">
                    <CurrencyDisplay amount={calculateAdvisoryFee()} />
                  </span>
                </p>
              </div>
            )}

            <Button 
              onClick={handleRequestAdvisory} 
              disabled={isRequestingAdvisory || !advisoryForm.investmentAmount}
              className="w-full"
            >
              {isRequestingAdvisory ? 'Submitting...' : 'Request Advisory'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PremiumFeaturesHub;