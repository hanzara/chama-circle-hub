import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plug, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Settings,
  TestTube,
  Shield,
  Zap,
  DollarSign,
  Smartphone,
  Building,
  Bitcoin
} from "lucide-react";

const integrationCategories = [
  {
    name: "Payment Processors",
    icon: DollarSign,
    integrations: [
      { name: "Stripe", status: "connected", health: "healthy", logo: "💳", description: "Online payment processing" },
      { name: "PayPal", status: "connected", health: "healthy", logo: "🅿️", description: "Digital wallet and payments" },
      { name: "Square", status: "available", health: null, logo: "⬜", description: "Point of sale and online payments" },
      { name: "Adyen", status: "available", health: null, logo: "🔷", description: "Global payment platform" },
    ]
  },
  {
    name: "Banking & Wire Transfers", 
    icon: Building,
    integrations: [
      { name: "Wise", status: "connected", health: "healthy", logo: "💸", description: "International money transfers" },
      { name: "Plaid", status: "connected", health: "degraded", logo: "🏦", description: "Banking data and ACH" },
      { name: "Dwolla", status: "available", health: null, logo: "🏛️", description: "ACH and bank transfers" },
      { name: "SWIFT Network", status: "available", health: null, logo: "🌐", description: "International wire transfers" },
    ]
  },
  {
    name: "Mobile Money",
    icon: Smartphone, 
    integrations: [
      { name: "M-PESA", status: "connected", health: "healthy", logo: "📱", description: "Kenya mobile payments" },
      { name: "MTN Mobile Money", status: "available", health: null, logo: "📲", description: "Africa mobile payments" },
      { name: "Orange Money", status: "available", health: null, logo: "🧡", description: "West Africa mobile money" },
      { name: "Airtel Money", status: "available", health: null, logo: "🔴", description: "Multi-country mobile money" },
    ]
  },
  {
    name: "Cryptocurrency",
    icon: Bitcoin,
    integrations: [
      { name: "Binance", status: "connected", health: "healthy", logo: "🟡", description: "Crypto exchange integration" },
      { name: "Coinbase", status: "available", health: null, logo: "🔵", description: "Cryptocurrency platform" },
      { name: "Kraken", status: "available", health: null, logo: "🟣", description: "Advanced crypto trading" },
      { name: "Bitcoin Network", status: "connected", health: "healthy", logo: "₿", description: "Direct Bitcoin integration" },
    ]
  }
];

const mockHealthData = {
  "Stripe": { successRate: 99.8, avgResponse: 145, lastCheck: "2 minutes ago" },
  "PayPal": { successRate: 99.5, avgResponse: 280, lastCheck: "5 minutes ago" },
  "Wise": { successRate: 99.9, avgResponse: 1200, lastCheck: "1 minute ago" },
  "Plaid": { successRate: 97.2, avgResponse: 890, lastCheck: "10 minutes ago" },
  "M-PESA": { successRate: 98.8, avgResponse: 2100, lastCheck: "3 minutes ago" },
  "Binance": { successRate: 99.1, avgResponse: 320, lastCheck: "4 minutes ago" },
  "Bitcoin Network": { successRate: 99.9, avgResponse: 600000, lastCheck: "1 minute ago" },
};

export const IntegrationsSection = () => {
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);

  const getStatusIcon = (status: string, health?: string) => {
    if (status === "connected") {
      if (health === "healthy") return <CheckCircle className="w-4 h-4 text-green-600" />;
      if (health === "degraded") return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      return <Clock className="w-4 h-4 text-blue-600" />;
    }
    return <Plug className="w-4 h-4 text-gray-400" />;
  };

  const getStatusColor = (status: string, health?: string) => {
    if (status === "connected") {
      if (health === "healthy") return "text-green-600";
      if (health === "degraded") return "text-yellow-600";
      return "text-blue-600";
    }
    return "text-gray-500";
  };

  const getHealthBadge = (health?: string) => {
    switch (health) {
      case "healthy":
        return <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>;
      case "degraded":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Degraded</Badge>;
      case "down":
        return <Badge variant="destructive">Down</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Integration Hub</h1>
        <p className="text-muted-foreground">
          Connect and manage all your payment providers, banks, and financial services
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="health">Health Monitor</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {integrationCategories.map((category) => (
            <Card key={category.name}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <category.icon className="w-5 h-5" />
                  {category.name}
                </CardTitle>
                <CardDescription>
                  {category.integrations.filter(i => i.status === 'connected').length} of {category.integrations.length} connected
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {category.integrations.map((integration) => (
                    <Dialog key={integration.name}>
                      <DialogTrigger asChild>
                        <Card className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-2xl">{integration.logo}</div>
                              {getStatusIcon(integration.status, integration.health)}
                            </div>
                            <h4 className="font-semibold">{integration.name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {integration.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className={`text-sm capitalize ${getStatusColor(integration.status, integration.health)}`}>
                                {integration.status}
                              </span>
                              {integration.health && getHealthBadge(integration.health)}
                            </div>
                          </CardContent>
                        </Card>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <span className="text-2xl">{integration.logo}</span>
                            {integration.name}
                          </DialogTitle>
                          <DialogDescription>
                            {integration.description}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          {integration.status === "connected" ? (
                            <>
                              <div className="space-y-2">
                                <Label>Status</Label>
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(integration.status, integration.health)}
                                  <span className={getStatusColor(integration.status, integration.health)}>
                                    Connected
                                  </span>
                                  {integration.health && getHealthBadge(integration.health)}
                                </div>
                              </div>
                              
                              {mockHealthData[integration.name as keyof typeof mockHealthData] && (
                                <div className="space-y-2">
                                  <Label>Performance</Label>
                                  <div className="text-sm space-y-1">
                                    <div>Success Rate: {mockHealthData[integration.name as keyof typeof mockHealthData].successRate}%</div>
                                    <div>Avg Response: {mockHealthData[integration.name as keyof typeof mockHealthData].avgResponse}ms</div>
                                    <div>Last Check: {mockHealthData[integration.name as keyof typeof mockHealthData].lastCheck}</div>
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="flex-1">
                                  <Settings className="w-4 h-4 mr-2" />
                                  Configure
                                </Button>
                                <Button variant="outline" size="sm" className="flex-1">
                                  <TestTube className="w-4 h-4 mr-2" />
                                  Test
                                </Button>
                              </div>
                              <Button variant="destructive" size="sm" className="w-full">
                                Disconnect
                              </Button>
                            </>
                          ) : (
                            <>
                              <div className="space-y-2">
                                <Label>API Configuration</Label>
                                <Input placeholder="API Key" type="password" />
                                <Input placeholder="Secret Key" type="password" />
                              </div>
                              <Button className="w-full">
                                Connect {integration.name}
                              </Button>
                            </>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Live Health Dashboard
              </CardTitle>
              <CardDescription>
                Real-time monitoring of all connected integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(mockHealthData).map(([name, data]) => {
                  const integration = integrationCategories
                    .flatMap(cat => cat.integrations)
                    .find(int => int.name === name);
                  
                  if (!integration || integration.status !== 'connected') return null;
                  
                  return (
                    <div key={name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{integration.logo}</div>
                        <div>
                          <h4 className="font-semibold">{name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Last check: {data.lastCheck}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-8 text-center">
                        <div>
                          <div className="text-lg font-semibold text-green-600">
                            {data.successRate}%
                          </div>
                          <div className="text-xs text-muted-foreground">Success Rate</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold">
                            {data.avgResponse.toLocaleString()}ms
                          </div>
                          <div className="text-xs text-muted-foreground">Response Time</div>
                        </div>
                        <div>
                          {getHealthBadge(integration.health)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Integration Marketplace
              </CardTitle>
              <CardDescription>
                Discover new payment providers and financial services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {integrationCategories
                  .flatMap(cat => cat.integrations)
                  .filter(int => int.status === 'available')
                  .map((integration) => (
                    <Card key={integration.name} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-2xl">{integration.logo}</div>
                          <Badge variant="outline">Available</Badge>
                        </div>
                        <h4 className="font-semibold mb-1">{integration.name}</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {integration.description}
                        </p>
                        <Button size="sm" className="w-full">
                          Connect
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};