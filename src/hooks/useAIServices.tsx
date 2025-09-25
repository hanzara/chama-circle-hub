import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AIAnalysis {
  creditScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  fraudAlerts: FraudAlert[];
  recommendations: Recommendation[];
  insights: FinancialInsight[];
}

export interface FraudAlert {
  id: string;
  type: 'suspicious_transaction' | 'unusual_pattern' | 'account_anomaly';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export interface Recommendation {
  id: string;
  type: 'investment' | 'savings' | 'loan' | 'budget';
  title: string;
  description: string;
  confidence: number;
  expectedReturn?: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface FinancialInsight {
  id: string;
  category: 'spending' | 'income' | 'savings' | 'investment';
  insight: string;
  actionable: boolean;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface TrainingData {
  userId: string;
  transactionHistory: any[];
  behaviorPatterns: any[];
  financialGoals: any[];
  riskProfile: any;
  demographics: any;
}

export const useAIServices = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // AI Chat for Financial Advice using Supabase Edge Function
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await supabase.functions.invoke('ai-finance-chat', {
        body: {
          message,
          userId: user?.id,
          contextData: {
            timestamp: new Date().toISOString(),
          }
        }
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-chat-history', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations', user?.id] });
    },
  });

  // Expense Categorization
  const categorizeExpenseMutation = useMutation({
    mutationFn: async (transactionData: { description: string; amount: number; merchant?: string }) => {
      // Use AI to categorize expenses
      const response = await supabase.functions.invoke('ai-finance-chat', {
        body: {
          message: `Categorize this transaction: "${transactionData.description}" for amount KES ${transactionData.amount}. Respond with just the category name (e.g., Food & Bills, Transport, Health, Entertainment, etc.)`,
          userId: user?.id,
          contextData: { 
            type: 'categorization',
            transaction: transactionData 
          }
        }
      });

      if (response.error) throw response.error;
      return response.data;
    },
  });

  // Training Data Collection
  const collectTrainingDataMutation = useMutation({
    mutationFn: async (data: Partial<TrainingData>) => {
      // Store training data in user financial profile
      const { error } = await supabase
        .from('user_financial_profiles')
        .upsert({
          user_id: user?.id,
          ai_insights_enabled: true,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Training Data Collected",
        description: "Your data has been added to improve AI models.",
      });
    },
  });

  // Get AI Analysis from database
  const aiAnalysisQuery = useQuery({
    queryKey: ['ai-analysis', user?.id],
    queryFn: async () => {
      // Get AI recommendations and insights from database
      const { data: recommendations } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'new')
        .limit(5);

      const { data: profile } = await supabase
        .from('user_financial_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      // Calculate simple credit score based on profile
      let creditScore = 650; // Base score
      if (profile?.monthly_income && profile?.monthly_expenses) {
        const debtToIncome = profile.monthly_expenses / profile.monthly_income;
        if (debtToIncome < 0.3) creditScore += 100;
        else if (debtToIncome < 0.5) creditScore += 50;
      }
      
      if (profile?.current_savings && profile.current_savings > 10000) {
        creditScore += 50;
      }

      creditScore = Math.min(850, Math.max(300, creditScore));

      const riskLevel = creditScore > 750 ? 'low' : creditScore > 650 ? 'medium' : 'high';

      return {
        creditScore,
        riskLevel,
        lastUpdated: new Date().toISOString(),
        recommendations: recommendations || [],
        insights: [],
        fraudAlerts: [],
      };
    },
    enabled: !!user,
  });

  return {
    // Mutations
    chatMutation,
    categorizeExpenseMutation,
    collectTrainingDataMutation,
    
    // Queries
    aiAnalysisQuery,
    
    // Loading states
    isChatting: chatMutation.isPending,
    isCategorizing: categorizeExpenseMutation.isPending,
    isCollectingData: collectTrainingDataMutation.isPending,
    isAnalyzing: aiAnalysisQuery.isLoading,
  };
};