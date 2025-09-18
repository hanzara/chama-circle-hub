import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface CreditScoreCardProps {
  score: number;
  riskLevel: 'low' | 'medium' | 'high';
  lastUpdated?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const CreditScoreCard: React.FC<CreditScoreCardProps> = ({
  score,
  riskLevel,
  lastUpdated,
  onRefresh,
  isLoading = false
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 800) return 'text-green-600';
    if (score >= 700) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      default: return 'outline';
    }
  };

  const getScoreDescription = (score: number) => {
    if (score >= 800) return 'Excellent credit - best loan rates available';
    if (score >= 700) return 'Good credit - competitive rates';
    if (score >= 600) return 'Fair credit - moderate rates';
    return 'Poor credit - limited options';
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-semibold">AI Credit Score</CardTitle>
          <CardDescription>
            Based on transaction patterns and financial behavior
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
        >
          {isLoading ? "Analyzing..." : "Refresh"}
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
              {score}
            </div>
            <p className="text-sm text-muted-foreground">
              {getScoreDescription(score)}
            </p>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <Badge variant={getRiskBadgeVariant(riskLevel)}>
              {riskLevel.toUpperCase()} RISK
            </Badge>
            {score >= 700 ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : score >= 600 ? (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Credit Score Range</span>
            <span>{score}/1000</span>
          </div>
          <Progress value={(score / 1000) * 100} className="w-full" />
        </div>
        
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">85%</div>
            <p className="text-xs text-muted-foreground">Payment History</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">12%</div>
            <p className="text-xs text-muted-foreground">Credit Utilization</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">24mo</div>
            <p className="text-xs text-muted-foreground">Credit History</p>
          </div>
        </div>
        
        {lastUpdated && (
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(lastUpdated).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
};