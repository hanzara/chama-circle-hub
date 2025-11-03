import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  ArrowRight, Shield, Users, Wallet, TrendingUp, Star, CheckCircle, 
  Quote, Sparkles, Mail, Zap, Target, Heart
} from "lucide-react";
import chamaHeroImage from "@/assets/chama-hero.jpg";
import walletFeatureImage from "@/assets/wallet-feature.jpg";
import communitySuccessImage from "@/assets/community-success.jpg";
import chamaMeetingImage from "@/assets/chama-meeting.jpg";
import mobileMoneyImage from "@/assets/mobile-money.jpg";
import financialSuccessImage from "@/assets/financial-success.jpg";
import teamWorkspaceImage from "@/assets/team-workspace.jpg";

const CompanyPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [activeUsers, setActiveUsers] = useState(0);
  const [activeChamas, setActiveChamas] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);

  // Animated counter effect
  useEffect(() => {
    const animateValue = (start: number, end: number, duration: number, setter: (value: number) => void) => {
      const startTime = Date.now();
      const animate = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        const easeOutQuad = progress * (2 - progress);
        const value = Math.floor(start + (end - start) * easeOutQuad);
        setter(value);
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      animate();
    };

    setTimeout(() => {
      animateValue(0, 2500, 2000, setActiveUsers);
      animateValue(0, 150, 2000, setActiveChamas);
      animateValue(0, 5000000, 2500, setTotalSavings);
    }, 500);
  }, []);

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

  const testimonials = [
    {
      name: "Mary Wanjiru",
      role: "Chama Chairperson",
      location: "Nairobi",
      quote: "ChamaWallet transformed how we manage our group savings. Transparency and automation have made everything so much easier!",
      rating: 5
    },
    {
      name: "John Kamau",
      role: "Treasurer",
      location: "Mombasa",
      quote: "The M-Pesa integration is seamless. Our members can contribute anytime, and we have real-time tracking of all transactions.",
      rating: 5
    },
    {
      name: "Grace Akinyi",
      role: "Member",
      location: "Kisumu",
      quote: "Finally, a platform that understands African savings culture. The loan management feature has been a game-changer for our group.",
      rating: 5
    }
  ];

  const faqs = [
    {
      question: "How secure is ChamaWallet?",
      answer: "ChamaWallet uses bank-grade 256-bit SSL encryption, multi-factor authentication, and continuous security monitoring. Your data and funds are protected by the same security standards used by major financial institutions."
    },
    {
      question: "How much does it cost to use ChamaWallet?",
      answer: "We offer a freemium model with basic features available for free. Premium features start from KES 500 per month per group. Transaction fees are minimal and transparent, typically 1-2% depending on the transaction type."
    },
    {
      question: "Can we integrate with M-Pesa?",
      answer: "Yes! ChamaWallet has seamless integration with M-Pesa, Airtel Money, and major banks. Members can make contributions and withdrawals directly through their mobile money accounts."
    },
    {
      question: "What happens if a member disputes a transaction?",
      answer: "We have a comprehensive dispute resolution system. All transactions are recorded with timestamps and can be reviewed by group admins. Our support team is available to help mediate and resolve any disputes."
    },
    {
      question: "How do I get started?",
      answer: "Simply sign up for free, create your chama profile, invite members, and start managing your group savings digitally. Our onboarding process takes less than 10 minutes!"
    },
    {
      question: "Is there a mobile app?",
      answer: "Yes! ChamaWallet is available on both web and mobile (iOS and Android). Access your group savings anytime, anywhere."
    }
  ];

  const benefits = [
    "Mobile-first design for easy access anywhere",
    "Integrated M-Pesa and mobile money support",
    "Transparent contribution tracking"
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
                onClick={() => navigate("/portal")}
                className="text-foreground hover:text-kenyan-green transition-colors"
              >
                Portal
              </Button>
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
        {/* Animated background elements */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-kenyan-green/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-kenyan-gold/10 rounded-full blur-3xl animate-bounce-slow"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in-up">
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
            
            <div className="relative animate-slide-in-right">
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

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16 animate-fade-in-up">
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
            <div className="relative order-2 lg:order-1 animate-slide-in-left">
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
                {benefits.map((benefit, index) => (
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

      {/* Impact Metrics Section */}
      <section className="py-20 bg-gradient-to-b from-background via-muted/30 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16 animate-fade-in-up">
            <Badge className="bg-primary/10 text-primary border-primary/20">
              <Sparkles className="h-3 w-3 mr-1" />
              Live Impact Metrics
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Transforming Communities Together
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real numbers from real people building financial futures
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="border-kenyan-green/20 bg-gradient-to-br from-kenyan-green/5 to-transparent hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-kenyan-green to-kenyan-green/70 rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Users className="h-8 w-8 text-kenyan-green-foreground" />
                </div>
                <div className="text-5xl font-bold text-kenyan-green">
                  {activeUsers.toLocaleString()}+
                </div>
                <div className="text-xl font-semibold text-foreground">Active Users</div>
                <div className="text-muted-foreground">Growing community members</div>
              </CardContent>
            </Card>

            <Card className="border-kenyan-gold/20 bg-gradient-to-br from-kenyan-gold/5 to-transparent hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-kenyan-gold to-kenyan-gold/70 rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Target className="h-8 w-8 text-kenyan-gold-foreground" />
                </div>
                <div className="text-5xl font-bold text-kenyan-gold">
                  {activeChamas}+
                </div>
                <div className="text-xl font-semibold text-foreground">Active Chamas</div>
                <div className="text-muted-foreground">Successfully onboarded groups</div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <TrendingUp className="h-8 w-8 text-primary-foreground" />
                </div>
                <div className="text-5xl font-bold text-primary">
                  KES {(totalSavings / 1000000).toFixed(1)}M+
                </div>
                <div className="text-xl font-semibold text-foreground">Total Savings</div>
                <div className="text-muted-foreground">Managed through our platform</div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slide-in-left">
              <h3 className="text-2xl lg:text-3xl font-bold text-foreground">
                Making Financial Inclusion a Reality
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Over 80% of Africans rely on informal financial systems. ChamaWallet bridges 
                the gap between traditional savings groups and modern digital finance, bringing 
                transparency, security, and scalability to community-driven financial growth.
              </p>
              <Button 
                size="lg"
                onClick={() => navigate("/auth")}
                className="bg-gradient-to-r from-kenyan-green to-primary hover:from-kenyan-green/90 hover:to-primary/90 text-kenyan-green-foreground shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Join Our Community
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            
            <div className="relative animate-slide-in-right">
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

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16 animate-fade-in-up">
            <Badge className="bg-kenyan-green/10 text-kenyan-green border-kenyan-green/20">
              <Heart className="h-3 w-3 mr-1" />
              Community Stories
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Trusted by Community Leaders
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hear from the people who are transforming their communities with ChamaWallet
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index} 
                className="border-border bg-background/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
              >
                <CardContent className="p-8 space-y-6">
                  <Quote className="h-10 w-10 text-kenyan-gold opacity-50 group-hover:opacity-100 transition-opacity" />
                  
                  <p className="text-muted-foreground leading-relaxed italic">
                    &quot;{testimonial.quote}&quot;
                  </p>
                  
                  <div className="flex items-center space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-kenyan-gold text-kenyan-gold" />
                    ))}
                  </div>
                  
                  <div className="pt-4 border-t border-border">
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-kenyan-green font-medium">{testimonial.role}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.location}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16 animate-fade-in-up">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about ChamaWallet
            </p>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-border bg-background/50 backdrop-blur-sm rounded-lg px-6 hover:shadow-lg transition-shadow"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-br from-kenyan-green via-primary to-kenyan-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDJ2LTJoMzR6TTM2IDN2Mkgydi0yaDM0ek0yIDBoMnYySDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-kenyan-gold/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Mail className="h-8 w-8 text-kenyan-gold" />
                </div>
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-bold text-kenyan-green-foreground">
                Stay Updated with ChamaWallet
              </h2>
              <p className="text-lg text-kenyan-green-foreground/80 max-w-2xl mx-auto">
                Get the latest updates on new features, financial tips, and community success stories delivered to your inbox.
              </p>
            </div>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                alert(`Thanks for subscribing with ${email}!`);
                setEmail("");
              }}
              className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto"
            >
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-background/90 backdrop-blur-sm border-kenyan-green-foreground/20 text-foreground placeholder:text-muted-foreground h-12"
              />
              <Button 
                type="submit"
                size="lg"
                className="bg-kenyan-gold text-kenyan-gold-foreground hover:bg-kenyan-gold/90 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                Subscribe
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
            
            <p className="text-sm text-kenyan-green-foreground/60">
              Join 5,000+ subscribers. Unsubscribe anytime. No spam, we promise! 🎉
            </p>
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
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-kenyan-navy text-kenyan-navy-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-kenyan-green to-kenyan-gold rounded-xl flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-kenyan-navy" />
                </div>
                <span className="text-xl font-bold">ChamaWallet</span>
              </div>
              <p className="text-kenyan-navy-foreground/80">
                Transforming Africa's traditional savings groups into secure, transparent digital financial ecosystems.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-kenyan-gold">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-kenyan-navy-foreground/80 hover:text-kenyan-green transition-colors">About Us</a></li>
                <li><a href="#" className="text-kenyan-navy-foreground/80 hover:text-kenyan-green transition-colors">Features</a></li>
                <li><a href="#" className="text-kenyan-navy-foreground/80 hover:text-kenyan-green transition-colors">Pricing</a></li>
                <li><a href="#" className="text-kenyan-navy-foreground/80 hover:text-kenyan-green transition-colors">Contact</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-kenyan-gold">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => navigate("/privacy")} 
                    className="text-kenyan-navy-foreground/80 hover:text-kenyan-green transition-colors"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate("/terms")} 
                    className="text-kenyan-navy-foreground/80 hover:text-kenyan-green transition-colors"
                  >
                    Terms of Service
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-kenyan-navy-foreground/20 pt-8 text-center">
            <p className="text-kenyan-navy-foreground/60">
              © 2025 ChamaWallet. All rights reserved. | Empowering Communities Across Africa
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CompanyPage;
