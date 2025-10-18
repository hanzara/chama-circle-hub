import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserPin } from '@/hooks/useUserPin';
import { useNavigate, useLocation } from 'react-router-dom';
import PinVerificationModal from '@/components/PinVerificationModal';
import PinSetupModal from '@/components/PinSetupModal';
import { useToast } from '@/hooks/use-toast';
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout';

interface PinGateProps {
  children: React.ReactNode;
}

const PinGate: React.FC<PinGateProps> = ({ children }) => {
  const { user, pinVerified, hasPinSetup, setPinVerified, checkPinStatus } = useAuth();
  const { verifyPin } = useUserPin();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [showPinVerification, setShowPinVerification] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);

  // Set up inactivity timeout (5 minutes)
  useInactivityTimeout({
    timeoutMinutes: 5,
    onTimeout: () => {
      toast({
        title: "Session Timeout",
        description: "Please verify your PIN to continue",
        variant: "default",
      });
    }
  });

  // Auth-related routes that don't need PIN verification
  const publicRoutes = ['/', '/auth'];

  // Ensure PIN status is checked when a session already exists (INITIAL_SESSION)
  useEffect(() => {
    if (user && hasPinSetup === null) {
      checkPinStatus();
    }
  }, [user, hasPinSetup, checkPinStatus]);

  useEffect(() => {
    const isPublicRoute = publicRoutes.includes(location.pathname);
    
    if (!user) {
      // Not logged in - no PIN gate needed
      setShowPinVerification(false);
      setShowPinSetup(false);
      return;
    }

    if (isPublicRoute) {
      // On public routes - redirect authenticated users to dashboard if PIN verified
      if (pinVerified) {
        navigate('/dashboard');
      }
      return;
    }

    // User is logged in and on a protected route
    if (hasPinSetup === null) {
      // Still checking PIN status
      return;
    }

    if (!hasPinSetup) {
      // No PIN setup - show PIN setup modal
      setShowPinSetup(true);
      setShowPinVerification(false);
    } else if (!pinVerified) {
      // Has PIN but not verified - show verification modal
      setShowPinVerification(true);
      setShowPinSetup(false);
    } else {
      // PIN verified - close all modals
      setShowPinVerification(false);
      setShowPinSetup(false);
    }
  }, [user, pinVerified, hasPinSetup, location.pathname, navigate]);

  const handlePinVerification = async (pin: string): Promise<boolean> => {
    const isValid = await verifyPin(pin);
    
    if (isValid) {
      setPinVerified(true);
      setShowPinVerification(false);
      toast({
        title: "Access Granted",
        description: "PIN verified successfully",
      });
      return true;
    } else {
      toast({
        title: "Invalid PIN",
        description: "The PIN you entered is incorrect. Please try again.",
        variant: "destructive",
      });
    }
    
    return false;
  };

  const handlePinSetupComplete = async () => {
    await checkPinStatus();
    setShowPinSetup(false);
    // After setup, show verification
    setShowPinVerification(true);
  };

  // Show loading state while checking PIN status
  if (user && hasPinSetup === null) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Verifying security...</p>
        </div>
      </div>
    );
  }

  // Block content if PIN not verified on protected routes
  const isProtectedRoute = !publicRoutes.includes(location.pathname);
  const shouldBlockContent = user && isProtectedRoute && (!pinVerified || showPinVerification || showPinSetup);

  return (
    <>
      {shouldBlockContent ? (
        <div className="fixed inset-0 bg-background z-40" />
      ) : (
        children
      )}
      
      <PinVerificationModal
        isOpen={showPinVerification}
        onClose={() => {
          // Never allow closing on protected routes
          if (isProtectedRoute) {
            toast({
              title: "PIN Required",
              description: "You must verify your PIN to access the app",
              variant: "destructive",
            });
          } else {
            setShowPinVerification(false);
          }
        }}
        onVerify={handlePinVerification}
        title="Security Verification Required"
        description="Please enter your 4-digit PIN to access your account"
        required={isProtectedRoute}
      />

      <PinSetupModal
        isOpen={showPinSetup}
        onClose={handlePinSetupComplete}
        required={true}
      />
    </>
  );
};

export default PinGate;
