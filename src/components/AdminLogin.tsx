import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminLoginProps {
  onLogin: (role: 'admin' | 'bank') => void;
  type: 'admin' | 'bank';
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, type }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const credentials = {
    admin: {
      email: 'admin@chamawise.com',
      password: 'SuperAdmin2024!',
      title: 'Admin Portal',
      description: 'Super Administrator Access',
      icon: <Shield className="h-8 w-8 text-red-500" />
    },
    bank: {
      email: 'partner@banktech.co.ke',
      password: 'BankPartner2024!',
      title: 'Bank Partner Portal',
      description: 'Verified Banking Partner Access',
      icon: <Lock className="h-8 w-8 text-blue-500" />
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const validCredentials = credentials[type];
    
    if (email === validCredentials.email && password === validCredentials.password) {
      toast({
        title: "Login Successful",
        description: `Welcome to the ${type === 'admin' ? 'Admin' : 'Bank Partner'} Portal`,
      });
      onLogin(type);
    } else {
      setError('Invalid email or password. Please check your credentials.');
      toast({
        title: "Login Failed",
        description: "Invalid credentials provided",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const currentCredentials = credentials[type];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 bg-white/10 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 p-3 bg-white/10 rounded-full border border-white/20">
              {currentCredentials.icon}
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              {currentCredentials.title}
            </CardTitle>
            <CardDescription className="text-gray-300">
              {currentCredentials.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert className="bg-red-500/10 border-red-500/20">
                  <AlertDescription className="text-red-300">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <h4 className="text-sm font-medium text-white mb-2">Demo Credentials:</h4>
              <div className="text-xs text-gray-300 space-y-1">
                <p><strong>Email:</strong> {currentCredentials.email}</p>
                <p><strong>Password:</strong> {currentCredentials.password}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;