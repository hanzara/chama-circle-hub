import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  Settings, 
  Users, 
  BarChart3, 
  Shield,
  Bot,
  Zap
} from "lucide-react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const Sidebar = ({ activeSection, onSectionChange }: SidebarProps) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "wallet", label: "Universal Wallet", icon: Wallet },
    { id: "payments", label: "Payment Channels", icon: CreditCard },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "routing", label: "Smart Routing", icon: Bot, badge: "AI" },
    { id: "api", label: "API Management", icon: Settings },
    { id: "security", label: "Security", icon: Shield },
    { id: "optimization", label: "Optimization", icon: Zap, badge: "Pro" },
  ];

  return (
    <div className="w-64 bg-card border-r border-border h-screen p-4">
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg">Universal Pay</span>
        </div>
        <p className="text-xs text-muted-foreground">Ultimate Payment Platform</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start space-x-3 ${
                isActive ? "bg-primary text-primary-foreground shadow-primary" : ""
              }`}
              onClick={() => onSectionChange(item.id)}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="text-xs px-2 py-0">
                  {item.badge}
                </Badge>
              )}
            </Button>
          );
        })}
      </nav>

      <div className="mt-8 p-4 bg-gradient-secondary rounded-lg text-secondary-foreground">
        <div className="text-sm font-semibold mb-2">System Status</div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>API Health</span>
            <Badge className="bg-accent text-accent-foreground">98.5%</Badge>
          </div>
          <div className="flex justify-between">
            <span>Active Channels</span>
            <span>8/12</span>
          </div>
        </div>
      </div>
    </div>
  );
};