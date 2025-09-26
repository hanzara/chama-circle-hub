import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface PremiumSubscription {
  id: string;
  user_id: string;
  chama_id?: string;
  subscription_type: 'individual' | 'chama_admin' | 'enterprise';
  features: string[];
  monthly_fee: number;
  billing_cycle: string;
  status: 'active' | 'inactive' | 'expired';
  expires_at: string;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

export interface InvestmentAdvisory {
  id: string;
  user_id: string;
  advisory_type: 'ai_recommendation' | 'expert_consultation' | 'portfolio_review';
  investment_amount: number;
  risk_profile: 'low' | 'medium' | 'high';
  recommendations: any;
  status: 'pending' | 'completed' | 'in_progress';
  advisor_fee: number;
  created_at: string;
  updated_at: string;
}

const PREMIUM_FEATURES = {
  individual: [
    'Advanced Analytics',
    'Priority Support',
    'Lower Transaction Fees',
    'Investment Advisory',
    'Custom Savings Goals',
    'Automated Savings',
  ],
  chama_admin: [
    'All Individual Features',
    'Member Management Tools',
    'Advanced Reporting',
    'Bulk Operations',
    'Custom Roles & Permissions',
    'WhatsApp Integration',
    'Automated Reminders',
  ],
  enterprise: [
    'All Previous Features',
    'API Access',
    'Custom Integrations',
    'Dedicated Support',
    'White-label Options',
    'Advanced Security',
    'Custom Analytics',
  ]
};

const SUBSCRIPTION_PRICING = {
  individual: 299, // KES per month
  chama_admin: 799, // KES per month
  enterprise: 1999, // KES per month
};

export const usePremiumFeatures = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's premium subscriptions
  const {
    data: subscriptions = [],
    isLoading: isLoadingSubscriptions
  } = useQuery({
    queryKey: ['premium-subscriptions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('premium_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PremiumSubscription[];
    },
    enabled: !!user,
  });

  // Fetch investment advisory requests
  const {
    data: advisoryRequests = [],
    isLoading: isLoadingAdvisory
  } = useQuery({
    queryKey: ['investment-advisory', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('investment_advisory')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as InvestmentAdvisory[];
    },
    enabled: !!user,
  });

  // Subscribe to premium features
  const subscribeMutation = useMutation({
    mutationFn: async ({
      subscriptionType,
      chamaId,
    }: {
      subscriptionType: 'individual' | 'chama_admin' | 'enterprise';
      chamaId?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const features = PREMIUM_FEATURES[subscriptionType];
      const monthlyFee = SUBSCRIPTION_PRICING[subscriptionType];

      const { data, error } = await supabase
        .from('premium_subscriptions')
        .insert({
          user_id: user.id,
          chama_id: chamaId,
          subscription_type: subscriptionType,
          features,
          monthly_fee: monthlyFee,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['premium-subscriptions'] });
      toast({
        title: "Premium Subscription Activated",
        description: "Welcome to premium! Your features are now active.",
      });
    },
    onError: (error) => {
      toast({
        title: "Subscription Failed",
        description: error.message || "Failed to activate premium subscription",
        variant: "destructive",
      });
    },
  });

  // Request investment advisory
  const requestAdvisoryMutation = useMutation({
    mutationFn: async ({
      advisoryType,
      investmentAmount,
      riskProfile,
    }: {
      advisoryType: 'ai_recommendation' | 'expert_consultation' | 'portfolio_review';
      investmentAmount: number;
      riskProfile: 'low' | 'medium' | 'high';
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Calculate advisor fee based on type and amount
      let advisorFee = 0;
      switch (advisoryType) {
        case 'ai_recommendation':
          advisorFee = Math.max(99, investmentAmount * 0.001); // Min 99 KES or 0.1%
          break;
        case 'expert_consultation':
          advisorFee = Math.max(499, investmentAmount * 0.005); // Min 499 KES or 0.5%
          break;
        case 'portfolio_review':
          advisorFee = Math.max(999, investmentAmount * 0.01); // Min 999 KES or 1%
          break;
      }

      const { data, error } = await supabase
        .from('investment_advisory')
        .insert({
          user_id: user.id,
          advisory_type: advisoryType,
          investment_amount: investmentAmount,
          risk_profile: riskProfile,
          advisor_fee: advisorFee,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment-advisory'] });
      toast({
        title: "Advisory Request Submitted",
        description: "Our experts will review your request and get back to you soon.",
      });
    },
    onError: (error) => {
      toast({
        title: "Request Failed",
        description: error.message || "Failed to submit advisory request",
        variant: "destructive",
      });
    },
  });

  // Helper functions
  const hasActiveSubscription = (type?: string) => {
    return subscriptions.some(sub => 
      sub.status === 'active' && 
      new Date(sub.expires_at) > new Date() &&
      (!type || sub.subscription_type === type)
    );
  };

  const hasFeature = (feature: string) => {
    return subscriptions.some(sub => 
      sub.status === 'active' && 
      new Date(sub.expires_at) > new Date() &&
      sub.features.includes(feature)
    );
  };

  const getActiveSubscription = () => {
    return subscriptions.find(sub => 
      sub.status === 'active' && 
      new Date(sub.expires_at) > new Date()
    );
  };

  const getTotalMonthlyRevenue = () => {
    return subscriptions
      .filter(sub => 
        sub.status === 'active' && 
        new Date(sub.expires_at) > new Date()
      )
      .reduce((total, sub) => total + sub.monthly_fee, 0);
  };

  const getAdvisoryRevenue = () => {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    
    return advisoryRequests
      .filter(req => 
        req.status === 'completed' &&
        new Date(req.updated_at) >= thisMonth
      )
      .reduce((total, req) => total + req.advisor_fee, 0);
  };

  return {
    // Data
    subscriptions,
    advisoryRequests,
    premiumFeatures: PREMIUM_FEATURES,
    subscriptionPricing: SUBSCRIPTION_PRICING,
    
    // Loading states
    isLoadingSubscriptions,
    isLoadingAdvisory,
    
    // Mutations
    subscribe: subscribeMutation.mutate,
    isSubscribing: subscribeMutation.isPending,
    
    requestAdvisory: requestAdvisoryMutation.mutate,
    isRequestingAdvisory: requestAdvisoryMutation.isPending,
    
    // Helper functions
    hasActiveSubscription,
    hasFeature,
    getActiveSubscription,
    getTotalMonthlyRevenue,
    getAdvisoryRevenue,
  };
};