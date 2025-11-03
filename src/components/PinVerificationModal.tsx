import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Shield, Eye, EyeOff } from 'lucide-react';

interface PinVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (pin: string) => Promise<boolean>;
  title: string;
  description: string;
  isLoading?: boolean;
  required?: boolean;
}

const PinVerificationModal: React.FC<PinVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerify,
  title,
  description,
  isLoading = false,
  required = false
}) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pin.length !== 4) {
      return;
    }

    setIsVerifying(true);
    try {
      const success = await onVerify(pin);
      if (success) {
        setPin('');
        onClose();
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setPin('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={required ? undefined : onClose}>
      <DialogContent className="sm:max-w-[420px] gap-6" onInteractOutside={(e) => required && e.preventDefault()}>
        <DialogHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl font-semibold">
            {title}
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center">
            {description}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="pin" className="text-sm font-medium">Enter your 4-digit PIN</Label>
            <div className="relative">
              <Input
                id="pin"
                type={showPin ? "text" : "password"}
                placeholder="••••"
                value={pin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setPin(value);
                }}
                className="text-center text-3xl tracking-[0.5em] h-14 font-bold pr-12"
                maxLength={4}
                required
                autoFocus
                disabled={isVerifying || isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 p-0"
                onClick={() => setShowPin(!showPin)}
                disabled={isVerifying || isLoading}
              >
                {showPin ? (
                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Eye className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              This PIN secures all your transactions and withdrawals
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={pin.length !== 4 || isVerifying || isLoading}
            >
              {isVerifying || isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Verifying PIN...
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5 mr-2" />
                  Verify & Continue
                </>
              )}
            </Button>
            {!required && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={isVerifying || isLoading}
                className="w-full"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PinVerificationModal;