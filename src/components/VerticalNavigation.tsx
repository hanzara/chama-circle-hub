import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Home, Users, TrendingUp, Wallet, Calculator, 
  PiggyBank, Smartphone, Award, BarChart3, 
  Building2, Shield, ChevronLeft, ChevronRight,
  CreditCard, Target, HandCoins, Gamepad2,
  BookOpen, Settings, LogOut, Menu, Handshake,
  ChevronDown, ChevronUp, Brain, Receipt, Wifi,
  User
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const VerticalNavigation = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<{[key: string]: boolean}>({});

  // Auto-collapse on mobile and set initial state
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  }, [isMobile]);

  const navigationItems = [
    {
      title: 'Home',
      icon: Home,
      path: '/',
      badge: null,
    },
    {
      title: 'Chamas',
      icon: Users,
      path: '/chamas',
      badge: '2',
      subItems: [
        { title: 'My Chamas', path: '/chamas' },
        { title: 'Create Chama', path: '/create-chama' },
        { title: 'Join Chama', path: '/join-chama' },
        { title: 'Advanced Features', path: '/advanced-chama' },
      ]
    },
    {
      title: 'Investments',
      icon: TrendingUp,
      path: '/investment',
      badge: null,
      subItems: [
        { title: 'Portfolio', path: '/investment' },
        { title: 'Staking', path: '/staking' },
        { title: 'P2P Trading', path: '/p2p-trading' },
      ]
    },
    {
      title: 'Wallets',
      icon: Wallet,
      path: '/smart-wallet',
      badge: 'New',
      subItems: [
        { title: 'Smart Wallet', path: '/smart-wallet' },
        { title: 'Mobile Money', path: '/mobile-money' },
        { title: 'Personal Savings', path: '/personal-savings' },
      ]
    },
    {
      title: 'Budget Tracker',
      icon: Calculator,
      path: '/budget-tracker',
      badge: 'Track',
    },
    {
      title: 'Deals & Bills',
      icon: Receipt,
      path: '/deals-and-bills',
      badge: 'Save',
    },
    {
      title: 'Loans',
      icon: HandCoins,
      path: '/loan-management',
      badge: null,
      subItems: [
        { title: 'My Loans', path: '/loan-management' },
        { title: 'Adaptive Credit', path: '/adaptive-credit' },
        { title: 'Blockchain Lending', path: '/blockchain-lending' },
      ]
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      path: '/analytics',
      badge: null,
    },
    {
      title: 'WIFI ACCESS',
      icon: Wifi,
      path: '/wifi-access',
      badge: 'New',
      subItems: [
        { title: 'Find Hotspots', path: '/wifi-access' },
        { title: 'My Sessions', path: '/wifi-access?tab=sessions' },
        { title: 'Wallet', path: '/wifi-access?tab=wallet' },
        { title: 'History', path: '/wifi-access?tab=history' },
      ]
    },
    {
      title: 'Community',
      icon: Award,
      path: '/community-hub',
      badge: null,
      subItems: [
        { title: 'Community Hub', path: '/community-hub' },
        { title: 'Voting System', path: '/voting-system' },
        { title: 'Financial Navigator', path: '/financial-navigator' },
      ]
    },
    {
      title: 'Smart Finance',
      icon: Brain,
      path: '/smart-finance',
      badge: 'AI',
      subItems: [
        { title: 'AI Advisor', path: '/smart-finance' },
        { title: 'Smart Tracker', path: '/smart-finance?tab=tracker' },
        { title: 'Financial Goals', path: '/smart-finance?tab=goals' },
        { title: 'AI Suggestions', path: '/smart-finance?tab=suggestions' },
        { title: 'Learn Money', path: '/smart-finance?tab=learn' },
      ]
    },
    {
      title: 'Partner Dashboard',
      icon: Handshake,
      path: '/partner-dashboard',
      badge: 'Partner',
      requiresAuth: true,
    },
    {
      title: 'Admin Portal',
      icon: Shield,
      path: '/admin-portal',
      badge: 'Admin',
      requiresAuth: true,
    },
    {
      title: 'Bank Portal',
      icon: Building2,
      path: '/bank-portal',
      badge: 'Bank',
      requiresAuth: true,
    },
    {
      title: 'Trivia Game',
      icon: Gamepad2,
      path: '/trivia-game',
      badge: 'Fun',
    },
    {
      title: 'Profile Settings',
      icon: User,
      path: '/profile-settings',
      badge: null,
    },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const hasActiveSubItem = (subItems: any[]) => {
    return subItems?.some(item => isActivePath(item.path));
  };

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
      
      <div className={`h-screen bg-background border-r border-border flex flex-col transition-all duration-300 z-50 shadow-lg ${
        isMobile 
          ? `fixed left-0 top-0 ${isCollapsed ? '-translate-x-full w-0' : 'translate-x-0 w-72'}` 
          : isCollapsed 
            ? 'w-20' 
            : 'w-72'
      }`}>
      {/* Header */}
      <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-primary/20">
                <PiggyBank className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Chama Circle
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto h-10 w-10 rounded-lg hover:bg-muted/80 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/20"
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5 text-foreground" /> : (isMobile ? <Menu className="h-5 w-5 text-foreground" /> : <ChevronLeft className="h-5 w-5 text-foreground" />)}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 p-6">
        <nav className="space-y-3">
          {navigationItems.map((item, index) => {
            const IconComponent = item.icon;
            const isActive = isActivePath(item.path) || (item.subItems && hasActiveSubItem(item.subItems));
            const isGroupOpen = openGroups[item.title] || isActive;
            
            return (
              <div key={index} className="space-y-2">
                {item.subItems ? (
                  <Collapsible open={isGroupOpen} onOpenChange={() => toggleGroup(item.title)}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group hover:scale-[1.02] ${
                          isActive
                            ? 'bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/10'
                            : 'text-foreground hover:bg-muted hover:text-foreground'
                        } focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2`}
                      >
                        <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted group-hover:bg-muted/80'}`}>
                          <IconComponent className="h-5 w-5 flex-shrink-0" />
                        </div>
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 text-left font-semibold">{item.title}</span>
                            <div className="flex items-center gap-2">
                              {item.badge && (
                                <Badge 
                                  variant={item.badge === 'Admin' || item.badge === 'Bank' ? 'destructive' : 'secondary'}
                                  className="text-xs font-medium px-2 py-1"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                              <div className={`p-1 rounded-md transition-colors ${isActive ? 'bg-primary/20' : 'bg-muted/50'}`}>
                                {isGroupOpen ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    
                    {!isCollapsed && (
                      <CollapsibleContent className="space-y-2">
                        <div className="ml-6 space-y-2 pt-2 border-l-2 border-muted pl-4">
                          {item.subItems.map((subItem, subIndex) => (
                            <NavLink
                              key={subIndex}
                              to={subItem.path}
                              className={`flex items-center px-4 py-2 rounded-lg text-sm transition-all duration-300 hover:scale-[1.02] ${
                                isActivePath(subItem.path)
                                  ? 'text-primary bg-primary/10 font-semibold border border-primary/20 shadow-md shadow-primary/10'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                              } focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2`}
                            >
                              <span>{subItem.title}</span>
                            </NavLink>
                          ))}
                        </div>
                      </CollapsibleContent>
                    )}
                  </Collapsible>
                ) : (
                  <NavLink
                    to={item.path}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-[1.02] group ${
                      isActive
                        ? 'bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/10'
                        : 'text-foreground hover:bg-muted hover:text-foreground'
                    } focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2`}
                  >
                    <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted group-hover:bg-muted/80'}`}>
                      <IconComponent className="h-5 w-5 flex-shrink-0" />
                    </div>
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 font-semibold">{item.title}</span>
                        {item.badge && (
                          <Badge 
                            variant={item.badge === 'Admin' || item.badge === 'Bank' ? 'destructive' : 'secondary'}
                            className="text-xs font-medium px-2 py-1"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </NavLink>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User Profile & Sign Out */}
      <div className="p-6 border-t border-border bg-gradient-to-r from-muted/30 to-muted/50">
        {!isCollapsed && user && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 px-4 py-3 bg-background rounded-xl border border-border shadow-sm">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-primary-foreground text-sm font-bold">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {user.email}
                </p>
                <p className="text-xs text-muted-foreground">Active User</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/30 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-destructive/20"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </Button>
          </div>
        )}
        {isCollapsed && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="w-full p-3 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/30 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-destructive/20"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        )}
      </div>
      </div>

      {/* Mobile Toggle Button - Always Visible */}
      {isMobile && isCollapsed && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCollapsed(false)}
          className="fixed top-4 left-4 z-50 bg-background shadow-xl border-border hover:bg-muted transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary/20"
        >
          <Menu className="h-5 w-5 text-foreground" />
        </Button>
      )}
    </>
  );
};

export default VerticalNavigation;
