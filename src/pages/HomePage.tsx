import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Footer } from "@/components/Footer";
import { 
  Globe, 
  Zap, 
  Shield, 
  ArrowRight, 
  CheckCircle, 
  Code, 
  TrendingUp, 
  Users,
  CreditCard,
  Bot,
  Workflow,
  Plug,
  Play,
  Star,
  DollarSign,
  Smartphone,
  Building,
  Target
} from "lucide-react";
import heroImage from "@/assets/hero-dashboard.jpg";
import aiRoutingImage from "@/assets/ai-routing.jpg";
import globalPaymentsImage from "@/assets/global-payments.jpg";
import securityImage from "@/assets/security-shield.jpg";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">Universal Pay</span>
          </Link>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="#platform" className="text-sm font-medium hover:text-primary transition-colors">Platform</Link>
            <Link to="#solutions" className="text-sm font-medium hover:text-primary transition-colors">Solutions</Link>
            <Link to="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</Link>
            <Link to="#developers" className="text-sm font-medium hover:text-primary transition-colors">Developers</Link>
            <Link to="#company" className="text-sm font-medium hover:text-primary transition-colors">Company</Link>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" asChild>
              <Link to="/auth">Log In</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-dashboard overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-center lg:text-left">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                  One API. Infinite Payment Possibilities.
                </h1>
                <p className="text-xl text-white/90 leading-relaxed max-w-2xl">
                  Send, receive, convert, and automate global payments — across cards, crypto, mobile money, 
                  and bank transfers — with AI optimization and complete control.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" asChild className="text-lg px-8 py-4">
                  <Link to="/auth">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Play className="w-5 h-5 mr-2" />
                  See Live Demo
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Universal Pay Dashboard" 
                className="rounded-2xl shadow-2xl border border-white/20"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto max-w-7xl text-center">
          <p className="text-muted-foreground mb-8">Trusted by teams at</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <Badge variant="secondary" className="px-4 py-2 text-sm">Flutterwave</Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">Wise</Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">Crypto.com</Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">Stripe</Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">PayPal</Badge>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section id="platform" className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">Everything you need to scale globally</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From payment processing to AI optimization, we provide the complete infrastructure for modern businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-gradient-card border-primary/20 shadow-glow hover:shadow-glow/50 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">All-In-One Wallet</h3>
                <p className="text-muted-foreground">Multi-currency, real-time FX, crypto integration with complete control</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-primary/20 shadow-glow hover:shadow-glow/50 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">SmartRoute AI</h3>
                <p className="text-muted-foreground">Save costs with AI-optimized routing and intelligent failover</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-primary/20 shadow-glow hover:shadow-glow/50 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
                  <Plug className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Universal API Access</h3>
                <p className="text-muted-foreground">Direct API access to Stripe, PayPal, Wise, and 200+ providers</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-primary/20 shadow-glow hover:shadow-glow/50 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
                  <Workflow className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No-Code Builder</h3>
                <p className="text-muted-foreground">Automate refunds, retries, split payouts with visual workflows</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">AI that optimizes every transaction</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Watch our AI choose between Stripe & Flutterwave in real-time, 
                automatically selecting the fastest, cheapest route for maximum success rates.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Up to 40% cost reduction</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>98.7% success rate improvement</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Sub-second decision making</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src={aiRoutingImage} 
                alt="AI Payment Routing" 
                className="rounded-2xl shadow-xl border border-border"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section id="solutions" className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">Built for every business model</h2>
            <p className="text-xl text-muted-foreground">
              From startups to enterprises, we have the perfect solution for your payment needs.
            </p>
          </div>

          <Tabs defaultValue="saas" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-12">
              <TabsTrigger value="saas">SaaS Platforms</TabsTrigger>
              <TabsTrigger value="marketplace">Marketplaces</TabsTrigger>
              <TabsTrigger value="developer">Developers</TabsTrigger>
              <TabsTrigger value="startup">Startups</TabsTrigger>
              <TabsTrigger value="mobile">Mobile Money</TabsTrigger>
            </TabsList>

            <TabsContent value="saas" className="space-y-8">
              <Card className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <Building className="w-8 h-8 text-primary" />
                      <h3 className="text-2xl font-bold">For SaaS Platforms</h3>
                    </div>
                    <p className="text-muted-foreground mb-6">
                      Automate recurring billing, handle global subscriptions, and optimize payment success rates 
                      across multiple currencies and regions.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Automated dunning management</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Multi-currency subscriptions</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Revenue recovery optimization</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <img 
                      src={globalPaymentsImage} 
                      alt="SaaS Payments" 
                      className="rounded-lg shadow-lg"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="marketplace" className="space-y-8">
              <Card className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <Users className="w-8 h-8 text-primary" />
                      <h3 className="text-2xl font-bold">For Marketplaces</h3>
                    </div>
                    <p className="text-muted-foreground mb-6">
                      Handle complex split payments, multi-party transactions, and instant payouts 
                      to sellers across the globe.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Automated split payments</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Instant seller payouts</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Multi-party escrow</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <img 
                      src={aiRoutingImage} 
                      alt="Marketplace Payments" 
                      className="rounded-lg shadow-lg"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="developer" className="space-y-8">
              <Card className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <Code className="w-8 h-8 text-primary" />
                      <h3 className="text-2xl font-bold">For Developers</h3>
                    </div>
                    <p className="text-muted-foreground mb-6">
                      Integrate our APIs and SDKs to build custom payment solutions for your applications.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>RESTful APIs</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>SDKs for Node, Python, and more</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Comprehensive documentation</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <img 
                      src={securityImage} 
                      alt="Developer Payments" 
                      className="rounded-lg shadow-lg"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="startup" className="space-y-8">
              <Card className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <Star className="w-8 h-8 text-primary" />
                      <h3 className="text-2xl font-bold">For Startups</h3>
                    </div>
                    <p className="text-muted-foreground mb-6">
                      Launch your startup with our flexible payment solutions and scale globally from day one.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Fast onboarding</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Competitive pricing</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Global reach</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <img 
                      src={globalPaymentsImage} 
                      alt="Startup Payments" 
                      className="rounded-lg shadow-lg"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="mobile" className="space-y-8">
              <Card className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <Smartphone className="w-8 h-8 text-primary" />
                      <h3 className="text-2xl font-bold">For Mobile Money</h3>
                    </div>
                    <p className="text-muted-foreground mb-6">
                      Accept mobile money payments from users around the world and expand your reach.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Mobile money integration</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Global coverage</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Secure transactions</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <img 
                      src={aiRoutingImage} 
                      alt="Mobile Money Payments" 
                      className="rounded-lg shadow-lg"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-xl text-muted-foreground">
              Start free, scale as you grow. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="p-8 relative">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Starter</h3>
                <div className="text-4xl font-bold mb-4">Free</div>
                <p className="text-muted-foreground mb-6">Perfect for getting started</p>
                <Button variant="outline" className="w-full mb-6">Get Started</Button>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Up to $1,000/month volume</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>3 API connections</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Basic routing</span>
                  </li>
                </ul>
              </div>
            </Card>

            <Card className="p-8 relative border-primary shadow-glow">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">Most Popular</Badge>
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <div className="text-4xl font-bold mb-4">$29<span className="text-lg text-muted-foreground">/mo</span></div>
                <p className="text-muted-foreground mb-6">For growing businesses</p>
                <Button className="w-full mb-6">Start Free Trial</Button>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Up to $100,000/month volume</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Unlimited API connections</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>AI-powered routing</span>
                  </li>
                </ul>
              </div>
            </Card>

            <Card className="p-8 relative">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                <div className="text-4xl font-bold mb-4">Custom</div>
                <p className="text-muted-foreground mb-6">For large organizations</p>
                <Button variant="outline" className="w-full mb-6">Contact Sales</Button>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Unlimited volume</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>White-label options</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Dedicated support</span>
                  </li>
                </ul>
              </div>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button variant="ghost">Compare All Plans <ArrowRight className="w-4 h-4 ml-2" /></Button>
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section id="developers" className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">Built for developers, by developers</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Comprehensive APIs, SDKs, and tools to integrate payments 
                into any application in minutes, not months.
              </p>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center">
                  <Code className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold">REST APIs</h4>
                  <p className="text-sm text-muted-foreground">Complete documentation</p>
                </div>
                <div className="text-center">
                  <Globe className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold">SDKs</h4>
                  <p className="text-sm text-muted-foreground">Node, Python, Flutter</p>
                </div>
                <div className="text-center">
                  <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold">Webhooks</h4>
                  <p className="text-sm text-muted-foreground">Real-time notifications</p>
                </div>
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold">Analytics</h4>
                  <p className="text-sm text-muted-foreground">Status & logs</p>
                </div>
              </div>
              <Button size="lg">
                Test in Sandbox
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
            <div className="bg-slate-900 rounded-2xl p-6 text-green-400 font-mono text-sm overflow-x-auto">
              <div className="mb-4">
                <span className="text-slate-400">// Initialize Universal Pay</span>
              </div>
              <div className="mb-2">
                <span className="text-blue-400">const</span> universalPay = <span className="text-blue-400">new</span> UniversalPay({'{'}
              </div>
              <div className="ml-4 mb-2">
                apiKey: <span className="text-yellow-400">'your-api-key'</span>,
              </div>
              <div className="ml-4 mb-2">
                environment: <span className="text-yellow-400">'sandbox'</span>
              </div>
              <div className="mb-4">{'}'});</div>
              
              <div className="mb-4">
                <span className="text-slate-400">// Process payment with AI routing</span>
              </div>
              <div className="mb-2">
                <span className="text-blue-400">const</span> payment = <span className="text-blue-400">await</span> universalPay.charge({'{'}
              </div>
              <div className="ml-4 mb-2">
                amount: <span className="text-purple-400">1000</span>,
              </div>
              <div className="ml-4 mb-2">
                currency: <span className="text-yellow-400">'USD'</span>,
              </div>
              <div className="ml-4 mb-2">
                smartRoute: <span className="text-purple-400">true</span>
              </div>
              <div>{'}'});</div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src={securityImage} 
                alt="Security Features" 
                className="rounded-2xl shadow-xl"
              />
            </div>
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">Enterprise-grade security</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Your data and transactions are protected by bank-level security 
                with advanced fraud detection and compliance monitoring.
              </p>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Shield className="w-6 h-6 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">End-to-end encryption</h4>
                    <p className="text-muted-foreground">AES-256 encryption for all data in transit and at rest</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Compliance ready</h4>
                    <p className="text-muted-foreground">GDPR, PCI-DSS, Open Banking compliant out of the box</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <TrendingUp className="w-6 h-6 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Real-time monitoring</h4>
                    <p className="text-muted-foreground">24/7 fraud detection with machine learning algorithms</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Users className="w-6 h-6 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Role-based access</h4>
                    <p className="text-muted-foreground">Granular permissions and audit trails</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-dashboard">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
            Ready to streamline payments with superpowers?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Start your free trial today — no card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8 py-4 bg-white text-primary hover:bg-white/90">
              <Link to="/auth">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-4 bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Link to="/contact">
                Talk to Sales
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
