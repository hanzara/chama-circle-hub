
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Download,
  Search,
  Filter
} from 'lucide-react';

const BankComplianceView: React.FC = () => {
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  const kycDocuments = [
    {
      id: 'KYC001',
      borrowerName: 'John Kamau',
      borrowerId: 'B001',
      documentType: 'National ID',
      status: 'verified',
      uploadDate: '2024-07-10',
      verifiedBy: 'System Auto-Verify',
      riskIndicators: [],
      documentUrl: '/documents/national-id-001.pdf'
    },
    {
      id: 'KYC002',
      borrowerName: 'John Kamau',
      borrowerId: 'B001',
      documentType: 'Bank Statement',
      status: 'verified',
      uploadDate: '2024-07-10',
      verifiedBy: 'Manual Review',
      riskIndicators: [],
      documentUrl: '/documents/bank-statement-001.pdf'
    },
    {
      id: 'KYC003',
      borrowerName: 'Mary Wanjiku',
      borrowerId: 'B002',
      documentType: 'National ID',
      status: 'flagged',
      uploadDate: '2024-07-12',
      verifiedBy: 'Pending',
      riskIndicators: ['Document quality concerns', 'Address mismatch'],
      documentUrl: '/documents/national-id-002.pdf'
    },
    {
      id: 'KYC004',
      borrowerName: 'Mary Wanjiku',
      borrowerId: 'B002',
      documentType: 'Salary Slip',
      status: 'pending',
      uploadDate: '2024-07-13',
      verifiedBy: 'Pending',
      riskIndicators: [],
      documentUrl: '/documents/salary-slip-002.pdf'
    }
  ];

  const fraudRiskIndicators = [
    {
      id: 'RISK001',
      borrowerName: 'Suspicious User',
      riskType: 'Document Fraud',
      severity: 'high',
      description: 'Multiple inconsistencies in submitted documents',
      detectedDate: '2024-07-13',
      status: 'investigating',
      evidence: ['Altered bank statement', 'Mismatched signatures', 'Photo inconsistencies']
    },
    {
      id: 'RISK002',
      borrowerName: 'Peter Otieno',
      riskType: 'Identity Verification',
      severity: 'medium',
      description: 'Biometric verification failed',
      detectedDate: '2024-07-12',
      status: 'pending_review',
      evidence: ['Facial recognition mismatch', 'Multiple login locations']
    }
  ];

  const complianceStats = {
    totalDocuments: 1247,
    verifiedDocuments: 1089,
    pendingReview: 98,
    flaggedDocuments: 60,
    fraudDetected: 12,
    complianceRate: 87.3
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Verified
        </Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Pending
        </Badge>;
      case 'flagged':
        return <Badge className="bg-red-100 text-red-800 border-red-200">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Flagged
        </Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800 border-red-200">High Risk</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium Risk</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Low Risk</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Compliance Statistics */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceStats.totalDocuments}</div>
            <p className="text-xs text-muted-foreground">All submissions</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{complianceStats.verifiedDocuments}</div>
            <p className="text-xs text-green-600">Approved documents</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{complianceStats.pendingReview}</div>
            <p className="text-xs text-yellow-600">Awaiting review</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{complianceStats.flaggedDocuments}</div>
            <p className="text-xs text-red-600">Risk indicators</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fraud Detected</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{complianceStats.fraudDetected}</div>
            <p className="text-xs text-red-600">Confirmed fraud</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{complianceStats.complianceRate}%</div>
            <p className="text-xs text-blue-600">Overall compliance</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance & KYC Dashboard
          </CardTitle>
          <CardDescription>
            Access submitted KYC documents and automated fraud risk indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="documents" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="documents">KYC Documents</TabsTrigger>
              <TabsTrigger value="fraud">Fraud Indicators</TabsTrigger>
            </TabsList>

            <TabsContent value="documents" className="space-y-4">
              <div className="space-y-4">
                {kycDocuments.map((doc) => (
                  <Card key={doc.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div>
                              <h4 className="font-medium">{doc.borrowerName}</h4>
                              <p className="text-sm text-muted-foreground">{doc.documentType}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mb-2">
                            {getStatusBadge(doc.status)}
                            <span className="text-sm text-muted-foreground">
                              Uploaded: {doc.uploadDate}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              Verified by: {doc.verifiedBy}
                            </span>
                          </div>

                          {doc.riskIndicators.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-red-600 mb-1">Risk Indicators:</p>
                              <div className="space-y-1">
                                {doc.riskIndicators.map((indicator, index) => (
                                  <Badge key={index} variant="destructive" className="mr-2">
                                    {indicator}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="fraud" className="space-y-4">
              <div className="space-y-4">
                {fraudRiskIndicators.map((risk) => (
                  <Card key={risk.id} className="hover:shadow-md transition-shadow border-l-4 border-l-red-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            <div>
                              <h4 className="font-medium text-red-800">{risk.borrowerName}</h4>
                              <p className="text-sm text-red-600">{risk.riskType}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mb-2">
                            {getSeverityBadge(risk.severity)}
                            <span className="text-sm text-muted-foreground">
                              Detected: {risk.detectedDate}
                            </span>
                            <Badge variant="outline">
                              {risk.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>

                          <p className="text-sm mb-3">{risk.description}</p>

                          <div>
                            <p className="text-sm font-medium mb-1">Evidence:</p>
                            <div className="space-y-1">
                              {risk.evidence.map((evidence, index) => (
                                <div key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                  {evidence}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Investigate
                          </Button>
                          <Button variant="destructive" size="sm">
                            Block User
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default BankComplianceView;
