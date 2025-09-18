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

  // Credit Scoring
  const creditScoreMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/ai/credit-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-analysis'] });
    },
  });

  // Fraud Detection
  const fraudDetectionMutation = useMutation({
    mutationFn: async (transactionData: any) => {
      const response = await fetch('/api/ai/fraud-detection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData),
      });
      return response.json();
    },
  });

  // AI Chat for Financial Advice
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      // This would integrate with OpenAI or another AI service
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, userId: user?.id }),
      });
      return response.json();
    },
  });

  // Investment Recommendations
  const investmentRecommendationsMutation = useMutation({
    mutationFn: async (riskProfile: any) => {
      const response = await fetch('/api/ai/investment-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riskProfile, userId: user?.id }),
      });
      return response.json();
    },
  });

  // Training Data Collection (storing in profiles for now)
  const collectTrainingDataMutation = useMutation({
    mutationFn: async (data: Partial<TrainingData>) => {
      // Store training data in user profile metadata for now
      const { error } = await supabase
        .from('profiles')
        .update({
          ai_training_data: data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

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

  // Get AI Analysis (mock data for now)
  const aiAnalysisQuery = useQuery({
    queryKey: ['ai-analysis', user?.id],
    queryFn: async () => {
      // Return mock AI analysis data until backend is ready
      return {
        creditScore: 750,
        riskLevel: 'medium' as const,
        lastUpdated: new Date().toISOString(),
        recommendations: [],
        insights: [],
      };
    },
    enabled: !!user,
  });

  return {
    // Mutations
    creditScoreMutation,
    fraudDetectionMutation,
    chatMutation,
    investmentRecommendationsMutation,
    collectTrainingDataMutation,
    
    // Queries
    aiAnalysisQuery,
    
    // Loading states
    isAnalyzing: creditScoreMutation.isPending,
    isDetectingFraud: fraudDetectionMutation.isPending,
    isChatting: chatMutation.isPending,
    isGeneratingRecommendations: investmentRecommendationsMutation.isPending,
    isCollectingData: collectTrainingDataMutation.isPending,
  };
};