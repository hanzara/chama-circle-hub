import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowDownUp, 
  CreditCard, 
  Smartphone, 
  Bitcoin, 
  Building, 
  Globe,
  CheckCircle,
  AlertCircle,
  Settings,
  Plus,
  ExternalLink
} from "lucide-react";

const inboundChannels = [
  {
    id: "stripe",
    name: "Stripe API",
    description: "Card & wallet payments",
    icon: CreditCard,
    status: "connected",
    volume24h: "$45,230",
    fees: "2.9% + $0.30",
    apiKey: "sk_live_****",
    enabled: true,
    color: "hsl(229, 84%, 50%)"
  },
  {
    id: "paypal",
    name: "PayPal REST API",
    description: "PayPal payments",
    icon: Globe,
    status: "connected", 
    volume24h: "$18,450",
    fees: "3.5%",
    apiKey: "EOS****",
    enabled: true,
    color: "hsl(217, 91%, 60%)"
  },
  {
    id: "flutterwave",
    name: "Flutterwave API",
    description: "African Mobile Money & cards",
    icon: Smartphone,
    status: "disconnected",
    volume24h: "$0",
    fees: "1.4%",
    apiKey: "Not configured",
    enabled: false,
    color: "hsl(45, 93%, 47%)"
  },
  {
    id: "wise",
    name: "Wise API",
    description: "International bank transfers via IBAN",
    icon: Building,
    status: "connected",
    volume24h: "$32,180",
    fees: "$0.50 + 0.45%",
    apiKey: "wise_****",
    enabled: true,
    color: "hsl(142, 76%, 36%)"
  },
  {
    id: "crypto",
    name: "Crypto APIs",
    description: "BTC, ETH, USDT reception",
    icon: Bitcoin,
    status: "connected",
    volume24h: "$28,900",
    fees: "0.5%",
    apiKey: "binance_****",
    enabled: true,
    color: "hsl(45, 93%, 47%)"
  },
  {
    id: "orange",
    name: "Orange Money API",
    description: "Mobile Money (via integrator)",
    icon: Smartphone,
    status: "pending",
    volume24h: "$1,230",
    fees: "2.1%",
    apiKey: "Pending verification",
    enabled: false,
    color: "hsl(25, 95%, 53%)"
  }
];

export const MultiInboundSection = () => {
  const [newChannel, setNewChannel] = useState({ name: "", apiKey: "", webhookUrl: "" });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      default:
        return "text-red-600";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Multi-Inbound Engine</h1>
        <p className="text-muted-foreground">
          Manage incoming payment channels via third-party APIs without closed partnerships
        </p>
      </div>

      <Tabs defaultValue="channels" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="channels">Payment Channels</TabsTrigger>
          <TabsTrigger value="configure">Configure New</TabsTrigger>
          <TabsTrigger value="monitoring">Real-time Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inboundChannels.map((channel) => {
              const IconComponent = channel.icon;
              return (
                <Card key={channel.id} className="relative overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 w-full h-1" 
                    style={{ backgroundColor: channel.color }}
                  />
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: channel.color }}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{channel.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {channel.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(channel.status)}
                        <span className={`text-sm font-medium ${getStatusColor(channel.status)}`}>
                          {channel.status}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">24h Volume</p>
                        <p className="font-medium">{channel.volume24h}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Fees</p>
                        <p className="font-medium">{channel.fees}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">API Key</p>
                        <p className="text-sm font-mono">{channel.apiKey}</p>
                      </div>
                      <Switch checked={channel.enabled} />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="configure" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add New Payment Channel
              </CardTitle>
              <CardDescription>
                Connect a new API for receiving payments directly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Channel Name</Label>
                  <Input 
                    placeholder="e.g., MTN MoMo API"
                    value={newChannel.name}
                    onChange={(e) => setNewChannel({...newChannel, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input 
                    type="password"
                    placeholder="Your API secret key"
                    value={newChannel.apiKey}
                    onChange={(e) => setNewChannel({...newChannel, apiKey: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <Input 
                  placeholder="https://your-domain.com/webhook/payments"
                  value={newChannel.webhookUrl}
                  onChange={(e) => setNewChannel({...newChannel, webhookUrl: e.target.value})}
                />
              </div>
              
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Connect Channel
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">$94,090</div>
                <p className="text-sm text-muted-foreground">Total 24h Inbound</p>
                <Badge variant="secondary" className="mt-2">+15.3%</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">6/8</div>
                <p className="text-sm text-muted-foreground">Active Channels</p>
                <Badge variant="secondary" className="mt-2">75% uptime</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">98.7%</div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <Badge variant="default" className="mt-2">+0.3%</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">$142.30</div>
                <p className="text-sm text-muted-foreground">Avg Fee Cost</p>
                <Badge variant="secondary" className="mt-2">-$12.40</Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};