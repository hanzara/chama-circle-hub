import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Link,
  Globe,
  MessageSquare,
  BarChart3,
  Bell,
  Settings,
  ExternalLink,
  Copy,
  QrCode,
  Smartphone,
  Mail,
  FileText,
  Code,
  Palette
} from "lucide-react";

const paymentLinks = [
  {
    id: "LINK-001",
    name: "Product Purchase",
    amount: "$299.99",
    currency: "USD",
    type: "one-time",
    clicks: 45,
    conversions: 12,
    status: "active",
    created: "2024-01-15",
    expires: "2024-02-15"
  },
  {
    id: "LINK-002",
    name: "Monthly Subscription",
    amount: "$29.99",
    currency: "USD",
    type: "recurring",
    clicks: 128,
    conversions: 89,
    status: "active",
    created: "2024-01-10",
    expires: "Never"
  },
  {
    id: "LINK-003",
    name: "Event Ticket",
    amount: "€75.00",
    currency: "EUR",
    type: "one-time",
    clicks: 234,
    conversions: 156,
    status: "completed",
    created: "2024-01-05",
    expires: "2024-01-20"
  }
];

const analyticsData = [
  { metric: "Total Revenue", value: "$125,430", change: "+12.5%" },
  { metric: "Conversion Rate", value: "68.2%", change: "+5.3%" },
  { metric: "Average Transaction", value: "$89.50", change: "-2.1%" },
  { metric: "Failed Payments", value: "2.1%", change: "-0.8%" }
];

const disputeHistory = [
  {
    id: "DISP-001",
    transaction: "TXN-12345",
    amount: "$250.00",
    reason: "Product not received",
    status: "resolved",
    resolution: "Refund issued",
    date: "2024-01-15"
  },
  {
    id: "DISP-002",
    transaction: "TXN-12346",
    amount: "$89.99",
    reason: "Duplicate charge",
    status: "investigating",
    resolution: "Under review",
    date: "2024-01-18"
  }
];

export const AdvancedToolsSection = () => {
  const [linkName, setLinkName] = useState("");
  const [linkAmount, setLinkAmount] = useState("");
  const [linkCurrency, setLinkCurrency] = useState("USD");
  const [customDomain, setCustomDomain] = useState("");
  const [brandingEnabled, setBrandingEnabled] = useState(false);

  const generatePaymentLink = () => {
    // Generate payment link logic
    const linkId = `LINK-${Date.now()}`;
    console.log(`Generated payment link: ${linkId}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Advanced Tools</h1>
        <p className="text-muted-foreground">
          Custom payment links, hosted pages, dispute management, and financial analytics
        </p>
      </div>

      <Tabs defaultValue="links" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="links">Payment Links</TabsTrigger>
          <TabsTrigger value="pages">Hosted Pages</TabsTrigger>
          <TabsTrigger value="disputes">Disputes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="links" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Payment Link */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="w-5 h-5" />
                  Create Payment Link
                </CardTitle>
                <CardDescription>
                  Generate custom payment links for easy sharing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Link Name</Label>
                  <Input 
                    placeholder="e.g., Product Purchase"
                    value={linkName}
                    onChange={(e) => setLinkName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input 
                      type="number"
                      placeholder="0.00"
                      value={linkAmount}
                      onChange={(e) => setLinkAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select value={linkCurrency} onValueChange={setLinkCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="NGN">NGN</SelectItem>
                        <SelectItem value="KES">KES</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Payment Type</Label>
                  <Select defaultValue="one-time">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one-time">One-time Payment</SelectItem>
                      <SelectItem value="recurring">Recurring Payment</SelectItem>
                      <SelectItem value="donation">Donation (Any Amount)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Expiration</Label>
                  <Select defaultValue="30d">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24 Hours</SelectItem>
                      <SelectItem value="7d">7 Days</SelectItem>
                      <SelectItem value="30d">30 Days</SelectItem>
                      <SelectItem value="never">Never Expire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Preview URL:</p>
                  <p className="text-sm font-mono bg-background p-2 rounded border">
                    https://pay.universalpay.com/{linkName ? linkName.toLowerCase().replace(/\s+/g, '-') : 'payment-link'}
                  </p>
                </div>

                <Button 
                  className="w-full"
                  onClick={generatePaymentLink}
                  disabled={!linkName || !linkAmount}
                >
                  <Link className="w-4 h-4 mr-2" />
                  Generate Payment Link
                </Button>
              </CardContent>
            </Card>

            {/* Payment Links List */}
            <Card>
              <CardHeader>
                <CardTitle>Active Payment Links</CardTitle>
                <CardDescription>Manage your existing payment links</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {paymentLinks.map((link) => (
                  <div key={link.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{link.name}</h4>
                      <Badge variant={link.status === 'active' ? 'default' : 'secondary'}>
                        {link.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {link.amount} • {link.type} • {link.clicks} clicks • {link.conversions} conversions
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <QrCode className="w-3 h-3 mr-1" />
                        QR
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Hosted Payment Pages
              </CardTitle>
              <CardDescription>
                Create fully customizable payment pages with your branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Page Configuration</h4>
                  
                  <div className="space-y-2">
                    <Label>Page Title</Label>
                    <Input placeholder="Payment for..." />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea placeholder="Enter payment description..." />
                  </div>

                  <div className="space-y-2">
                    <Label>Custom Domain</Label>
                    <Input 
                      placeholder="payments.yourdomain.com"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Custom Branding</p>
                      <p className="text-sm text-muted-foreground">
                        Add your logo and brand colors
                      </p>
                    </div>
                    <Switch checked={brandingEnabled} onCheckedChange={setBrandingEnabled} />
                  </div>

                  {brandingEnabled && (
                    <div className="space-y-4 p-4 bg-muted rounded-lg">
                      <div className="space-y-2">
                        <Label>Logo URL</Label>
                        <Input placeholder="https://yourdomain.com/logo.png" />
                      </div>
                      <div className="space-y-2">
                        <Label>Primary Color</Label>
                        <div className="flex gap-2">
                          <Input placeholder="#0066CC" className="flex-1" />
                          <Button variant="outline" size="icon">
                            <Palette className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Page Preview</h4>
                  <div className="border rounded-lg p-6 bg-gradient-to-br from-primary/5 to-primary/10">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto flex items-center justify-center">
                        <Globe className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold">Payment Page</h3>
                      <p className="text-muted-foreground">Secure payment processing</p>
                      <div className="space-y-2">
                        <Input placeholder="Amount" className="max-w-xs mx-auto" />
                        <Button className="w-full max-w-xs">Pay Now</Button>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Preview of your hosted payment page
                  </p>
                </div>
              </div>

              <Button className="w-full">
                <Globe className="w-4 h-4 mr-2" />
                Create Hosted Page
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disputes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Dispute & Chargeback Management
              </CardTitle>
              <CardDescription>
                Manage payment disputes and chargeback cases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">2</div>
                    <div className="text-sm text-muted-foreground">Resolved</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">1</div>
                    <div className="text-sm text-muted-foreground">Investigating</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">95%</div>
                    <div className="text-sm text-muted-foreground">Win Rate</div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                {disputeHistory.map((dispute) => (
                  <div key={dispute.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{dispute.id}</h4>
                      <p className="text-sm text-muted-foreground">
                        {dispute.transaction} • {dispute.amount} • {dispute.reason}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {dispute.date} • {dispute.resolution}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={dispute.status === 'resolved' ? 'default' : 'secondary'}
                        className="mb-1"
                      >
                        {dispute.status}
                      </Badge>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm">
                          <FileText className="w-3 h-3 mr-1" />
                          Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Contact
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Financial Analytics Dashboard
              </CardTitle>
              <CardDescription>
                Comprehensive analytics and reporting for your payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {analyticsData.map((metric) => (
                  <Card key={metric.metric}>
                    <CardContent className="p-4">
                      <div className="text-sm text-muted-foreground">{metric.metric}</div>
                      <div className="text-2xl font-bold">{metric.value}</div>
                      <div className={`text-sm ${
                        metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.change}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Charts Placeholder */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Revenue Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-primary mx-auto mb-2" />
                        <p className="text-muted-foreground">Revenue chart would appear here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Payment Methods</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-secondary mx-auto mb-2" />
                        <p className="text-muted-foreground">Payment methods breakdown</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Real-time Notifications
              </CardTitle>
              <CardDescription>
                Configure notifications for email, SMS, and push alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Email Notifications</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Payment received</p>
                      <p className="text-sm text-muted-foreground">Get notified when payments are received</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Payment failed</p>
                      <p className="text-sm text-muted-foreground">Alert when payments fail</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Dispute opened</p>
                      <p className="text-sm text-muted-foreground">Immediate notification for new disputes</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Weekly summary</p>
                      <p className="text-sm text-muted-foreground">Weekly payment activity summary</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">SMS Notifications</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Large transactions</p>
                      <p className="text-sm text-muted-foreground">SMS for transactions over $1,000</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Security alerts</p>
                      <p className="text-sm text-muted-foreground">Critical security notifications</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Push Notifications</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Real-time updates</p>
                      <p className="text-sm text-muted-foreground">Instant push notifications for all events</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Mobile app alerts</p>
                      <p className="text-sm text-muted-foreground">Push notifications on mobile app</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Notification Channels</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    <span>SMS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    <span>Push</span>
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