import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Users, Loader2 } from 'lucide-react';
import { useChamaPurchase } from '@/hooks/useChamaPurchase';
import { useAuth } from '@/hooks/useAuth';

interface Chama {
  id: string;
  name: string;
  description: string;
  max_members: number;
  current_members: number;
  contribution_amount: number;
  contribution_frequency: string;
}

interface EnhancedChamaPurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chama: Chama | null;
  onSuccess: () => void;
}

export const EnhancedChamaPurchaseModal: React.FC<EnhancedChamaPurchaseModalProps> = ({
  open,
  onOpenChange,
  chama,
  onSuccess
}) => {
  const { user } = useAuth();
  const { purchaseChama, isPurchasing } = useChamaPurchase();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (open) {
      setEmail(user?.email || '');
    }
  }, [open, user]);

  const calculatePrice = () => {
    return chama ? chama.max_members * 20 : 0;
  };

  const membershipProgress = chama 
    ? ((chama.current_members || 0) / chama.max_members) * 100 
    : 0;

  const handleProceedToPayment = () => {
    if (!fullName || !email || !phone || !chama) {
      return;
    }

    purchaseChama({
      chamaId: chama.id,
      expectedAmount: calculatePrice(),
      email: email
    });
  };

  if (!chama) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] max-h-[90vh] overflow-y-auto bg-background p-5 rounded-2xl">
        {/* Header Section */}
        <div className="flex items-start gap-3 mb-4">
          <Users className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-foreground mb-1">
              {chama.name}
            </h2>
            <p className="text-sm text-muted-foreground italic">
              "Building wealth together, one contribution at a time"
            </p>
          </div>
        </div>

        {/* Info Boxes */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-primary/10 rounded-lg p-3 text-center">
            <p className="text-sm font-medium text-foreground mb-1">Max Members</p>
            <p className="text-2xl font-bold text-foreground">{chama.max_members}</p>
          </div>
          <div className="bg-primary/10 rounded-lg p-3 text-center">
            <p className="text-sm font-medium text-foreground mb-1">Monthly Contribution</p>
            <p className="text-2xl font-bold text-foreground">KES {chama.contribution_amount}</p>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Membership Progress</p>
          <Progress value={membershipProgress} className="h-2 mb-1" />
          <p className="text-xs text-muted-foreground text-right">
            {chama.current_members || 0} / {chama.max_members} members
          </p>
        </div>

        {/* Ownership Fee */}
        <div className="bg-muted/50 rounded-lg p-4 mb-4">
          <p className="font-semibold text-foreground mb-1">Ownership Fee</p>
          <p className="text-sm text-muted-foreground mb-1">
            {chama.max_members} members × KES 20 = <span className="font-bold text-foreground">KES {calculatePrice()}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            One-time payment · Lifetime ownership
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-4 mb-4">
          <div>
            <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="mt-1.5 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="mt-1.5 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <Label htmlFor="phone" className="text-sm font-medium text-foreground">
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="07XXXXXXXXX"
              className="mt-1.5 focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="sticky bottom-0 pt-2 pb-1 bg-background">
          <Button
            onClick={handleProceedToPayment}
            disabled={!fullName || !email || !phone || isPurchasing}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            size="lg"
          >
            {isPurchasing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Proceed to Payment'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
