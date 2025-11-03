import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PackagePurchaseModal } from './PackagePurchaseModal';
import { MapPin, Wifi, Star, Clock, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Hotspot {
  id: string;
  name: string;
  description: string;
  address: string;
  location_lat: number;
  location_lng: number;
  rating: number;
  total_ratings: number;
  coverage_radius: number;
  max_concurrent_users: number;
  current_active_users: number;
  network_ssid: string;
  packages: any[];
  distance?: number;
  speed?: string;
  status?: 'excellent' | 'good' | 'fair';
}

export function HotspotMap() {
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotspotsWithPackages();
  }, []);

  const fetchHotspotsWithPackages = async () => {
    try {
      setLoading(true);
      
      // @ts-ignore
      const response = await supabase
        .from('wifi_hotspots')
        .select('*');

      if (response.error) throw response.error;

      const results: Hotspot[] = [];
      
      for (const hotspot of (response.data || [])) {
        // @ts-ignore
        const pkgsResponse = await supabase
          .from('wifi_packages')
          .select('*')
          .eq('hotspot_id', hotspot.id)
          .eq('is_active', true);

        results.push({
          ...hotspot,
          packages: pkgsResponse.data || [],
          distance: 0.5,
          speed: '50 Mbps',
          status: 'excellent'
        } as Hotspot);
      }

      setHotspots(results);
    } catch (error: any) {
      console.error('Error fetching hotspots:', error);
      toast.error('Failed to load WiFi hotspots');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: 'excellent' | 'good' | 'fair') => {
    switch (status) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-yellow-500';
      case 'fair': return 'bg-red-500';
    }
  };

  const handlePurchasePackage = (pkg: any, hotspot: Hotspot) => {
    setSelectedPackage(pkg);
    setSelectedHotspot(hotspot.id);
    setShowPurchaseModal(true);
  };

  const handlePurchaseComplete = () => {
    console.log('Package purchased:', selectedPackage?.id);
    
    if (selectedPackage) {
      const purchases = JSON.parse(localStorage.getItem('seller-sales') || '[]');
      const newSale = {
        id: Date.now().toString(),
        packageId: selectedPackage.id,
        amount: selectedPackage.price,
        commission: Math.round(selectedPackage.price * 0.1),
        net_amount: Math.round(selectedPackage.price * 0.9),
        status: 'completed',
        voucher_code: `DEMO${Date.now().toString().slice(-6)}`,
        created_at: new Date().toISOString(),
        package_name: selectedPackage.name,
        hotspot_name: selectedPackage.hotspot_name
      };
      
      purchases.push(newSale);
      localStorage.setItem('seller-sales', JSON.stringify(purchases));
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading WiFi hotspots...</p>
      </div>
    );
  }

  if (hotspots.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No WiFi hotspots available yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Available WiFi Hotspots</h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          Find and connect to nearby WiFi hotspots
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {hotspots.map((hotspot) => (
          <Card key={hotspot.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(hotspot.status!)}`} />
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg truncate">{hotspot.name}</CardTitle>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{hotspot.address}</span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="flex-shrink-0">{hotspot.distance} km</Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="space-y-1">
                  <div className="flex items-center justify-center space-x-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{hotspot.rating}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center space-x-1">
                    <Wifi className="h-3 w-3" />
                    <span className="text-sm font-medium">{hotspot.speed}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Speed</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span className="text-sm font-medium">{hotspot.current_active_users}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Users</p>
                </div>
              </div>

              {/* Packages */}
              {hotspot.packages && hotspot.packages.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-sm">Available Packages</h4>
                    {hotspot.packages.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedHotspot(selectedHotspot === hotspot.id ? null : hotspot.id)}
                        className="text-xs"
                      >
                        {selectedHotspot === hotspot.id ? 'Hide' : 'View All'}
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {(selectedHotspot === hotspot.id ? hotspot.packages : hotspot.packages.slice(0, 2)).map((pkg) => (
                      <div key={pkg.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1 min-w-0 mr-3">
                          <div className="font-medium text-sm truncate">{pkg.name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {pkg.description || 'WiFi access package'}
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            <span>{pkg.duration_minutes} min</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="font-semibold text-sm">KES {(pkg.price / 100).toFixed(0)}</div>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => handlePurchasePackage(pkg, hotspot)}
                            className="flex-shrink-0 text-xs px-3"
                          >
                            Buy
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {selectedPackage && selectedHotspot && (
        <PackagePurchaseModal
          open={showPurchaseModal}
          onOpenChange={setShowPurchaseModal}
          hotspot={hotspots.find(h => h.id === selectedHotspot)!}
          package={selectedPackage}
          onPurchaseComplete={handlePurchaseComplete}
        />
      )}
    </div>
  );
}
