import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Shield, DollarSign, Clock, Star, AlertCircle } from 'lucide-react';
import { Recommendation } from '@/hooks/useAIServices';

interface InvestmentRecommendationsProps {
  recommendations: Recommendation[];
  onLearnMore: (recommendation: Recommendation) => void;
  onInvest: (recommendation: Recommendation) => void;
  isLoading?: boolean;
}

export const InvestmentRecommendations: React.FC<InvestmentRecommendationsProps> = ({
  recommendations,
  onLearnMore,
  onInvest,
  isLoading = false
}) => {
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Mock recommendations if none provided
  const displayRecommendations = recommendations.length > 0 ? recommendations : [
    {
      id: '1',
      type: 'investment' as const,
      title: 'Kenya Government Treasury Bills',
      description: 'Secure government-backed investment with guaranteed returns. Perfect for conservative investors looking for steady income.',
      confidence: 92,
      expectedReturn: 12.5,
      riskLevel: 'low' as const,
    },
    {
      id: '2',
      type: 'investment' as const,
      title: 'SACCO Dividend Savings',
      description: 'Join a local SACCO for community-based savings with competitive dividends and loan access.',
      confidence: 88,
      expectedReturn: 8.0,
      riskLevel: 'low' as const,
    },
    {
      id: '3',
      type: 'investment' as const,
      title: 'NSE Index Fund',
      description: 'Diversified investment in top Kenyan companies through the Nairobi Securities Exchange.',
      confidence: 75,
      expectedReturn: 15.0,
      riskLevel: 'medium' as const,
    },
    {
      id: '4',
      type: 'investment' as const,
      title: 'Real Estate Investment Trust (REIT)',
      description: 'Invest in Kenyan real estate without large capital requirements. Monthly rental income distribution.',
      confidence: 70,
      expectedReturn: 18.5,
      riskLevel: 'medium' as const,
    },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Investment Recommendations</CardTitle>
          <CardDescription>Analyzing your profile...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>AI Investment Recommendations</span>
            </CardTitle>
            <CardDescription>
              Personalized investment opportunities based on your profile
            </CardDescription>
          </div>
          <Badge variant="secondary">
            {displayRecommendations.length} Options
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {displayRecommendations.map((recommendation) => (
          <Card key={recommendation.id} className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{recommendation.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {recommendation.description}
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={getRiskColor(recommendation.riskLevel)}
                  >
                    {recommendation.riskLevel.toUpperCase()} RISK
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-2 bg-muted/50 rounded">
                    <DollarSign className="h-4 w-4 mx-auto mb-1 text-green-600" />
                    <div className="text-lg font-bold text-green-600">
                      {recommendation.expectedReturn}%
                    </div>
                    <p className="text-xs text-muted-foreground">Expected Return</p>
                  </div>
                  
                  <div className="text-center p-2 bg-muted/50 rounded">
                    <Star className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                    <div className={`text-lg font-bold ${getConfidenceColor(recommendation.confidence)}`}>
                      {recommendation.confidence}%
                    </div>
                    <p className="text-xs text-muted-foreground">AI Confidence</p>
                  </div>
                  
                  <div className="text-center p-2 bg-muted/50 rounded">
                    <Shield className="h-4 w-4 mx-auto mb-1 text-purple-600" />
                    <div className="text-lg font-bold text-purple-600">
                      {recommendation.riskLevel === 'low' ? 'A+' : 
                       recommendation.riskLevel === 'medium' ? 'B+' : 'C+'}
                    </div>
                    <p className="text-xs text-muted-foreground">Safety Rating</p>
                  </div>
                  
                  <div className="text-center p-2 bg-muted/50 rounded">
                    <Clock className="h-4 w-4 mx-auto mb-1 text-orange-600" />
                    <div className="text-lg font-bold text-orange-600">
                      {recommendation.riskLevel === 'low' ? '1Y+' : 
                       recommendation.riskLevel === 'medium' ? '3Y+' : '5Y+'}
                    </div>
                    <p className="text-xs text-muted-foreground">Time Horizon</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>AI Confidence Score</span>
                    <span className={getConfidenceColor(recommendation.confidence)}>
                      {recommendation.confidence}%
                    </span>
                  </div>
                  <Progress value={recommendation.confidence} className="h-2" />
                </div>

                {recommendation.riskLevel === 'high' && (
                  <div className="flex items-center space-x-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <p className="text-xs text-yellow-700">
                      High-risk investment. Only invest what you can afford to lose.
                    </p>
                  </div>
                )}

                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onLearnMore(recommendation)}
                    className="flex-1"
                  >
                    Learn More
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onInvest(recommendation)}
                    className="flex-1"
                    disabled={recommendation.confidence < 60}
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="text-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Recommendations are updated weekly based on market conditions and your profile
          </p>
        </div>
      </CardContent>
    </Card>
  );
};