import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowDownUp,
  Brain,
  Zap,
  Target,
  TrendingUp,
  Clock,
  Shield,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Settings,
  BarChart3,
  Route,
  Cpu,
  Activity,
  Calculator,
  Filter,
  Eye,
  Edit,
  Save,
  RefreshCw,
  Bell,
  Users,
  Globe,
  Layers,
  ArrowRight,
  LineChart
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Sample payment gateways data
const paymentGateways = [
  {
    id: "stripe",
    name: "Stripe",
    status: "active" as "active" | "paused" | "maintenance",
    successRate: 98.5,
    avgLatency: 245,
    volume24h: "$45,200",
    fees: "2.9%",
    priority: 1,
    regions: ["US", "EU", "AU"],
    color: "hsl(229, 84%, 50%)"
  },
  {
    id: "paypal",
    name: "PayPal",
    status: "active" as const,
    successRate: 96.8,
    avgLatency: 380,
    volume24h: "$32,100",
    fees: "3.5%",
    priority: 2,
    regions: ["US", "EU", "CA"],
    color: "hsl(217, 91%, 60%)"
  },
  {
    id: "adyen",
    name: "Adyen",
    status: "active" as const,
    successRate: 97.9,
    avgLatency: 320,
    volume24h: "$28,700",
    fees: "2.2%",
    priority: 3,
    regions: ["EU", "APAC"],
    color: "hsl(142, 76%, 36%)"
  },
  {
    id: "square",
    name: "Square",
    status: "maintenance" as const,
    successRate: 95.2,
    avgLatency: 450,
    volume24h: "$18,900",
    fees: "2.6%",
    priority: 4,
    regions: ["US", "CA"],
    color: "hsl(38, 92%, 50%)"
  },
  {
    id: "flutterwave",
    name: "Flutterwave",
    status: "active" as const,
    successRate: 94.7,
    avgLatency: 520,
    volume24h: "$12,300",
    fees: "1.8%",
    priority: 5,
    regions: ["AF", "EU"],
    color: "hsl(258, 90%, 66%)"
  }
];

const routingRules = [
  {
    id: "rule_1",
    name: "High Success Rate Priority",
    description: "Route to gateways with >97% success rate first",
    enabled: true,
    type: "success_rate" as const,
    threshold: 97,
    weight: 40
  },
  {
    id: "rule_2",
    name: "Low Latency Routing",
    description: "Prefer gateways with <300ms response time",
    enabled: true,
    type: "latency" as const,
    threshold: 300,
    weight: 30
  },
  {
    id: "rule_3",
    name: "Cost Optimization",
    description: "Route to lowest cost gateway when possible",
    enabled: false,
    type: "cost" as const,
    threshold: 0,
    weight: 20
  },
  {
    id: "rule_4",
    name: "Regional Preference",
    description: "Prefer gateways optimized for transaction region",
    enabled: true,
    type: "region" as const,
    threshold: 0,
    weight: 10
  }
];

const metrics = [
  { label: "Total Transactions", value: "12,847", change: "+8.2%", changeType: "positive" as const },
  { label: "Success Rate", value: "97.8%", change: "+0.3%", changeType: "positive" as const },
  { label: "Avg Latency", value: "289ms", change: "-12ms", changeType: "positive" as const },
  { label: "Cost Savings", value: "$2,340", change: "+18%", changeType: "positive" as const }
];

// Transaction flow data for visualization
const recentTransactions = [
  { id: "tx_001", amount: "$250", status: "success", gateway: "stripe", latency: "245ms", route: "Primary", timestamp: "2 min ago" },
  { id: "tx_002", amount: "$1,200", status: "success", gateway: "adyen", latency: "320ms", route: "AI Optimized", timestamp: "3 min ago" },
  { id: "tx_003", amount: "$450", status: "failed", gateway: "paypal", latency: "680ms", route: "Fallback", timestamp: "5 min ago" },
  { id: "tx_004", amount: "$75", status: "success", gateway: "stripe", latency: "230ms", route: "Primary", timestamp: "7 min ago" },
];

const liveActivity = [
  { type: "route_optimized", message: "AI optimized route for $1,200 transaction", time: "now", severity: "info" },
  { type: "gateway_failover", message: "PayPal failover to Stripe - latency exceeded", time: "2 min", severity: "warning" },
  { type: "cost_saved", message: "Saved $15.40 by routing through Adyen", time: "5 min", severity: "success" },
  { type: "performance_alert", message: "Square gateway showing increased latency", time: "8 min", severity: "error" },
];

export const SmartRoutingSection = () => {
  const [selectedGateway, setSelectedGateway] = useState(paymentGateways[0]);
  const [routingEnabled, setRoutingEnabled] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showCostCalculator, setShowCostCalculator] = useState(false);
  const [calculatorAmount, setCalculatorAmount] = useState("1000");
  const [calculatorCurrency, setCalculatorCurrency] = useState("USD");
  const [routingStrategy, setRoutingStrategy] = useState("balanced");
  const [liveTransactions, setLiveTransactions] = useState(0);
  const [showGatewayConfig, setShowGatewayConfig] = useState(false);
  const [editingGateway, setEditingGateway] = useState<any>(null);
  const { toast } = useToast();

  // Simulate live transaction counter
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTransactions(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleGateway = (gatewayId: string) => {
    const gateway = paymentGateways.find(g => g.id === gatewayId);
    if (!gateway) return;

    const newStatus = gateway.status === 'active' ? 'paused' : 'active';
    gateway.status = newStatus as 'active' | 'paused' | 'maintenance';
    
    toast({
      title: `Gateway ${newStatus === 'active' ? 'Activated' : 'Paused'}`,
      description: `${gateway.name} has been ${newStatus === 'active' ? 'activated' : 'paused'}.`,
    });
  };

  const handleRuleToggle = (ruleId: string) => {
    const rule = routingRules.find(r => r.id === ruleId);
    if (!rule) return;

    rule.enabled = !rule.enabled;
    toast({
      title: `Rule ${rule.enabled ? 'Enabled' : 'Disabled'}`,
      description: `${rule.name} has been ${rule.enabled ? 'enabled' : 'disabled'}.`,
    });
  };

  const runSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setSimulationResults({
        routedTransactions: 1000,
        successRate: 98.2,
        avgLatency: 267,
        costSavings: 15.3,
        optimalRoutes: {
          stripe: 45,
          paypal: 28,
          adyen: 22,
          others: 5
        }
      });
      setIsSimulating(false);
      toast({
        title: "Simulation Complete",
        description: "Smart routing simulation completed successfully.",
      });
    }, 3000);
  };

  const calculateCosts = () => {
    const amount = parseFloat(calculatorAmount);
    const costs = paymentGateways.map(gateway => ({
      name: gateway.name,
      fee: (amount * parseFloat(gateway.fees.replace('%', '')) / 100).toFixed(2),
      total: (amount + (amount * parseFloat(gateway.fees.replace('%', '')) / 100)).toFixed(2),
      estimated: gateway.status === 'active'
    }));
    return costs.sort((a, b) => parseFloat(a.fee) - parseFloat(b.fee));
  };

  const handleStrategyChange = (strategy: string) => {
    setRoutingStrategy(strategy);
    toast({
      title: "Strategy Updated",
      description: `Routing strategy changed to ${strategy}`,
    });
  };

  const handleGatewayEdit = (gateway: any) => {
    setEditingGateway({ ...gateway });
    setShowGatewayConfig(true);
  };

  const saveGatewayConfig = () => {
    if (editingGateway) {
      const index = paymentGateways.findIndex(g => g.id === editingGateway.id);
      if (index !== -1) {
        paymentGateways[index] = { ...editingGateway };
        toast({
          title: "Gateway Updated",
          description: `${editingGateway.name} configuration saved successfully.`,
        });
      }
    }
    setShowGatewayConfig(false);
    setEditingGateway(null);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'text-green-500 bg-green-500/10';
      case 'paused': return 'text-orange-500 bg-orange-500/10';
      case 'maintenance': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'active': return CheckCircle;
      case 'paused': return Pause;
      case 'maintenance': return AlertCircle;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Smart Payment Routing</h1>
            <p className="text-muted-foreground">
              AI-powered routing through 50+ payment gateways for optimal success rates and costs
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Live Transactions</div>
              <div className="text-2xl font-bold text-primary">{liveTransactions.toLocaleString()}</div>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        {/* Strategy Selector */}
        <div className="mt-4 flex items-center gap-4">
          <Label htmlFor="strategy">Routing Strategy:</Label>
          <Select value={routingStrategy} onValueChange={handleStrategyChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="balanced">Balanced</SelectItem>
              <SelectItem value="cost-optimized">Cost Optimized</SelectItem>
              <SelectItem value="speed-first">Speed First</SelectItem>
              <SelectItem value="reliability">Reliability First</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={showCostCalculator} onOpenChange={setShowCostCalculator}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Calculator className="w-4 h-4 mr-2" />
                Cost Calculator
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Payment Cost Calculator</DialogTitle>
                <DialogDescription>
                  Compare costs across different payment gateways
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input 
                      id="amount"
                      value={calculatorAmount}
                      onChange={(e) => setCalculatorAmount(e.target.value)}
                      placeholder="1000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={calculatorCurrency} onValueChange={setCalculatorCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {calculateCosts().map((cost, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${cost.estimated ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span className="font-medium">{cost.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${cost.fee} fee</div>
                        <div className="text-sm text-muted-foreground">${cost.total} total</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className={`text-sm flex items-center gap-1 ${
                metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className="w-3 h-3" />
                {metric.change}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Tabs Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="gateways">Gateways</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Live Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Smart Routing Control */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Routing Engine */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>AI Routing Engine</CardTitle>
                  <CardDescription>Intelligent payment routing system</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={routingEnabled} 
                  onCheckedChange={setRoutingEnabled}
                />
                <Badge variant={routingEnabled ? "default" : "secondary"}>
                  {routingEnabled ? "Active" : "Paused"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Gateway List */}
            <div>
              <h4 className="font-medium mb-4">Payment Gateways ({paymentGateways.length})</h4>
              <div className="space-y-3">
                {paymentGateways.map((gateway) => {
                  const StatusIcon = getStatusIcon(gateway.status);
                  return (
                    <div 
                      key={gateway.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedGateway.id === gateway.id ? 'border-primary bg-primary/5' : 'hover:border-accent'
                      }`}
                      onClick={() => setSelectedGateway(gateway)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: gateway.color }}
                          ></div>
                          <div>
                            <p className="font-medium">{gateway.name}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Success: {gateway.successRate}%</span>
                              <span>Latency: {gateway.avgLatency}ms</span>
                              <span>Fees: {gateway.fees}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Priority {gateway.priority}
                          </Badge>
                          <div className={`p-1 rounded ${getStatusColor(gateway.status)}`}>
                            <StatusIcon className="w-4 h-4" />
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleGateway(gateway.id);
                            }}
                          >
                            {gateway.status === 'active' ? 'Pause' : 'Activate'}
                          </Button>
                        </div>
                      </div>
                      
                      {/* Gateway Performance Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Performance Score</span>
                          <span>{Math.round((gateway.successRate + (100 - gateway.avgLatency/10))/2)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ 
                              width: `${Math.round((gateway.successRate + (100 - gateway.avgLatency/10))/2)}%`,
                              backgroundColor: gateway.color
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Routing Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="w-5 h-5" />
              Routing Rules
            </CardTitle>
            <CardDescription>Configure intelligent routing logic</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {routingRules.map((rule) => (
              <div key={rule.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={rule.enabled} 
                      onCheckedChange={() => handleRuleToggle(rule.id)}
                    />
                    <span className="font-medium text-sm">{rule.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {rule.weight}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {rule.description}
                </p>
                {rule.type === 'success_rate' && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Min Success Rate</span>
                      <span>{rule.threshold}%</span>
                    </div>
                    <Slider
                      value={[rule.threshold]}
                      onValueChange={([value]) => rule.threshold = value}
                      max={100}
                      min={80}
                      step={1}
                      className="w-full"
                    />
                  </div>
                )}
                {rule.type === 'latency' && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Max Latency</span>
                      <span>{rule.threshold}ms</span>
                    </div>
                    <Slider
                      value={[rule.threshold]}
                      onValueChange={([value]) => rule.threshold = value}
                      max={1000}
                      min={100}
                      step={10}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            ))}
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={runSimulation}
              disabled={isSimulating}
            >
              {isSimulating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  Simulating...
                </div>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Simulation
                </>
              )}
            </Button>
          </CardContent>
        </Card>
          </div>
        </TabsContent>

        <TabsContent value="gateways" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Gateway Management</h3>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Add Gateway
            </Button>
          </div>
          
          <div className="grid gap-4">
            {paymentGateways.map((gateway) => {
              const StatusIcon = getStatusIcon(gateway.status);
              return (
                <Card key={gateway.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: gateway.color }}
                        >
                          {gateway.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{gateway.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Regions: {gateway.regions.join(', ')}</span>
                            <span>Volume: {gateway.volume24h}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleGatewayEdit(gateway)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Configure
                        </Button>
                        <Button
                          size="sm"
                          variant={gateway.status === 'active' ? 'destructive' : 'default'}
                          onClick={() => handleToggleGateway(gateway.id)}
                        >
                          {gateway.status === 'active' ? 'Pause' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="text-center p-3 bg-muted/50 rounded">
                        <div className="text-2xl font-bold text-green-600">{gateway.successRate}%</div>
                        <div className="text-sm text-muted-foreground">Success Rate</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded">
                        <div className="text-2xl font-bold text-blue-600">{gateway.avgLatency}ms</div>
                        <div className="text-sm text-muted-foreground">Avg Latency</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded">
                        <div className="text-2xl font-bold text-orange-600">{gateway.fees}</div>
                        <div className="text-sm text-muted-foreground">Processing Fee</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Routing Rules Configuration</h3>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Add Rule
            </Button>
          </div>
          
          <div className="grid gap-4">
            {routingRules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Switch 
                        checked={rule.enabled} 
                        onCheckedChange={() => handleRuleToggle(rule.id)}
                      />
                      <div>
                        <h4 className="font-semibold">{rule.name}</h4>
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-sm">
                      Weight: {rule.weight}%
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Rule Weight</Label>
                      <Slider
                        value={[rule.weight]}
                        onValueChange={([value]) => rule.weight = value}
                        max={100}
                        min={0}
                        step={5}
                        className="w-full mt-2"
                      />
                    </div>
                    
                    {rule.type === 'success_rate' && (
                      <div>
                        <Label>Minimum Success Rate: {rule.threshold}%</Label>
                        <Slider
                          value={[rule.threshold]}
                          onValueChange={([value]) => rule.threshold = value}
                          max={100}
                          min={80}
                          step={1}
                          className="w-full mt-2"
                        />
                      </div>
                    )}
                    
                    {rule.type === 'latency' && (
                      <div>
                        <Label>Maximum Latency: {rule.threshold}ms</Label>
                        <Slider
                          value={[rule.threshold]}
                          onValueChange={([value]) => rule.threshold = value}
                          max={1000}
                          min={100}
                          step={10}
                          className="w-full mt-2"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Success Rate Trend</span>
                    <span className="text-sm font-medium text-green-600">+2.3% this week</span>
                  </div>
                  <Progress value={97.8} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Latency Improvement</span>
                    <span className="text-sm font-medium text-blue-600">-15ms avg</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Cost Optimization</span>
                    <span className="text-sm font-medium text-orange-600">$2,340 saved</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          tx.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <div className="font-medium">{tx.amount}</div>
                          <div className="text-sm text-muted-foreground">via {tx.gateway}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{tx.latency}</div>
                        <div className="text-xs text-muted-foreground">{tx.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Button 
            onClick={runSimulation}
            disabled={isSimulating}
            className="w-full"
            size="lg"
          >
            {isSimulating ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Running Advanced Simulation...
              </div>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Advanced Analytics Simulation
              </>
            )}
          </Button>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Live System Activity
              </CardTitle>
              <CardDescription>Real-time routing decisions and system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {liveActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.severity === 'success' ? 'bg-green-500' :
                      activity.severity === 'warning' ? 'bg-yellow-500' :
                      activity.severity === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.type.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Simulation Results */}
      {simulationResults && (
        <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <BarChart3 className="w-5 h-5" />
              Simulation Results
            </CardTitle>
            <CardDescription>Performance prediction for next 1000 transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {simulationResults.routedTransactions}
                </div>
                <div className="text-sm text-muted-foreground">Transactions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {simulationResults.successRate}%
                </div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {simulationResults.avgLatency}ms
                </div>
                <div className="text-sm text-muted-foreground">Avg Latency</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {simulationResults.costSavings}%
                </div>
                <div className="text-sm text-muted-foreground">Cost Savings</div>
              </div>
            </div>
            
            <div className="mt-4">
              <h5 className="font-medium mb-2">Optimal Route Distribution</h5>
              <div className="space-y-2">
                {Object.entries(simulationResults.optimalRoutes).map(([gateway, percentage]) => (
                  <div key={gateway} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{gateway}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full">
                        <div 
                          className="h-2 bg-primary rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="w-8 text-right">{percentage as number}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gateway Configuration Modal */}
      <Dialog open={showGatewayConfig} onOpenChange={setShowGatewayConfig}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure {editingGateway?.name}</DialogTitle>
            <DialogDescription>
              Adjust gateway settings and preferences
            </DialogDescription>
          </DialogHeader>
          {editingGateway && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority Level</Label>
                  <Input 
                    id="priority"
                    type="number"
                    value={editingGateway.priority}
                    onChange={(e) => setEditingGateway({
                      ...editingGateway,
                      priority: parseInt(e.target.value)
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="fees">Processing Fees</Label>
                  <Input 
                    id="fees"
                    value={editingGateway.fees}
                    onChange={(e) => setEditingGateway({
                      ...editingGateway,
                      fees: e.target.value
                    })}
                  />
                </div>
              </div>
              
              <div>
                <Label>Supported Regions</Label>
                <div className="flex gap-2 mt-2">
                  {['US', 'EU', 'APAC', 'CA', 'AF'].map((region) => (
                    <Badge 
                      key={region}
                      variant={editingGateway.regions.includes(region) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const regions = editingGateway.regions.includes(region)
                          ? editingGateway.regions.filter((r: string) => r !== region)
                          : [...editingGateway.regions, region];
                        setEditingGateway({ ...editingGateway, regions });
                      }}
                    >
                      {region}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowGatewayConfig(false)}>
                  Cancel
                </Button>
                <Button onClick={saveGatewayConfig}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};