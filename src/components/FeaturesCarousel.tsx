import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  PiggyBank, 
  TrendingUp, 
  Shield, 
  Smartphone, 
  BarChart3,
  ArrowRight
} from 'lucide-react';

const FeaturesCarousel = () => {
  const features = [
    {
      id: 'chama-management',
      title: 'Smart Chama Management',
      description: 'Create and manage savings groups with automated contributions, transparent tracking, and secure digital payments.',
      icon: <Users className="h-12 w-12" />,
      gradient: 'from-blue-500/20 to-indigo-500/20',
      iconBg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      benefits: ['Automated contributions', 'Member management', 'Transparent tracking']
    },
    {
      id: 'personal-savings',
      title: 'Personal Savings Goals',
      description: 'Set personalized savings targets with intelligent recommendations and track your progress with beautiful analytics.',
      icon: <PiggyBank className="h-12 w-12" />,
      gradient: 'from-green-500/20 to-emerald-500/20',
      iconBg: 'bg-gradient-to-r from-green-500 to-emerald-600',
      benefits: ['Goal tracking', 'Smart recommendations', 'Progress analytics']
    },
    {
      id: 'investment-platform',
      title: 'Investment Opportunities',
      description: 'Access curated investment opportunities with AI-powered insights to grow your wealth intelligently.',
      icon: <TrendingUp className="h-12 w-12" />,
      gradient: 'from-purple-500/20 to-violet-500/20',
      iconBg: 'bg-gradient-to-r from-purple-500 to-violet-600',
      benefits: ['AI insights', 'Curated opportunities', 'Risk management']
    },
    {
      id: 'security-features',
      title: 'Bank-Grade Security',
      description: 'Your financial data is protected with military-grade encryption and multi-factor authentication.',
      icon: <Shield className="h-12 w-12" />,
      gradient: 'from-orange-500/20 to-red-500/20',
      iconBg: 'bg-gradient-to-r from-orange-500 to-red-600',
      benefits: ['256-bit encryption', 'Multi-factor auth', 'Secure transactions']
    },
    {
      id: 'mobile-integration',
      title: 'M-Pesa Integration',
      description: 'Seamlessly connect with M-Pesa for instant deposits, withdrawals, and peer-to-peer transfers.',
      icon: <Smartphone className="h-12 w-12" />,
      gradient: 'from-teal-500/20 to-cyan-500/20',
      iconBg: 'bg-gradient-to-r from-teal-500 to-cyan-600',
      benefits: ['Instant transfers', 'Low fees', 'Mobile convenience']
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/10" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-secondary/10 to-green-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <BarChart3 className="h-4 w-4" />
            Platform Features
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Everything You Need to 
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"> Build Wealth</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our comprehensive platform combines traditional chama savings with modern fintech innovation, 
            giving you all the tools needed to achieve your financial goals.
          </p>
        </div>

        {/* Features Carousel */}
        <div className="max-w-6xl mx-auto">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {features.map((feature) => (
                <CarouselItem key={feature.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <Card className="group h-full border-0 shadow-lg bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-500 hover:scale-105 overflow-hidden">
                    <CardContent className="p-8 relative">
                      {/* Background Gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                      
                      {/* Content */}
                      <div className="relative z-10">
                        {/* Icon */}
                        <div className={`inline-flex p-4 rounded-2xl ${feature.iconBg} text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          {feature.icon}
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                          {feature.title}
                        </h3>

                        {/* Description */}
                        <p className="text-muted-foreground leading-relaxed mb-6">
                          {feature.description}
                        </p>

                        {/* Benefits */}
                        <ul className="space-y-2 mb-8">
                          {feature.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center gap-3 text-sm">
                              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                              <span className="text-muted-foreground">{benefit}</span>
                            </li>
                          ))}
                        </ul>

                        {/* CTA Button */}
                        <Button 
                          variant="ghost" 
                          className="group/btn w-full justify-between bg-primary/10 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                        >
                          <span>Learn More</span>
                          <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                        </Button>
                      </div>

                      {/* Decorative Elements */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-secondary/10 rounded-full -ml-8 -mb-8 group-hover:scale-125 transition-transform duration-700" />
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Navigation */}
            <div className="flex justify-center mt-8 gap-4">
              <CarouselPrevious className="relative translate-x-0 translate-y-0 bg-card border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary" />
              <CarouselNext className="relative translate-x-0 translate-y-0 bg-card border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary" />
            </div>
          </Carousel>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            Explore All Features
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturesCarousel;