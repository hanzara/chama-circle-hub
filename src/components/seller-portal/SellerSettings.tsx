import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  User, 
  CreditCard, 
  Shield,
  Save,
  AlertCircle
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

interface SellerSettingsProps {
  profile: SellerProfile;
  onUpdate: (profile: SellerProfile) => void;
}

export function SellerSettings({ profile, onUpdate }: SellerSettingsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    business_name: profile.business_name || '',
    phone: profile.phone || '',
    mpesa_number: profile.mpesa_number || '',
    business_description: '',
    support_email: '',
    support_hours: '',
  });

  const [bankDetails, setBankDetails] = useState({
    bank_name: profile.bank_details?.bank_name || '',
    account_number: profile.bank_details?.account_number || '',
    account_name: profile.bank_details?.account_name || '',
    branch: profile.bank_details?.branch || '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBankDetailsChange = (field: string, value: string) => {
    setBankDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        business_name: formData.business_name,
        phone: formData.phone,
        mpesa_number: formData.mpesa_number,
        bank_details: bankDetails,
      };

      const { data, error } = await supabase
        .from('sellers')
        .update(updateData)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Settings Updated",
        description: "Your seller settings have been updated successfully",
      });

      onUpdate(data as SellerProfile);
    } catch (error: any) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Seller Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      {/* KYC Status */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Verification Status</h3>
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge className={getKYCStatusColor(profile.kyc_status)}>
            {profile.kyc_status.toUpperCase()}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Commission Rate: {profile.commission_rate}%
          </span>
        </div>

        {profile.kyc_status === 'rejected' && (
          <div className="mt-4 p-3 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-600">
                Your KYC verification was rejected. Please update your documents in the Profile tab and resubmit for verification.
              </p>
            </div>
          </div>
        )}
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Information */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <User className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Business Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="support_email">Support Email</Label>
              <Input
                id="support_email"
                type="email"
                value={formData.support_email}
                onChange={(e) => handleInputChange('support_email', e.target.value)}
                placeholder="support@yourbusiness.com"
              />
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <Label htmlFor="business_description">Business Description</Label>
            <Textarea
              id="business_description"
              value={formData.business_description}
              onChange={(e) => handleInputChange('business_description', e.target.value)}
              placeholder="Describe your Wi-Fi business and services"
              rows={3}
            />
          </div>

          <div className="space-y-2 mt-4">
            <Label htmlFor="support_hours">Support Hours</Label>
            <Input
              id="support_hours"
              value={formData.support_hours}
              onChange={(e) => handleInputChange('support_hours', e.target.value)}
              placeholder="e.g., Mon-Fri 8AM-6PM"
            />
          </div>
        </Card>

        {/* Bank Details */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CreditCard className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Bank Details</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bank_name">Bank Name</Label>
              <Input
                id="bank_name"
                value={bankDetails.bank_name}
                onChange={(e) => handleBankDetailsChange('bank_name', e.target.value)}
                placeholder="e.g., KCB Bank"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_number">Account Number</Label>
              <Input
                id="account_number"
                value={bankDetails.account_number}
                onChange={(e) => handleBankDetailsChange('account_number', e.target.value)}
                placeholder="Your bank account number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_name">Account Name</Label>
              <Input
                id="account_name"
                value={bankDetails.account_name}
                onChange={(e) => handleBankDetailsChange('account_name', e.target.value)}
                placeholder="Account holder name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Input
                id="branch"
                value={bankDetails.branch}
                onChange={(e) => handleBankDetailsChange('branch', e.target.value)}
                placeholder="Branch name or code"
              />
            </div>
          </div>

          <div className="mt-4 p-3 border border-blue-200 rounded-lg bg-blue-50">
            <p className="text-sm text-blue-600">
              <strong>Note:</strong> Bank details are optional and used as a backup payment method. 
              M-Pesa is the primary payout method for faster transactions.
            </p>
          </div>
        </Card>

        {/* Save Button */}
        <Card className="p-6">
          <Button type="submit" disabled={loading} className="flex items-center space-x-2">
            <Save className="h-4 w-4" />
            <span>{loading ? 'Saving...' : 'Save Settings'}</span>
          </Button>
        </Card>
      </form>
    </div>
  );
}