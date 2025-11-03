import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileCheck, 
  Upload, 
  Eye, 
  Download,
  CheckCircle,
  Clock,
  AlertTriangle,
  X,
  Camera,
  FileText,
  CreditCard,
  Building2,
  Loader2
} from 'lucide-react';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { useToast } from '@/hooks/use-toast';

const KYCVerification: React.FC = () => {
  const { kycDocuments, uploadKYCDocument, uploading, profile } = useEnhancedAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documentType, setDocumentType] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const documentTypes = [
    { value: 'national_id', label: 'National ID', icon: CreditCard },
    { value: 'passport', label: 'Passport', icon: FileText },
    { value: 'driving_license', label: 'Driving License', icon: CreditCard },
    { value: 'utility_bill', label: 'Utility Bill', icon: FileText },
    { value: 'bank_statement', label: 'Bank Statement', icon: Building2 },
    { value: 'business_permit', label: 'Business Permit', icon: Building2 },
    { value: 'tax_certificate', label: 'Tax Certificate', icon: FileText }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_review':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'rejected':
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'in_review':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!documentType) {
      toast({
        title: "Error",
        description: "Please select a document type first",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "Error",
        description: "File size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Only JPG, PNG, and PDF files are allowed",
        variant: "destructive",
      });
      return;
    }

    await uploadKYCDocument(file, documentType, documentNumber);
    setDocumentType('');
    setDocumentNumber('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const calculateKYCProgress = () => {
    const requiredDocs = ['national_id', 'utility_bill'];
    const uploadedDocs = kycDocuments.map(doc => doc.document_type);
    const verifiedDocs = kycDocuments.filter(doc => doc.status === 'verified').map(doc => doc.document_type);
    
    const uploadProgress = (uploadedDocs.filter(type => requiredDocs.includes(type)).length / requiredDocs.length) * 50;
    const verificationProgress = (verifiedDocs.filter(type => requiredDocs.includes(type)).length / requiredDocs.length) * 50;
    
    return uploadProgress + verificationProgress;
  };

  const kycProgress = calculateKYCProgress();

  return (
    <div className="space-y-6">
      {/* KYC Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            KYC Verification Status
          </CardTitle>
          <CardDescription>
            Complete your identity verification to unlock higher transaction limits and premium features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Verification Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(kycProgress)}%</span>
            </div>
            <Progress value={kycProgress} className="w-full" />
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${profile?.kyc_status === 'verified' ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {getStatusIcon(profile?.kyc_status || 'pending')}
                </div>
                <div>
                  <p className="font-medium">Overall Status</p>
                  <Badge className={getStatusColor(profile?.kyc_status || 'pending')}>
                    {profile?.kyc_status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Upload className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Documents</p>
                  <p className="text-sm text-muted-foreground">{kycDocuments.length} uploaded</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CreditCard className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Transaction Limit</p>
                  <p className="text-sm text-muted-foreground">
                    KES {profile?.max_transaction_limit?.toLocaleString() || '10,000'}
                  </p>
                </div>
              </div>
            </div>

            {profile?.kyc_status === 'rejected' && profile?.kyc_rejection_reason && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Verification Rejected:</strong> {profile.kyc_rejection_reason}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload New Document */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload New Document
          </CardTitle>
          <CardDescription>
            Upload required documents for identity verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="document-type">Document Type</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="document-number">Document Number (Optional)</Label>
              <Input
                id="document-number"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="Enter document number"
              />
            </div>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {uploading ? (
              <div className="space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <div>
                  <p className="text-lg font-medium">Uploading document...</p>
                  <p className="text-muted-foreground">Please wait while we process your file</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium">Upload Document</p>
                  <p className="text-muted-foreground">
                    Drag and drop your file here, or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Supports: JPG, PNG, PDF (max 10MB)
                  </p>
                </div>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!documentType || uploading}
                  className="mx-auto"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />

          <Alert>
            <FileCheck className="h-4 w-4" />
            <AlertDescription>
              <strong>Required Documents:</strong> National ID and Utility Bill (not older than 3 months).
              Additional documents may be required based on your account type.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Uploaded Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Uploaded Documents
          </CardTitle>
          <CardDescription>
            Track the status of your uploaded verification documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {kycDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No documents uploaded</p>
              <p className="text-muted-foreground">Upload your first document to start the verification process</p>
            </div>
          ) : (
            <div className="space-y-4">
              {kycDocuments.map((doc) => {
                const docType = documentTypes.find(type => type.value === doc.document_type);
                return (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-muted rounded-lg">
                        {docType?.icon ? <docType.icon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium">{docType?.label || doc.document_type}</p>
                        <p className="text-sm text-muted-foreground">
                          Uploaded {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                        {doc.document_number && (
                          <p className="text-sm text-muted-foreground">
                            Doc #: {doc.document_number}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(doc.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(doc.status)}
                          {doc.status.replace('_', ' ').toUpperCase()}
                        </div>
                      </Badge>

                      <div className="flex items-center space-x-2">
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
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Benefits</CardTitle>
          <CardDescription>
            See what you unlock with different verification levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <h4 className="font-semibold">Basic (Unverified)</h4>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• KES 10,000 transaction limit</li>
                <li>• KES 50,000 daily limit</li>
                <li>• Basic chama features</li>
                <li>• Limited loan access</li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <h4 className="font-semibold">Standard (ID Verified)</h4>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• KES 100,000 transaction limit</li>
                <li>• KES 500,000 daily limit</li>
                <li>• Full chama features</li>
                <li>• Higher loan eligibility</li>
                <li>• Investment opportunities</li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h4 className="font-semibold">Premium (Fully Verified)</h4>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• KES 1,000,000 transaction limit</li>
                <li>• KES 5,000,000 daily limit</li>
                <li>• Premium loan rates</li>
                <li>• Exclusive investments</li>
                <li>• Priority support</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KYCVerification;