import { useState } from 'react';
import { SellerPortalDashboard } from '@/components/seller-portal/SellerPortalDashboard';
import { SellerLogin } from '@/components/seller-portal/SellerLogin';
import { usePortalAuth } from '@/hooks/usePortalAuth';

const PortalPage = () => {
  const { portalUser, loading } = usePortalAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading portal...</p>
        </div>
      </div>
    );
  }

  if (!portalUser) {
    return <SellerLogin onLoginSuccess={(userData) => {
      // Login success is handled by the usePortalAuth hook
      window.location.reload();
    }} />;
  }

  return <SellerPortalDashboard />;
};

export default PortalPage;