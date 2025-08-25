import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard,
  Eye,
  EyeOff,
  Copy,
  Lock,
  Unlock,
  Trash2,
  Settings,
  Shield,
  Globe,
  Smartphone,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  RefreshCw,
  DollarSign,
  Apple,
  Wallet,
  PlusCircle,
  MoreHorizontal,
  Receipt
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCards, Card as CardType } from "@/hooks/useCards";
import { useAuth } from "@/hooks/useAuth";
import { CardCreationWizard } from "@/components/CardCreationWizard";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface TopUpModalProps {
  card: CardType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TopUpModal = ({ card, open, onOpenChange }: TopUpModalProps) => {
  const [amount, setAmount] = useState('');
  const [isTopUpding, setIsTopUpding] = useState(false);
  const { topUpCard } = useCards();

  const handleTopUp = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    setIsTopUpding(true);
    try {
      await topUpCard(card.id, parseFloat(amount));
      setAmount('');
      onOpenChange(false);
    } catch (error) {
      console.error('Top up failed:', error);
    } finally {
      setIsTopUpding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Top Up Card</DialogTitle>
          <DialogDescription>
            Add funds to {card.card_name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Amount (USD)</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setAmount('100')}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Quick Add $100
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setAmount('500')}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Quick Add $500
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Top Up from External Account
            </Button>
          </div>
          
          <Button 
            onClick={handleTopUp}
            disabled={isTopUpding || !amount || parseFloat(amount) <= 0}
            className="w-full bg-gradient-primary hover:opacity-90"
          >
            {isTopUpding ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              `Add $${amount || '0'}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface CardDetailsModalProps {
  card: CardType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CardDetailsModal = ({ card, open, onOpenChange }: CardDetailsModalProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const { transactions, updateCardSettings, updateCardStatus } = useCards();
  const { toast } = useToast();

  const cardTransactions = transactions.filter(t => t.card_id === card.id).slice(0, 10);

  const handleDigitalWalletToggle = async (provider: 'apple' | 'google' | 'paypal', enabled: boolean) => {
    try {
      const updateKey = `is_${provider}_pay_enabled` as keyof CardType;
      await updateCardSettings(card.id, { [updateKey]: enabled });
      
      toast({
        title: `${provider === 'apple' ? 'Apple Pay' : provider === 'google' ? 'Google Pay' : 'PayPal'} ${enabled ? 'Enabled' : 'Disabled'}`,
        description: `Your card has been ${enabled ? 'added to' : 'removed from'} ${provider === 'apple' ? 'Apple Pay' : provider === 'google' ? 'Google Pay' : 'PayPal'}.`,
      });
    } catch (error) {
      console.error(`Failed to toggle ${provider} pay:`, error);
    }
  };

  const handleCopyCardNumber = () => {
    if (card.card_number) {
      navigator.clipboard.writeText(card.card_number.replace(/\s/g, ''));
      toast({
        title: "Card Number Copied",
        description: "Card number has been copied to clipboard.",
      });
    }
  };

  const totalSpent = cardTransactions.reduce((sum, t) => sum + t.amount, 0);
  const rewardsEarned = Math.floor(totalSpent * 0.02); // 2% cashback

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {card.card_name}
          </DialogTitle>
          <DialogDescription>
            {card.card_type} card • {card.status}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            {/* Card Visual */}
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-sm opacity-80">Card Name</p>
                    <p className="font-medium text-lg">{card.card_name}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                      onClick={() => setShowDetails(!showDetails)}
                    >
                      {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                      onClick={handleCopyCardNumber}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <p className="text-xl font-mono tracking-wider">
                    {showDetails ? card.card_number : card.card_number?.replace(/\d(?=\d{4})/g, '*')}
                  </p>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs opacity-80">Expires</p>
                      <p>{card.expiry_date ? new Date(card.expiry_date).toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' }) : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-80">CVV</p>
                      <p>{showDetails ? card.cvv : '***'}</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-80">Balance</p>
                      <p className="text-lg font-semibold">${card.current_balance.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Daily Limit</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">${card.daily_limit?.toLocaleString() || 'Unlimited'}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Weekly Limit</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">${card.weekly_limit?.toLocaleString() || 'Unlimited'}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Monthly Limit</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">${card.monthly_limit?.toLocaleString() || 'Unlimited'}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">International</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={card.international_enabled ? "default" : "secondary"}>
                    {card.international_enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Digital Wallet Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Digital Wallet Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Apple className="w-5 h-5" />
                    <Label>Apple Pay</Label>
                  </div>
                  <Switch
                    checked={card.is_apple_pay_enabled}
                    onCheckedChange={(checked) => handleDigitalWalletToggle('apple', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    <Label>Google Pay</Label>
                  </div>
                  <Switch
                    checked={card.is_google_pay_enabled}
                    onCheckedChange={(checked) => handleDigitalWalletToggle('google', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    <Label>PayPal</Label>
                  </div>
                  <Switch
                    checked={card.is_paypal_enabled}
                    onCheckedChange={(checked) => handleDigitalWalletToggle('paypal', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Transactions</h3>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Statement
              </Button>
            </div>
            
            {cardTransactions.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Receipt className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No transactions yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {cardTransactions.map((transaction) => (
                  <Card key={transaction.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{transaction.merchant_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${transaction.amount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">{transaction.currency_used}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Spending Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Daily Limit: ${card.daily_limit || 0}</Label>
                  <div className="text-sm text-muted-foreground">Current daily spending limit</div>
                </div>
                
                <div>
                  <Label>Weekly Limit: ${card.weekly_limit || 0}</Label>
                  <div className="text-sm text-muted-foreground">Current weekly spending limit</div>
                </div>
                
                <div>
                  <Label>Monthly Limit: ${card.monthly_limit || 0}</Label>
                  <div className="text-sm text-muted-foreground">Current monthly spending limit</div>
                </div>
                
                <Button variant="outline" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Spending Limits
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Multi-Currency Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {card.currency_priority.map((currency, index) => (
                    <div key={currency} className="flex items-center gap-2 p-2 border rounded">
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        {index + 1}
                      </Badge>
                      <span>{currency}</span>
                      {index === 0 && <Badge variant="outline">Primary</Badge>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-4">
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Cashback Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold">${rewardsEarned}</p>
                    <p className="text-muted-foreground">Total Cashback Earned</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress to next milestone</span>
                      <span>${rewardsEarned}/100</span>
                    </div>
                    <Progress value={(rewardsEarned % 100)} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Just ${100 - (rewardsEarned % 100)} more in spending to unlock your next reward!
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{Math.floor(rewardsEarned * 10)}</p>
                      <p className="text-sm text-muted-foreground">Reward Points</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">2%</p>
                      <p className="text-sm text-muted-foreground">Cashback Rate</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Freeze/Unfreeze Card</Label>
                    <p className="text-sm text-muted-foreground">Temporarily block all transactions</p>
                  </div>
                  <Button
                    variant={card.status === 'locked' ? "default" : "destructive"}
                    size="sm"
                    onClick={() => updateCardStatus(card.id, card.status === 'locked' ? 'active' : 'locked')}
                  >
                    {card.status === 'locked' ? (
                      <>
                        <Unlock className="w-4 h-4 mr-2" />
                        Unfreeze
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Freeze
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>International Transactions</Label>
                    <p className="text-sm text-muted-foreground">Enable global usage</p>
                  </div>
                  <Switch
                    checked={card.international_enabled}
                    onCheckedChange={(checked) => updateCardSettings(card.id, { international_enabled: checked })}
                  />
                </div>

                {card.card_type === 'physical' && (
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Change PIN</Label>
                      <p className="text-sm text-muted-foreground">Update your card PIN</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Change PIN
                    </Button>
                  </div>
                )}

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Notification Preferences</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Transaction Alerts</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Declined Payments</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Suspicious Activity</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Spending Limit Alerts</Label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export const VirtualCardsSection = () => {
  const { cards, loading, deleteCard, refreshData } = useCards();
  const { user } = useAuth();
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (cards.length > 0 && !selectedCard) {
      setSelectedCard(cards[0]);
    }
  }, [cards, selectedCard]);

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
        <p className="text-muted-foreground">Please log in to view your cards.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'text-green-500';
      case 'locked': return 'text-orange-500';
      case 'frozen': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'active': return CheckCircle;
      case 'locked': return Lock;
      case 'frozen': return AlertCircle;
      default: return Clock;
    }
  };

  const totalBalance = cards.reduce((sum, card) => sum + card.current_balance, 0);
  const totalLimit = cards.reduce((sum, card) => sum + (card.monthly_limit || 0), 0);
  const activeCards = cards.filter(card => card.status === 'active').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Virtual & Physical Cards</h1>
        <p className="text-muted-foreground">
          Complete control over your payment cards with world-class security and flexibility
        </p>
      </div>

      {/* Cards Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="w-5 h-5" />
              Total Cards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{cards.length}</div>
            <div className="text-sm text-muted-foreground">{activeCards} Active</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBalance.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Across all cards</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Limits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalLimit.toLocaleString()}</div>
            <div className="text-sm text-green-600">Available credit</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={refreshData}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Cards Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card List */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Cards</CardTitle>
              <CardDescription>Manage your virtual and physical payment cards</CardDescription>
            </div>
            <CardCreationWizard onCardCreated={refreshData} />
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p>Loading your cards...</p>
              </div>
            ) : cards.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">No cards yet</p>
                <CardCreationWizard onCardCreated={refreshData} />
              </div>
            ) : (
              cards.map((card) => {
                const StatusIcon = getStatusIcon(card.status);
                return (
                  <div 
                    key={card.id} 
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${selectedCard?.id === card.id ? 'border-primary bg-primary/5' : 'hover:border-accent'}`}
                    onClick={() => setSelectedCard(card)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 bg-gradient-to-r from-slate-900 to-slate-800 rounded flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{card.card_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {card.card_number?.replace(/(.{4})/g, '$1 ').trim().replace(/\d(?=[\s\d]*\d{4})/g, '*')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={card.card_type === 'virtual' ? 'default' : 'secondary'}>
                          {card.card_type}
                        </Badge>
                        <StatusIcon className={`w-4 h-4 ${getStatusColor(card.status)}`} />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => {
                              setSelectedCard(card);
                              setDetailsModalOpen(true);
                            }}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedCard(card);
                              setTopUpModalOpen(true);
                            }}>
                              Top Up Card
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => deleteCard(card.id)}
                              className="text-destructive"
                            >
                              Delete Card
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Balance</p>
                        <p className="font-medium">${card.current_balance.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Monthly Limit</p>
                        <p className="font-medium">${card.monthly_limit?.toLocaleString() || 'Unlimited'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <Badge variant={card.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                          {card.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedCard ? (
              <>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setDetailsModalOpen(true)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Full Details
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setTopUpModalOpen(true)}
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Top Up Card
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Statement
                </Button>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Digital Wallets</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" size="sm" className="p-2">
                      <Apple className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="p-2">
                      <Smartphone className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="p-2">
                      <Wallet className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Select a card to see actions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {selectedCard && (
        <>
          <CardDetailsModal
            card={selectedCard}
            open={detailsModalOpen}
            onOpenChange={setDetailsModalOpen}
          />
          <TopUpModal
            card={selectedCard}
            open={topUpModalOpen}
            onOpenChange={setTopUpModalOpen}
          />
        </>
      )}
    </div>
  );
};