import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface CreditScoreWidgetProps {
  score: number;
  totalBorrowed?: number;
  totalRepaid?: number;
  onTimePayments?: number;
  latePayments?: number;
}

export const CreditScoreWidget = ({
  score,
  totalBorrowed = 0,
  totalRepaid = 0,
  onTimePayments = 0,
  latePayments = 0,
}: CreditScoreWidgetProps) => {
  const getScoreColor = () => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = () => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const getScoreEmoji = () => {
    if (score >= 80) return '💪';
    if (score >= 60) return '⭐';
    if (score >= 40) return '👍';
    return '⚠️';
  };

  const getTrendIcon = () => {
    if (score >= 70) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (score >= 40) return <Minus className="w-4 h-4 text-yellow-600" />;
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  const repaymentRate = totalBorrowed > 0 
    ? ((totalRepaid / totalBorrowed) * 100).toFixed(1)
    : '0';

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Main Score Display */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Credit Score</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-3xl font-bold ${getScoreColor()}`}>
                {score}
              </span>
              <span className="text-muted-foreground">/100</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-1">{getScoreEmoji()}</div>
            <p className={`text-sm font-medium ${getScoreColor()}`}>
              {getScoreLabel()}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={score} className="h-3" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Improving {getTrendIcon()}</span>
            <span>Next milestone: {Math.ceil(score / 20) * 20}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Repayment Rate</p>
            <p className="text-lg font-semibold">{repaymentRate}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">On-Time Payments</p>
            <p className="text-lg font-semibold text-green-600">{onTimePayments}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Borrowed</p>
            <p className="text-sm font-medium">
              KES {totalBorrowed.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Repaid</p>
            <p className="text-sm font-medium text-green-600">
              KES {totalRepaid.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-xs font-medium mb-1">💡 Improve Your Score</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Pay on time (+5 points)</li>
            <li>• Pay early (+10 points)</li>
            <li>• Complete full repayment (+20 points)</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};