import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navigation from '@/components/Navigation';
import { HotspotMap } from '@/components/wifi/HotspotMap';
import { WifiWallet } from '@/components/wifi/WifiWallet';
import { ActiveSessions } from '@/components/wifi/ActiveSessions';
import { TransactionHistory } from '@/components/wifi/TransactionHistory';
import { useAuth } from '@/hooks/useAuth';
import { useWifiStats } from '@/hooks/useWifiStats';
import { Wifi, MapPin, Clock, CreditCard, AlertCircle } from 'lucide-react';

const WifiAccessPage = () => {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useWifiStats();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get saved state from localStorage or URL
  const savedTab = localStorage.getItem('wifi-access-tab');
  const activeTab = searchParams.get('tab') || savedTab || 'hotspots';

  // Save tab selection to localStorage and URL
  const handleTabChange = (newTab: string) => {
    localStorage.setItem('wifi-access-tab', newTab);
    setSearchParams({ tab: newTab });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please sign in to access WiFi services.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-full overflow-hidden">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Wifi className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold truncate">WiFi Access</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Find nearby hotspots, purchase packages, and manage your internet sessions
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            <Card className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Nearby Hotspots</p>
                  <p className="text-base sm:text-lg font-semibold">
                    {statsLoading ? '...' : stats?.nearbyHotspots || 0}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Active Sessions</p>
                  <p className="text-base sm:text-lg font-semibold">
                    {statsLoading ? '...' : stats?.activeSessions || 0}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-purple-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Wallet Balance</p>
                  <p className="text-base sm:text-lg font-semibold">
                    {statsLoading ? '...' : `KES ${stats?.walletBalance.toFixed(2) || '0.00'}`}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Data Used Today</p>
                  <p className="text-base sm:text-lg font-semibold">
                    {statsLoading ? '...' : `${stats?.dataUsedToday || '0.0'} GB`}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="hotspots">Find Hotspots</TabsTrigger>
            <TabsTrigger value="sessions">My Sessions</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="hotspots" className="space-y-6 mt-6">
            <HotspotMap />
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6 mt-6">
            <ActiveSessions />
          </TabsContent>

          <TabsContent value="wallet" className="space-y-6 mt-6">
            <WifiWallet />
          </TabsContent>

          <TabsContent value="history" className="space-y-6 mt-6">
            <TransactionHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WifiAccessPage;