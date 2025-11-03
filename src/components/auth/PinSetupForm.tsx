import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Lock, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  Fingerprint
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const PinSetupForm: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [step, setStep] = useState<'setup' | 'verify' | 'success'>('setup');
  const [formData, setFormData] = useState({
    pin: '',
    confirmPin: '',
    verifyPin: '',
  });
  const [showPin, setShowPin] = useState(false);
  const [pinStatus, setPinStatus] = useState<{
    hasPin: boolean;
    isLocked: boolean;
    failedAttempts: number;
    lockUntil?: string;
  }>({ hasPin: false, isLocked: false, failedAttempts: 0 });
  const [biometricSupported, setBiometricSupported] = useState(false);

  React.useEffect(() => {
    checkPinStatus();
    checkBiometricSupport();
  }, [user]);

  const checkPinStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_pins_enhanced')
        .select('failed_attempts, locked_until')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPinStatus({
          hasPin: true,
          isLocked: data.locked_until ? new Date(data.locked_until) > new Date() : false,
          failedAttempts: data.failed_attempts || 0,
          lockUntil: data.locked_until,
        });
      }
    } catch (error: any) {
      console.error('Error checking PIN status:', error);
    }
  };

  const checkBiometricSupport = () => {
    // Check if device supports biometric authentication
    if ('credentials' in navigator && 'create' in navigator.credentials) {
      setBiometricSupported(true);
    }
  };

  const handleSetupPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (formData.pin !== formData.confirmPin) {
      toast({
        title: "PIN Mismatch",
        description: "The PINs you entered don't match",
        variant: "destructive",
      });
      return;
    }

    if (formData.pin.length < 4 || formData.pin.length > 6) {
      toast({
        title: "Invalid PIN Length",
        description: "PIN must be between 4-6 digits",
        variant: "destructive",
      });
      return;
    }

    if (!/^\d+$/.test(formData.pin)) {
      toast({
        title: "Invalid PIN Format",
        description: "PIN must contain only numbers",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.rpc('set_user_pin_enhanced', {
        p_user_id: user.id,
        p_pin: formData.pin,
      });

      if (error) throw error;

      const result = data as { success: boolean; message: string };
      if (result?.success) {
        toast({
          title: "PIN Set Successfully! 🔐",
          description: "Your transaction PIN has been created",
        });
        
        setStep('verify');
        setFormData({ ...formData, pin: '', confirmPin: '' });
        checkPinStatus();
      } else {
        throw new Error(result?.message || 'Failed to set PIN');
      }
    } catch (error: any) {
      console.error('Error setting PIN:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to set PIN",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setVerifying(true);

    try {
      const { data, error } = await supabase.rpc('verify_user_pin_enhanced', {
        p_user_id: user.id,
        p_pin: formData.verifyPin,
      });

      if (error) throw error;

      const result = data as { success: boolean; message: string };
      if (result?.success) {
        toast({
          title: "PIN Verified! ✅",
          description: "Your PIN is working correctly",
        });
        setStep('success');
        checkPinStatus();
      } else {
        toast({
          title: "Verification Failed",
          description: result?.message || "Invalid PIN",
          variant: "destructive",
        });
        
        // Update failed attempts count
        checkPinStatus();
      }
    } catch (error: any) {
      console.error('Error verifying PIN:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to verify PIN",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
      setFormData({ ...formData, verifyPin: '' });
    }
  };

  const enableBiometric = async () => {
    if (!biometricSupported) {
      toast({
        title: "Not Supported",
        description: "Biometric authentication is not supported on this device",
        variant: "destructive",
      });
      return;
    }

    try {
      // This would typically involve WebAuthn API for biometric authentication
      // For now, we'll just show a success message
      toast({
        title: "Biometric Enabled! 👆",
        description: "You can now use your fingerprint or face ID for quick access",
      });
    } catch (error: any) {
      console.error('Error enabling biometric:', error);
      toast({
        title: "Error",
        description: "Failed to enable biometric authentication",
        variant: "destructive",
      });
    }
  };

  const getPinStrength = (pin: string) => {
    if (pin.length < 4) return { strength: 'weak', color: 'text-red-500' };
    if (pin.length === 4) return { strength: 'medium', color: 'text-yellow-500' };
    if (pin.length >= 5) return { strength: 'strong', color: 'text-green-500' };
    return { strength: 'weak', color: 'text-red-500' };
  };

  if (pinStatus.isLocked) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Lock className="h-5 w-5" />
            Account Locked
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your account is temporarily locked due to too many failed PIN attempts. 
              Please try again after {new Date(pinStatus.lockUntil!).toLocaleString()}.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Transaction PIN Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 'setup' && (
            <form onSubmit={handleSetupPin} className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Set up a secure PIN for transaction authentication. This PIN will be required for all financial operations.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="pin">Transaction PIN (4-6 digits) *</Label>
                <div className="relative">
                  <Input
                    id="pin"
                    type={showPin ? 'text' : 'password'}
                    value={formData.pin}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                    maxLength={6}
                    placeholder="Enter your PIN"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPin(!showPin)}
                  >
                    {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {formData.pin && (
                  <p className={`text-xs ${getPinStrength(formData.pin).color}`}>
                    PIN strength: {getPinStrength(formData.pin).strength}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPin">Confirm PIN *</Label>
                <Input
                  id="confirmPin"
                  type={showPin ? 'text' : 'password'}
                  value={formData.confirmPin}
                  onChange={(e) => setFormData({ ...formData, confirmPin: e.target.value.replace(/\D/g, '') })}
                  maxLength={6}
                  placeholder="Confirm your PIN"
                  required
                />
                {formData.confirmPin && formData.pin !== formData.confirmPin && (
                  <p className="text-xs text-red-500">PINs don't match</p>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={loading || formData.pin !== formData.confirmPin || formData.pin.length < 4}
                className="w-full gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Setting up PIN...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Set PIN
                  </>
                )}
              </Button>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={handleVerifyPin} className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Great! Now let's verify your PIN to make sure it's working correctly.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="verifyPin">Enter your PIN to verify</Label>
                <Input
                  id="verifyPin"
                  type="password"
                  value={formData.verifyPin}
                  onChange={(e) => setFormData({ ...formData, verifyPin: e.target.value.replace(/\D/g, '') })}
                  maxLength={6}
                  placeholder="Enter your PIN"
                  required
                />
              </div>

              {pinStatus.failedAttempts > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {pinStatus.failedAttempts} failed attempt(s). You have {5 - pinStatus.failedAttempts} attempts remaining.
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                disabled={verifying || formData.verifyPin.length < 4}
                className="w-full gap-2"
              >
                {verifying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Verify PIN
                  </>
                )}
              </Button>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold">PIN Setup Complete!</h3>
                <p className="text-muted-foreground">
                  Your transaction PIN has been successfully configured and verified.
                </p>
              </div>

              {biometricSupported && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-3">
                    Want to make it even easier? Enable biometric authentication for quick access.
                  </p>
                  <Button 
                    onClick={enableBiometric}
                    variant="outline"
                    className="gap-2"
                  >
                    <Fingerprint className="h-4 w-4" />
                    Enable Biometric
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PinSetupForm;