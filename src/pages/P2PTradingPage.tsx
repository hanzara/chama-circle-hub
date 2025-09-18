
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Star, 
  MessageCircle, 
  Clock, 
  DollarSign,
  Users,
  Zap,
  Award
} from 'lucide-react';

const P2PTradingPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('buy');
  const [selectedAsset, setSelectedAsset] = useState('USDC');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  // Mock data for demonstration
  const tradingPairs = [
    { asset: 'USDC', price: 154.50, change: 2.4, volume: '2.4M' },
    { asset: 'USDT', price: 154.30, change: -0.8, volume: '1.8M' },
    { asset: 'BTC', price: 8520000, change: 5.2, volume: '892K' },
    { asset: 'ETH', price: 620000, change: 3.1, volume: '1.2M' },
  ];

  const p2pListings = [
    {
      id: 1,
      user: { name: 'Sarah K.', rating: 4.9, trades: 156, avatar: '' },
      type: 'sell',
      asset: 'USDC',
      amount: 10000,
      price: 154.50,
      paymentMethods: ['M-Pesa', 'Bank Transfer'],
      limits: { min: 1000, max: 50000 },
      completion: 98.5
    },
    {
      id: 2,
      user: { name: 'John M.', rating: 4.8, trades: 203, avatar: '' },
      type: 'buy',
      asset: 'USDT',
      amount: 25000,
      price: 154.30,
      paymentMethods: ['M-Pesa', 'Airtel Money'],
      limits: { min: 2000, max: 100000 },
      completion: 99.2
    },
  ];

  const handleCreateListing = () => {
    if (!amount || !price || !paymentMethod) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Listing Created! 🎉",
      description: `Your ${activeTab} order for ${amount} ${selectedAsset} has been posted`,
    });
  };

  const handleTrade = (listing: any) => {
    toast({
      title: "Trade Initiated! 🤝",
      description: `Starting escrow process with ${listing.user.name}`,
    });
  };

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">P2P Trading Hub</h1>
          <p className="text-muted-foreground">Trade cryptocurrencies directly with other users in Kenya</p>
        </div>

        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {tradingPairs.map((pair) => (
            <Card key={pair.asset} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{pair.asset}/KES</span>
                  <Badge variant={pair.change > 0 ? "default" : "destructive"} className="text-xs">
                    {pair.change > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {pair.change}%
                  </Badge>
                </div>
                <div className="text-lg font-bold">KES {pair.price.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Vol: {pair.volume}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Order */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Create Order
              </CardTitle>
              <CardDescription>Post your buy/sell order</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="buy" className="text-green-600">Buy</TabsTrigger>
                  <TabsTrigger value="sell" className="text-red-600">Sell</TabsTrigger>
                </TabsList>
                
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Asset</Label>
                    <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USDC">USDC</SelectItem>
                        <SelectItem value="USDT">USDT</SelectItem>
                        <SelectItem value="BTC">BTC</SelectItem>
                        <SelectItem value="ETH">ETH</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Amount ({selectedAsset})</Label>
                    <Input 
                      type="number" 
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Price (KES per {selectedAsset})</Label>
                    <Input 
                      type="number" 
                      placeholder="Enter price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mpesa">M-Pesa</SelectItem>
                        <SelectItem value="airtel">Airtel Money</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleCreateListing} className="w-full">
                    Create {activeTab === 'buy' ? 'Buy' : 'Sell'} Order
                  </Button>
                </div>
              </Tabs>
            </CardContent>
          </Card>

          {/* Order Book */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Active Orders
              </CardTitle>
              <CardDescription>Browse and trade with other users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {p2pListings.map((listing) => (
                  <div key={listing.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={listing.user.avatar} />
                          <AvatarFallback>{listing.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{listing.user.name}</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{listing.user.rating}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {listing.user.trades} trades
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {listing.completion}% completion rate
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge variant={listing.type === 'buy' ? 'default' : 'secondary'} className="mb-2">
                          {listing.type === 'buy' ? 'Buying' : 'Selling'} {listing.asset}
                        </Badge>
                        <div className="text-lg font-bold">
                          KES {listing.price.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Amount: {listing.amount.toLocaleString()} {listing.asset}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Payment:</span>
                        {listing.paymentMethods.map((method) => (
                          <Badge key={method} variant="outline" className="text-xs">
                            {method}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Limits: KES {listing.limits.min.toLocaleString()} - {listing.limits.max.toLocaleString()}
                        </span>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm">Trade</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Trade with {listing.user.name}</DialogTitle>
                              <DialogDescription>
                                {listing.type === 'buy' ? 'Sell' : 'Buy'} {listing.asset} at KES {listing.price.toLocaleString()}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Amount to trade</Label>
                                <Input type="number" placeholder="Enter amount" />
                              </div>
                              <Button onClick={() => handleTrade(listing)} className="w-full">
                                Start Trade
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Features */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security & Protection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Escrow Protection</h3>
                <p className="text-sm text-muted-foreground">
                  Funds are held securely until both parties confirm the trade
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Verified Users</h3>
                <p className="text-sm text-muted-foreground">
                  Trade with KYC-verified users for added security
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Real-time Chat</h3>
                <p className="text-sm text-muted-foreground">
                  Communicate directly with traders during the process
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default P2PTradingPage;
