import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  TrendingDown, 
  X,
  Bell
} from 'lucide-react';
import { BudgetAlert, useBudgetTracker } from '@/hooks/useBudgetTracker';

interface BudgetAlertsProps {
  alerts: BudgetAlert[];
}

const BudgetAlerts: React.FC<BudgetAlertsProps> = ({ alerts }) => {
  const { markAlertAsRead } = useBudgetTracker();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'overspend':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'low_budget':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'recurring_reminder':
        return <Bell className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'overspend':
        return 'destructive';
      case 'low_budget':
        return 'default';
      case 'recurring_reminder':
        return 'default';
      default:
        return 'default';
    }
  };

  const getAlertBadgeText = (type: string) => {
    switch (type) {
      case 'overspend':
        return 'Over Budget';
      case 'low_budget':
        return 'Low Budget';
      case 'recurring_reminder':
        return 'Reminder';
      default:
        return 'Alert';
    }
  };

  if (alerts.length === 0) {
    return null;
  }

  return (
    <Card className="border-l-4 border-l-yellow-500">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Budget Alerts ({alerts.length})
            </h3>
          </div>
          
          <div className="space-y-2">
            {alerts.map((alert) => (
              <Alert 
                key={alert.id} 
                variant={getAlertVariant(alert.alert_type) as any}
                className="relative"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.alert_type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {getAlertBadgeText(alert.alert_type)}
                        </Badge>
                        {alert.category && (
                          <Badge variant="secondary" className="text-xs">
                            {alert.category}
                          </Badge>
                        )}
                        {alert.percentage_used && (
                          <Badge 
                            variant={alert.percentage_used >= 100 ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {alert.percentage_used.toFixed(1)}%
                          </Badge>
                        )}
                      </div>
                      <AlertDescription className="text-sm">
                        {alert.message}
                      </AlertDescription>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(alert.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAlertAsRead(alert.id)}
                    className="h-6 w-6 p-0 hover:bg-transparent"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Alert>
            ))}
          </div>
          
          {alerts.length > 3 && (
            <div className="text-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => alerts.forEach(alert => markAlertAsRead(alert.id))}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Mark All as Read
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetAlerts;