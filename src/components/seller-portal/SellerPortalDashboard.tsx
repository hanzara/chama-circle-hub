import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SellerOnboarding } from './SellerOnboarding';
import { HotspotManagement } from './HotspotManagement';
import { PackageManagement } from './PackageManagement';
import { SalesDashboard } from './SalesDashboard';
import { PayoutsPanel } from './PayoutsPanel';
import { SessionsMonitor } from './SessionsMonitor';
import { SellerSettings } from './SellerSettings';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Wifi, 
  Package, 
  BarChart3, 
  CreditCard, 
  Users, 
  Settings,
  Shield,
  Store
} from 'lucide-react';

interface SellerProfile {
  id: string;
  business_name: string | null;
  phone: string | null;
  kyc_status: 'pending' | 'approved' | 'rejected';
  kyc_docs: any;
  bank_details: any;
  mpesa_number: string | null;
  commission_rate: number;
}

export function SellerPortalDashboard() {
  const { portalUser } = usePortalAuth();
  const { toast } = useToast();
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('onboarding');

  useEffect(() => {
    if (portalUser) {
      fetchSellerProfile();
    }
  }, [portalUser]);

  const fetchSellerProfile = async () => {
    if (!portalUser) return;
    
    try {
      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('portal_user_id', portalUser.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setSellerProfile(data as SellerProfile);
        if (data.kyc_status === 'approved') {
          setActiveTab('dashboard');
        }
      }
    } catch (error: any) {
      console.error('Error fetching seller profile:', error);
      toast({
        title: "Error",
        description: "Failed to load seller profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedProfile: SellerProfile) => {
    setSellerProfile(updatedProfile);
    if (updatedProfile.kyc_status === 'approved') {
      setActiveTab('dashboard');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!sellerProfile) {
    return <SellerOnboarding onComplete={handleProfileUpdate} />;
  }

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const isApproved = sellerProfile.kyc_status === 'approved';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-lg p-6 border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Store className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Seller Portal</h1>
              <p className="text-muted-foreground">
                Manage your Wi-Fi hotspots and packages
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span className="text-sm">KYC Status:</span>
              <span className={`font-semibold ${getKYCStatusColor(sellerProfile.kyc_status)}`}>
                {sellerProfile.kyc_status.toUpperCase()}
              </span>
            </div>
            {sellerProfile.business_name && (
              <p className="text-sm text-muted-foreground mt-1">
                {sellerProfile.business_name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* KYC Pending Notice */}
      {!isApproved && (
        <Card className="p-4 border-yellow-200 bg-yellow-50">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-yellow-800">
                KYC Verification {sellerProfile.kyc_status === 'rejected' ? 'Rejected' : 'Pending'}
              </h3>
              <p className="text-sm text-yellow-600">
                {sellerProfile.kyc_status === 'rejected' 
                  ? 'Your KYC verification was rejected. Please update your documents and try again.'
                  : 'Your KYC verification is pending approval. Full features will be available once approved.'
                }
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="onboarding" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="hotspots" className="flex items-center space-x-2">
            <Wifi className="h-4 w-4" />
            <span>Hotspots</span>
          </TabsTrigger>
          <TabsTrigger value="packages" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>Packages</span>
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Sales</span>
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Sessions</span>
          </TabsTrigger>
          <TabsTrigger value="payouts" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>Payouts</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="onboarding">
          <SellerOnboarding 
            existingProfile={sellerProfile} 
            onComplete={handleProfileUpdate} 
          />
        </TabsContent>

        <TabsContent value="hotspots">
          <HotspotManagement sellerId={sellerProfile.id} />
        </TabsContent>

        <TabsContent value="packages">
          <PackageManagement sellerId={sellerProfile.id} />
        </TabsContent>

        <TabsContent value="dashboard">
          <SalesDashboard sellerId={sellerProfile.id} />
        </TabsContent>

        <TabsContent value="sessions">
          <SessionsMonitor sellerId={sellerProfile.id} />
        </TabsContent>

        <TabsContent value="payouts">
          <PayoutsPanel sellerId={sellerProfile.id} />
        </TabsContent>

        <TabsContent value="settings">
          <SellerSettings 
            profile={sellerProfile} 
            onUpdate={handleProfileUpdate} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}