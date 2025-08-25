import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CreditCard, 
  Smartphone, 
  Bitcoin, 
  QrCode,
  Globe,
  ArrowRight,
  Building,
  Wallet,
  DollarSign,
  Euro,
  Repeat,
  Play,
  CheckCircle,
  Send,
  ArrowDownToLine,
  Clock,
  Users,
  Shuffle
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";

// Payment Methods with detailed sub-options
const paymentMethods = [
  { 
    name: "Bank Cards", 
    icon: CreditCard, 
    type: "card", 
    methods: [
      "Visa (one-time and recurring payments)",
      "Mastercard (one-time and recurring payments)", 
      "American Express",
      "Discover",
      "UnionPay",
      "JCB",
      "Virtual cards from neobanks (Revolut, N26, Monzo…)"
    ]
  },
  { 
    name: "International Payment Gateways", 
    icon: Globe, 
    type: "gateway", 
    methods: [
      "Stripe",
      "PayPal", 
      "Flutterwave",
      "Payoneer",
      "Wise",
      "Square",
      "Checkout.com"
    ]
  },
  { 
    name: "Banks & Open Banking", 
    icon: Building, 
    type: "bank", 
    methods: [
      "Payments via IBAN (SEPA, SWIFT)",
      "Direct debits (ACH, SEPA Direct Debit)",
      "Payments via open banking APIs",
      "Fast local transfers (e.g., RTP in the USA, Faster Payments in the UK)"
    ]
  },
  { 
    name: "Mobile Money", 
    icon: Smartphone, 
    type: "mobile", 
    methods: [
      "Orange Money",
      "MTN Mobile Money",
      "M-Pesa",
      "Airtel Money",
      "Moov Money",
      "Tigo Cash",
      "Wave"
    ]
  },
  { 
    name: "Cryptocurrencies", 
    icon: Bitcoin, 
    type: "crypto", 
    methods: [
      "Bitcoin (on-chain and Lightning Network)",
      "Ethereum",
      "USDT (TRC20, ERC20, BEP20)",
      "USDC",
      "BNB", 
      "Solana",
      "Avalanche",
      "Polygon",
      "Others via crypto API aggregators"
    ]
  },
  { 
    name: "QR Codes", 
    icon: QrCode, 
    type: "qr", 
    methods: [
      "Payments via Universal Pay generated QR codes",
      "QR codes compatible with MoMo, PayPal, Stripe, AliPay, and WeChat Pay"
    ]
  },
  { 
    name: "Other Input Sources", 
    icon: Globe, 
    type: "other", 
    methods: [
      "Payments via custom payment links",
      "Universal Pay hosted payment pages",
      "E-commerce integration (WooCommerce, Shopify, Magento)",
      "In-app payments via Universal Pay mobile SDK"
    ]
  }
];

// Output Methods for Send/Withdraw
const outputMethods = [
  {
    name: "Bank Accounts",
    icon: Building,
    type: "bank",
    methods: [
      "SEPA transfers",
      "SWIFT transfers", 
      "Local bank transfers (e.g., Cameroon, Nigeria, Kenya)",
      "Instant transfers (RTP, Faster Payments)"
    ]
  },
  {
    name: "Mobile Money",
    icon: Smartphone,
    type: "mobile",
    methods: [
      "Orange Money",
      "MTN Mobile Money",
      "M-Pesa", 
      "Airtel Money",
      "Wave",
      "Moov Money",
      "Tigo Cash"
    ]
  },
  {
    name: "Payment Cards",
    icon: CreditCard,
    type: "cards",
    methods: [
      "Top-up Universal Pay virtual cards",
      "Top-up physical Visa and Mastercard cards",
      "Transfers to prepaid partner cards"
    ]
  },
  {
    name: "Digital Wallets",
    icon: Wallet,
    type: "wallet",
    methods: [
      "PayPal",
      "Google Pay",
      "Apple Pay",
      "Stripe Wallet"
    ]
  },
  {
    name: "Cryptocurrencies", 
    icon: Bitcoin,
    type: "crypto",
    methods: [
      "Withdrawals to BTC, ETH, USDT, USDC, BNB, SOL, MATIC, AVAX, etc.",
      "Crypto-to-crypto swaps or crypto-to-fiat via aggregators",
      "Lightning Network payments for Bitcoin"
    ]
  },
  {
    name: "Third-Party Platforms",
    icon: Globe,
    type: "platforms",
    methods: [
      "Transfers to Stripe, PayPal, Wise, or Payoneer accounts",
      "Automatic invoice payments to partners"
    ]
  }
];

// Payment Types
const paymentTypes = [
  { name: "One-time Payment", icon: CreditCard, description: "Single payment to recipient" },
  { name: "Recurring Payment", icon: Clock, description: "Scheduled automatic payments" },
  { name: "Split Payment", icon: Users, description: "Divide payment among multiple recipients" },
  { name: "Multi-source Payment", icon: Shuffle, description: "Combine multiple payment sources" }
];

export const PaymentsSection = () => {
  const [activeTab, setActiveTab] = useState("pay");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [selectedPaymentType, setSelectedPaymentType] = useState("one-time");
  const [selectedSubOption, setSelectedSubOption] = useState("");
  const [selectedSendSource, setSelectedSendSource] = useState("");
  const [selectedSendDestination, setSelectedSendDestination] = useState("");
  const [selectedSendSubSource, setSelectedSendSubSource] = useState("");
  const [selectedSendSubDestination, setSelectedSendSubDestination] = useState("");
  const [selectedWithdrawSource, setSelectedWithdrawSource] = useState("");
  const [selectedWithdrawDestination, setSelectedWithdrawDestination] = useState("");
  const [selectedWithdrawSubSource, setSelectedWithdrawSubSource] = useState("");
  const [selectedWithdrawSubDestination, setSelectedWithdrawSubDestination] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState({
    recipient: "",
    amount: "",
    currency: "USD",
    description: "",
    accountNumber: "",
    paymentMethod: ""
  });

  const { wallets, sendPayment, loading } = useWallet();
  const { toast } = useToast();

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentData.recipient || !paymentData.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      await sendPayment({
        recipient: paymentData.recipient,
        amount: parseFloat(paymentData.amount),
        currency: paymentData.currency,
        message: paymentData.description
      });
      
      setPaymentData({ recipient: "", amount: "", currency: "USD", description: "", accountNumber: "", paymentMethod: "" });
      toast({
        title: "Success",
        description: "Payment initiated successfully",
      });
    } catch (error) {
      console.error("Payment error:", error);
    }
    setProcessing(false);
  };

  const PayTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Type
            </CardTitle>
            <CardDescription>Choose your payment approach</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {paymentTypes.map((type) => (
              <Button
                key={type.name}
                variant={selectedPaymentType === type.name.toLowerCase().replace(/[^a-z]/g, '-') ? "default" : "outline"}
                className="w-full justify-start h-auto py-3"
                onClick={() => setSelectedPaymentType(type.name.toLowerCase().replace(/[^a-z]/g, '-'))}
              >
                <type.icon className="w-4 h-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-sm">{type.name}</div>
                  <div className="text-xs text-muted-foreground">{type.description}</div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Payment Method Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Payment Method
            </CardTitle>
            <CardDescription>How would you like to pay?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {paymentMethods.map((method) => (
              <Button
                key={method.name}
                variant={selectedPaymentMethod === method.type ? "default" : "outline"}
                className="w-full justify-start h-auto py-3"
                onClick={() => {
                  setSelectedPaymentMethod(method.type);
                  setSelectedSubOption(""); // Reset sub-option when method changes
                }}
              >
                <method.icon className="w-4 h-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-sm">{method.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {method.methods.slice(0, 2).join(', ')}
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Sub-option Selection */}
      {selectedPaymentMethod && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="w-5 h-5" />
              Select Specific Option
            </CardTitle>
            <CardDescription>
              Choose your preferred {paymentMethods.find(m => m.type === selectedPaymentMethod)?.name} option
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {paymentMethods
                .find(m => m.type === selectedPaymentMethod)
                ?.methods.map((subOption, index) => (
                  <Button
                    key={index}
                    variant={selectedSubOption === subOption ? "default" : "outline"}
                    className="w-full justify-start h-auto p-3 text-left"
                    onClick={() => setSelectedSubOption(subOption)}
                  >
                    <div className="w-full">
                      <div className="font-medium text-sm leading-tight">{subOption}</div>
                      {selectedSubOption === subOption && (
                        <Badge className="mt-1">Selected</Badge>
                      )}
                    </div>
                  </Button>
                ))
              }
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Form */}
      {selectedPaymentMethod && selectedSubOption && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>Enter payment information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient *</Label>
                  <Input
                    id="recipient"
                    placeholder="Enter recipient name or ID"
                    value={paymentData.recipient}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, recipient: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={paymentData.currency} onValueChange={(value) => setPaymentData(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                      <SelectItem value="BTC">BTC - Bitcoin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account">Account/Reference</Label>
                  <Input
                    id="account"
                    placeholder="Account number or reference"
                    value={paymentData.accountNumber}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, accountNumber: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Payment description or note"
                  value={paymentData.description}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <Button type="submit" className="w-full" disabled={processing}>
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Initiate Payment
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const SendTab = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Send Money</h2>
        <p className="text-muted-foreground">Transfer funds to friends, family, or businesses</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Source of Funds
            </CardTitle>
            <CardDescription>Choose where to send money from</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {outputMethods.map((method) => (
              <Button
                key={method.name}
                variant={selectedSendSource === method.type ? "default" : "outline"}
                className="w-full justify-start h-auto py-3"
                onClick={() => {
                  setSelectedSendSource(method.type);
                  setSelectedSendSubSource(""); // Reset sub-option when source changes
                }}
              >
                <method.icon className="w-4 h-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-sm">{method.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {method.methods.slice(0, 2).join(', ')}
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Destination Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Send Destination
            </CardTitle>
            <CardDescription>Choose where to send money to</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {outputMethods.map((method) => (
              <Button
                key={method.name}
                variant={selectedSendDestination === method.type ? "default" : "outline"}
                className="w-full justify-start h-auto py-3"
                onClick={() => {
                  setSelectedSendDestination(method.type);
                  setSelectedSendSubDestination(""); // Reset sub-option when destination changes
                }}
              >
                <method.icon className="w-4 h-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-sm">{method.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {method.methods.slice(0, 2).join(', ')}
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Source Sub-options */}
      {selectedSendSource && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="w-5 h-5" />
              Select Specific Source
            </CardTitle>
            <CardDescription>
              Choose your preferred {outputMethods.find(m => m.type === selectedSendSource)?.name} source
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {outputMethods
                .find(m => m.type === selectedSendSource)
                ?.methods.map((subOption, index) => (
                  <Button
                    key={index}
                    variant={selectedSendSubSource === subOption ? "default" : "outline"}
                    className="w-full justify-start h-auto p-3 text-left"
                    onClick={() => setSelectedSendSubSource(subOption)}
                  >
                    <div className="w-full">
                      <div className="font-medium text-sm leading-tight">{subOption}</div>
                      {selectedSendSubSource === subOption && (
                        <Badge className="mt-1">Selected</Badge>
                      )}
                    </div>
                  </Button>
                ))
              }
            </div>
          </CardContent>
        </Card>
      )}

      {/* Destination Sub-options */}
      {selectedSendDestination && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="w-5 h-5" />
              Select Specific Destination
            </CardTitle>
            <CardDescription>
              Choose your preferred {outputMethods.find(m => m.type === selectedSendDestination)?.name} destination
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {outputMethods
                .find(m => m.type === selectedSendDestination)
                ?.methods.map((subOption, index) => (
                  <Button
                    key={index}
                    variant={selectedSendSubDestination === subOption ? "default" : "outline"}
                    className="w-full justify-start h-auto p-3 text-left"
                    onClick={() => setSelectedSendSubDestination(subOption)}
                  >
                    <div className="w-full">
                      <div className="font-medium text-sm leading-tight">{subOption}</div>
                      {selectedSendSubDestination === subOption && (
                        <Badge className="mt-1">Selected</Badge>
                      )}
                    </div>
                  </Button>
                ))
              }
            </div>
          </CardContent>
        </Card>
      )}

      {/* Send Form */}
      {selectedSendSource && selectedSendDestination && selectedSendSubSource && selectedSendSubDestination && (
        <Card>
          <CardHeader>
            <CardTitle>Send Details</CardTitle>
            <CardDescription>Enter transfer information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Amount</Label>
                  <Input placeholder="Enter amount to send" />
                </div>
                
                <div>
                  <Label>Currency</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                      <SelectItem value="BTC">BTC - Bitcoin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Recipient Details</Label>
                  <Input placeholder="Phone, email, or account number" />
                </div>
                
                <div>
                  <Label>Reference/Note</Label>
                  <Input placeholder="Payment reference or note" />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Button size="lg">
                <Send className="w-4 h-4 mr-2" />
                Send Money
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction Flow Visualization */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${selectedSendSource ? 'bg-primary text-white' : 'bg-primary/10'}`}>
                <Wallet className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium">Choose Source</p>
            </div>
            <ArrowRight className="text-muted-foreground" />
            <div className="text-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${selectedSendDestination ? 'bg-primary text-white' : 'bg-primary/10'}`}>
                <Send className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium">Choose Destination</p>
            </div>
            <ArrowRight className="text-muted-foreground" />
            <div className="text-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${selectedSendSubSource && selectedSendSubDestination ? 'bg-primary text-white' : 'bg-primary/10'}`}>
                <CheckCircle className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium">Complete Transfer</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const WithdrawTab = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Withdraw Funds</h2>
        <p className="text-muted-foreground">Transfer money to your bank or mobile wallet</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Withdrawal Source Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Withdrawal Source
            </CardTitle>
            <CardDescription>Choose where to withdraw funds from</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {outputMethods.map((method) => (
              <Button
                key={method.name}
                variant={selectedWithdrawSource === method.type ? "default" : "outline"}
                className="w-full justify-start h-auto py-3"
                onClick={() => {
                  setSelectedWithdrawSource(method.type);
                  setSelectedWithdrawSubSource(""); // Reset sub-option when source changes
                }}
              >
                <method.icon className="w-4 h-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-sm">{method.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {method.methods.slice(0, 2).join(', ')}
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Withdrawal Destination Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownToLine className="w-5 h-5" />
              Withdrawal Destination
            </CardTitle>
            <CardDescription>Choose where to transfer funds to</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {outputMethods.map((method) => (
              <Button
                key={method.name}
                variant={selectedWithdrawDestination === method.type ? "default" : "outline"}
                className="w-full justify-start h-auto py-3"
                onClick={() => {
                  setSelectedWithdrawDestination(method.type);
                  setSelectedWithdrawSubDestination(""); // Reset sub-option when destination changes
                }}
              >
                <method.icon className="w-4 h-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-sm">{method.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {method.methods.slice(0, 2).join(', ')}
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Source Sub-options */}
      {selectedWithdrawSource && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="w-5 h-5" />
              Select Specific Source
            </CardTitle>
            <CardDescription>
              Choose your preferred {outputMethods.find(m => m.type === selectedWithdrawSource)?.name} source
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {outputMethods
                .find(m => m.type === selectedWithdrawSource)
                ?.methods.map((subOption, index) => (
                  <Button
                    key={index}
                    variant={selectedWithdrawSubSource === subOption ? "default" : "outline"}
                    className="w-full justify-start h-auto p-3 text-left"
                    onClick={() => setSelectedWithdrawSubSource(subOption)}
                  >
                    <div className="w-full">
                      <div className="font-medium text-sm leading-tight">{subOption}</div>
                      {selectedWithdrawSubSource === subOption && (
                        <Badge className="mt-1">Selected</Badge>
                      )}
                    </div>
                  </Button>
                ))
              }
            </div>
          </CardContent>
        </Card>
      )}

      {/* Destination Sub-options */}
      {selectedWithdrawDestination && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="w-5 h-5" />
              Select Specific Destination
            </CardTitle>
            <CardDescription>
              Choose your preferred {outputMethods.find(m => m.type === selectedWithdrawDestination)?.name} destination
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {outputMethods
                .find(m => m.type === selectedWithdrawDestination)
                ?.methods.map((subOption, index) => (
                  <Button
                    key={index}
                    variant={selectedWithdrawSubDestination === subOption ? "default" : "outline"}
                    className="w-full justify-start h-auto p-3 text-left"
                    onClick={() => setSelectedWithdrawSubDestination(subOption)}
                  >
                    <div className="w-full">
                      <div className="font-medium text-sm leading-tight">{subOption}</div>
                      {selectedWithdrawSubDestination === subOption && (
                        <Badge className="mt-1">Selected</Badge>
                      )}
                    </div>
                  </Button>
                ))
              }
            </div>
          </CardContent>
        </Card>
      )}

      {/* Withdraw Form */}
      {selectedWithdrawSource && selectedWithdrawDestination && selectedWithdrawSubSource && selectedWithdrawSubDestination && (
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Details</CardTitle>
            <CardDescription>Enter withdrawal information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Amount</Label>
                  <Input placeholder="Enter withdrawal amount" />
                </div>
                
                <div>
                  <Label>Currency</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                      <SelectItem value="BTC">BTC - Bitcoin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Destination Account</Label>
                  <Input placeholder="Account number or mobile number" />
                </div>
                
                <div>
                  <Label>Reference/Note</Label>
                  <Input placeholder="Withdrawal reference or note" />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Button size="lg">
                <ArrowDownToLine className="w-4 h-4 mr-2" />
                Request Withdrawal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Balance */}
      <Card>
        <CardHeader>
          <CardTitle>Available Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {wallets.map((wallet) => (
              <div key={wallet.id} className="p-4 border rounded-lg text-center">
                <div className="font-semibold text-lg">{wallet.currency}</div>
                <div className="text-2xl font-bold">${wallet.balance.toFixed(2)}</div>
                <Badge variant="outline" className="mt-2">{wallet.currency}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Payments Hub</h1>
        <p className="text-muted-foreground">
          Comprehensive payment solutions for all your financial needs
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pay" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Pay
          </TabsTrigger>
          <TabsTrigger value="send" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Send
          </TabsTrigger>
          <TabsTrigger value="withdraw" className="flex items-center gap-2">
            <ArrowDownToLine className="w-4 h-4" />
            Withdraw
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pay">
          <PayTab />
        </TabsContent>

        <TabsContent value="send">
          <SendTab />
        </TabsContent>

        <TabsContent value="withdraw">
          <WithdrawTab />
        </TabsContent>
      </Tabs>

      {/* Live Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Payment System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <div className="text-sm font-medium text-green-800">Active Tab</div>
              <div className="text-lg font-bold text-green-900 capitalize">{activeTab}</div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <div className="text-sm font-medium text-blue-800">Payment Method</div>
              <div className="text-lg font-bold text-blue-900">{selectedPaymentMethod || "Not Selected"}</div>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
              <div className="text-sm font-medium text-purple-800">Payment Type</div>
              <div className="text-lg font-bold text-purple-900 capitalize">{selectedPaymentType.replace(/-/g, ' ')}</div>
            </div>
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-center">
              <div className="text-sm font-medium text-orange-800">Status</div>
              <div className="text-lg font-bold text-orange-900">
                {processing ? "Processing" : "Ready"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};