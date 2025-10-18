import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface EnhancedProfile {
  id?: string;
  user_id: string;
  full_name: string;
  phone?: string;
  email: string;
  date_of_birth?: string;
  location?: string;
  user_category: string;
  institution_name?: string;
  business_name?: string;
  business_permit_ref?: string;
  profile_completion_percentage?: number;
  email_verified?: boolean;
  phone_verified?: boolean;
  kyc_status?: string;
  kyc_submitted_at?: string;
  kyc_verified_at?: string;
  kyc_verified_by?: string;
  kyc_rejection_reason?: string;
  is_verified?: boolean;
  verification_tier?: number; // Changed from string to number
  max_transaction_limit?: number;
  max_daily_limit?: number;
  profile_visibility?: string;
  show_investments?: boolean;
  terms_accepted?: boolean;
  terms_accepted_at?: string;
  privacy_policy_accepted?: boolean;
  privacy_policy_accepted_at?: string;
  avatar_url?: string;
  last_login_at?: string;
  last_active_at?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

interface KYCDocument {
  id: string;
  user_id: string;
  document_type: string; // Simplified to match database
  document_number?: string;
  file_path: string; // Changed from storage_path
  file_name: string;
  file_size?: number;
  mime_type?: string;
  status: string; // Simplified to match database
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

interface SecuritySettings {
  id?: string;
  user_id: string;
  pin_hash?: string;
  pin_salt?: string;
  pin_created_at?: string;
  pin_last_changed?: string;
  failed_pin_attempts?: number;
  pin_locked_until?: string;
  last_failed_pin_attempt?: string;
  biometric_enabled?: boolean;
  biometric_type?: string;
  biometric_last_used?: string;
  max_session_duration?: string;
  auto_logout_enabled?: boolean;
  require_pin_for_transactions?: boolean;
  security_questions?: any[];
  trusted_devices?: any[];
  last_security_review?: string;
  security_score?: number;
  created_at?: string;
  updated_at?: string;
}

export const useEnhancedAuth = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<EnhancedProfile | null>(null);
  const [kycDocuments, setKycDocuments] = useState<KYCDocument[]>([]);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEnhancedProfile();
      fetchKYCDocuments();
      fetchSecuritySettings();
    } else {
      setProfile(null);
      setKycDocuments([]);
      setSecuritySettings(null);
      setLoading(false);
    }
  }, [user]);

  const fetchEnhancedProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles_enhanced')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching enhanced profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Enhanced profile fetch error:', error);
    }
  };

  const fetchKYCDocuments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('kyc_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching KYC documents:', error);
      } else {
        setKycDocuments(data || []);
      }
    } catch (error) {
      console.error('KYC documents fetch error:', error);
    }
  };

  const fetchSecuritySettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_pins_enhanced')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching security settings:', error);
      } else {
        setSecuritySettings(data);
      }
    } catch (error) {
      console.error('Security settings fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<EnhancedProfile>) => {
    if (!user || !profile) return false;

    try {
      const { error } = await supabase
        .from('user_profiles_enhanced')
        .update(updates)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating enhanced profile:', error);
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive",
        });
        return false;
      }

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    }
  };

  const uploadKYCDocument = async (file: File, documentType: string, documentNumber?: string) => {
    if (!user) return false;

    setUploading(true);
    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${documentType}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('kyc-documents')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Create document record
      const { error: dbError } = await supabase
        .from('kyc_documents')
        .insert({
          user_id: user.id,
          document_type: documentType,
          document_number: documentNumber,
          file_path: fileName,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type
        });

      if (dbError) {
        throw dbError;
      }

      await fetchKYCDocuments();
      
      toast({
        title: "Success",
        description: "KYC document uploaded successfully",
      });
      return true;
    } catch (error: any) {
      console.error('KYC upload error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
      return false;
    } finally {
      setUploading(false);
    }
  };

  const setPIN = async (pin: string) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('set_user_pin_enhanced', {
        p_user_id: user.id,
        p_pin: pin
      });

      if (error) throw error;

      const result = data as { success: boolean; message: string };
      
      if (result.success) {
        await fetchSecuritySettings();
        toast({
          title: "Success",
          description: result.message,
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      console.error('Error setting PIN:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to set PIN",
        variant: "destructive",
      });
      return false;
    }
  };

  const verifyPIN = async (pin: string) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('verify_user_pin_v2', {
        p_user_id: user.id,
        p_pin: pin
      });

      if (error) throw error;

      const result = data as boolean;
      
      if (result) {
        toast({
          title: "Success",
          description: "PIN verified successfully",
        });
        return true;
      } else {
        toast({
          title: "Error", 
          description: "Invalid PIN",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      console.error('Error verifying PIN:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to verify PIN",
        variant: "destructive",
      });
      return false;
    }
  };

  const acceptLegalTerms = async (documentType: 'terms_of_service' | 'privacy_policy' | 'kyc_consent' | 'data_processing' | 'marketing_consent', documentVersion: string = '1.0') => {
    if (!user) return false;

    try {
      // For now, just update the profile directly
      const updates: any = {};
      if (documentType === 'terms_of_service') {
        updates.terms_accepted = true;
        updates.terms_accepted_at = new Date().toISOString();
      } else if (documentType === 'privacy_policy') {
        updates.privacy_policy_accepted = true;
        updates.privacy_policy_accepted_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('user_profiles_enhanced')
        .update(updates)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Legal terms accepted successfully",
      });
      return true;
    } catch (error: any) {
      console.error('Error accepting legal terms:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to accept legal terms",
        variant: "destructive",
      });
      return false;
    }
  };

  const calculateProfileCompletion = (profile: EnhancedProfile | null) => {
    if (!profile) return 0;
    
    let completed = 0;
    const total = 10;
    
    if (profile.full_name) completed++;
    if (profile.phone) completed++;
    if (profile.email) completed++;
    if (profile.date_of_birth) completed++;
    if (profile.location) completed++;
    if (profile.email_verified) completed++;
    if (profile.phone_verified) completed++;
    if (profile.terms_accepted) completed++;
    if (profile.privacy_policy_accepted) completed++;
    if (profile.kyc_status === 'verified') completed++;
    
    return Math.round((completed / total) * 100);
  };

  return {
    profile,
    kycDocuments,
    securitySettings,
    loading,
    uploading,
    updateProfile,
    uploadKYCDocument,
    setPIN,
    verifyPIN,
    acceptLegalTerms,
    fetchEnhancedProfile,
    fetchKYCDocuments,
    fetchSecuritySettings,
    profileCompletion: calculateProfileCompletion(profile)
  };
};