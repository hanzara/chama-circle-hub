import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Search, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Download,
  Filter,
  Calendar,
  Globe,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const mockTransactionData = [
  { month: "Jan", volume: 45000, fees: 1200, count: 156 },
  { month: "Feb", volume: 52000, fees: 1180, count: 189 },
  { month: "Mar", volume: 48000, fees: 1350, count: 167 },
  { month: "Apr", volume: 61000, fees: 1420, count: 203 },
  { month: "May", volume: 55000, fees: 1250, count: 178 },
  { month: "Jun", volume: 67000, fees: 1380, count: 221 },
];

const mockChannelData = [
  { name: "Wise", value: 35, color: "#8884d8", volume: 156000, fees: 2100 },
  { name: "Stripe", value: 25, color: "#82ca9d", volume: 98000, fees: 2850 },
  { name: "PayPal", value: 20, color: "#ffc658", volume: 87000, fees: 3200 },
  { name: "Crypto", value: 15, color: "#ff7300", volume: 65000, fees: 890 },
  { name: "Wire", value: 5, color: "#0088fe", volume: 23000, fees: 1150 },
];

const mockInsights = [
  {
    type: "opportunity",
    title: "Route Optimization Opportunity",
    description: "70% of your UK payments could save 15% on fees by using Faster Payments instead of SWIFT",
    impact: "$450 monthly savings",
    action: "Enable auto-routing"
  },
  {
    type: "alert",
    title: "Unusual Activity Detected",
    description: "Failed transaction rate increased by 12% for Stripe payments in the last 24 hours",
    impact: "7 failed transactions",
    action: "Check Stripe status"
  },
  {
    type: "success",
    title: "Cost Optimization Success",
    description: "Smart routing saved you $1,200 this month compared to manual routing",
    impact: "18% cost reduction",
    action: "View details"
  }
];

export const IntelligenceSection = () => {
  const [query, setQuery] = useState("");
  const [dateRange, setDateRange] = useState("last-30-days");
  const [channel, setChannel] = useState("all");
  const [currency, setCurrency] = useState("all");

  const handleQuery = () => {
    // This would normally process the natural language query
    console.log("Processing query:", query);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "opportunity":
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case "alert":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Brain className="w-5 h-5" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "opportunity":
        return "border-blue-200 bg-blue-50";
      case "alert":
        return "border-yellow-200 bg-yellow-50";
      case "success":
        return "border-green-200 bg-green-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Business Intelligence</h1>
        <p className="text-muted-foreground">
          AI-powered insights and natural language queries for your payment data
        </p>
      </div>

      {/* Natural Language Query */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Ask Universal Intelligence
          </CardTitle>
          <CardDescription>
            Ask questions about your payments in plain English
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input 
              placeholder="e.g., 'Show my total fees paid to Stripe last month' or 'Compare transaction volume in Kenya vs Nigeria'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleQuery}>
              <Search className="w-4 h-4 mr-2" />
              Ask
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setQuery("Show my total fees by channel this quarter")}>
              Fees by channel
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuery("Compare success rates between payment methods")}>
              Success rate comparison
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuery("What's my most expensive payment corridor?")}>
              Expensive corridors
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
          <TabsTrigger value="cost-analysis">Cost Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {mockInsights.map((insight, index) => (
              <Card key={index} className={getInsightColor(insight.type)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getInsightIcon(insight.type)}
                      <div className="space-y-1">
                        <h4 className="font-semibold">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground">{insight.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="outline">{insight.impact}</Badge>
                          <Button variant="link" size="sm" className="p-0 h-auto">
                            {insight.action}
                            <ArrowUpRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last-7-days">Last 7 days</SelectItem>
                      <SelectItem value="last-30-days">Last 30 days</SelectItem>
                      <SelectItem value="last-3-months">Last 3 months</SelectItem>
                      <SelectItem value="last-year">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <Select value={channel} onValueChange={setChannel}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Channels</SelectItem>
                      <SelectItem value="wise">Wise</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Currencies</SelectItem>
                      <SelectItem value="usd">USD</SelectItem>
                      <SelectItem value="eur">EUR</SelectItem>
                      <SelectItem value="gbp">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Volume & Fees</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockTransactionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="volume" stroke="#8884d8" name="Volume ($)" />
                    <Line type="monotone" dataKey="fees" stroke="#82ca9d" name="Fees ($)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Channel Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockChannelData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {mockChannelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Transaction Count</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockTransactionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Channel Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockChannelData.map((channel) => (
                    <div key={channel.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{channel.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Volume: ${channel.volume.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${channel.fees}</p>
                        <p className="text-sm text-muted-foreground">fees</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Predictive Forecasting
              </CardTitle>
              <CardDescription>
                AI-powered predictions for your payment volume and costs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Next Month Volume</h4>
                  <div className="text-2xl font-bold text-green-600">$72,000</div>
                  <div className="text-sm text-muted-foreground">+8% projected growth</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Predicted Fees</h4>
                  <div className="text-2xl font-bold text-blue-600">$1,440</div>
                  <div className="text-sm text-muted-foreground">2.0% of volume</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Transaction Count</h4>
                  <div className="text-2xl font-bold text-purple-600">245</div>
                  <div className="text-sm text-muted-foreground">+11% increase</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">6-Month Forecast</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockTransactionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="volume" 
                      stroke="#8884d8" 
                      strokeDasharray="5 5"
                      name="Predicted Volume ($)" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cost-analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Cost Savings Simulator
              </CardTitle>
              <CardDescription>
                Analyze how different routing strategies would impact your costs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Current vs Optimized Routing</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <span>Manual Routing (Last Month)</span>
                      <span className="font-semibold text-red-600">$1,680</span>
                    </div>
                    <div className="flex justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <span>AI Smart Routing</span>
                      <span className="font-semibold text-green-600">$1,380</span>
                    </div>
                    <div className="flex justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="font-semibold">Total Savings</span>
                      <span className="font-semibold text-blue-600">$300 (18%)</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">Yearly Projection</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                      <span>Potential Annual Savings</span>
                      <span className="font-semibold text-primary">$3,600</span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                      <span>ROI on Platform Usage</span>
                      <span className="font-semibold text-primary">480%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};