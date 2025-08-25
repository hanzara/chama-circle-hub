import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, BarChart3, DollarSign, Clock, Users, AlertTriangle } from "lucide-react";

export const AnalyticsSection = () => {
  const performanceMetrics = [
    { label: "Total Volume", value: "$234.5K", change: "+12.5%", changeType: "positive", icon: DollarSign },
    { label: "Success Rate", value: "98.5%", change: "+0.2%", changeType: "positive", icon: TrendingUp },
    { label: "Avg Processing Time", value: "2.3s", change: "-0.1s", changeType: "positive", icon: Clock },
    { label: "Active Users", value: "1,247", change: "+8.2%", changeType: "positive", icon: Users },
  ];

  const channelPerformance = [
    { channel: "Stripe", volume: "$89.2K", success: "99.1%", fees: "$2,587", trend: "up" },
    { channel: "PayPal", volume: "$67.3K", success: "97.8%", fees: "$2,356", trend: "up" },
    { channel: "Flutterwave", volume: "$34.1K", success: "96.5%", fees: "$477", trend: "down" },
    { channel: "Wise", volume: "$28.9K", success: "99.3%", fees: "$231", trend: "up" },
    { channel: "Crypto.com", volume: "$15.0K", success: "98.9%", fees: "$75", trend: "up" },
  ];

  const recentAlerts = [
    { type: "warning", message: "MTN MoMo API response time increased by 200%", time: "2 min ago" },
    { type: "error", message: "Failed payment threshold exceeded for Flutterwave", time: "15 min ago" },
    { type: "info", message: "New high-volume transaction detected", time: "1 hour ago" },
    { type: "success", message: "All payment channels are operational", time: "2 hours ago" },
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error": return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "success": return <TrendingUp className="h-4 w-4 text-accent" />;
      default: return <BarChart3 className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor performance metrics and payment channel analytics
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select defaultValue="7d">
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Export Report</Button>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-accent rounded-full"></div>
          <span className="text-sm text-muted-foreground">Live data</span>
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="p-4 bg-gradient-card shadow-card hover:shadow-glow transition-smooth">
              <div className="flex items-center justify-between mb-2">
                <Icon className="h-5 w-5 text-primary" />
                <div className={`flex items-center space-x-1 ${
                  metric.changeType === "positive" ? "text-accent" : "text-destructive"
                }`}>
                  {metric.changeType === "positive" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span className="text-xs font-medium">{metric.change}</span>
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{metric.value}</div>
              <div className="text-sm text-muted-foreground">{metric.label}</div>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Volume Chart */}
            <Card className="p-6 bg-gradient-card shadow-card">
              <h3 className="text-lg font-semibold mb-4">Transaction Volume</h3>
              <div className="h-64 bg-gradient-dashboard rounded-lg flex items-center justify-center mb-4">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                  <div className="text-sm">Interactive volume chart</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold">$89.2K</div>
                  <div className="text-xs text-muted-foreground">Today</div>
                </div>
                <div>
                  <div className="text-lg font-bold">$534.7K</div>
                  <div className="text-xs text-muted-foreground">This Week</div>
                </div>
                <div>
                  <div className="text-lg font-bold">$2.1M</div>
                  <div className="text-xs text-muted-foreground">This Month</div>
                </div>
              </div>
            </Card>

            {/* Success Rate Chart */}
            <Card className="p-6 bg-gradient-card shadow-card">
              <h3 className="text-lg font-semibold mb-4">Success Rate Trends</h3>
              <div className="h-64 bg-gradient-dashboard rounded-lg flex items-center justify-center mb-4">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                  <div className="text-sm">Success rate over time</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-accent">98.5%</div>
                  <div className="text-xs text-muted-foreground">Current</div>
                </div>
                <div>
                  <div className="text-lg font-bold">97.8%</div>
                  <div className="text-xs text-muted-foreground">Average</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-accent">99.1%</div>
                  <div className="text-xs text-muted-foreground">Peak</div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          <Card className="p-6 bg-gradient-card shadow-card">
            <h3 className="text-lg font-semibold mb-4">Channel Performance Comparison</h3>
            <div className="space-y-4">
              {channelPerformance.map((channel, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <div>
                      <div className="font-medium">{channel.channel}</div>
                      <div className="text-sm text-muted-foreground">Payment processor</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-8 text-center">
                    <div>
                      <div className="font-semibold">{channel.volume}</div>
                      <div className="text-xs text-muted-foreground">Volume</div>
                    </div>
                    <div>
                      <div className="font-semibold">{channel.success}</div>
                      <div className="text-xs text-muted-foreground">Success</div>
                    </div>
                    <div>
                      <div className="font-semibold">{channel.fees}</div>
                      <div className="text-xs text-muted-foreground">Fees</div>
                    </div>
                    <div>
                      {channel.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-accent mx-auto" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-destructive mx-auto" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-gradient-card shadow-card">
              <div className="text-2xl font-bold mb-2">1,247</div>
              <div className="text-sm text-muted-foreground mb-1">Total Transactions</div>
              <div className="flex items-center text-accent text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                +15.2% from yesterday
              </div>
            </Card>
            <Card className="p-4 bg-gradient-card shadow-card">
              <div className="text-2xl font-bold mb-2">2.3s</div>
              <div className="text-sm text-muted-foreground mb-1">Avg Processing Time</div>
              <div className="flex items-center text-accent text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                -0.1s improvement
              </div>
            </Card>
            <Card className="p-4 bg-gradient-card shadow-card">
              <div className="text-2xl font-bold mb-2">$1,891</div>
              <div className="text-sm text-muted-foreground mb-1">Avg Transaction Size</div>
              <div className="flex items-center text-destructive text-xs">
                <TrendingDown className="h-3 w-3 mr-1" />
                -3.4% from last week
              </div>
            </Card>
          </div>

          <Card className="p-6 bg-gradient-card shadow-card">
            <h3 className="text-lg font-semibold mb-4">Transaction Distribution by Time</h3>
            <div className="h-64 bg-gradient-dashboard rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <div className="text-sm">Hourly transaction distribution chart</div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card className="p-6 bg-gradient-card shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">System Alerts</h3>
              <Button variant="outline" size="sm">Mark All Read</Button>
            </div>
            <div className="space-y-3">
              {recentAlerts.map((alert, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border border-border rounded-lg">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="text-sm font-medium">{alert.message}</div>
                    <div className="text-xs text-muted-foreground">{alert.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card shadow-card">
            <h3 className="text-lg font-semibold mb-4">Alert Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">High Volume Transactions</div>
                  <div className="text-sm text-muted-foreground">Alert when transaction exceeds $10,000</div>
                </div>
                <Badge className="bg-accent text-accent-foreground">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Failed Payment Rate</div>
                  <div className="text-sm text-muted-foreground">Alert when failure rate exceeds 5%</div>
                </div>
                <Badge className="bg-accent text-accent-foreground">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">API Response Time</div>
                  <div className="text-sm text-muted-foreground">Alert when response time exceeds 5 seconds</div>
                </div>
                <Badge variant="outline">Disabled</Badge>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};