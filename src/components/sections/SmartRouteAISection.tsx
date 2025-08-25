import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Brain, 
  Zap, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Activity,
  Target,
  Settings,
  BarChart3,
  RefreshCw
} from "lucide-react";

const routingStrategies = [
  {
    id: "cost",
    name: "Cost Optimized",
    description: "Minimize transaction fees",
    icon: DollarSign,
    active: true,
    savings: "23%"
  },
  {
    id: "speed",
    name: "Speed Optimized", 
    description: "Fastest processing time",
    icon: Zap,
    active: false,
    savings: "15%"
  },
  {
    id: "reliability",
    name: "Reliability First",
    description: "Highest success rate",
    icon: CheckCircle,
    active: false,
    savings: "18%"
  }
];

const apiPerformance = [
  { name: "Stripe", score: 95, latency: 150, cost: 2.9, success: 99.2, status: "optimal" },
  { name: "Flutterwave", score: 88, latency: 280, cost: 3.8, success: 97.8, status: "good" },
  { name: "PayPal", score: 82, latency: 320, cost: 3.5, success: 96.5, status: "good" },
  { name: "Binance Pay", score: 79, latency: 200, cost: 0.0, success: 94.2, status: "warning" }
];

const recentOptimizations = [
  {
    id: 1,
    time: "2 mins ago",
    transaction: "Payment #12847",
    originalAPI: "PayPal",
    optimizedAPI: "Stripe", 
    savings: "$2.40",
    reason: "Lower fees + faster processing"
  },
  {
    id: 2,
    time: "5 mins ago", 
    transaction: "Payment #12846",
    originalAPI: "Flutterwave",
    optimizedAPI: "Binance Pay",
    savings: "$8.20",
    reason: "Zero fees for crypto payment"
  },
  {
    id: 3,
    time: "12 mins ago",
    transaction: "Payment #12845", 
    originalAPI: "Stripe",
    optimizedAPI: "Flutterwave",
    savings: "$1.60",
    reason: "Better conversion rates for NGN"
  }
];

export function SmartRouteAISection() {
  const [aiEnabled, setAiEnabled] = useState(true);
  const [selectedStrategy, setSelectedStrategy] = useState("cost");
  const [autoFallback, setAutoFallback] = useState(true);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-text bg-clip-text text-transparent">
              SmartRoute AI
            </h1>
            <p className="text-muted-foreground">AI Payment Optimizer</p>
          </div>
        </div>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Let AI choose the optimal payment route for every transaction. 
          Save money, increase speed, and maximize success rates automatically.
        </p>
      </div>

      {/* AI Control Center */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5" />
                <span>AI Engine Status</span>
              </CardTitle>
              <CardDescription>Configure your optimization preferences</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">AI Routing</span>
              <Switch 
                checked={aiEnabled} 
                onCheckedChange={setAiEnabled}
                className="data-[state=checked]:bg-gradient-primary"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Optimization Strategy */}
          <div className="space-y-4">
            <h3 className="font-medium">Optimization Strategy</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {routingStrategies.map((strategy) => (
                <Card 
                  key={strategy.id}
                  className={`cursor-pointer transition-all ${
                    selectedStrategy === strategy.id 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedStrategy(strategy.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <strategy.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{strategy.name}</div>
                        <div className="text-sm text-muted-foreground">{strategy.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-400">+{strategy.savings}</div>
                        <div className="text-xs text-muted-foreground">avg savings</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
            <div className="space-y-4">
              <h3 className="font-medium">Fallback Settings</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Auto Fallback</div>
                  <div className="text-sm text-muted-foreground">Retry failed payments automatically</div>
                </div>
                <Switch 
                  checked={autoFallback} 
                  onCheckedChange={setAutoFallback}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fallback Priority</label>
                <Select defaultValue="intelligent">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="intelligent">AI Intelligent Routing</SelectItem>
                    <SelectItem value="cost">Cost Priority</SelectItem>
                    <SelectItem value="speed">Speed Priority</SelectItem>
                    <SelectItem value="manual">Manual Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Learning Preferences</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Learn from failed transactions</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Adapt to user patterns</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Real-time fee optimization</span>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Performance Scores */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>API Performance Scores</span>
            </CardTitle>
            <CardDescription>Real-time scoring based on speed, cost, and reliability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {apiPerformance.map((api) => (
              <div key={api.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium">{api.name}</span>
                    <Badge 
                      variant="outline"
                      className={
                        api.status === 'optimal' ? 'border-green-500 text-green-400' :
                        api.status === 'good' ? 'border-blue-500 text-blue-400' :
                        'border-yellow-500 text-yellow-400'
                      }
                    >
                      {api.status}
                    </Badge>
                  </div>
                  <span className="font-bold text-lg">{api.score}</span>
                </div>
                <Progress 
                  value={api.score} 
                  className="h-2"
                />
                <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                  <div>Latency: {api.latency}ms</div>
                  <div>Cost: {api.cost}%</div>
                  <div>Success: {api.success}%</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Optimizations */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Recent Optimizations</span>
            </CardTitle>
            <CardDescription>AI routing decisions and savings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentOptimizations.map((opt) => (
              <div key={opt.id} className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{opt.transaction}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400 font-bold text-sm">{opt.savings}</span>
                    <Badge variant="secondary" className="text-xs">saved</Badge>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>
                    Routed from <span className="text-foreground">{opt.originalAPI}</span> to{" "}
                    <span className="text-foreground">{opt.optimizedAPI}</span>
                  </div>
                  <div>{opt.reason}</div>
                  <div className="text-muted-foreground/70">{opt.time}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">$4,287</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.7%</div>
            <p className="text-xs text-muted-foreground">+2.3% improvement</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">187ms</div>
            <p className="text-xs text-muted-foreground">-45ms faster</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">AI Decisions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.4K</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}