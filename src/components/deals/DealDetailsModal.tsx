import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gift, Star, Calendar, Loader2 } from 'lucide-react';
import { Deal, useDealsAndBills } from '@/hooks/useDealsAndBills';
import CurrencyDisplay from '@/components/CurrencyDisplay';

interface DealDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal: Deal | null;
}

const DealDetailsModal: React.FC<DealDetailsModalProps> = ({ open, onOpenChange, deal }) => {
  const { useDeal, isUsingDeal } = useDealsAndBills();
  const [purchaseAmount, setPurchaseAmount] = useState('');

  const handleUseDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deal) return;

    await useDeal({
      dealId: deal.id,
      originalAmount: parseFloat(purchaseAmount),
      merchantId: deal.merchant_id,
    });

    onOpenChange(false);
    setPurchaseAmount('');
  };

  const calculateDiscount = () => {
    const amount = parseFloat(purchaseAmount) || 0;
    if (!deal) return 0;
    
    if (deal.discount_percentage) {
      let discount = (amount * deal.discount_percentage) / 100;
      if (deal.maximum_discount) {
        discount = Math.min(discount, deal.maximum_discount);
      }
      return discount;
    }
    
    return deal.discount_amount || 0;
  };

  const getFinalAmount = () => {
    const amount = parseFloat(purchaseAmount) || 0;
    return amount - calculateDiscount();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Deal Details
          </DialogTitle>
        </DialogHeader>

        {deal && (
          <div className="space-y-6">
            {/* Deal Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{deal.title}</h3>
                <Badge variant="default">
                  {deal.discount_percentage 
                    ? `${deal.discount_percentage}% OFF` 
                    : `Save KES ${deal.discount_amount}`
                  }
                </Badge>
              </div>
              
              <p className="text-muted-foreground">{deal.description}</p>
              
              {deal.merchants && (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{deal.merchants.name}</p>
                    <p className="text-sm text-muted-foreground">{deal.merchants.category}</p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                {deal.minimum_spend > 0 && (
                  <div>
                    <span className="text-muted-foreground">Min spend:</span>
                    <CurrencyDisplay 
                      amount={deal.minimum_spend} 
                      className="font-medium block" 
                      showToggle={false} 
                    />
                  </div>
                )}
                
                {deal.valid_until && (
                  <div>
                    <span className="text-muted-foreground">Valid until:</span>
                    <p className="font-medium">
                      {new Date(deal.valid_until).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {deal.terms_conditions && (
                <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded">
                  <strong>Terms:</strong> {deal.terms_conditions}
                </div>
              )}
            </div>

            {/* Purchase Form */}
            <form onSubmit={handleUseDeal} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Purchase Amount (KES)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder={deal.minimum_spend > 0 ? deal.minimum_spend.toString() : "1000"}
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  min={deal.minimum_spend || 1}
                  step="1"
                  required
                />
              </div>

              {purchaseAmount && parseFloat(purchaseAmount) >= (deal.minimum_spend || 0) && (
                <div className="bg-green-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Original Amount:</span>
                    <CurrencyDisplay 
                      amount={parseFloat(purchaseAmount)} 
                      className="font-medium" 
                      showToggle={false} 
                    />
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Your Savings:</span>
                    <CurrencyDisplay 
                      amount={calculateDiscount()} 
                      className="font-medium" 
                      showToggle={false} 
                    />
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>You Pay:</span>
                    <CurrencyDisplay 
                      amount={getFinalAmount()} 
                      className="font-semibold text-primary" 
                      showToggle={false} 
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={
                    isUsingDeal || 
                    !purchaseAmount || 
                    parseFloat(purchaseAmount) < (deal.minimum_spend || 0)
                  }
                  className="gap-2"
                >
                  {isUsingDeal ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Gift className="h-4 w-4" />
                      Use Deal
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

export default DealDetailsModal;