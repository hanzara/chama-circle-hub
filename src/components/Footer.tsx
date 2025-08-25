import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Globe, 
  Twitter, 
  Linkedin, 
  Github, 
  MessageCircle,
  Youtube,
  LayoutDashboard,
  Brain,
  Workflow,
  Wallet,
  QrCode,
  FileText,
  CreditCard,
  Code,
  BookOpen,
  Shield,
  HeadphonesIcon,
  PhoneCall,
  Bug,
  Lightbulb,
  Languages,
  Moon,
  Sun,
  Heart
} from "lucide-react";

export const Footer = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  return (
    <footer className="border-t border-border bg-gradient-card shadow-elegant backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16">
          {/* Main Brand Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-2xl bg-gradient-text bg-clip-text text-transparent">
                  Universal Pay™
                </h2>
              </div>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Empowering Global Payments Through Smart APIs
            </p>
          </div>

          <Separator className="mb-12" />

          {/* Main Footer Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
            {/* Platform */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Platform</span>
              </h3>
              <div className="space-y-3">
                <Button variant="ghost" className="h-auto p-0 justify-start text-muted-foreground hover:text-foreground transition-colors">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <Button variant="ghost" className="h-auto p-0 justify-start text-muted-foreground hover:text-foreground transition-colors">
                  <Brain className="w-4 h-4 mr-2" />
                  SmartRoute AI
                </Button>
                <Button variant="ghost" className="h-auto p-0 justify-start text-muted-foreground hover:text-foreground transition-colors">
                  <Globe className="w-4 h-4 mr-2" />
                  API Marketplace
                </Button>
                <Button variant="ghost" className="h-auto p-0 justify-start text-muted-foreground hover:text-foreground transition-colors">
                  <Workflow className="w-4 h-4 mr-2" />
                  Workflow Builder
                </Button>
                <Button variant="ghost" className="h-auto p-0 justify-start text-muted-foreground hover:text-foreground transition-colors">
                  <Wallet className="w-4 h-4 mr-2" />
                  Virtual Wallet
                </Button>
                <Button variant="ghost" className="h-auto p-0 justify-start text-muted-foreground hover:text-foreground transition-colors">
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Payments
                </Button>
              </div>
            </div>

            {/* Business Tools */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Business Tools</span>
              </h3>
              <div className="space-y-3">
                <Button variant="ghost" className="h-auto p-0 justify-start text-muted-foreground hover:text-foreground transition-colors">
                  Invoicing & Billing
                </Button>
                <Button variant="ghost" className="h-auto p-0 justify-start text-muted-foreground hover:text-foreground transition-colors">
                  Payouts & Settlements
                </Button>
                <Button variant="ghost" className="h-auto p-0 justify-start text-muted-foreground hover:text-foreground transition-colors">
                  Multi-Currency Support
                </Button>
                <Button variant="ghost" className="h-auto p-0 justify-start text-muted-foreground hover:text-foreground transition-colors">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Virtual & Physical Cards
                </Button>
              </div>
            </div>

            {/* Developers */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center space-x-2">
                <Code className="w-5 h-5" />
                <span>Developers</span>
              </h3>
              <div className="space-y-3">
                <Button variant="ghost" className="h-auto p-0 justify-start text-muted-foreground hover:text-foreground transition-colors">
                  <BookOpen className="w-4 h-4 mr-2" />
                  API Docs
                </Button>
                <Button variant="ghost" className="h-auto p-0 justify-start text-muted-foreground hover:text-foreground transition-colors">
                  SDKs & Sandbox
                </Button>
                <Button variant="ghost" className="h-auto p-0 justify-start text-muted-foreground hover:text-foreground transition-colors">
                  API Status
                </Button>
                <Button variant="ghost" className="h-auto p-0 justify-start text-muted-foreground hover:text-foreground transition-colors">
                  Integration Guides
                </Button>
                <Button variant="ghost" className="h-auto p-0 justify-start text-muted-foreground hover:text-foreground transition-colors">
                  Webhooks
                </Button>
              </div>
            </div>

            {/* Compliance & Legal */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Compliance & Legal</span>
              </h3>
              <div className="space-y-3">
                <Button variant="ghost" className="h-auto p-0 justify-start text-muted-foreground hover:text-foreground transition-colors">
                  KYC & AML Policy
                </Button>
                <Button variant="ghost" className="h-auto p-0 justify-start text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Button>
                <Button variant="ghost" className="h-auto p-0 justify-start text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Button>
                <Button variant="ghost" className="h-auto p-0 justify-start text-muted-foreground hover:text-foreground transition-colors">
                  Security Center
                </Button>
              </div>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center space-x-2">
                <HeadphonesIcon className="w-5 h-5" />
                <span>Support</span>
              </h3>
              <div className="space-y-3">
                <Button variant="ghost" className="h-auto p-0 justify-start text-muted-foreground hover:text-foreground transition-colors">
                  Help Center
                </Button>
                <Button variant="ghost" className="h-auto p-0 justify-start text-muted-foreground hover:text-foreground transition-colors">
                  <PhoneCall className="w-4 h-4 mr-2" />
                  Contact Sales
                </Button>
                <Button variant="ghost" className="h-auto p-0 justify-start text-muted-foreground hover:text-foreground transition-colors">
                  <Bug className="w-4 h-4 mr-2" />
                  Report a Bug
                </Button>
                <Button variant="ghost" className="h-auto p-0 justify-start text-muted-foreground hover:text-foreground transition-colors">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Request a Feature
                </Button>
              </div>
            </div>
          </div>

          <Separator className="mb-12" />

          {/* Interactive Elements */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Language & Theme */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Languages className="w-5 h-5" />
                  <span className="font-medium">Language</span>
                </div>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">🇺🇸 English</SelectItem>
                    <SelectItem value="fr">🇫🇷 Français</SelectItem>
                    <SelectItem value="es">🇪🇸 Español</SelectItem>
                    <SelectItem value="ar">🇸🇦 العربية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  <span className="font-medium">Dark Mode</span>
                </div>
                <Switch 
                  checked={isDarkMode} 
                  onCheckedChange={setIsDarkMode}
                />
              </div>
            </div>

            {/* Newsletter */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="font-semibold text-lg">📬 Stay ahead in fintech</h3>
              <p className="text-muted-foreground">
                Subscribe to updates and get the latest insights on global payments.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input 
                  placeholder="Enter your email" 
                  className="flex-1 bg-muted/50 border-border"
                />
                <Button className="sm:px-8 bg-gradient-primary hover:opacity-90 transition-opacity">
                  Subscribe to Updates
                </Button>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="text-center mb-12">
            <h3 className="font-semibold text-lg mb-6">🔗 Connect With Us</h3>
            <div className="flex justify-center space-x-4">
              <Button variant="ghost" size="icon" className="h-12 w-12 hover:bg-primary/10 transition-colors">
                <Linkedin className="w-6 h-6" />
              </Button>
              <Button variant="ghost" size="icon" className="h-12 w-12 hover:bg-primary/10 transition-colors">
                <Twitter className="w-6 h-6" />
              </Button>
              <Button variant="ghost" size="icon" className="h-12 w-12 hover:bg-primary/10 transition-colors">
                <Github className="w-6 h-6" />
              </Button>
              <Button variant="ghost" size="icon" className="h-12 w-12 hover:bg-primary/10 transition-colors">
                <MessageCircle className="w-6 h-6" />
              </Button>
              <Button variant="ghost" size="icon" className="h-12 w-12 hover:bg-primary/10 transition-colors">
                <Youtube className="w-6 h-6" />
              </Button>
            </div>
          </div>

          <Separator className="mb-8" />

          {/* Bottom Copyright */}
          <div className="text-center space-y-2">
            <p className="text-muted-foreground flex items-center justify-center space-x-2">
              <span>© 2025 Universal Pay Inc.</span>
              <span>|</span>
              <span className="flex items-center space-x-1">
                <span>Built with</span>
                <Heart className="w-4 h-4 text-red-500 fill-current" />
                <span>in San Francisco</span>
              </span>
              <span>|</span>
              <span className="font-mono">v1.0.0</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};