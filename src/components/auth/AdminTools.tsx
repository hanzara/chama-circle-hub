import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Settings, 
  Users, 
  FileCheck, 
  Shield,
  Search,
  Eye,
  CheckCircle,
  X,
  Clock,
  AlertTriangle,
  Download,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface KYCDocument {
  id: string;
  user_id: string;
  document_type: string;
  file_name: string;
  status: string;
  created_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  [key: string]: any;
}

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  kyc_status: string;
  verification_tier: number; // Changed to number
  created_at: string;
  [key: string]: any;
}

const AdminTools: React.FC = () => {
  const { toast } = useToast();
  const [kycDocuments, setKycDocuments] = useState<KYCDocument[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchKYCDocuments();
    fetchUserProfiles();
  }, []);

  const fetchKYCDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('kyc_documents')
        .select(`
          *,
          user_profiles_enhanced!inner(full_name, email)
        `)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setKycDocuments(data || []);
    } catch (error: any) {
      console.error('Error fetching KYC documents:', error);
      toast({
        title: "Error",
        description: "Failed to load KYC documents",
        variant: "destructive",
      });
    }
  };

  const fetchUserProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles_enhanced')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserProfiles((data || []) as UserProfile[]);
    } catch (error: any) {
      console.error('Error fetching user profiles:', error);
      toast({
        title: "Error",
        description: "Failed to load user profiles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const approveKYCDocument = async (documentId: string) => {
    setProcessing(documentId);
    try {
      const { error } = await supabase
        .from('kyc_documents')
        .update({
          status: 'verified',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', documentId);

      if (error) throw error;

      await fetchKYCDocuments();
      toast({
        title: "Success",
        description: "KYC document approved successfully",
      });
    } catch (error: any) {
      console.error('Error approving KYC document:', error);
      toast({
        title: "Error",
        description: "Failed to approve KYC document",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const rejectKYCDocument = async (documentId: string, reason: string) => {
    setProcessing(documentId);
    try {
      const { error } = await supabase
        .from('kyc_documents')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason
        })
        .eq('id', documentId);

      if (error) throw error;

      await fetchKYCDocuments();
      toast({
        title: "Success",
        description: "KYC document rejected",
      });
    } catch (error: any) {
      console.error('Error rejecting KYC document:', error);
      toast({
        title: "Error",
        description: "Failed to reject KYC document",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const updateUserVerification = async (userId: string, status: string, tier: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles_enhanced')
        .update({
          kyc_status: status,
          is_verified: status === 'verified',
          verification_tier: parseInt(tier) || 1,
          kyc_verified_at: status === 'verified' ? new Date().toISOString() : null
        })
        .eq('user_id', userId);

      if (error) throw error;

      await fetchUserProfiles();
      toast({
        title: "Success",
        description: "User verification status updated",
      });
    } catch (error: any) {
      console.error('Error updating user verification:', error);
      toast({
        title: "Error",
        description: "Failed to update verification status",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <X className="h-4 w-4 text-red-600" />;
      case 'in_review':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'in_review':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDocuments = kycDocuments.filter(doc => {
    const matchesSearch = doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc as any).user_profiles_enhanced?.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = userProfiles.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.kyc_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading admin tools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Admin Access:</strong> You have administrative privileges. Use these tools responsibly 
          to manage user verification and maintain platform security.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="kyc" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="kyc">KYC Review</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="settings">Admin Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="kyc" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                KYC Document Review
              </CardTitle>
              <CardDescription>
                Review and approve user verification documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by filename or user name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Documents List */}
              <div className="space-y-4">
                {filteredDocuments.map((doc) => (
                  <div key={doc.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-muted rounded-lg">
                          <FileCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">{doc.file_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {(doc as any).user_profiles_enhanced?.full_name} • {doc.document_type.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(doc.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(doc.status)}
                            {doc.status.replace('_', ' ').toUpperCase()}
                          </div>
                        </Badge>

                        {doc.status === 'pending' && (
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => approveKYCDocument(doc.id)}
                              disabled={processing === doc.id}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => rejectKYCDocument(doc.id, 'Document quality insufficient')}
                              disabled={processing === doc.id}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}

                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>

                    {doc.rejection_reason && (
                      <div className="mt-3 p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-800">
                          <strong>Rejection Reason:</strong> {doc.rejection_reason}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {filteredDocuments.length === 0 && (
                  <div className="text-center py-8">
                    <FileCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No documents found</p>
                    <p className="text-muted-foreground">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Try adjusting your search or filter criteria'
                        : 'No KYC documents to review at this time'
                      }
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage user accounts and verification status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by KYC status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Users List */}
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-muted rounded-lg">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">{user.full_name}</h4>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Joined {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <Badge className={getStatusColor(user.kyc_status)}>
                            {user.kyc_status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            Tier: {user.verification_tier}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Select 
                            onValueChange={(value) => {
                              const [status, tier] = value.split(':');
                              updateUserVerification(user.user_id, status, tier);
                            }}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Change status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="verified:standard">Verify (Standard)</SelectItem>
                              <SelectItem value="verified:premium">Verify (Premium)</SelectItem>
                              <SelectItem value="rejected:basic">Reject</SelectItem>
                              <SelectItem value="in_review:basic">Mark In Review</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredUsers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No users found</p>
                    <p className="text-muted-foreground">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Try adjusting your search or filter criteria'
                        : 'No users to manage at this time'
                      }
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Admin Settings
              </CardTitle>
              <CardDescription>
                Configure system settings and export data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Export All KYC Documents
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Export User Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Export Audit Logs
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">System Statistics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Users:</span>
                      <span className="font-medium">{userProfiles.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Verified Users:</span>
                      <span className="font-medium">
                        {userProfiles.filter(u => u.is_verified).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Pending KYC:</span>
                      <span className="font-medium">
                        {kycDocuments.filter(d => d.status === 'pending').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Rejected Documents:</span>
                      <span className="font-medium">
                        {kycDocuments.filter(d => d.status === 'rejected').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminTools;