import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  Star, 
  Download, 
  Key, 
  BarChart3, 
  Settings, 
  Users,
  DollarSign,
  Shield,
  Zap,
  Globe
} from "lucide-react";

const apiCategories = [
  { id: "payments", name: "Payment Processing", count: 12 },
  { id: "crypto", name: "Cryptocurrency", count: 8 },
  { id: "mobile", name: "Mobile Money", count: 6 },
  { id: "banking", name: "Banking APIs", count: 10 },
  { id: "data", name: "Financial Data", count: 5 },
];

const featuredAPIs = [
  {
    id: "stripe",
    name: "Stripe",
    description: "Complete payment infrastructure for the internet",
    category: "Payment Processing",
    rating: 4.9,
    reviews: 2847,
    price: "2.9% + $0.30",
    logo: "ST",
    connected: false,
    features: ["Cards", "Digital Wallets", "Bank Transfers", "Subscriptions"],
    uptime: 99.9
  },
  {
    id: "flutterwave",
    name: "Flutterwave",
    description: "Payment infrastructure for global merchants",
    category: "Payment Processing", 
    rating: 4.7,
    reviews: 1205,
    price: "3.8% per transaction",
    logo: "FW",
    connected: true,
    features: ["Mobile Money", "Cards", "Bank Transfer", "USSD"],
    uptime: 99.7
  },
  {
    id: "binance",
    name: "Binance Pay",
    description: "Cryptocurrency payment solution",
    category: "Cryptocurrency",
    rating: 4.6,
    reviews: 892,
    price: "0% fees for merchants",
    logo: "BP",
    connected: false,
    features: ["Crypto Payments", "Multi-chain", "Instant Settlement"],
    uptime: 99.8
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Global digital payment platform",
    category: "Payment Processing",
    rating: 4.5,
    reviews: 3421,
    price: "3.49% + fixed fee",
    logo: "PP",
    connected: false,
    features: ["Digital Wallet", "PayPal Credit", "Invoice", "Subscriptions"],
    uptime: 99.6
  }
];

export function APIMarketplaceSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showApiKey, setShowApiKey] = useState<string | null>(null);

  const filteredAPIs = featuredAPIs.filter(api => {
    const matchesSearch = api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         api.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || api.category.toLowerCase().includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleConnect = (apiId: string) => {
    setShowApiKey(apiId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-text bg-clip-text text-transparent">
              Universal Pay Connect
            </h1>
            <p className="text-muted-foreground">API Marketplace</p>
          </div>
        </div>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover, connect, and manage payment APIs from one unified platform. 
          Choose from 40+ pre-integrated APIs with one-click setup.
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="bg-gradient-card shadow-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search APIs (e.g., Stripe, mobile money, crypto...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
              >
                All
              </Button>
              {apiCategories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name} ({category.count})
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAPIs.map((api) => (
          <Card key={api.id} className="bg-gradient-card shadow-card hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-primary text-white font-bold">
                      {api.logo}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">{api.name}</CardTitle>
                      {api.connected && (
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                          Connected
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{api.description}</CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-sm text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{api.rating}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {api.reviews} reviews
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Features */}
              <div className="flex flex-wrap gap-2">
                {api.features.map((feature) => (
                  <Badge key={feature} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                    <span>Pricing</span>
                  </div>
                  <div className="font-medium">{api.price}</div>
                </div>
                <div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Zap className="w-4 h-4" />
                    <span>Uptime</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={api.uptime * 10} className="flex-1 h-2" />
                    <span className="font-medium">{api.uptime}%</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {api.connected ? (
                  <>
                    <Button size="sm" className="flex-1">
                      <Settings className="w-4 h-4 mr-2" />
                      Configure
                    </Button>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Usage
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleConnect(api.id)}
                    >
                      <Key className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Docs
                    </Button>
                  </>
                )}
              </div>

              {/* API Key Input */}
              {showApiKey === api.id && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg border space-y-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Secure API Key Setup</span>
                  </div>
                  <Input 
                    type="password"
                    placeholder={`Enter your ${api.name} API key`}
                    className="font-mono text-sm"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Save & Connect
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowApiKey(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Connected APIs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">+2 this month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly API Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.7K</div>
            <p className="text-xs text-muted-foreground">+18% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cost Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">$1,247</div>
            <p className="text-xs text-muted-foreground">Saved via smart routing</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}