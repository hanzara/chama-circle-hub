import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  User, 
  FileCheck, 
  Lock,
  Eye,
  ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileManagement from '@/components/auth/ProfileManagement';
import KYCVerification from '@/components/auth/KYCVerification';
import PinSetupForm from '@/components/auth/PinSetupForm';
import SecurityDashboard from '@/components/auth/SecurityDashboard';
import ComplianceCenter from '@/components/auth/ComplianceCenter';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';

const ProfileSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, profileCompletion, securitySettings, loading } = useEnhancedAuth();
  const [activeTab, setActiveTab] = useState('profile');

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

  const getVerificationStatus = () => {
    if (!profile) return { status: 'pending', color: 'text-gray-500' };
    
    switch (profile.kyc_status) {
      case 'verified':
        return { status: 'Verified', color: 'text-green-600' };
      case 'in_review':
        return { status: 'Under Review', color: 'text-blue-600' };
      case 'rejected':
        return { status: 'Rejected', color: 'text-red-600' };
      default:
        return { status: 'Pending', color: 'text-gray-500' };
    }
  };

  const verificationStatus = getVerificationStatus();
  const securityScore = securitySettings?.security_score || 50;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Profile Settings</h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Manage your profile, security settings, and verification status
              </p>
            </div>
            <Button onClick={() => navigate('/dashboard')} variant="outline" className="self-start sm:self-auto">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
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
                  <FileCheck className={`h-5 w-5 ${verificationStatus.color}`} />
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

export default ProfileSettingsPage;
