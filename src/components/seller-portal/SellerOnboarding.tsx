import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

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

interface SellerOnboardingProps {
  existingProfile?: SellerProfile | null;
  onComplete: (profile: SellerProfile) => void;
}

export function SellerOnboarding({ existingProfile, onComplete }: SellerOnboardingProps) {
  const { portalUser } = usePortalAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    business_name: existingProfile?.business_name || '',
    phone: existingProfile?.phone || '',
    mpesa_number: existingProfile?.mpesa_number || '',
    address: '',
    business_description: '',
  });

  const [kycFiles, setKycFiles] = useState({
    id_document: null as File | null,
    business_license: null as File | null,
    proof_of_address: null as File | null,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: string, file: File | null) => {
    setKycFiles(prev => ({ ...prev, [field]: file }));
  };

  const uploadKYCDocuments = async () => {
    const uploadedDocs: any = {};
    
    for (const [key, file] of Object.entries(kycFiles)) {
      if (file) {
        const fileName = `${portalUser?.id}/${key}_${Date.now()}.${file.name.split('.').pop()}`;
        const { data, error } = await supabase.storage
          .from('kyc-documents')
          .upload(fileName, file);
        
        if (error) {
          throw new Error(`Failed to upload ${key}: ${error.message}`);
        }
        
        uploadedDocs[key] = data.path;
      }
    }
    
    return uploadedDocs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portalUser) return;

    setLoading(true);
    try {
      // Upload KYC documents if any
      let kycDocs = existingProfile?.kyc_docs || {};
      if (Object.values(kycFiles).some(file => file !== null)) {
        const uploadedDocs = await uploadKYCDocuments();
        kycDocs = { ...kycDocs, ...uploadedDocs };
      }

      let updateData;
      if (existingProfile) {
        // Update existing profile
        const { data, error } = await supabase
          .from('sellers')
          .update({
            business_name: formData.business_name,
            phone: formData.phone,
            mpesa_number: formData.mpesa_number,
            kyc_docs: kycDocs,
            kyc_status: Object.keys(kycDocs).length > 0 ? 'pending' : existingProfile.kyc_status,
          })
          .eq('id', existingProfile.id)
          .select()
          .single();

        if (error) throw error;
        updateData = data;
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from('sellers')
          .insert({
            portal_user_id: portalUser.id,
            business_name: formData.business_name,
            phone: formData.phone,
            mpesa_number: formData.mpesa_number,
            kyc_docs: kycDocs,
            kyc_status: Object.keys(kycDocs).length > 0 ? 'pending' : 'pending',
          } as any)
          .select()
          .single();

        if (error) throw error;
        updateData = data;
      }

      toast({
        title: "Profile Updated",
        description: "Your seller profile has been updated successfully. KYC review is in progress.",
      });

      onComplete(updateData as SellerProfile);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (!existingProfile) return null;
    
    switch (existingProfile.kyc_status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          {getStatusIcon()}
          <div>
            <h2 className="text-xl font-semibold">Seller Profile & KYC</h2>
            <p className="text-muted-foreground">
              Complete your profile and upload KYC documents to start selling Wi-Fi packages
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Business Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="business_name">Business Name *</Label>
              <Input
                id="business_name"
                value={formData.business_name}
                onChange={(e) => handleInputChange('business_name', e.target.value)}
                placeholder="Enter your business name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="e.g., +254700000000"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mpesa_number">M-Pesa Number</Label>
                <Input
                  id="mpesa_number"
                  value={formData.mpesa_number}
                  onChange={(e) => handleInputChange('mpesa_number', e.target.value)}
                  placeholder="e.g., 254700000000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Business Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your business address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_description">Business Description</Label>
              <Textarea
                id="business_description"
                value={formData.business_description}
                onChange={(e) => handleInputChange('business_description', e.target.value)}
                placeholder="Briefly describe your Wi-Fi business"
                rows={3}
              />
            </div>
          </div>

          {/* KYC Documents */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">KYC Documents</h3>
            <p className="text-sm text-muted-foreground">
              Upload clear photos or scans of the following documents for verification
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: 'id_document', label: 'ID Document', description: 'National ID or Passport' },
                { key: 'business_license', label: 'Business License', description: 'Business registration certificate' },
                { key: 'proof_of_address', label: 'Proof of Address', description: 'Utility bill or bank statement' },
              ].map(({ key, label, description }) => (
                <div key={key} className="space-y-2">
                  <Label>{label}</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">{description}</p>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(key, e.target.files?.[0] || null)}
                      className="text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Updating...' : existingProfile ? 'Update Profile' : 'Create Seller Profile'}
            </Button>
          </div>
        </form>

        {existingProfile?.kyc_status === 'rejected' && (
          <Card className="mt-6 p-4 border-red-200 bg-red-50">
            <h4 className="font-semibold text-red-800 mb-2">KYC Verification Rejected</h4>
            <p className="text-sm text-red-600">
              Your KYC documents were rejected. Please review and upload new documents for re-verification.
              Common issues include blurry images, expired documents, or mismatched information.
            </p>
          </Card>
        )}
      </Card>
    </div>
  );
}