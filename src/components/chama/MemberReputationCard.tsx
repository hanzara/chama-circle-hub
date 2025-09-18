
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, TrendingDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface MemberReputationProps {
  memberName: string;
  contributionScore: number;
  repaymentScore: number;
  participationScore: number;
  overallScore: number;
  lastCalculated: string;
}

const MemberReputationCard: React.FC<MemberReputationProps> = ({
  memberName,
  contributionScore,
  repaymentScore,
  participationScore,
  overallScore,
  lastCalculated
}) => {
  const { t } = useLanguage();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{memberName}</CardTitle>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <Badge variant={getScoreBadgeVariant(overallScore)}>
              {overallScore.toFixed(1)}
            </Badge>
          </div>
        </div>
        <CardDescription>
          {t('member.reputation')} • Updated {new Date(lastCalculated).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">{t('reputation.contribution')}</span>
              <span className={`text-sm font-medium ${getScoreColor(contributionScore)}`}>
                {contributionScore.toFixed(1)}%
              </span>
            </div>
            <Progress value={contributionScore} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">{t('reputation.repayment')}</span>
              <span className={`text-sm font-medium ${getScoreColor(repaymentScore)}`}>
                {repaymentScore.toFixed(1)}%
              </span>
            </div>
            <Progress value={repaymentScore} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">{t('reputation.participation')}</span>
              <span className={`text-sm font-medium ${getScoreColor(participationScore)}`}>
                {participationScore.toFixed(1)}%
              </span>
            </div>
            <Progress value={participationScore} className="h-2" />
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex justify-between items-center">
            <span className="font-medium">{t('reputation.overall')}</span>
            <div className="flex items-center gap-2">
              {overallScore >= 75 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`font-bold ${getScoreColor(overallScore)}`}>
                {overallScore.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MemberReputationCard;
