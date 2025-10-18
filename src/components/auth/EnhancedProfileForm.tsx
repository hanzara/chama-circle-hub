import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Upload, 
  Camera, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Loader2,
  Shield,
  Building2,
  GraduationCap
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserProfile {
  id?: string;
  user_id: string;
  full_name?: string;
  phone?: string;
  email?: string;
  date_of_birth?: string;
  location?: string;
  user_category?: 'individual' | 'student' | 'business' | 'institution';
  institution_name?: string;
  business_name?: string;
  business_permit_ref?: string;
  kyc_status?: 'pending' | 'under_review' | 'verified' | 'rejected';
  verification_tier?: number;
}

interface KYCDocument {
  id: string;
  document_type: string;
  file_name: string;
  status: 'pending' | 'under_review' | 'verified' | 'rejected';
  created_at: string;
  review_notes?: string;
}

const EnhancedProfileForm: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    user_id: user?.id || '',
    full_name: '',
    phone: '',
    email: user?.email || '',
    date_of_birth: '',
    location: '',
    user_category: 'individual',
    institution_name: '',
    business_name: '',
    business_permit_ref: '',
  });
  const [kycDocuments, setKycDocuments] = useState<KYCDocument[]>([]);

  React.useEffect(() => {
    if (user) {
      fetchProfile();
      fetchKYCDocuments();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles_enhanced')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfile({
          ...data,
          date_of_birth: data.date_of_birth || '',
          user_category: data.user_category as 'individual' | 'student' | 'business' | 'institution',
          kyc_status: data.kyc_status as 'pending' | 'under_review' | 'verified' | 'rejected',
        });
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchKYCDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('kyc_documents')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setKycDocuments((data || []) as KYCDocument[]);
    } catch (error: any) {
      console.error('Error fetching KYC documents:', error);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('user_profiles_enhanced')
        .upsert({
          user_id: user.id,
          full_name: profile.full_name,
          phone: profile.phone,
          email: profile.email,
          date_of_birth: profile.date_of_birth || null,
          location: profile.location,
          user_category: profile.user_category,
          institution_name: profile.user_category === 'institution' ? profile.institution_name : null,
          business_name: profile.user_category === 'business' ? profile.business_name : null,
          business_permit_ref: profile.user_category === 'business' ? profile.business_permit_ref : null,
        });

      if (error) throw error;

      toast({
        title: "Profile Updated! ✅",
        description: "Your profile information has been saved successfully",
      });

      fetchProfile(); // Refresh profile data
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

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Basic validation
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a JPG, PNG, or PDF file",
        variant: "destructive",
      });
      return;
    }

    setUploadingDoc(true);

    try {
      // Upload to Supabase Storage (you'll need to create a bucket)
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `kyc-documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('kyc-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save document record
      const { error: dbError } = await supabase
        .from('kyc_documents')
        .insert({
          user_id: user.id,
          document_type: 'national_id', // Default, can be made selectable
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
        });

      if (dbError) throw dbError;

      toast({
        title: "Document Uploaded! 📄",
        description: "Your KYC document has been uploaded for review",
      });

      fetchKYCDocuments(); // Refresh documents
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setUploadingDoc(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getKYCStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'under_review':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><Clock className="h-3 w-3 mr-1" />Under Review</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'business':
        return <Building2 className="h-4 w-4" />;
      case 'student':
        return <GraduationCap className="h-4 w-4" />;
      case 'institution':
        return <Building2 className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
            {profile.kyc_status && (
              <div className="ml-auto">
                {getKYCStatusBadge(profile.kyc_status)}
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={profile.full_name || ''}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email || ''}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={profile.date_of_birth || ''}
                  onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profile.location || ''}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  placeholder="City, Country"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="user_category">User Category *</Label>
                <Select
                  value={profile.user_category}
                  onValueChange={(value) => setProfile({ ...profile, user_category: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Individual
                      </div>
                    </SelectItem>
                    <SelectItem value="student">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Student
                      </div>
                    </SelectItem>
                    <SelectItem value="business">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Business
                      </div>
                    </SelectItem>
                    <SelectItem value="institution">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Institution
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {profile.user_category === 'business' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="business_name">Business Name</Label>
                    <Input
                      id="business_name"
                      value={profile.business_name || ''}
                      onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business_permit_ref">Business Permit Reference</Label>
                    <Input
                      id="business_permit_ref"
                      value={profile.business_permit_ref || ''}
                      onChange={(e) => setProfile({ ...profile, business_permit_ref: e.target.value })}
                    />
                  </div>
                </>
              )}

              {profile.user_category === 'institution' && (
                <div className="space-y-2">
                  <Label htmlFor="institution_name">Institution Name</Label>
                  <Input
                    id="institution_name"
                    value={profile.institution_name || ''}
                    onChange={(e) => setProfile({ ...profile, institution_name: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading} className="gap-2">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4" />
                    Save Profile
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* KYC Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            KYC Documents
            <Badge variant="outline" className="ml-auto">
              Tier {profile.verification_tier || 1}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Section */}
          <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
            <div className="space-y-2">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
              <h3 className="font-medium">Upload KYC Document</h3>
              <p className="text-sm text-muted-foreground">
                Upload your ID, passport, or business documents for verification
              </p>
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingDoc}
                  className="gap-2"
                >
                  {uploadingDoc ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4" />
                      Choose File
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Supported: JPG, PNG, PDF (Max 5MB)
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg,application/pdf"
            onChange={handleDocumentUpload}
            className="hidden"
          />

          {/* Documents List */}
          {kycDocuments.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Uploaded Documents</h4>
              {kycDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                      <Camera className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{doc.file_name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {doc.document_type.replace('_', ' ')} • {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                      {doc.review_notes && (
                        <p className="text-xs text-destructive mt-1">{doc.review_notes}</p>
                      )}
                    </div>
                  </div>
                  {getKYCStatusBadge(doc.status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedProfileForm;