import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/hooks/useAuth';
import { useProfilePhoto } from '@/hooks/useProfilePhoto';
import AuthModal from './AuthModal';
import LanguageSelector from './LanguageSelector';
import NotificationCenter from './NotificationCenter';
import ThemeToggle from './ThemeToggle';
import SearchBar from './SearchBar';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Users, TrendingUp, LogOut, Bell, 
  Wallet, BarChart3, HandCoins, Globe
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNotifications } from '@/hooks/useNotifications';

const Navigation = () => {
  const { user, signOut } = useAuth();
  const { profilePhoto } = useProfilePhoto();
  const { t } = useLanguage();
  const { notifications } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState('');

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Main tabs - simplified to 4 core sections
  const mainTabs = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/dashboard',
      subtabs: []
    },
    {
      id: 'chamas',
      label: 'Chamas',
      icon: Users,
      path: '/chamas',
      subtabs: [
        { label: 'My Chamas', path: '/chamas' },
        { label: 'Available Chamas', path: '/available-chamas' },
        { label: 'Create Chama', path: '/create-chama' },
        { label: 'Join Chama', path: '/join-chama' }
      ]
    },
    {
      id: 'loans',
      label: 'Loans',
      icon: HandCoins,
      path: '/loan-management',
      subtabs: [
        { label: 'My Loans', path: '/loan-management' },
        { label: 'Adaptive Credit', path: '/adaptive-credit' },
        { label: 'Blockchain Lending', path: '/blockchain-lending' }
      ]
    },
    {
      id: 'investments',
      label: 'Investments',
      icon: TrendingUp,
      path: '/investment',
      subtabs: [
        { label: 'Portfolio', path: '/investment' },
        { label: 'Staking', path: '/staking' },
        { label: 'P2P Trading', path: '/p2p-trading' }
      ]
    },
    {
      id: 'community',
      label: 'Community',
      icon: Globe,
      path: '/community',
      subtabs: [
        { label: 'Community Hub', path: '/community' },
        { label: 'Networking', path: '/community' },
        { label: 'Voting System', path: '/community' },
        { label: 'Financial Navigator', path: '/community' }
      ]
    }
  ];

  // Get current active main tab based on path
  React.useEffect(() => {
    const currentPath = location.pathname;
    const activeTab = mainTabs.find(tab => 
      tab.path === currentPath || 
      tab.subtabs.some(sub => sub.path === currentPath)
    );
    setActiveMainTab(activeTab?.id || '');
  }, [location.pathname]);

  const getActiveSubtabs = () => {
    const activeTab = mainTabs.find(tab => tab.id === activeMainTab);
    return activeTab?.subtabs || [];
  };

  const isActiveTab = (tabId: string) => activeMainTab === tabId;
  const isActiveSubtab = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          {/* Top Header with Global Elements */}
          <div className="flex items-center justify-between h-16">
            {/* Left: Search Bar */}
            <div className="flex items-center">
              <SearchBar />
            </div>

            {/* Center: Brand Logo */}
            <div 
              className="font-bold text-xl bg-gradient-to-r from-kenyan-green to-kenyan-gold bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate(user ? '/dashboard' : '/')}
            >
              ChamaVault
            </div>

            {/* Right: Global UI Elements */}
            <div className="flex items-center space-x-3">
              <LanguageSelector />
              <ThemeToggle />
              
              {user ? (
                <>
                  {/* Notification Bell */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setNotificationOpen(true)}
                    className="relative h-9 w-9"
                  >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center p-0"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                  
                  {/* User Profile with Online Indicator */}
                  <div className="flex items-center space-x-3 px-3 py-2 bg-kenyan-green/5 rounded-lg border border-kenyan-green/20">
                    <div className="relative">
                      <Avatar className="h-8 w-8 ring-2 ring-kenyan-green/20">
                        {profilePhoto?.photo_url ? (
                          <AvatarImage src={profilePhoto.photo_url} alt="Profile" />
                        ) : (
                          <AvatarFallback className="bg-kenyan-green text-white font-semibold">
                            {user.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      {/* Online Indicator */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-kenyan-green rounded-full border-2 border-background"></div>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-sm font-medium text-foreground">
                        {user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-kenyan-green font-medium">Online</p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSignOut}
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setAuthModalOpen(true)}
                  className="h-9"
                >
                  {t('nav.signIn', 'Sign In')}
                </Button>
              )}
            </div>
          </div>

          {/* Navigation - Only show subtabs when in a specific section */}
          {user && (
            <div className="py-4">
              {/* Only show subtabs if we have an active tab with subtabs, hide main tabs */}
              {getActiveSubtabs().length > 0 ? (
                <div className="flex justify-center">
                  <div className="flex items-center gap-2 bg-kenyan-green/5 rounded-lg p-2 shadow-sm border border-kenyan-green/10">
                    {getActiveSubtabs().map((subtab, index) => (
                      <Button
                        key={index}
                        variant={isActiveSubtab(subtab.path) ? "default" : "ghost"}
                        onClick={() => navigate(subtab.path)}
                        className={`h-8 px-3 text-sm font-medium rounded-md transition-all duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-kenyan-gold/20 ${
                          isActiveSubtab(subtab.path)
                            ? 'bg-kenyan-gold text-kenyan-navy shadow-md shadow-kenyan-gold/20'
                            : 'text-kenyan-navy/60 hover:text-kenyan-navy hover:bg-kenyan-gold/10'
                        }`}
                      >
                        {subtab.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                // Show main tabs only when not in a specific section (e.g., home page)
                <div className="flex justify-center">
                  <div className="flex items-center gap-2 bg-kenyan-navy/5 rounded-xl p-2 shadow-sm border border-kenyan-navy/10">
                    {mainTabs.map((tab) => {
                      const IconComponent = tab.icon;
                      return (
                        <Button
                          key={tab.id}
                          variant={isActiveTab(tab.id) ? "default" : "ghost"}
                          onClick={() => {
                            setActiveMainTab(tab.id);
                            navigate(tab.path);
                          }}
                          className={`h-10 px-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-kenyan-green/20 ${
                            isActiveTab(tab.id) 
                              ? 'bg-kenyan-green text-white shadow-lg shadow-kenyan-green/20' 
                              : 'text-kenyan-navy/70 hover:text-kenyan-navy hover:bg-kenyan-green/10'
                          }`}
                        >
                          <IconComponent className="h-5 w-5 mr-2" />
                          {tab.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Modals */}
      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen} 
      />
      <NotificationCenter 
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
      />
    </>
  );
};

export default Navigation;