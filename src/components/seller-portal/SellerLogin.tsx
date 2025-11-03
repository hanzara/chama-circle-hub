import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, User, Key, Lock, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SellerLoginProps {
  onLoginSuccess: (userData: any) => void;
}

export const SellerLogin = ({ onLoginSuccess }: SellerLoginProps) => {
  const [step, setStep] = useState<'username' | 'code' | 'password-setup'>('username');
  const [username, setUsername] = useState('');
  const [loginCode, setLoginCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [requiresPasswordSetup, setRequiresPasswordSetup] = useState(false);
  const { toast } = useToast();

  const handleGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('generate_seller_login_code', {
        p_username: username.trim()
      });

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        setGeneratedCode(result.code);
        setRequiresPasswordSetup(result.requires_password_setup);
        setStep('code');
        
        toast({
          title: "Login Code Generated",
          description: `Your login code is: ${result.code}. It expires in 1 hour.`,
          duration: 10000,
        });
      } else {
        toast({
          title: "Error",
          description: result?.message || "Failed to generate login code",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Code generation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate login code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginCode.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('authenticate_seller_with_code', {
        p_username: username,
        p_code: loginCode.trim().toUpperCase()
      });

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        setSessionToken(result.session_token);
        
        if (result.requires_password_setup) {
          setStep('password-setup');
          toast({
            title: "Code Verified",
            description: "Please set up your password to complete registration",
          });
        } else {
          // Already has password, login complete
          localStorage.setItem('portal_session', result.session_token);
          
          toast({
            title: "Login Successful",
            description: `Welcome back, ${result.username}`,
          });

          onLoginSuccess({
            id: result.user_id,
            username: result.username,
            access_level: result.access_level,
            organization: result.organization,
            session_token: result.session_token
          });
        }
      } else {
        toast({
          title: "Authentication Failed",
          description: result?.message || "Invalid code",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Code verification error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to verify code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('set_seller_password', {
        p_username: username,
        p_session_token: sessionToken,
        p_new_password: newPassword
      });

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        localStorage.setItem('portal_session', sessionToken);
        
        toast({
          title: "Password Set Successfully",
          description: "You can now use your password for future logins",
        });

        // Complete login
        const { data: verifyData } = await supabase.rpc('verify_portal_session', {
          p_session_token: sessionToken
        });

        if (verifyData) {
          const userData = verifyData as any;
          onLoginSuccess({
            id: userData.user_id,
            username: userData.username,
            access_level: userData.access_level,
            organization: userData.organization,
            session_token: sessionToken
          });
        }
      } else {
        toast({
          title: "Error",
          description: result?.message || "Failed to set password",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Password setup error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to set password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-background/95 backdrop-blur-sm border-border/50 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Seller Portal Login
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                {step === 'username' && 'Enter your username to receive a login code'}
                {step === 'code' && 'Enter the code sent to you'}
                {step === 'password-setup' && 'Set up your password'}
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Step 1: Username */}
            {step === 'username' && (
              <form onSubmit={handleGenerateCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="bg-background/50"
                    required
                    autoFocus
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={loading || !username.trim()}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating Code...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      Get Login Code
                    </div>
                  )}
                </Button>

                <Alert>
                  <AlertDescription className="text-sm">
                    A unique 8-character login code will be generated for you. Use it within 1 hour to access your account.
                  </AlertDescription>
                </Alert>
              </form>
            )}

            {/* Step 2: Enter Code */}
            {step === 'code' && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <Alert className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-sm text-green-800 dark:text-green-200">
                    <div className="font-semibold mb-1">Your Login Code: {generatedCode}</div>
                    <div className="text-xs">This code expires in 1 hour</div>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="code" className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Enter Login Code
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    value={loginCode}
                    onChange={(e) => setLoginCode(e.target.value.toUpperCase())}
                    placeholder="Enter 8-character code"
                    className="bg-background/50 font-mono text-lg tracking-wider"
                    maxLength={8}
                    required
                    autoFocus
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={loading || loginCode.length !== 8}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Verify Code
                    </div>
                  )}
                </Button>

                <Button 
                  type="button" 
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setStep('username');
                    setLoginCode('');
                    setGeneratedCode('');
                  }}
                >
                  Back to Username
                </Button>
              </form>
            )}

            {/* Step 3: Password Setup */}
            {step === 'password-setup' && (
              <form onSubmit={handleSetPassword} className="space-y-4">
                <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                  <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                    Set up a password for easier future logins. You'll be able to login with just your username and password.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="new-password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    New Password
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                    className="bg-background/50"
                    minLength={6}
                    required
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Confirm Password
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="bg-background/50"
                    minLength={6}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  disabled={loading || !newPassword || !confirmPassword}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Setting Password...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Set Password & Login
                    </div>
                  )}
                </Button>
              </form>
            )}

            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">
                Secure seller authentication powered by ChamaVault
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
