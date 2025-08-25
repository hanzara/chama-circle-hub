import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  AlertTriangle, 
  RefreshCw, 
  Activity, 
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Settings,
  Zap
} from "lucide-react";

const failureEvents = [
  {
    id: "1",
    timestamp: "2 minutes ago",
    channel: "PayPal API",
    reason: "Rate limit exceeded",
    failedAmount: "$2,450.00",
    retryStatus: "retrying",
    alternativeUsed: "Stripe API",
    success: true
  },
  {
    id: "2",
    timestamp: "15 minutes ago", 
    channel: "Wise API",
    reason: "Service temporarily unavailable",
    failedAmount: "$890.00",
    retryStatus: "failed",
    alternativeUsed: "SWIFT Wire",
    success: false
  },
  {
    id: "3",
    timestamp: "1 hour ago",
    channel: "Crypto.com API",
    reason: "Invalid API key",
    failedAmount: "$1,200.00",
    retryStatus: "resolved",
    alternativeUsed: "Binance API",
    success: true
  }
];

const alertRules = [
  {
    id: "1",
    name: "High Value Payment Failure",
    condition: "Amount > $1000 AND consecutive failures > 2",
    action: "Immediate SMS + Email alert",
    enabled: true
  },
  {
    id: "2",
    name: "API Key Expiration",
    condition: "API key expires within 7 days",
    action: "Daily email reminder",
    enabled: true
  },
  {
    id: "3",
    name: "Channel Downtime",
    condition: "Channel unavailable > 30 minutes",
    action: "Switch to backup + notify",
    enabled: false
  }
];

const monitoringMetrics = [
  {
    label: "System Uptime",
    value: "99.97%",
    status: "excellent",
    change: "+0.02%"
  },
  {
    label: "Auto-Recovery Rate",
    value: "94.3%",
    status: "good", 
    change: "+1.2%"
  },
  {
    label: "Avg Recovery Time",
    value: "45s",
    status: "good",
    change: "-12s"
  },
  {
    label: "Failed Payments",
    value: "0.8%",
    status: "excellent",
    change: "-0.3%"
  }
];

export const AntiBlockageSection = () => {
  const [autoRetryEnabled, setAutoRetryEnabled] = useState(true);
  const [maxRetries, setMaxRetries] = useState("3");
  const [retryDelay, setRetryDelay] = useState("30");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "retrying":
        return <RefreshCw className="w-4 h-4 text-yellow-600 animate-spin" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-green-600";
      case "good":
        return "text-blue-600";
      case "warning":
        return "text-yellow-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-muted-foreground";
    }
  };

  const getMetricVariant = (status: string) => {
    switch (status) {
      case "excellent":
        return "default" as const;
      case "good":
        return "secondary" as const;
      case "warning":
        return "outline" as const;
      case "critical":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Anti-Blockage Mode</h1>
        <p className="text-muted-foreground">
          Real-time monitoring and automatic failover for payment channel reliability
        </p>
      </div>

      <Tabs defaultValue="monitoring" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
          <TabsTrigger value="failures">Failure Events</TabsTrigger>
          <TabsTrigger value="alerts">Alert Rules</TabsTrigger>
          <TabsTrigger value="settings">Retry Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="space-y-6">
          {/* Real-time Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {monitoringMetrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">{metric.value}</div>
                      <p className="text-sm text-muted-foreground">{metric.label}</p>
                    </div>
                    <Badge variant={getMetricVariant(metric.status)}>
                      {metric.change}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Live Status Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Channel Health Status
              </CardTitle>
              <CardDescription>Real-time status of all payment channels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Stripe API", status: "operational", latency: "120ms", uptime: "100%" },
                  { name: "PayPal API", status: "degraded", latency: "850ms", uptime: "98.2%" },
                  { name: "Wise API", status: "operational", latency: "200ms", uptime: "99.8%" },
                  { name: "Crypto APIs", status: "operational", latency: "300ms", uptime: "99.5%" },
                  { name: "Flutterwave API", status: "maintenance", latency: "N/A", uptime: "0%" },
                ].map((channel, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        channel.status === "operational" ? "bg-green-500" :
                        channel.status === "degraded" ? "bg-yellow-500" :
                        "bg-red-500"
                      }`} />
                      <div>
                        <p className="font-medium">{channel.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{channel.status}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Latency: {channel.latency}</p>
                      <p className="text-sm text-muted-foreground">Uptime: {channel.uptime}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Recent Failure Events
              </CardTitle>
              <CardDescription>
                Automatic failover events and recovery attempts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {failureEvents.map((event) => (
                <div key={event.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(event.retryStatus)}
                      <div>
                        <p className="font-medium">{event.channel}</p>
                        <p className="text-sm text-muted-foreground">{event.timestamp}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{event.failedAmount}</p>
                      <Badge variant={event.success ? "default" : "destructive"}>
                        {event.success ? "Recovered" : "Failed"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Failure Reason</p>
                      <p className="font-medium">{event.reason}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Alternative Used</p>
                      <p className="font-medium">{event.alternativeUsed}</p>
                    </div>
                  </div>
                  
                  {event.retryStatus === "retrying" && (
                    <div className="flex items-center gap-2 text-sm text-yellow-600">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Attempting automatic retry...</span>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Alert Rules Configuration
              </CardTitle>
              <CardDescription>
                Configure when and how to be notified about system issues
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {alertRules.map((rule) => (
                <div key={rule.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{rule.name}</h4>
                    <Switch checked={rule.enabled} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Trigger Condition</p>
                      <p className="font-medium">{rule.condition}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Action</p>
                      <p className="font-medium">{rule.action}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full">
                <Bell className="w-4 h-4 mr-2" />
                Add New Alert Rule
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Auto-Retry Configuration
              </CardTitle>
              <CardDescription>
                Configure how the system handles payment failures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Enable Auto-Retry</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically retry failed payments through alternative channels
                    </p>
                  </div>
                </div>
                <Switch checked={autoRetryEnabled} onCheckedChange={setAutoRetryEnabled} />
              </div>

              {autoRetryEnabled && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Maximum Retry Attempts</Label>
                      <Select value={maxRetries} onValueChange={setMaxRetries}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 attempt</SelectItem>
                          <SelectItem value="2">2 attempts</SelectItem>
                          <SelectItem value="3">3 attempts</SelectItem>
                          <SelectItem value="5">5 attempts</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Retry Delay (seconds)</Label>
                      <Select value={retryDelay} onValueChange={setRetryDelay}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 seconds</SelectItem>
                          <SelectItem value="30">30 seconds</SelectItem>
                          <SelectItem value="60">1 minute</SelectItem>
                          <SelectItem value="300">5 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Fallback Channel Priority</h4>
                    <p className="text-sm text-muted-foreground">
                      Drag to reorder fallback channels for automatic retry
                    </p>
                    
                    <div className="space-y-2">
                      {[
                        "Stripe API (Primary backup)",
                        "Wise API (Secondary backup)", 
                        "PayPal API (Tertiary backup)",
                        "Manual processing (Last resort)"
                      ].map((channel, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-6 bg-muted-foreground rounded cursor-move" />
                            <span>{channel}</span>
                          </div>
                          <Badge variant="outline">Priority {index + 1}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};