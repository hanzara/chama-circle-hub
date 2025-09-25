import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Shield, Users, Wallet, TrendingUp, Star, CheckCircle } from "lucide-react";
import chamaHeroImage from "@/assets/chama-hero.jpg";
import walletFeatureImage from "@/assets/wallet-feature.jpg";
import communitySuccessImage from "@/assets/community-success.jpg";
import chamaMeetingImage from "@/assets/chama-meeting.jpg";
import mobileMoneyImage from "@/assets/mobile-money.jpg";
import financialSuccessImage from "@/assets/financial-success.jpg";
import teamWorkspaceImage from "@/assets/team-workspace.jpg";

const CompanyPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Wallet className="h-8 w-8" />,
      title: "Digital Wallets",
      description: "Connect M-Pesa, Airtel Money, and bank accounts for seamless financial integration."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Group Savings & Merry-Go-Round",
      description: "Automate contributions, manage group savings, and handle rotating credit associations."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Loan Management",
      description: "Apply, approve, and disburse loans digitally with AI-powered credit assessments."
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Transparency & Analytics",
      description: "Real-time reports visible to all members with comprehensive financial tracking."
    }
  ];

  const additionalFeatures = [
    "AI Credit Scoring for member trustworthiness assessment",
    "Investor Access for verified Chamas to raise external funds",
    "Mobile App & Web App accessible anytime, anywhere",
    "Automated compliance and audit trails",
    "Multi-language support for diverse communities",
    "Real-time notifications and alerts"
  ];

  const businessModel = [
    {
      title: "Freemium & Premium Subscriptions",
      description: "Basic features free, advanced tools for premium members"
    },
    {
      title: "Transaction Fees",
      description: "Small fees on withdrawals, contributions, and investments"
    },
    {
      title: "Data Analytics",
      description: "Insights and reporting services (with user consent)"
    },
    {
      title: "Strategic Partnerships",
      description: "Collaborations with banks, SACCOs, and institutional investors"
    }
  ];

  const teamMembers = [
    {
      name: "Harun Nzai Randu",
      role: "CEO & Co-Founder",
      bio: "Former banking executive with 10+ years in African financial services"
    },
    {
      name: "David Mwangi",
      role: "CTO & Co-Founder", 
      bio: "Software architect specializing in fintech and mobile payment systems"
    },
    {
      name: "Grace Wanjiku",
      role: "Product Lead",
      bio: "UX expert focused on financial inclusion and community-driven design"
    },
    {
      name: "Michael Ochieng",
      role: "Head of Operations",
      bio: "Operations specialist with deep knowledge of Chama culture and practices"
    }
  ];

  const benefits = [
    "Mobile-first design for easy access anywhere",
    "Integrated M-Pesa and mobile money support",
    "Transparent contribution tracking",
    "Automated payout systems",
    "Real-time financial analytics",
    "Community networking features"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-kenyan-white to-secondary/20">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-kenyan-green to-primary rounded-xl flex items-center justify-center shadow-lg">
                <Wallet className="h-6 w-6 text-kenyan-green-foreground" />
              </div>
              <div>
                <span className="text-xl font-bold text-foreground">ChamaWallet</span>
                <div className="text-xs text-kenyan-gold font-medium">Empowering Communities</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/auth")}
                className="text-foreground hover:text-kenyan-green transition-colors"
              >
                Login
              </Button>
              <Button 
                onClick={() => navigate("/auth")}
                className="bg-gradient-to-r from-kenyan-green to-primary hover:from-kenyan-green/90 hover:to-primary/90 text-kenyan-green-foreground shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-kenyan-green/5 via-transparent to-kenyan-gold/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-6">
                <Badge variant="secondary" className="w-fit bg-kenyan-green/10 text-kenyan-green border-kenyan-green/20 hover:bg-kenyan-green/20 transition-colors">
                  <Star className="h-3 w-3 mr-1 text-kenyan-gold" />
                  Trusted by 100+ Active Chamas
                </Badge>
                
                <h1 className="text-5xl lg:text-7xl font-bold text-foreground leading-tight">
                  Digitizing Africa's
                  <span className="text-transparent bg-gradient-to-r from-kenyan-green to-primary bg-clip-text block mt-2">
                    Grassroots
                  </span>
                  <span className="text-kenyan-gold">Savings Culture</span>
                </h1>
                
                <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                  Empowering communities by transforming Chamas into secure, transparent, 
                  and scalable digital financial ecosystems across Africa.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="bg-gradient-to-r from-kenyan-green to-primary hover:from-kenyan-green/90 hover:to-primary/90 text-kenyan-green-foreground px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate("/auth")}
                  className="border-kenyan-green/30 text-kenyan-green hover:border-kenyan-green hover:bg-kenyan-green/5 px-8 py-4 text-lg transition-all duration-300"
                >
                  Request Demo
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-kenyan-gold rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">Live on Mobile & Web</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-kenyan-green" />
                  <span className="text-sm text-muted-foreground">Bank-Grade Security</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10 animate-float">
                <img 
                  src={chamaHeroImage} 
                  alt="Chama group savings meeting in Kenya" 
                  className="rounded-3xl shadow-2xl w-full h-auto border border-kenyan-green/10"
                />
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-kenyan-gold to-kenyan-green rounded-2xl flex items-center justify-center shadow-xl">
                  <TrendingUp className="h-12 w-12 text-kenyan-gold-foreground" />
                </div>
              </div>
              <div className="absolute -inset-6 bg-gradient-to-r from-kenyan-green/20 via-primary/15 to-kenyan-gold/20 rounded-3xl blur-3xl -z-10 animate-shimmer"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Overview Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              About ChamaWallet
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Founded in 2025 and headquartered in Mombasa, Kenya, we're transforming Africa's traditional savings groups into modern digital financial ecosystems.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-8">
              <div className="grid md:grid-cols-1 gap-6">
                <Card className="border-border bg-background/50 backdrop-blur-sm text-center p-8">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Our Mission</h3>
                  <p className="text-muted-foreground">
                    We empower communities by transforming Chamas into secure, transparent, and scalable digital financial ecosystems.
                  </p>
                </Card>
                
                <Card className="border-border bg-background/50 backdrop-blur-sm text-center p-8">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Our Vision</h3>
                  <p className="text-muted-foreground">
                    To become Africa's leading platform for group savings, lending, and financial inclusion.
                  </p>
                </Card>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src={chamaMeetingImage} 
                alt="Chama group meeting" 
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/10 rounded-3xl blur-2xl -z-10"></div>
            </div>
          </div>

          <div className="text-center">
            <Card className="border-border bg-background/50 backdrop-blur-sm p-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold text-foreground mb-4">Industry Focus</h3>
              <p className="text-muted-foreground">
                FinTech / Financial Services with emphasis on community-driven financial solutions.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Everything You Need for Group Savings
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools your chama needs to thrive
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="border-kenyan-green/20 hover:border-kenyan-green/50 transition-all duration-300 bg-background/50 backdrop-blur-sm hover:shadow-xl group">
                <CardContent className="p-6 space-y-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-kenyan-green/10 to-kenyan-gold/10 rounded-xl flex items-center justify-center text-kenyan-green group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-kenyan-green transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mobile Money Integration Showcase */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <img 
                src={mobileMoneyImage} 
                alt="Mobile money integration" 
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/10 rounded-3xl blur-2xl -z-10"></div>
            </div>
            
            <div className="space-y-6 order-1 lg:order-2">
              <h3 className="text-2xl lg:text-3xl font-bold text-foreground">
                Seamless Mobile Money Integration
              </h3>
              <p className="text-lg text-muted-foreground">
                Connect effortlessly with M-Pesa, Airtel Money, and major banks. 
                Make contributions and withdrawals with just a few taps on your phone.
              </p>
              <div className="space-y-3">
                {benefits.slice(0, 3).map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Advanced Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools designed specifically for African financial communities
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3 p-4 bg-background/50 rounded-lg border border-border">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Traction & Impact Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Our Impact
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Addressing Africa's financial inclusion challenge with digital-first solutions
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-8">
              <div className="grid md:grid-cols-1 gap-6">
                <div className="text-center space-y-4 p-6 bg-background/50 rounded-xl border border-border">
                  <div className="text-4xl font-bold text-primary">100+</div>
                  <div className="text-xl font-semibold text-foreground">Active Chamas</div>
                  <div className="text-muted-foreground">Successfully onboarded in beta phase</div>
                </div>
                
                <div className="text-center space-y-4 p-6 bg-background/50 rounded-xl border border-border">
                  <div className="text-4xl font-bold text-primary">80%+</div>
                  <div className="text-xl font-semibold text-foreground">Market Need</div>
                  <div className="text-muted-foreground">Of Africans rely on informal finance systems</div>
                </div>
                
                <div className="text-center space-y-4 p-6 bg-background/50 rounded-xl border border-border">
                  <div className="text-4xl font-bold text-primary">5+</div>
                  <div className="text-xl font-semibold text-foreground">Countries</div>
                  <div className="text-muted-foreground">Planned for regional expansion</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src={financialSuccessImage} 
                alt="Community financial success" 
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/10 rounded-3xl blur-2xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Model Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              How We Generate Revenue
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Sustainable business model designed to scale with our community
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {businessModel.map((model, index) => (
              <Card key={index} className="border-border hover:border-primary/50 transition-colors bg-background/50 backdrop-blur-sm">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold text-foreground">{model.title}</h3>
                  <p className="text-muted-foreground">{model.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Meet Our Team
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experienced professionals dedicated to transforming African finance
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="relative">
              <img 
                src={teamWorkspaceImage} 
                alt="Team workspace" 
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/10 rounded-3xl blur-2xl -z-10"></div>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-2xl lg:text-3xl font-bold text-foreground">
                Building the Future of Finance
              </h3>
              <p className="text-lg text-muted-foreground">
                Our diverse team combines deep financial expertise with cutting-edge technology 
                to create solutions that truly serve African communities.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="border-border bg-background/50 backdrop-blur-sm text-center">
                <CardContent className="p-6 space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full mx-auto flex items-center justify-center">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
                    <p className="text-primary font-medium">{member.role}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-kenyan-green/10 via-kenyan-gold/5 to-kenyan-green/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJoc2woMTQyIDY5JSA0MiUgLyAwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="space-y-10">
            <div className="space-y-6">
              <Badge className="bg-kenyan-gold/20 text-kenyan-gold border-kenyan-gold/30 hover:bg-kenyan-gold/30">
                🚀 Join the Revolution
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
                Ready to Transform Your 
                <span className="text-transparent bg-gradient-to-r from-kenyan-green to-kenyan-gold bg-clip-text block">
                  Chama Experience?
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Join hundreds of groups already using ChamaWallet to manage their savings, 
                track contributions, and achieve their financial goals together. Start your digital transformation today.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                size="lg"
                onClick={() => navigate("/auth")}
                className="bg-gradient-to-r from-kenyan-green to-primary hover:from-kenyan-green/90 hover:to-primary/90 text-kenyan-green-foreground px-10 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/auth")}
                className="border-kenyan-navy/30 text-kenyan-navy hover:border-kenyan-navy hover:bg-kenyan-navy/5 px-10 py-4 text-lg transition-all duration-300"
              >
                Login to Your Account
              </Button>
            </div>

            {/* Contact Information */}
            <div className="grid md:grid-cols-3 gap-8 mt-16 pt-12 border-t border-kenyan-green/20">
              <Card className="bg-background/60 border-kenyan-green/20 hover:border-kenyan-green/40 transition-colors backdrop-blur-sm">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-kenyan-green/10 rounded-xl flex items-center justify-center mx-auto">
                    <Users className="h-6 w-6 text-kenyan-green" />
                  </div>
                  <h3 className="font-semibold text-foreground">For Partnerships</h3>
                  <p className="text-sm text-muted-foreground">partnerships@chamawallet.com</p>
                </CardContent>
              </Card>
              
              <Card className="bg-background/60 border-kenyan-gold/20 hover:border-kenyan-gold/40 transition-colors backdrop-blur-sm">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-kenyan-gold/10 rounded-xl flex items-center justify-center mx-auto">
                    <TrendingUp className="h-6 w-6 text-kenyan-gold" />
                  </div>
                  <h3 className="font-semibold text-foreground">For Investors</h3>
                  <p className="text-sm text-muted-foreground">investors@chamawallet.com</p>
                </CardContent>
              </Card>
              
              <Card className="bg-background/60 border-primary/20 hover:border-primary/40 transition-colors backdrop-blur-sm">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">General Inquiries</h3>
                  <p className="text-sm text-muted-foreground">hello@chamawallet.com</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-kenyan-navy text-kenyan-navy-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="py-16">
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
              {/* Brand Column */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-kenyan-green to-kenyan-gold rounded-xl flex items-center justify-center">
                    <Wallet className="h-7 w-7 text-kenyan-navy" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold">ChamaWallet</span>
                    <div className="text-kenyan-gold text-sm font-medium">Empowering Communities</div>
                  </div>
                </div>
                
                <p className="text-kenyan-navy-foreground/80 leading-relaxed max-w-md">
                  Transforming Africa's traditional savings groups into secure, transparent, 
                  and scalable digital financial ecosystems. Join the revolution in community finance.
                </p>
                
                <div className="flex space-x-4">
                  <div className="w-10 h-10 bg-kenyan-green/10 rounded-lg flex items-center justify-center hover:bg-kenyan-green/20 transition-colors cursor-pointer">
                    <svg className="w-5 h-5 text-kenyan-green" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </div>
                  <div className="w-10 h-10 bg-kenyan-green/10 rounded-lg flex items-center justify-center hover:bg-kenyan-green/20 transition-colors cursor-pointer">
                    <svg className="w-5 h-5 text-kenyan-green" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                    </svg>
                  </div>
                  <div className="w-10 h-10 bg-kenyan-green/10 rounded-lg flex items-center justify-center hover:bg-kenyan-green/20 transition-colors cursor-pointer">
                    <svg className="w-5 h-5 text-kenyan-green" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Product Column */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-kenyan-gold">Product</h3>
                <ul className="space-y-3">
                  <li><a href="#" className="text-kenyan-navy-foreground/80 hover:text-kenyan-green transition-colors">Digital Wallets</a></li>
                  <li><a href="#" className="text-kenyan-navy-foreground/80 hover:text-kenyan-green transition-colors">Group Savings</a></li>
                  <li><a href="#" className="text-kenyan-navy-foreground/80 hover:text-kenyan-green transition-colors">Loan Management</a></li>
                  <li><a href="#" className="text-kenyan-navy-foreground/80 hover:text-kenyan-green transition-colors">Analytics</a></li>
                  <li><a href="#" className="text-kenyan-navy-foreground/80 hover:text-kenyan-green transition-colors">Mobile App</a></li>
                  <li><a href="#" className="text-kenyan-navy-foreground/80 hover:text-kenyan-green transition-colors">Web Platform</a></li>
                </ul>
              </div>
              
              {/* Company Column */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-kenyan-gold">Company</h3>
                <ul className="space-y-3">
                  <li><a href="#" className="text-kenyan-navy-foreground/80 hover:text-kenyan-green transition-colors">About Us</a></li>
                  <li><a href="#" className="text-kenyan-navy-foreground/80 hover:text-kenyan-green transition-colors">Our Team</a></li>
                  <li><a href="#" className="text-kenyan-navy-foreground/80 hover:text-kenyan-green transition-colors">Careers</a></li>
                  <li><a href="#" className="text-kenyan-navy-foreground/80 hover:text-kenyan-green transition-colors">Press</a></li>
                  <li><a href="#" className="text-kenyan-navy-foreground/80 hover:text-kenyan-green transition-colors">Blog</a></li>
                  <li><a href="#" className="text-kenyan-navy-foreground/80 hover:text-kenyan-green transition-colors">Investors</a></li>
                </ul>
              </div>
              
              {/* Support Column */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-kenyan-gold">Support</h3>
                <ul className="space-y-3">
                  <li><a href="#" className="text-kenyan-navy-foreground/80 hover:text-kenyan-green transition-colors">Help Center</a></li>
                  <li><a href="#" className="text-kenyan-navy-foreground/80 hover:text-kenyan-green transition-colors">Documentation</a></li>
                  <li><a href="#" className="text-kenyan-navy-foreground/80 hover:text-kenyan-green transition-colors">API Reference</a></li>
                  <li><a href="#" className="text-kenyan-navy-foreground/80 hover:text-kenyan-green transition-colors">Status</a></li>
                  <li><a href="#" className="text-kenyan-navy-foreground/80 hover:text-kenyan-green transition-colors">Contact Us</a></li>
                  <li><a href="#" className="text-kenyan-navy-foreground/80 hover:text-kenyan-green transition-colors">Community</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-kenyan-navy-foreground/10 py-8">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-8">
                <p className="text-sm text-kenyan-navy-foreground/60">
                  © 2024 ChamaWallet. All rights reserved.
                </p>
                <div className="flex space-x-6">
                  <a href="#" className="text-sm text-kenyan-navy-foreground/60 hover:text-kenyan-green transition-colors">
                    Privacy Policy
                  </a>
                  <a href="#" className="text-sm text-kenyan-navy-foreground/60 hover:text-kenyan-green transition-colors">
                    Terms of Service
                  </a>
                  <a href="#" className="text-sm text-kenyan-navy-foreground/60 hover:text-kenyan-green transition-colors">
                    Cookie Policy
                  </a>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-kenyan-navy-foreground/60">Made with ❤️ in Kenya</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-kenyan-green rounded-full animate-pulse"></div>
                  <span className="text-sm text-kenyan-green">All systems operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CompanyPage;