import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Shield, Eye, EyeOff } from 'lucide-react';
import { useUserPin } from '@/hooks/useUserPin';

interface PinSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  required?: boolean;
}

const PinSetupModal: React.FC<PinSetupModalProps> = ({ isOpen, onClose, required = false }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPins, setShowPins] = useState(false);
  const { setPin: savePin, isLoading } = useUserPin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pin !== confirmPin) {
      return;
    }

    if (pin.length !== 4) {
      return;
    }

    const success = await savePin(pin);
    if (success) {
      setPin('');
      setConfirmPin('');
      onClose();
    }
  };

  const handleClose = () => {
    if (required) {
      // Don't allow closing if PIN setup is required
      return;
    }
    setPin('');
    setConfirmPin('');
    onClose();
  };

  const isPinValid = pin.length === 4 && confirmPin.length === 4 && pin === confirmPin;

  return (
    <Dialog open={isOpen} onOpenChange={required ? undefined : handleClose}>
      <DialogContent className="sm:max-w-[400px]" onInteractOutside={(e) => required && e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Setup Security PIN
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {required 
              ? "You need to set up a 4-digit PIN to secure your account and continue."
              : "Create a 4-digit PIN to secure your transactions and sensitive operations."
            }
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pin">Create PIN</Label>
              <div className="relative">
                <Input
                  id="pin"
                  type={showPins ? "text" : "password"}
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setPin(value);
                  }}
                  className="text-center text-lg tracking-widest pr-10"
                  maxLength={4}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPins(!showPins)}
                >
                  {showPins ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPin">Confirm PIN</Label>
              <Input
                id="confirmPin"
                type={showPins ? "text" : "password"}
                placeholder="••••"
                value={confirmPin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setConfirmPin(value);
                }}
                className="text-center text-lg tracking-widest"
                maxLength={4}
                required
              />
            </div>

            {pin.length === 4 && confirmPin.length === 4 && pin !== confirmPin && (
              <p className="text-sm text-destructive">PINs do not match</p>
            )}

            <div className="flex gap-3 pt-4">
              {!required && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                className={required ? "w-full" : "flex-1"}
                disabled={!isPinValid || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  'Set PIN'
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PinSetupModal;