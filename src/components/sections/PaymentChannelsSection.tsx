import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentChannelCard } from "@/components/PaymentChannelCard";
import { Plus, Settings, AlertCircle, CheckCircle, Key, Link } from "lucide-react";

export const PaymentChannelsSection = () => {
  const inboundChannels = [
    {
      provider: "Stripe",
      type: "inbound" as const,
      status: "active" as const,
      balance: "$12,450.00",
      volume24h: "$25,300",
      fees: "2.9%",
      apiStatus: "connected" as const,
      color: "hsl(229, 84%, 50%)"
    },
    {
      provider: "PayPal",
      type: "inbound" as const,
      status: "active" as const,
      balance: "$8,920.00",
      volume24h: "$15,600",
      fees: "3.5%",
      apiStatus: "connected" as const,
      color: "hsl(217, 91%, 60%)"
    },
    {
      provider: "Flutterwave",
      type: "inbound" as const,
      status: "active" as const,
      balance: "$3,200.00",
      volume24h: "$7,800",
      fees: "1.4%",
      apiStatus: "connected" as const,
      color: "hsl(45, 93%, 47%)"
    },
    {
      provider: "Crypto.com",
      type: "inbound" as const,
      status: "active" as const,
      balance: "0.24 BTC",
      volume24h: "$12,900",
      fees: "0.5%",
      apiStatus: "connected" as const,
      color: "hsl(45, 93%, 47%)"
    }
  ];

  const outboundChannels = [
    {
      provider: "Wise",
      type: "outbound" as const,
      status: "active" as const,
      volume24h: "$18,200",
      fees: "0.8%",
      apiStatus: "connected" as const,
      color: "hsl(173, 58%, 39%)"
    },
    {
      provider: "MTN MoMo",
      type: "outbound" as const,
      status: "inactive" as const,
      fees: "2.1%",
      apiStatus: "disconnected" as const,
      color: "hsl(142, 76%, 36%)"
    },
    {
      provider: "Orange Money",
      type: "outbound" as const,
      status: "active" as const,
      volume24h: "$5,400",
      fees: "1.8%",
      apiStatus: "connected" as const,
      color: "hsl(25, 95%, 53%)"
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Payment Channels</h1>
        <p className="text-muted-foreground">
          Configure and manage your payment API integrations
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inbound">Inbound</TabsTrigger>
          <TabsTrigger value="outbound">Outbound</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-gradient-card shadow-card">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-accent" />
                <div>
                  <div className="text-2xl font-bold">7</div>
                  <div className="text-sm text-muted-foreground">Active Channels</div>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-card shadow-card">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                <div>
                  <div className="text-2xl font-bold">1</div>
                  <div className="text-sm text-muted-foreground">Disconnected</div>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-card shadow-card">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gradient-primary rounded"></div>
                <div>
                  <div className="text-2xl font-bold">$89.2K</div>
                  <div className="text-sm text-muted-foreground">24h Volume</div>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-card shadow-card">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gradient-secondary rounded"></div>
                <div>
                  <div className="text-2xl font-bold">2.1%</div>
                  <div className="text-sm text-muted-foreground">Avg Fees</div>
                </div>
              </div>
            </Card>
          </div>

          {/* All Channels */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">All Payment Channels</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Channel
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...inboundChannels, ...outboundChannels].map((channel, index) => (
                <PaymentChannelCard key={index} {...channel} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="inbound" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Inbound Payment Channels</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Inbound Channel
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inboundChannels.map((channel, index) => (
              <PaymentChannelCard key={index} {...channel} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="outbound" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Outbound Payment Channels</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Outbound Channel
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {outboundChannels.map((channel, index) => (
              <PaymentChannelCard key={index} {...channel} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* API Configuration */}
          <Card className="p-6 bg-gradient-card shadow-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Key className="h-5 w-5 mr-2" />
              API Configuration
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stripe-key">Stripe Secret Key</Label>
                  <Input
                    id="stripe-key"
                    type="password"
                    placeholder="sk_live_..."
                    defaultValue="sk_live_************************"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paypal-key">PayPal Client ID</Label>
                  <Input
                    id="paypal-key"
                    type="password"
                    placeholder="AW..."
                    defaultValue="AW************************"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="crypto-key">Crypto.com API Key</Label>
                  <Input
                    id="crypto-key"
                    type="password"
                    placeholder="..."
                    defaultValue="************************"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wise-key">Wise API Token</Label>
                  <Input
                    id="wise-key"
                    type="password"
                    placeholder="..."
                    defaultValue="************************"
                  />
                </div>
              </div>
              <Button className="w-full">Update API Keys</Button>
            </div>
          </Card>

          {/* Channel Settings */}
          <Card className="p-6 bg-gradient-card shadow-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Channel Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Auto-retry Failed Payments</div>
                  <div className="text-sm text-muted-foreground">Automatically retry failed transactions</div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Smart Routing</div>
                  <div className="text-sm text-muted-foreground">Use AI to optimize payment routing</div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Real-time Notifications</div>
                  <div className="text-sm text-muted-foreground">Get notified of payment events</div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Webhook Endpoints</div>
                  <div className="text-sm text-muted-foreground">Enable webhook notifications</div>
                </div>
                <Switch />
              </div>
            </div>
          </Card>

          {/* Connection Test */}
          <Card className="p-6 bg-gradient-card shadow-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Link className="h-5 w-5 mr-2" />
              Connection Test
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <span>Stripe API</span>
                <Badge className="bg-accent text-accent-foreground">Connected</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <span>PayPal API</span>
                <Badge className="bg-accent text-accent-foreground">Connected</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <span>MTN MoMo API</span>
                <Badge className="bg-destructive text-destructive-foreground">Disconnected</Badge>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">Test All Connections</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};