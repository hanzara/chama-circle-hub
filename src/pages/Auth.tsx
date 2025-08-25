import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowRight, Shield, Globe, Zap } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkUser();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Account created successfully! Please check your email to verify your account.");
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Signed in successfully!");
        navigate("/");
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dashboard flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Auth Form - Left Side */}
        <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur border-white/20 order-2 lg:order-1">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to Universal Pay</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? "Creating account..." : "Create Account"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Platform Features - Right Side */}
        <div className="space-y-8 text-center lg:text-left order-1 lg:order-2">
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start space-x-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">Universal Pay</h1>
            </div>
            <p className="text-xl text-white/90 leading-relaxed">
              The world's most advanced payment infrastructure. Route money globally 
              with AI-powered optimization, automated treasury management, and enterprise-grade security.
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Globe className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Global Coverage</h3>
                  <p className="text-sm text-white/80">
                    Support for 200+ countries and 150+ currencies with real-time exchange rates and local payment methods.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Enterprise Security</h3>
                  <p className="text-sm text-white/80">
                    Bank-level security with advanced fraud detection, compliance monitoring, and end-to-end encryption.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">AI-Powered Routing</h3>
                  <p className="text-sm text-white/80">
                    Intelligent payment optimization with machine learning to reduce costs and improve success rates.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <p className="text-sm text-white/70">
              Join thousands of businesses worldwide who trust Universal Pay for their payment infrastructure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;