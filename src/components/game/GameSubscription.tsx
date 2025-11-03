
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Zap, 
  Crown, 
  Star,
  Target,
  Trophy,
  TrendingUp,
  Users,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GameSubscriptionProps {
  currentBalance: number;
  onSubscribe: (cost: number) => void;
}

const GameSubscription: React.FC<GameSubscriptionProps> = ({ currentBalance, onSubscribe }) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);
  const { toast } = useToast();

  const subscriptionPlans = [
    {
      id: 'basic',
      name: 'Basic Premium',
      monthlyPrice: 50,
      annualPrice: 500,
      color: 'from-blue-500 to-indigo-600',
      features: [
        'Double points per game',
        'Access to premium categories',
        '3 extra lives per game',
        'Priority game registration',
        'Basic statistics tracking'
      ],
      maxPoints: 2000,
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium Plus',
      monthlyPrice: 100,
      annualPrice: 1000,
      color: 'from-purple-500 to-pink-600',
      features: [
        'Triple points per game',
        'All premium categories',
        '5 extra lives per game',
        'VIP game registration',
        'Advanced analytics',
        'Weekly bonus games',
        'Custom avatars'
      ],
      maxPoints: 3000,
      popular: true
    },
    {
      id: 'ultimate',
      name: 'Ultimate Champion',
      monthlyPrice: 200,
      annualPrice: 2000,
      color: 'from-yellow-500 to-orange-600',
      features: [
        'Quadruple points per game',
        'Exclusive champion categories',
        'Unlimited lives',
        'First priority registration',
        'Complete analytics suite',
        'Daily bonus games',
        'Exclusive champion badge',
        'Monthly cash bonuses',
        'Personal game coach'
      ],
      maxPoints: 5000,
      popular: false
    }
  ];

  const handleSubscribe = (planId: string) => {
    const plan = subscriptionPlans.find(p => p.id === planId);
    if (!plan) return;

    const cost = isAnnual ? plan.annualPrice : plan.monthlyPrice;
    
    if (currentBalance < cost) {
      toast({
        title: "Insufficient Balance",
        description: `You need KSh ${cost - currentBalance} more to subscribe to this plan.`,
        variant: "destructive",
      });
      return;
    }

    onSubscribe(cost);
    setSelectedPlan(planId);
    
    toast({
      title: "Subscription Activated!",
      description: `Welcome to ${plan.name}! Your premium features are now active.`,
    });
  };

  const currentBenefits = [
    { icon: Star, title: "1x Point Multiplier", description: "Standard points per correct answer" },
    { icon: Target, title: "Basic Categories", description: "Access to 4 basic trivia categories" },
    { icon: Trophy, title: "Standard Lives", description: "3 lives per game session" },
    { icon: Users, title: "Regular Registration", description: "Join games when slots available" }
  ];

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-gray-50 to-slate-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-gray-600" />
            Current Plan: Free Tier
          </CardTitle>
          <CardDescription>
            Upgrade to premium for enhanced gaming experience and bigger rewards
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {currentBenefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="flex items-center gap-3">
                  <IconComponent className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="font-medium text-gray-700">{benefit.title}</div>
                    <div className="text-sm text-gray-500">{benefit.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4 p-4 bg-white rounded-lg border">
        <span className={`font-medium ${!isAnnual ? 'text-blue-600' : 'text-gray-500'}`}>
          Monthly
        </span>
        <Switch
          checked={isAnnual}
          onCheckedChange={setIsAnnual}
        />
        <span className={`font-medium ${isAnnual ? 'text-green-600' : 'text-gray-500'}`}>
          Annual
        </span>
        {isAnnual && (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Save 17%
          </Badge>
        )}
      </div>

      {/* Subscription Plans */}
      <div className="grid gap-6 md:grid-cols-3">
        {subscriptionPlans.map((plan) => {
          const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
          const canAfford = currentBalance >= price;
          
          return (
            <Card
              key={plan.id}
              className={`border-2 transition-all duration-200 ${
                plan.popular 
                  ? 'border-purple-500 shadow-lg scale-105' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {plan.popular && (
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white text-center py-2 text-sm font-medium">
                  <Sparkles className="inline h-4 w-4 mr-1" />
                  Most Popular
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center mb-4`}>
                  <Crown className="h-8 w-8 text-white" />
                </div>
                
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                
                <div className="space-y-2">
                  <div className="text-3xl font-bold">
                    KSh {price.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    per {isAnnual ? 'year' : 'month'}
                  </div>
                  {isAnnual && (
                    <div className="text-xs text-green-600">
                      Save KSh {(plan.monthlyPrice * 12 - plan.annualPrice).toLocaleString()} annually
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-green-600">
                    Up to {plan.maxPoints.toLocaleString()} points per game
                  </div>
                  <div className="text-sm text-gray-600">
                    Max earning: KSh {(plan.maxPoints * 0.1).toLocaleString()}
                  </div>
                </div>
                
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={!canAfford}
                  className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 disabled:opacity-50`}
                >
                  {!canAfford ? (
                    `Need KSh ${(price - currentBalance).toLocaleString()} more`
                  ) : (
                    `Subscribe for KSh ${price.toLocaleString()}`
                  )}
                </Button>
                
                {!canAfford && (
                  <p className="text-xs text-center text-red-500">
                    Insufficient balance. Please deposit more funds.
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Premium Benefits Overview */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            Why Go Premium?
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Maximize Your Earnings</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Earn 2x-4x more points per game</li>
                <li>• Access exclusive high-value categories</li>
                <li>• Monthly cash bonuses for premium members</li>
                <li>• Priority access to special tournaments</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Enhanced Experience</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Advanced game analytics and insights</li>
                <li>• Custom avatars and badges</li>
                <li>• Extended game time with extra lives</li>
                <li>• Personal coaching and tips</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameSubscription;
