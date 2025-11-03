import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, 
  Download, 
  QrCode, 
  Share2, 
  Apple, 
  MonitorSpeaker,
  Chrome,
  CheckCircle,
  Star,
  Users,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AppDownload: React.FC = () => {
  const { toast } = useToast();
  const [showQR, setShowQR] = useState(false);

  const handleDownloadPWA = () => {
    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      toast({
        title: "App Already Installed",
        description: "ChamaVault is already installed on your device.",
      });
      return;
    }

    // For PWA installation, we'll show instructions
    toast({
      title: "Install ChamaVault",
      description: "Look for the 'Install App' or 'Add to Home Screen' option in your browser menu.",
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: 'ChamaVault - Smart Community Finance',
      text: 'Join me on ChamaVault, the best platform for Chama management and financial growth!',
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: "Link Copied",
          description: "App link copied to clipboard!",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const downloadLinks = [
    {
      platform: "Android",
      icon: Smartphone,
      url: "#", // Replace with actual Google Play Store link
      description: "Get it on Google Play",
      badge: "Most Popular",
      badgeVariant: "default" as const
    },
    {
      platform: "iOS",
      icon: Apple,
      url: "#", // Replace with actual App Store link
      description: "Download on the App Store",
      badge: "Coming Soon",
      badgeVariant: "secondary" as const
    },
    {
      platform: "Web App",
      icon: Chrome,
      url: window.location.origin,
      description: "Install as Progressive Web App",
      badge: "Instant Access",
      badgeVariant: "outline" as const,
      action: handleDownloadPWA
    },
    {
      platform: "Desktop",
      icon: MonitorSpeaker,
      url: "#", // Replace with actual desktop app link
      description: "Windows & Mac Desktop App",
      badge: "Beta",
      badgeVariant: "destructive" as const
    }
  ];

  const features = [
    {
      icon: Users,
      title: "10,000+ Active Users",
      description: "Join our growing community"
    },
    {
      icon: TrendingUp,
      title: "KES 50M+ Managed",
      description: "Total savings under management"
    },
    {
      icon: Star,
      title: "4.8/5 Rating",
      description: "Highly rated by our users"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
            <Download className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Download ChamaVault
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get the most trusted Chama management and financial platform right on your device. 
            Available on all platforms for seamless access anywhere, anytime.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="text-center border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Download Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {downloadLinks.map((link, index) => (
            <Card key={index} className="relative overflow-hidden border-0 bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-all duration-300 hover:scale-105">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <link.icon className="w-8 h-8 text-primary" />
                  <Badge variant={link.badgeVariant} className="text-xs">
                    {link.badge}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{link.platform}</CardTitle>
                <CardDescription className="text-sm">
                  {link.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={link.action || (() => window.open(link.url, '_blank'))}
                  disabled={link.url === "#"}
                >
                  {link.url === "#" ? "Coming Soon" : "Download"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* QR Code Section */}
        <Card className="mb-12 border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <QrCode className="w-5 h-5" />
              Quick Access
            </CardTitle>
            <CardDescription>
              Scan the QR code with your mobile device for instant access
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="inline-flex flex-col items-center space-y-4">
              {!showQR ? (
                <Button 
                  variant="outline" 
                  onClick={() => setShowQR(true)}
                  className="w-40"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Show QR Code
                </Button>
              ) : (
                <div className="bg-white p-4 rounded-lg border">
                  {/* Replace with actual QR code generator */}
                  <div className="w-48 h-48 bg-muted rounded flex items-center justify-center">
                    <QrCode className="w-24 h-24 text-muted-foreground" />
                  </div>
                </div>
              )}
              <Button variant="ghost" onClick={handleShare} className="text-sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share App Link
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features Highlight */}
        <Card className="border-0 bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Why Choose ChamaVault?</CardTitle>
            <CardDescription className="text-lg">
              The complete solution for modern Chama management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Secure Savings", description: "Bank-grade security for your group's money" },
                { title: "Smart Lending", description: "AI-powered loan management and approval" },
                { title: "Mobile Money", description: "Seamless M-Pesa and bank integration" },
                { title: "Investment Tracking", description: "Monitor and grow your investments" },
                { title: "Group Management", description: "Effortless member and meeting management" },
                { title: "Real-time Reports", description: "Comprehensive financial reporting" }
              ].map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 text-muted-foreground">
          <p>Having trouble downloading? Contact our support team for assistance.</p>
          <Button variant="link" className="mt-2">
            Get Help
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppDownload;