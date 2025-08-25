import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  QrCode,
  Download,
  Share2,
  Copy,
  Smartphone,
  CreditCard,
  Wallet,
  Globe,
  Settings,
  Eye
} from "lucide-react";

const qrCodeHistory = [
  {
    id: "QR-001",
    name: "Restaurant Payment",
    amount: "$45.99",
    currency: "USD",
    type: "one-time",
    scans: 1,
    status: "completed",
    created: "2 hours ago"
  },
  {
    id: "QR-002",
    name: "Monthly Subscription",
    amount: "€29.99",
    currency: "EUR", 
    type: "recurring",
    scans: 8,
    status: "active",
    created: "1 day ago"
  },
  {
    id: "QR-003",
    name: "Event Tickets",
    amount: "$120.00",
    currency: "USD",
    type: "multi-use",
    scans: 15,
    status: "active",
    created: "3 days ago"
  }
];

const compatiblePlatforms = [
  { name: "Universal Pay", icon: QrCode, supported: true },
  { name: "PayPal", icon: Wallet, supported: true },
  { name: "M-Pesa", icon: Smartphone, supported: true },
  { name: "AliPay", icon: CreditCard, supported: true },
  { name: "WeChat Pay", icon: Smartphone, supported: true },
  { name: "Google Pay", icon: Wallet, supported: true },
  { name: "Apple Pay", icon: Wallet, supported: false },
  { name: "Samsung Pay", icon: Smartphone, supported: false },
];

export const QRCodeSection = () => {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [description, setDescription] = useState("");
  const [qrType, setQrType] = useState("one-time");
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);

  const generateQRCode = () => {
    // Simulate QR code generation
    const qrData = `UP:${amount}${currency}:${description}:${qrType}:${Date.now()}`;
    setGeneratedQR(qrData);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">QR Code Payments</h1>
        <p className="text-muted-foreground">
          Generate Universal QR codes compatible with major payment platforms worldwide
        </p>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generate">Generate QR</TabsTrigger>
          <TabsTrigger value="history">QR History</TabsTrigger>
          <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* QR Generation Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  Create QR Code
                </CardTitle>
                <CardDescription>
                  Generate a payment QR code for any amount and currency
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input 
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="NGN">NGN</SelectItem>
                        <SelectItem value="KES">KES</SelectItem>
                        <SelectItem value="BTC">BTC</SelectItem>
                        <SelectItem value="ETH">ETH</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input 
                    placeholder="Payment description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>QR Code Type</Label>
                  <Select value={qrType} onValueChange={setQrType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one-time">One-time Payment</SelectItem>
                      <SelectItem value="multi-use">Multi-use Payment</SelectItem>
                      <SelectItem value="recurring">Recurring Payment</SelectItem>
                      <SelectItem value="dynamic">Dynamic Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Platform Compatibility</h4>
                  <div className="flex flex-wrap gap-2">
                    {compatiblePlatforms.filter(p => p.supported).slice(0, 4).map((platform) => (
                      <Badge key={platform.name} variant="secondary" className="text-xs">
                        {platform.name}
                      </Badge>
                    ))}
                    <Badge variant="outline" className="text-xs">+2 more</Badge>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={generateQRCode}
                  disabled={!amount || !description}
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Generate QR Code
                </Button>
              </CardContent>
            </Card>

            {/* QR Preview */}
            <Card>
              <CardHeader>
                <CardTitle>QR Code Preview</CardTitle>
                <CardDescription>
                  Your generated QR code will appear here
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {generatedQR ? (
                  <div className="space-y-4">
                    {/* QR Code Placeholder */}
                    <div className="aspect-square bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-dashed border-primary/20 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <QrCode className="w-24 h-24 mx-auto text-primary mb-4" />
                        <p className="text-sm text-muted-foreground">QR Code Generated</p>
                        <p className="text-xs font-mono mt-2">{generatedQR.slice(0, 20)}...</p>
                      </div>
                    </div>

                    {/* QR Details */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-medium">{amount} {currency}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium capitalize">{qrType.replace('-', ' ')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Description:</span>
                        <span className="font-medium">{description}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-square bg-muted/50 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <QrCode className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground">Generate a QR code to see preview</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>QR Code History</CardTitle>
              <CardDescription>
                Manage and track all your generated QR codes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {qrCodeHistory.map((qr) => (
                <div key={qr.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium">{qr.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {qr.id} • {qr.amount} • {qr.type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {qr.scans} scans • Created {qr.created}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={qr.status === 'active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {qr.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compatibility" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Platform Compatibility
              </CardTitle>
              <CardDescription>
                QR codes compatible with major payment platforms globally
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {compatiblePlatforms.map((platform) => (
                  <div 
                    key={platform.name}
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      platform.supported ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <platform.icon className="w-6 h-6" />
                      <span className="font-medium">{platform.name}</span>
                    </div>
                    <Badge 
                      variant={platform.supported ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {platform.supported ? 'Supported' : 'Coming Soon'}
                    </Badge>
                  </div>
                ))}
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Universal Compatibility</h4>
                <p className="text-sm text-muted-foreground">
                  Our QR codes use universal standards and can be scanned by any compatible payment app. 
                  Cross-platform compatibility ensures maximum acceptance worldwide.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                QR Code Settings
              </CardTitle>
              <CardDescription>
                Configure default settings for QR code generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Default Currency</Label>
                  <Select defaultValue="USD">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>QR Code Size</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (200x200)</SelectItem>
                      <SelectItem value="medium">Medium (400x400)</SelectItem>
                      <SelectItem value="large">Large (800x800)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Expiration Time</Label>
                  <Select defaultValue="24h">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 Hour</SelectItem>
                      <SelectItem value="24h">24 Hours</SelectItem>
                      <SelectItem value="7d">7 Days</SelectItem>
                      <SelectItem value="30d">30 Days</SelectItem>
                      <SelectItem value="never">Never Expire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};