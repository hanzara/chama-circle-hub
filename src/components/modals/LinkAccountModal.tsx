import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLinkedAccounts } from '@/hooks/useLinkedAccounts';
import { useAuth } from '@/hooks/useAuth';
import { 
  Smartphone, 
  CreditCard, 
  Building2, 
  Check, 
  Link as LinkIcon,
  Shield,
  Zap,
  Star
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LinkAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOBILE_MONEY_PROVIDERS = [
  { id: 'mpesa', name: 'M-Pesa', icon: '💚' },
  { id: 'airtel_money', name: 'Airtel Money', icon: '🔴' },
];

export function LinkAccountModal({ isOpen, onClose }: LinkAccountModalProps) {
  const { user } = useAuth();
  const { linkAccount, isLinkingAccount } = useLinkedAccounts();
  
  const [accountType, setAccountType] = useState<'mobile_money' | 'card' | 'bank'>('mobile_money');
  const [provider, setProvider] = useState('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [email, setEmail] = useState(user?.email || '');

  const handleLinkAccount = async () => {
    try {
      await linkAccount({
        accountType,
        provider,
        phoneNumber: accountType === 'mobile_money' ? phoneNumber : undefined,
        email,
        accountName: accountName || undefined,
      });

      if (accountType === 'mobile_money') {
        onClose();
      }
    } catch (error) {
      console.error('Failed to link account:', error);
    }
  };

  const isFormValid = () => {
    if (accountType === 'mobile_money') {
      return phoneNumber.length >= 10 && provider;
    }
    return email && provider;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <LinkIcon className="h-6 w-6 text-primary" />
            Link Payment Account
          </DialogTitle>
          <DialogDescription>
            Connect your mobile money, card, or bank account for seamless transactions
          </DialogDescription>
        </DialogHeader>

        {/* Benefits Section */}
        <div className="grid grid-cols-3 gap-3 my-4">
          <Card className="border-primary/20">
            <CardContent className="pt-4 text-center">
              <Zap className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-xs font-medium">Instant Payments</p>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="pt-4 text-center">
              <Shield className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <p className="text-xs font-medium">Secure & Safe</p>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="pt-4 text-center">
              <Star className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-xs font-medium">Auto Top-Up</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={accountType} onValueChange={(value) => setAccountType(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mobile_money" className="gap-2">
              <Smartphone className="h-4 w-4" />
              Mobile Money
            </TabsTrigger>
            <TabsTrigger value="card" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Card
            </TabsTrigger>
            <TabsTrigger value="bank" className="gap-2">
              <Building2 className="h-4 w-4" />
              Bank
            </TabsTrigger>
          </TabsList>

          {/* Mobile Money Tab */}
          <TabsContent value="mobile_money" className="space-y-4 mt-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">Select Provider</Label>
              <div className="grid grid-cols-2 gap-3">
                {MOBILE_MONEY_PROVIDERS.map((prov) => (
                  <Card
                    key={prov.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      provider === prov.id
                        ? 'border-primary border-2 bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setProvider(prov.id)}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{prov.icon}</span>
                        <span className="font-semibold">{prov.name}</span>
                      </div>
                      {provider === prov.id && (
                        <div className="bg-primary rounded-full p-1">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile-phone">Phone Number</Label>
              <Input
                id="mobile-phone"
                type="tel"
                placeholder="254712345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="text-lg"
              />
              <p className="text-xs text-muted-foreground">
                Enter your {MOBILE_MONEY_PROVIDERS.find(p => p.id === provider)?.name} phone number
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile-name">Account Name (Optional)</Label>
              <Input
                id="mobile-name"
                placeholder="e.g., My Primary Account"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
              />
            </div>
          </TabsContent>

          {/* Card Tab */}
          <TabsContent value="card" className="space-y-4 mt-6">
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Card Tokenization via Paystack
                </CardTitle>
                <CardDescription>
                  We'll charge KES 100 to verify your card (refunded immediately)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="card-email">Email Address</Label>
                  <Input
                    id="card-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="card-name">Card Nickname (Optional)</Label>
                  <Input
                    id="card-name"
                    placeholder="e.g., My Visa Card"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                  />
                </div>

                <div className="bg-white rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="font-medium">PCI-DSS Compliant</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your card details are never stored on our servers. Paystack handles all sensitive data securely.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bank Tab */}
          <TabsContent value="bank" className="space-y-4 mt-6">
            <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-0">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Bank Account Linking
                </CardTitle>
                <CardDescription>
                  Connect your bank account via Paystack for direct transfers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="bank-email">Email Address</Label>
                  <Input
                    id="bank-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank-name">Account Nickname (Optional)</Label>
                  <Input
                    id="bank-name"
                    placeholder="e.g., KCB Savings Account"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                  />
                </div>

                <Badge variant="outline" className="w-full justify-center py-2">
                  Supports all major Kenyan banks
                </Badge>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isLinkingAccount}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleLinkAccount}
            disabled={!isFormValid() || isLinkingAccount}
          >
            {isLinkingAccount ? (
              'Linking...'
            ) : (
              <>
                <LinkIcon className="h-4 w-4 mr-2" />
                Link Account
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
