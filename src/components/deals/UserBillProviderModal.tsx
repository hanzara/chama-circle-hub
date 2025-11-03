import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Receipt, Loader2, Star } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import CurrencyDisplay from '@/components/CurrencyDisplay';

interface UserBillProvider {
  id: string;
  provider_name: string;
  provider_type: 'paybill' | 'till' | 'account';
  paybill_number?: string;
  till_number?: string;
  account_number?: string;
  provider_code?: string;
  category: string;
  is_favorite: boolean;
}

interface UserBillProviderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: UserBillProvider | null;
}

const UserBillProviderModal: React.FC<UserBillProviderModalProps> = ({ 
  open, 
  onOpenChange, 
  provider 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    accountNumber: '',
    amount: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!provider || !user) return;

    setLoading(true);

    try {
      // Calculate fee (2% of amount with minimum of KES 5)
      const amount = parseFloat(formData.amount);
      const feeAmount = Math.max(amount * 0.02, 5);
      const totalAmount = amount + feeAmount;

      const { error } = await supabase
        .from('user_bill_payments')
        .insert({
          user_id: user.id,
          bill_provider_id: provider.id, // This will need to be adapted based on your schema
          account_number: formData.accountNumber,
          amount: amount,
          service_fee: feeAmount,
          total_amount: totalAmount,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: "Bill Payment Initiated! 💳",
        description: `Payment of KES ${totalAmount} is being processed`,
      });

      onOpenChange(false);
      setFormData({ accountNumber: '', amount: '' });
    } catch (error: any) {
      console.error('Error processing bill payment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process bill payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateFee = () => {
    const amount = parseFloat(formData.amount) || 0;
    return Math.max(amount * 0.02, 5);
  };

  const getTotalAmount = () => {
    const amount = parseFloat(formData.amount) || 0;
    return amount + calculateFee();
  };

  const getPaymentInfo = () => {
    if (!provider) return '';
    
    switch (provider.provider_type) {
      case 'paybill':
        return `Paybill: ${provider.paybill_number}`;
      case 'till':
        return `Till: ${provider.till_number}`;
      case 'account':
        return `Account: ${provider.account_number}`;
      default:
        return '';
    }
  };

  const toggleFavorite = async () => {
    if (!provider || !user) return;

    try {
      const { error } = await supabase
        .from('user_bill_providers')
        .update({ is_favorite: !provider.is_favorite })
        .eq('id', provider.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: provider.is_favorite ? "Removed from favorites" : "Added to favorites",
        description: `${provider.provider_name} ${provider.is_favorite ? 'removed from' : 'added to'} favorites`,
      });
    } catch (error: any) {
      console.error('Error updating favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Pay {provider?.provider_name} Bill
            </div>
            {provider && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFavorite}
                className="text-yellow-500 hover:text-yellow-600"
              >
                <Star 
                  className={`h-4 w-4 ${provider.is_favorite ? 'fill-current' : ''}`} 
                />
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        {provider && (
          <div className="space-y-4">
            {/* Provider Info */}
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{provider.provider_name}</h3>
                <Badge variant="outline">{provider.category}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {getPaymentInfo()}
                {provider.provider_code && ` • Code: ${provider.provider_code}`}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accountNumber">
                  {provider.provider_type === 'paybill' ? 'Account Number' : 
                   provider.provider_type === 'till' ? 'Reference (Optional)' : 
                   'Customer Number'} *
                </Label>
                <Input
                  id="accountNumber"
                  placeholder={
                    provider.provider_type === 'paybill' ? 'Enter your account number' :
                    provider.provider_type === 'till' ? 'Enter reference (optional)' :
                    'Enter your customer number'
                  }
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  required={provider.provider_type !== 'till'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (KES) *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="1000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  min="1"
                  step="1"
                  required
                />
              </div>

              {formData.amount && (
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Bill Amount:</span>
                    <CurrencyDisplay 
                      amount={parseFloat(formData.amount)} 
                      className="font-medium" 
                      showToggle={false} 
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Processing Fee:</span>
                    <CurrencyDisplay 
                      amount={calculateFee()} 
                      className="font-medium" 
                      showToggle={false} 
                    />
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total Amount:</span>
                    <CurrencyDisplay 
                      amount={getTotalAmount()} 
                      className="font-semibold" 
                      showToggle={false} 
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || !formData.amount || (provider.provider_type !== 'till' && !formData.accountNumber)}
                  className="gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Receipt className="h-4 w-4" />
                      Pay Bill
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserBillProviderModal;