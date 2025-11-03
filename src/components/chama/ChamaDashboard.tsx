import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { useChamaMetrics } from '@/hooks/useChamaMetrics';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Calendar,
  Vote,
  Target,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ChamaDashboardProps {
  chamaId: string;
}

export const ChamaDashboard: React.FC<ChamaDashboardProps> = ({ chamaId }) => {
  const { t } = useLanguage();
  const { data: metrics } = useChamaMetrics(chamaId);

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.net.worth')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CurrencyDisplay 
              amount={(metrics as any)?.net_worth || 0} 
              className="text-2xl font-bold" 
              showToggle={false} 
            />
            <p className="text-xs text-muted-foreground">
              Total group savings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.upcoming.contributions')}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics as any)?.upcoming_contributions_count || 0}</div>
            <p className="text-xs text-muted-foreground">
              Members due this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.pending.votes')}</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics as any)?.pending_votes_count || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active voting sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.roi')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics as any)?.roi_percentage || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Annual return rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Group Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Contribution Compliance</span>
                <span>{(metrics as any)?.average_repayment_performance || 0}%</span>
              </div>
              <Progress 
                value={(metrics as any)?.average_repayment_performance || 0} 
                className="h-2"
                color={(metrics as any)?.average_repayment_performance >= 85 ? 'primary' : 
                       (metrics as any)?.average_repayment_performance >= 70 ? 'warning' : 'destructive'}
              />
              <p className="text-sm text-muted-foreground">
                {(metrics as any)?.average_repayment_performance || 0}% Average Repayment Rate
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="flex items-center justify-between p-2 border rounded-lg">
                <span className="text-sm">Pending Approvals</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex items-center justify-between p-2 border rounded-lg">
                <span className="text-sm">Loan Applications</span>
                <span className="font-medium">2</span>
              </div>
              <div className="flex items-center justify-between p-2 border rounded-lg">
                <span className="text-sm">Overdue Payments</span>
                <span className="font-medium text-destructive">1</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};