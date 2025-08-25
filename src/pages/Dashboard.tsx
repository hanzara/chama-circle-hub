import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavigation } from "@/components/TopNavigation";
import { Footer } from "@/components/Footer";
import { DashboardSection } from "@/components/sections/DashboardSection";
import { PaymentsSection } from "@/components/sections/PaymentsSection";
import { WalletSection } from "@/components/sections/WalletSection";
import { VirtualCardsSection } from "@/components/sections/VirtualCardsSection";
import { SmartRoutingSection } from "@/components/sections/SmartRoutingSection";
import { DeveloperHubSection } from "@/components/sections/DeveloperHubSection";
import { APIMarketplaceSection } from "@/components/sections/APIMarketplaceSection";
import { SmartRouteAISection } from "@/components/sections/SmartRouteAISection";
import { FlowBuilderSection } from "@/components/sections/FlowBuilderSection";
import { QRCodeSection } from "@/components/sections/QRCodeSection";
import { RefundSection } from "@/components/sections/RefundSection";
import { SecuritySection } from "@/components/sections/SecuritySection";
import { AntiBlockageSection } from "@/components/sections/AntiBlockageSection";
import { AdvancedToolsSection } from "@/components/sections/AdvancedToolsSection";
import { Globe } from "lucide-react";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderActiveSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardSection />;
      case "payments":
        return <PaymentsSection />;
      case "wallet":
        return <WalletSection />;
      case "cards":
        return <VirtualCardsSection />;
      case "routing":
        return <SmartRoutingSection />;
      case "api":
        return <DeveloperHubSection />;
      case "marketplace":
        return <APIMarketplaceSection />;
      case "smartroute":
        return <SmartRouteAISection />;
      case "flowbuilder":
        return <FlowBuilderSection />;
      case "qr":
        return <QRCodeSection />;
      case "refunds":
        return <RefundSection />;
      case "security":
        return <SecuritySection />;
      case "antiblockage":
        return <AntiBlockageSection />;
      case "tools":
        return <AdvancedToolsSection />;
      default:
        return <DashboardSection />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopNavigation />
      
      <SidebarProvider>
        <div className="flex-1 flex w-full bg-gradient-dashboard">
          <AppSidebar 
            activeSection={activeSection} 
            onSectionChange={setActiveSection} 
          />
          
          <div className="flex-1 flex flex-col">
            {/* Header with mobile trigger */}
            <header className="h-16 flex items-center border-b border-border bg-gradient-card/90 shadow-card backdrop-blur px-4 lg:hidden">
              <SidebarTrigger className="mr-2 hover:bg-accent/20 transition-colors" />
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
                  <Globe className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="font-bold text-lg">Universal Pay</span>
                  <p className="text-xs text-muted-foreground">Global Platform</p>
                </div>
              </div>
            </header>

            {/* Main content */}
            <main className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-7xl mx-auto">
                {renderActiveSection()}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
      
      <Footer />
    </div>
  );
};

export default Dashboard;