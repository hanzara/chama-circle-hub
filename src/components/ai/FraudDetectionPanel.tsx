import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, AlertTriangle, Clock, CheckCircle2, X } from 'lucide-react';
import { FraudAlert } from '@/hooks/useAIServices';

interface FraudDetectionPanelProps {
  alerts: FraudAlert[];
  onResolveAlert: (alertId: string) => void;
  onDismissAlert: (alertId: string) => void;
  isMonitoring?: boolean;
}

export const FraudDetectionPanel: React.FC<FraudDetectionPanelProps> = ({
  alerts,
  onResolveAlert,
  onDismissAlert,
  isMonitoring = true
}) => {
  const activeAlerts = alerts.filter(alert => !alert.resolved);
  const resolvedAlerts = alerts.filter(alert => alert.resolved);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low': return <Shield className="h-4 w-4 text-blue-500" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getAlertTypeDescription = (type: string) => {
    switch (type) {
      case 'suspicious_transaction': return 'Unusual transaction detected';
      case 'unusual_pattern': return 'Spending pattern anomaly';
      case 'account_anomaly': return 'Account behavior unusual';
      default: return 'Security alert';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <div>
                <CardTitle>AI Fraud Detection</CardTitle>
                <CardDescription>
                  Real-time monitoring of unusual account activity
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              <span className="text-sm text-muted-foreground">
                {isMonitoring ? 'Monitoring Active' : 'Monitoring Disabled'}
              </span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {activeAlerts.length === 0 ? (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>All Clear</AlertTitle>
              <AlertDescription>
                No suspicious activity detected. Your account is secure.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Active Alerts ({activeAlerts.length})
              </h4>
              {activeAlerts.map((alert) => (
                <Alert key={alert.id} className="border-l-4 border-l-red-500">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getSeverityIcon(alert.severity)}
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <AlertTitle className="text-sm">
                            {getAlertTypeDescription(alert.type)}
                          </AlertTitle>
                          <Badge variant={getSeverityBadge(alert.severity) as any}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <AlertDescription className="text-sm">
                          {alert.message}
                        </AlertDescription>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(alert.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onResolveAlert(alert.id)}
                      >
                        Resolve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDismissAlert(alert.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          )}
          
          {resolvedAlerts.length > 0 && (
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Recent Resolved ({resolvedAlerts.length})
              </h4>
              {resolvedAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-center space-x-3 p-2 bg-muted/50 rounded-md">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">
                      Resolved on {new Date(alert.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};