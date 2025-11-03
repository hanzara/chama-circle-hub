import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  User, 
  FileCheck, 
  Settings, 
  Fingerprint,
  CreditCard,
  Eye,
  Activity,
  Award,
  Lock,
  ChevronRight,
  UserCheck,
  Clock,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AuthForms from '@/components/auth/AuthForms';
import ProfileManagement from '@/components/auth/ProfileManagement';
import KYCVerification from '@/components/auth/KYCVerification';
import PinSetupForm from '@/components/auth/PinSetupForm';
import SecurityDashboard from '@/components/auth/SecurityDashboard';
import ComplianceCenter from '@/components/auth/ComplianceCenter';
import AdminTools from '@/components/auth/AdminTools';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';

const AuthPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { profile, profileCompletion, securitySettings, loading } = useEnhancedAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const getVerificationStatus = () => {
    if (!profile) return { status: 'pending', icon: Clock, color: 'text-gray-500' };
    
    switch (profile.kyc_status) {
      case 'verified':
        return { status: 'Verified', icon: CheckCircle2, color: 'text-green-600' };
      case 'in_review':
        return { status: 'Under Review', icon: Clock, color: 'text-blue-600' };
      case 'rejected':
        return { status: 'Rejected', icon: AlertTriangle, color: 'text-red-600' };
      default:
        return { status: 'Pending', icon: Clock, color: 'text-gray-500' };
    }
  };

  const getSecurityScore = () => {
    if (!securitySettings) return 50;
    return securitySettings.security_score;
  };

  const getVerificationBenefits = () => {
    if (!profile) return { tier: 'basic', maxTransaction: 10000, maxDaily: 50000 };
    return {
      tier: profile.verification_tier,
      maxTransaction: profile.max_transaction_limit,
      maxDaily: profile.max_daily_limit
    };
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex">
        {/* Left Panel - Features */}
        <div className="hidden lg:flex lg:w-1/2 bg-primary p-12 text-primary-foreground flex-col justify-center">
          <div className="max-w-lg">
            <h1 className="text-4xl font-bold mb-4">
              Secure Digital Identity
            </h1>
            <p className="text-xl text-primary-foreground/80 mb-8">
              Complete KYC verification, set up PIN security, and manage your digital financial identity with bank-grade security.
            </p>
            
            <div className="space-y-6">
              {[
                {
                  icon: Shield,
                  title: "Enhanced Security",
                  description: "Multi-layer security with PIN, biometrics, and fraud detection"
                },
                {
                  icon: FileCheck,
                  title: "KYC Verification",
                  description: "Secure document verification for higher transaction limits"
                },
                {
                  icon: UserCheck,
                  title: "Identity Management",
                  description: "Complete profile management with privacy controls"
                },
                {
                  icon: Award,
                  title: "Verified Benefits",
                  description: "Access premium features with verified account status"
                },
                {
                  icon: Activity,
                  title: "Real-time Monitoring",
                  description: "24/7 fraud detection and suspicious activity alerts"
                },
                {
                  icon: Lock,
                  title: "Compliance Ready",
                  description: "GDPR compliant with full audit trails and data protection"
                }
              ].map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="bg-primary-foreground/20 rounded-lg p-2 flex-shrink-0">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{feature.title}</h3>
                    <p className="text-primary-foreground/80">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-primary-foreground/10 rounded-lg backdrop-blur-sm border border-primary-foreground/20">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
                <span className="font-semibold">Bank-grade security standards</span>
              </div>
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
                <span className="font-semibold">GDPR compliant data protection</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
                <span className="font-semibold">24/7 fraud monitoring</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Authentication Forms */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="font-bold text-3xl text-primary mb-2">
                ChamaVault
              </div>
              <p className="text-muted-foreground">
                Secure authentication and identity management
              </p>
            </div>

            <AuthForms />
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const verificationStatus = getVerificationStatus();
  const securityScore = getSecurityScore();
  const benefits = getVerificationBenefits();

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Identity & Security Center</h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Manage your profile, security settings, and verification status
              </p>
            </div>
            <Button onClick={() => navigate('/dashboard')} variant="outline" className="self-start sm:self-auto">
              <ChevronRight className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Go to Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </Button>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Profile</p>
                  <p className="text-lg font-semibold">{profileCompletion}% Complete</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <verificationStatus.icon className={`h-5 w-5 ${verificationStatus.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">KYC Status</p>
                  <p className="text-lg font-semibold">{verificationStatus.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Security Score</p>
                  <p className="text-lg font-semibold">{securityScore}/100</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Daily Limit</p>
                  <p className="text-lg font-semibold">KES {benefits.maxDaily.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="kyc" className="flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              <span className="hidden sm:inline">KYC</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="pin" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">PIN</span>
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Legal</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileManagement />
          </TabsContent>

          <TabsContent value="kyc">
            <KYCVerification />
          </TabsContent>

          <TabsContent value="security">
            <SecurityDashboard />
          </TabsContent>

          <TabsContent value="pin">
            <PinSetupForm />
          </TabsContent>

          <TabsContent value="compliance">
            <ComplianceCenter />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthPage;