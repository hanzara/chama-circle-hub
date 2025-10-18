import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Store, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Search,
  Filter,
  FileText,
  Phone,
  CreditCard,
  Building2
} from 'lucide-react';

interface Seller {
  id: string;
  portal_user_id: string;
  business_name: string | null;
  phone: string | null;
  kyc_status: 'pending' | 'approved' | 'rejected';
  kyc_docs: any;
  bank_details: any;
  mpesa_number: string | null;
  commission_rate: number;
  created_at: string;
  portal_users?: {
    username: string;
    email: string;
  };
}

export function AdminSellerVerification() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [filteredSellers, setFilteredSellers] = useState<Seller[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSellers();
  }, []);

  useEffect(() => {
    filterSellers();
  }, [sellers, searchTerm, statusFilter]);

  const fetchSellers = async () => {
    try {
      const { data, error } = await supabase
        .from('sellers')
        .select(`
          *,
          portal_users (
            username,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSellers((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching sellers:', error);
      toast({
        title: "Error",
        description: "Failed to load sellers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterSellers = () => {
    let filtered = sellers;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.kyc_status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone?.includes(searchTerm) ||
        s.portal_users?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.portal_users?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSellers(filtered);
  };

  const updateKYCStatus = async (sellerId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('sellers')
        .update({ kyc_status: newStatus })
        .eq('id', sellerId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Seller KYC ${newStatus === 'approved' ? 'approved' : 'rejected'} successfully`,
      });

      fetchSellers();
      setShowDetailsDialog(false);
    } catch (error: any) {
      console.error('Error updating KYC status:', error);
      toast({
        title: "Error",
        description: "Failed to update KYC status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'secondary' as const, icon: Clock, className: 'bg-yellow-100 text-yellow-800' },
      approved: { variant: 'default' as const, icon: CheckCircle, className: 'bg-green-100 text-green-800' },
      rejected: { variant: 'destructive' as const, icon: XCircle, className: 'bg-red-100 text-red-800' }
    };
    
    const config = variants[status as keyof typeof variants];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const stats = {
    total: sellers.length,
    pending: sellers.filter(s => s.kyc_status === 'pending').length,
    approved: sellers.filter(s => s.kyc_status === 'approved').length,
    rejected: sellers.filter(s => s.kyc_status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sellers</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Seller Verification Management
          </CardTitle>
          <CardDescription>Review and approve seller KYC applications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by business name, phone, username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)} className="w-auto">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Business</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Contact</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Username</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Commission</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSellers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        No sellers found
                      </td>
                    </tr>
                  ) : (
                    filteredSellers.map((seller) => (
                      <tr key={seller.id} className="border-t hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div className="font-medium">{seller.business_name || 'N/A'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">{seller.phone || 'N/A'}</div>
                          <div className="text-xs text-muted-foreground">{seller.portal_users?.email}</div>
                        </td>
                        <td className="px-4 py-3 text-sm">{seller.portal_users?.username || 'N/A'}</td>
                        <td className="px-4 py-3">{getStatusBadge(seller.kyc_status)}</td>
                        <td className="px-4 py-3 text-sm">{seller.commission_rate}%</td>
                        <td className="px-4 py-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedSeller(seller);
                              setShowDetailsDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Seller Details & KYC Review</DialogTitle>
            <DialogDescription>
              Review seller information and KYC documents
            </DialogDescription>
          </DialogHeader>

          {selectedSeller && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Store className="h-4 w-4" />
                    Business Information
                  </div>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Name:</span> {selectedSeller.business_name || 'N/A'}</p>
                    <p><span className="font-medium">Status:</span> {getStatusBadge(selectedSeller.kyc_status)}</p>
                    <p><span className="font-medium">Commission:</span> {selectedSeller.commission_rate}%</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Phone className="h-4 w-4" />
                    Contact Information
                  </div>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Phone:</span> {selectedSeller.phone || 'N/A'}</p>
                    <p><span className="font-medium">M-Pesa:</span> {selectedSeller.mpesa_number || 'N/A'}</p>
                    <p><span className="font-medium">Email:</span> {selectedSeller.portal_users?.email || 'N/A'}</p>
                  </div>
                </div>

                {selectedSeller.bank_details && Object.keys(selectedSeller.bank_details).length > 0 && (
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Building2 className="h-4 w-4" />
                      Bank Details
                    </div>
                    <div className="text-sm space-y-1">
                      <p><span className="font-medium">Bank:</span> {selectedSeller.bank_details.bank_name || 'N/A'}</p>
                      <p><span className="font-medium">Account:</span> {selectedSeller.bank_details.account_number || 'N/A'}</p>
                      <p><span className="font-medium">Account Name:</span> {selectedSeller.bank_details.account_name || 'N/A'}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="h-4 w-4" />
                    KYC Documents
                  </div>
                  {selectedSeller.kyc_docs && Object.keys(selectedSeller.kyc_docs).length > 0 ? (
                    <div className="grid gap-2">
                      {Object.entries(selectedSeller.kyc_docs).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // Handle document viewing
                              const url = `${supabase.storage.from('kyc-documents').getPublicUrl(value as string).data.publicUrl}`;
                              window.open(url, '_blank');
                            }}
                          >
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No documents uploaded</p>
                  )}
                </div>
              </div>

              {selectedSeller.kyc_status === 'pending' && (
                <DialogFooter className="gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => updateKYCStatus(selectedSeller.id, 'rejected')}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => updateKYCStatus(selectedSeller.id, 'approved')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}