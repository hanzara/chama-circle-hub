import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Shield, 
  Eye, 
  Download,
  CheckCircle,
  Clock,
  FileText,
  Scale,
  Database,
  Lock,
  UserCheck,
  Globe
} from 'lucide-react';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { useToast } from '@/hooks/use-toast';

const ComplianceCenter: React.FC = () => {
  const { profile, acceptLegalTerms } = useEnhancedAuth();
  const { toast } = useToast();
  const [acceptingTerms, setAcceptingTerms] = useState(false);

  const handleAcceptTerms = async (documentType: string) => {
    setAcceptingTerms(true);
    try {
      await acceptLegalTerms(documentType as any, '1.0');
    } finally {
      setAcceptingTerms(false);
    }
  };

  const legalDocuments = [
    {
      id: 'terms_of_service',
      title: 'Terms of Service',
      description: 'Our terms and conditions for using ChamaVault platform',
      version: '1.0',
      lastUpdated: '2024-01-15',
      accepted: profile?.terms_accepted,
      acceptedAt: profile?.terms_accepted_at,
      required: true,
      icon: Scale
    },
    {
      id: 'privacy_policy',
      title: 'Privacy Policy',
      description: 'How we collect, use, and protect your personal information',
      version: '1.0',
      lastUpdated: '2024-01-15',
      accepted: profile?.privacy_policy_accepted,
      acceptedAt: profile?.privacy_policy_accepted_at,
      required: true,
      icon: Shield
    },
    {
      id: 'kyc_consent',
      title: 'KYC Consent',
      description: 'Consent for identity verification and document processing',
      version: '1.0',
      lastUpdated: '2024-01-15',
      accepted: false,
      acceptedAt: null,
      required: false,
      icon: UserCheck
    },
    {
      id: 'data_processing',
      title: 'Data Processing Agreement',
      description: 'GDPR-compliant data processing terms and conditions',
      version: '1.0',
      lastUpdated: '2024-01-15',
      accepted: false,
      acceptedAt: null,
      required: false,
      icon: Database
    },
    {
      id: 'marketing_consent',
      title: 'Marketing Communications',
      description: 'Consent for receiving marketing and promotional content',
      version: '1.0',
      lastUpdated: '2024-01-15',
      accepted: false,
      acceptedAt: null,
      required: false,
      icon: Globe
    }
  ];

  const dataRights = [
    {
      title: 'Right to Access',
      description: 'Request a copy of all personal data we hold about you',
      action: 'Request Data Export'
    },
    {
      title: 'Right to Rectification',
      description: 'Request correction of inaccurate or incomplete data',
      action: 'Update Profile'
    },
    {
      title: 'Right to Erasure',
      description: 'Request deletion of your personal data (Right to be Forgotten)',
      action: 'Delete Account'
    },
    {
      title: 'Right to Portability',
      description: 'Request your data in a machine-readable format',
      action: 'Export Data'
    },
    {
      title: 'Right to Object',
      description: 'Object to processing of your data for specific purposes',
      action: 'Manage Preferences'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Legal Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Legal Documents & Agreements
          </CardTitle>
          <CardDescription>
            Review and manage your legal agreements and consent preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {legalDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-muted rounded-lg">
                    <doc.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{doc.title}</h4>
                      {doc.required && (
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{doc.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Version {doc.version} • Last updated {new Date(doc.lastUpdated).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {doc.accepted ? (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">Accepted</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.acceptedAt && new Date(doc.acceptedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-600" />
                      <p className="text-sm text-gray-600">Pending</p>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {!doc.accepted && (
                      <Button 
                        size="sm"
                        onClick={() => handleAcceptTerms(doc.id)}
                        disabled={acceptingTerms}
                      >
                        Accept
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Privacy & Data Settings
          </CardTitle>
          <CardDescription>
            Control how your data is used and shared
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="font-medium">Analytics & Performance</h4>
                <p className="text-sm text-muted-foreground">
                  Help us improve our services by sharing anonymous usage data
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="font-medium">Marketing Communications</h4>
                <p className="text-sm text-muted-foreground">
                  Receive updates about new features, offers, and financial insights
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="font-medium">Data Processing for Credit Scoring</h4>
                <p className="text-sm text-muted-foreground">
                  Allow processing of transaction data to improve your credit score
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="font-medium">Third-Party Integrations</h4>
                <p className="text-sm text-muted-foreground">
                  Share data with trusted partners for enhanced services
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Rights (GDPR) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Your Data Rights
          </CardTitle>
          <CardDescription>
            Exercise your rights under GDPR and data protection laws
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dataRights.map((right, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{right.title}</h4>
                  <p className="text-sm text-muted-foreground">{right.description}</p>
                </div>
                <Button variant="outline" size="sm">
                  {right.action}
                </Button>
              </div>
            ))}
          </div>

          <Alert className="mt-4">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Your Privacy Matters:</strong> We are committed to protecting your personal data 
              in accordance with GDPR and Kenyan data protection laws. You can exercise any of these 
              rights at any time by contacting our privacy team.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Compliance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Compliance Overview
          </CardTitle>
          <CardDescription>
            Our commitment to regulatory compliance and data protection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Regulatory Compliance</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Central Bank of Kenya (CBK) Guidelines
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Anti-Money Laundering (AML) Compliance
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Know Your Customer (KYC) Requirements
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Payment Card Industry (PCI) Standards
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Data Protection</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  GDPR Compliance
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Kenya Data Protection Act
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  End-to-End Encryption
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Regular Security Audits
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Audit Trail</h4>
            <p className="text-sm text-muted-foreground">
              All your actions and data changes are logged for security and compliance purposes. 
              You can request access to your audit logs at any time.
            </p>
            <Button variant="outline" size="sm" className="mt-3">
              <Download className="h-4 w-4 mr-2" />
              Download Audit Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceCenter;