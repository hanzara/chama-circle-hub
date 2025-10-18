import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { useNavigate } from 'react-router-dom';

interface UpcomingContribution {
  id: string;
  chama_id: string;
  chama_name: string;
  amount: number;
  due_date: string;
  days_until_due: number;
  status: 'upcoming' | 'due' | 'overdue';
  member_role: string;
}

interface UpcomingContributionsProps {
  contributions: UpcomingContribution[];
}

export const UpcomingContributions: React.FC<UpcomingContributionsProps> = ({ 
  contributions 
}) => {
  const navigate = useNavigate();

  if (!contributions || contributions.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Contributions
          </CardTitle>
          <CardDescription>Your scheduled payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No Upcoming Contributions
            </h3>
            <p className="text-sm text-muted-foreground">
              You're all caught up with your chama contributions!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string, daysUntilDue: number) => {
    switch (status) {
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'due':
        return <Badge variant="secondary" className="bg-orange-500 text-white">Due Now</Badge>;
      case 'upcoming':
        if (daysUntilDue <= 3) {
          return <Badge variant="secondary" className="bg-yellow-500 text-white">Due Soon</Badge>;
        }
        return <Badge variant="outline">Upcoming</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string, daysUntilDue: number) => {
    if (status === 'overdue') {
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
    if (status === 'due' || daysUntilDue <= 3) {
      return <Clock className="h-4 w-4 text-orange-500" />;
    }
    return <Calendar className="h-4 w-4 text-primary" />;
  };

  const sortedContributions = [...contributions].sort((a, b) => {
    // Sort by urgency: overdue first, then due, then upcoming
    const urgencyOrder = { 'overdue': 0, 'due': 1, 'upcoming': 2 };
    const aUrgency = urgencyOrder[a.status as keyof typeof urgencyOrder];
    const bUrgency = urgencyOrder[b.status as keyof typeof urgencyOrder];
    
    if (aUrgency !== bUrgency) return aUrgency - bUrgency;
    return a.days_until_due - b.days_until_due;
  });

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Upcoming Contributions ({contributions.length})
        </CardTitle>
        <CardDescription>Your scheduled payments this month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedContributions.slice(0, 5).map((contribution) => (
            <div
              key={contribution.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(contribution.status, contribution.days_until_due)}
                <div>
                  <h4 className="font-medium">{contribution.chama_name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Due {new Date(contribution.due_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <CurrencyDisplay 
                  amount={contribution.amount} 
                  className="font-semibold" 
                  showToggle={false} 
                />
                <div className="mt-1">
                  {getStatusBadge(contribution.status, contribution.days_until_due)}
                </div>
              </div>
            </div>
          ))}

          {contributions.length > 5 && (
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => navigate('/chamas')}
            >
              View All Contributions
            </Button>
          )}

          <div className="pt-4 border-t">
            <Button 
              className="w-full" 
              onClick={() => navigate('/make-contribution')}
            >
              Make Contribution
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};