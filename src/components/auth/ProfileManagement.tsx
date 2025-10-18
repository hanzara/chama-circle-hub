import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Building2,
  Eye,
  EyeOff,
  Save,
  Upload,
  CheckCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { useToast } from '@/hooks/use-toast';
import ProfilePhotoUpload from '@/components/ProfilePhotoUpload';

const ProfileManagement: React.FC = () => {
  const { profile, updateProfile, profileCompletion, loading } = useEnhancedAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    date_of_birth: profile?.date_of_birth || '',
    location: profile?.location || '',
    user_category: profile?.user_category || 'individual',
    institution_name: profile?.institution_name || '',
    business_name: profile?.business_name || '',
    profile_visibility: profile?.profile_visibility || 'chama_members',
    show_investments: profile?.show_investments || false
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await updateProfile(formData);
      if (success) {
        setEditing(false);
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      date_of_birth: profile?.date_of_birth || '',
      location: profile?.location || '',
      user_category: profile?.user_category || 'individual',
      institution_name: profile?.institution_name || '',
      business_name: profile?.business_name || '',
      profile_visibility: profile?.profile_visibility || 'chama_members',
      show_investments: profile?.show_investments || false
    });
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const getCompletionStatus = () => {
    if (profileCompletion >= 80) return { color: 'text-green-600', icon: CheckCircle };
    if (profileCompletion >= 50) return { color: 'text-yellow-600', icon: AlertTriangle };
    return { color: 'text-red-600', icon: AlertTriangle };
  };

  const completionStatus = getCompletionStatus();

  return (
    <div className="space-y-6">
      {/* Profile Completion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <completionStatus.icon className={`h-5 w-5 ${completionStatus.color}`} />
            Profile Completion
          </CardTitle>
          <CardDescription>
            Complete your profile to unlock all features and increase your transaction limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{profileCompletion}%</span>
            </div>
            <Progress value={profileCompletion} className="w-full" />
            
            {profileCompletion < 100 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Complete your profile to access higher transaction limits and premium features.
                  Missing: {profileCompletion < 100 ? 'KYC verification, ' : ''}
                  {!profile?.phone_verified ? 'phone verification, ' : ''}
                  {!profile?.email_verified ? 'email verification' : ''}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profile Photo */}
      <ProfilePhotoUpload />

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Your personal details and contact information
              </CardDescription>
            </div>
            {!editing && (
              <Button variant="outline" onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  disabled={!editing}
                  className="pl-10"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  value={profile?.email || ''}
                  disabled
                  className="pl-10 bg-muted"
                />
                {profile?.email_verified && (
                  <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-600" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!editing}
                  className="pl-10"
                  placeholder="+254 712 345 678"
                />
                {profile?.phone_verified && (
                  <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-600" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  disabled={!editing}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  disabled={!editing}
                  className="pl-10"
                  placeholder="City, Country"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user_category">Account Type</Label>
              <Select 
                value={formData.user_category} 
                onValueChange={(value) => setFormData({ ...formData, user_category: value })}
                disabled={!editing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="organization">Organization</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.user_category === 'business' && (
            <div className="space-y-2">
              <Label htmlFor="business_name">Business Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="business_name"
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  disabled={!editing}
                  className="pl-10"
                  placeholder="Enter your business name"
                />
              </div>
            </div>
          )}

          {formData.user_category === 'organization' && (
            <div className="space-y-2">
              <Label htmlFor="institution_name">Institution Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="institution_name"
                  value={formData.institution_name}
                  onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                  disabled={!editing}
                  className="pl-10"
                  placeholder="Enter your institution name"
                />
              </div>
            </div>
          )}

          {editing && (
            <div className="flex items-center gap-2 pt-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={saving}>
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Privacy Settings
          </CardTitle>
          <CardDescription>
            Control who can see your profile and investment information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile_visibility">Profile Visibility</Label>
            <Select 
              value={formData.profile_visibility} 
              onValueChange={(value) => setFormData({ ...formData, profile_visibility: value })}
              disabled={!editing}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Anyone can see</SelectItem>
                <SelectItem value="chama_members">Chama Members Only</SelectItem>
                <SelectItem value="private">Private - Only you</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show_investments">Show Investment Portfolio</Label>
              <p className="text-sm text-muted-foreground">
                Allow others to see your investment activities and returns
              </p>
            </div>
            <Switch
              id="show_investments"
              checked={formData.show_investments}
              onCheckedChange={(checked) => setFormData({ ...formData, show_investments: checked })}
              disabled={!editing}
            />
          </div>

          {editing && (
            <div className="flex items-center gap-2 pt-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Privacy Settings
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Status */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Status</CardTitle>
          <CardDescription>
            Your current verification level and benefits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${profile?.email_verified ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Mail className={`h-4 w-4 ${profile?.email_verified ? 'text-green-600' : 'text-gray-600'}`} />
              </div>
              <div>
                <p className="font-medium">Email</p>
                <p className={`text-sm ${profile?.email_verified ? 'text-green-600' : 'text-gray-600'}`}>
                  {profile?.email_verified ? 'Verified' : 'Pending'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${profile?.phone_verified ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Phone className={`h-4 w-4 ${profile?.phone_verified ? 'text-green-600' : 'text-gray-600'}`} />
              </div>
              <div>
                <p className="font-medium">Phone</p>
                <p className={`text-sm ${profile?.phone_verified ? 'text-green-600' : 'text-gray-600'}`}>
                  {profile?.phone_verified ? 'Verified' : 'Pending'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${profile?.is_verified ? 'bg-green-100' : 'bg-gray-100'}`}>
                <CheckCircle className={`h-4 w-4 ${profile?.is_verified ? 'text-green-600' : 'text-gray-600'}`} />
              </div>
              <div>
                <p className="font-medium">KYC</p>
                <p className={`text-sm ${profile?.is_verified ? 'text-green-600' : 'text-gray-600'}`}>
                  {profile?.is_verified ? 'Verified' : profile?.kyc_status || 'Pending'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Current Benefits</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Verification Tier:</span>
                <span className="ml-2 font-medium capitalize">{profile?.verification_tier || 'Basic'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Max Transaction:</span>
                <span className="ml-2 font-medium">KES {profile?.max_transaction_limit?.toLocaleString() || '10,000'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Daily Limit:</span>
                <span className="ml-2 font-medium">KES {profile?.max_daily_limit?.toLocaleString() || '50,000'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Profile Completion:</span>
                <span className="ml-2 font-medium">{profileCompletion}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileManagement;