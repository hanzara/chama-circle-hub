import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Plus, CreditCard, Smartphone, CalendarIcon, Upload, Shield, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useCards } from '@/hooks/useCards';
import { useWallet } from '@/hooks/useWallet';

interface CardCreationWizardProps {
  onCardCreated?: () => void;
}

export const CardCreationWizard = ({ onCardCreated }: CardCreationWizardProps) => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const { createCard } = useCards();
  const { wallets } = useWallet();

  const [cardData, setCardData] = useState({
    card_name: '',
    card_type: 'virtual' as 'virtual' | 'physical',
    card_subtype: 'recurring' as 'single_use' | 'recurring',
    primary_currency: 'USD',
    currency_priority: ['USD'] as string[],
    daily_limit: 1000,
    weekly_limit: 5000,
    monthly_limit: 20000,
    international_enabled: true,
    auto_expiry_date: undefined as Date | undefined,
    // KYC data for physical cards
    kyc: {
      full_name: '',
      document_type: 'passport',
      document_number: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
    },
    // Notification settings
    notifications: {
      sms: true,
      email: true,
      push: true,
      transaction_alerts: true,
      declined_payments: true,
      suspicious_activity: true,
      spending_limits: true,
    }
  });

  const currencies = ['USD', 'EUR', 'GBP', 'KES', 'BTC', 'ETH'];

  const handleCreateCard = async () => {
    setIsCreating(true);
    try {
      await createCard({
        card_name: cardData.card_name,
        card_type: cardData.card_type,
        card_subtype: cardData.card_subtype,
        primary_currency: cardData.primary_currency,
        currency_priority: cardData.currency_priority,
        daily_limit: cardData.daily_limit,
        weekly_limit: cardData.weekly_limit,
        monthly_limit: cardData.monthly_limit,
        international_enabled: cardData.international_enabled,
        auto_expiry_date: cardData.auto_expiry_date?.toISOString().split('T')[0],
      });
      
      setOpen(false);
      setCurrentStep(1);
      setCardData({
        card_name: '',
        card_type: 'virtual',
        card_subtype: 'recurring',
        primary_currency: 'USD',
        currency_priority: ['USD'],
        daily_limit: 1000,
        weekly_limit: 5000,
        monthly_limit: 20000,
        international_enabled: true,
        auto_expiry_date: undefined,
        kyc: {
          full_name: '',
          document_type: 'passport',
          document_number: '',
          address_line1: '',
          address_line2: '',
          city: '',
          state: '',
          postal_code: '',
          country: '',
        },
        notifications: {
          sms: true,
          email: true,
          push: true,
          transaction_alerts: true,
          declined_payments: true,
          suspicious_activity: true,
          spending_limits: true,
        }
      });
      onCardCreated?.();
    } catch (error) {
      console.error('Error creating card:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-semibold">Choose Card Type</Label>
              <p className="text-sm text-muted-foreground mb-4">Select whether you want a virtual or physical card</p>
              <div className="grid grid-cols-2 gap-4">
                <Card 
                  className={cn("cursor-pointer transition-all hover:shadow-md", 
                    cardData.card_type === 'virtual' ? 'border-primary bg-primary/5' : ''
                  )}
                  onClick={() => setCardData({...cardData, card_type: 'virtual'})}
                >
                  <CardHeader className="text-center">
                    <CreditCard className="w-8 h-8 mx-auto mb-2" />
                    <CardTitle className="text-lg">Virtual Card</CardTitle>
                    <CardDescription>Instant creation, online use</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary" className="w-full justify-center">Instant</Badge>
                  </CardContent>
                </Card>
                
                <Card 
                  className={cn("cursor-pointer transition-all hover:shadow-md", 
                    cardData.card_type === 'physical' ? 'border-primary bg-primary/5' : ''
                  )}
                  onClick={() => setCardData({...cardData, card_type: 'physical'})}
                >
                  <CardHeader className="text-center">
                    <Smartphone className="w-8 h-8 mx-auto mb-2" />
                    <CardTitle className="text-lg">Physical Card</CardTitle>
                    <CardDescription>Physical card, global acceptance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" className="w-full justify-center">5-7 days</Badge>
                  </CardContent>
                </Card>
              </div>
            </div>

            {cardData.card_type === 'virtual' && (
              <div>
                <Label className="text-base font-semibold">Virtual Card Type</Label>
                <p className="text-sm text-muted-foreground mb-3">Choose your preferred virtual card usage</p>
                <Select 
                  value={cardData.card_subtype} 
                  onValueChange={(value: 'single_use' | 'recurring') => setCardData({...cardData, card_subtype: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single_use">Single-use (One-time purchases)</SelectItem>
                    <SelectItem value="recurring">Recurring (Subscriptions & regular use)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="card_name">Card Name</Label>
              <Input
                id="card_name"
                placeholder="e.g., Netflix Subscription, Amazon Shopping"
                value={cardData.card_name}
                onChange={(e) => setCardData({...cardData, card_name: e.target.value})}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-semibold">Primary Currency & Multi-Currency Priority</Label>
              <p className="text-sm text-muted-foreground mb-4">Set your primary currency and fallback order</p>
              
              <div className="space-y-4">
                <div>
                  <Label>Primary Currency</Label>
                  <Select 
                    value={cardData.primary_currency} 
                    onValueChange={(value) => {
                      setCardData({
                        ...cardData, 
                        primary_currency: value,
                        currency_priority: [value, ...cardData.currency_priority.filter(c => c !== value)]
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Fallback Currency Order</Label>
                  <p className="text-xs text-muted-foreground mb-2">Drag to reorder fallback currencies</p>
                  <div className="space-y-2">
                    {cardData.currency_priority.map((currency, index) => (
                      <div key={currency} className="flex items-center gap-2 p-2 border rounded bg-background">
                        <Badge variant={index === 0 ? "default" : "secondary"}>
                          {index + 1}
                        </Badge>
                        <span>{currency}</span>
                        {index === 0 && <Badge variant="outline">Primary</Badge>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold">Spending Limits</Label>
              <p className="text-sm text-muted-foreground mb-4">Set daily, weekly, and monthly spending limits</p>
              
              <div className="space-y-4">
                <div>
                  <Label>Daily Limit: ${cardData.daily_limit}</Label>
                  <Slider
                    value={[cardData.daily_limit]}
                    onValueChange={(value) => setCardData({...cardData, daily_limit: value[0]})}
                    max={10000}
                    min={100}
                    step={100}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label>Weekly Limit: ${cardData.weekly_limit}</Label>
                  <Slider
                    value={[cardData.weekly_limit]}
                    onValueChange={(value) => setCardData({...cardData, weekly_limit: value[0]})}
                    max={50000}
                    min={500}
                    step={500}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label>Monthly Limit: ${cardData.monthly_limit}</Label>
                  <Slider
                    value={[cardData.monthly_limit]}
                    onValueChange={(value) => setCardData({...cardData, monthly_limit: value[0]})}
                    max={200000}
                    min={1000}
                    step={1000}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-semibold">Security & Control Settings</Label>
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>International Transactions</Label>
                    <p className="text-sm text-muted-foreground">Enable worldwide usage</p>
                  </div>
                  <Switch
                    checked={cardData.international_enabled}
                    onCheckedChange={(checked) => setCardData({...cardData, international_enabled: checked})}
                  />
                </div>

                {cardData.card_type === 'virtual' && (
                  <div>
                    <Label>Auto-Expiry Date (Optional)</Label>
                    <p className="text-sm text-muted-foreground mb-2">Set automatic expiry for single-use cards</p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !cardData.auto_expiry_date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {cardData.auto_expiry_date ? format(cardData.auto_expiry_date, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={cardData.auto_expiry_date}
                          onSelect={(date) => setCardData({...cardData, auto_expiry_date: date})}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold">Notification Settings</Label>
              <div className="space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <Label>Transaction Alerts</Label>
                  <Switch
                    checked={cardData.notifications.transaction_alerts}
                    onCheckedChange={(checked) => setCardData({
                      ...cardData, 
                      notifications: {...cardData.notifications, transaction_alerts: checked}
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Declined Payments</Label>
                  <Switch
                    checked={cardData.notifications.declined_payments}
                    onCheckedChange={(checked) => setCardData({
                      ...cardData, 
                      notifications: {...cardData.notifications, declined_payments: checked}
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Suspicious Activity</Label>
                  <Switch
                    checked={cardData.notifications.suspicious_activity}
                    onCheckedChange={(checked) => setCardData({
                      ...cardData, 
                      notifications: {...cardData.notifications, suspicious_activity: checked}
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        if (cardData.card_type === 'physical') {
          return (
            <div className="space-y-6">
              <div>
                <Label className="text-base font-semibold">Identity Verification (KYC)</Label>
                <p className="text-sm text-muted-foreground mb-4">Required for physical card delivery</p>
                
                <div className="space-y-4">
                  <div>
                    <Label>Full Legal Name</Label>
                    <Input
                      value={cardData.kyc.full_name}
                      onChange={(e) => setCardData({
                        ...cardData,
                        kyc: {...cardData.kyc, full_name: e.target.value}
                      })}
                      placeholder="As shown on government ID"
                    />
                  </div>
                  
                  <div>
                    <Label>Document Type</Label>
                    <Select 
                      value={cardData.kyc.document_type}
                      onValueChange={(value) => setCardData({
                        ...cardData,
                        kyc: {...cardData.kyc, document_type: value}
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="passport">Passport</SelectItem>
                        <SelectItem value="drivers_license">Driver's License</SelectItem>
                        <SelectItem value="national_id">National ID</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Document Number</Label>
                    <Input
                      value={cardData.kyc.document_number}
                      onChange={(e) => setCardData({
                        ...cardData,
                        kyc: {...cardData.kyc, document_number: e.target.value}
                      })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Address Line 1</Label>
                      <Input
                        value={cardData.kyc.address_line1}
                        onChange={(e) => setCardData({
                          ...cardData,
                          kyc: {...cardData.kyc, address_line1: e.target.value}
                        })}
                      />
                    </div>
                    <div>
                      <Label>Address Line 2</Label>
                      <Input
                        value={cardData.kyc.address_line2}
                        onChange={(e) => setCardData({
                          ...cardData,
                          kyc: {...cardData.kyc, address_line2: e.target.value}
                        })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>City</Label>
                      <Input
                        value={cardData.kyc.city}
                        onChange={(e) => setCardData({
                          ...cardData,
                          kyc: {...cardData.kyc, city: e.target.value}
                        })}
                      />
                    </div>
                    <div>
                      <Label>State/Region</Label>
                      <Input
                        value={cardData.kyc.state}
                        onChange={(e) => setCardData({
                          ...cardData,
                          kyc: {...cardData.kyc, state: e.target.value}
                        })}
                      />
                    </div>
                    <div>
                      <Label>Postal Code</Label>
                      <Input
                        value={cardData.kyc.postal_code}
                        onChange={(e) => setCardData({
                          ...cardData,
                          kyc: {...cardData.kyc, postal_code: e.target.value}
                        })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Country</Label>
                    <Select 
                      value={cardData.kyc.country}
                      onValueChange={(value) => setCardData({
                        ...cardData,
                        kyc: {...cardData.kyc, country: value}
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="KE">Kenya</SelectItem>
                        <SelectItem value="NG">Nigeria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Upload Document Photo</p>
                    <p className="text-xs text-muted-foreground">Clear photo of your ID document</p>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        return null;

      default:
        return null;
    }
  };

  const totalSteps = cardData.card_type === 'physical' ? 4 : 3;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Create Card
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New {cardData.card_type} Card</DialogTitle>
          <DialogDescription>
            Step {currentStep} of {totalSteps}: Configure your new card with advanced security and controls
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center space-x-2 mb-6">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  step <= currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {step}
              </div>
              {step < totalSteps && (
                <div
                  className={cn(
                    "w-12 h-0.5 mx-2",
                    step < currentStep ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {renderStep()}

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          
          {currentStep < totalSteps ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!cardData.card_name}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleCreateCard}
              disabled={isCreating || !cardData.card_name}
              className="bg-gradient-primary hover:opacity-90"
            >
              {isCreating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </div>
              ) : (
                'Create Card'
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};