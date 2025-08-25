import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowDownLeft, ArrowUpRight, Copy, QrCode, Send, Zap } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";

interface SendReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'send' | 'receive';
  defaultCurrency?: string;
}

export const SendReceiveModal = ({ isOpen, onClose, mode, defaultCurrency = 'USD' }: SendReceiveModalProps) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(defaultCurrency);
  const [message, setMessage] = useState('');
  const [autopilot, setAutopilot] = useState(true);
  const [loading, setLoading] = useState(false);

  const { wallets, sendPayment } = useWallet();
  const { toast } = useToast();

  // Generate receive address/details
  const receiveDetails = {
    address: `${currency}:${currency === 'BTC' ? 'bc1q' : currency === 'ETH' ? '0x' : ''}${Math.random().toString(36).substr(2, 9)}`,
    qrCode: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="black"/><rect x="10" y="10" width="80" height="80" fill="white"/><text x="50" y="55" text-anchor="middle" fill="black" font-size="8">QR Code</text></svg>')}`
  };

  const handleSend = async () => {
    if (!recipient || !amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await sendPayment({
        recipient,
        amount: parseFloat(amount),
        currency,
        message,
        route: autopilot ? undefined : 'manual'
      });
      
      toast({
        title: "Payment Sent",
        description: `Successfully sent ${amount} ${currency} to ${recipient}`,
      });
      
      onClose();
      setRecipient('');
      setAmount('');
      setMessage('');
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Address copied successfully",
    });
  };

  const availableBalance = wallets.find(w => w.currency === currency)?.balance || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'send' ? (
              <>
                <ArrowUpRight className="h-5 w-5" />
                Send Payment
              </>
            ) : (
              <>
                <ArrowDownLeft className="h-5 w-5" />
                Receive Payment
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === 'send' 
              ? 'Send money using our AI-powered routing system' 
              : 'Generate address to receive payments'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {mode === 'send' ? (
            <>
              {/* Send Form */}
              <div className="space-y-2">
                <Label>Recipient</Label>
                <Input 
                  placeholder="Email, phone, wallet address, IBAN..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input 
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <div className="text-xs text-muted-foreground">
                    Available: {availableBalance.toLocaleString()} {currency}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets.map((wallet) => (
                        <SelectItem key={wallet.currency} value={wallet.currency}>
                          {wallet.currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Message (Optional)</Label>
                <Textarea 
                  placeholder="Payment reference or note"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">AI Autopilot</span>
                </div>
                <Badge variant={autopilot ? "default" : "secondary"}>
                  {autopilot ? "Enabled" : "Manual"}
                </Badge>
              </div>

              <Button 
                onClick={handleSend} 
                disabled={loading || !recipient || !amount}
                className="w-full"
              >
                {loading ? (
                  "Processing..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send {amount || '0'} {currency}
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              {/* Receive Form */}
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((wallet) => (
                      <SelectItem key={wallet.currency} value={wallet.currency}>
                        {wallet.currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Receive Address</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={receiveDetails.address}
                      readOnly
                      className="text-sm"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(receiveDetails.address)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col items-center space-y-2">
                  <Label>QR Code</Label>
                  <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                    <QrCode className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <Button variant="outline" size="sm">
                    Download QR Code
                  </Button>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Share this address to receive {currency} payments. 
                    Funds will appear in your wallet once confirmed.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};