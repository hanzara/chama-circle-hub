import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Truck, Zap, Home, Factory, Smartphone, 
  TrendingUp, Users, DollarSign, CheckCircle, 
  Clock, AlertTriangle, Star, Filter,
  Phone, Mail, MapPin, Calendar
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLogin from '@/components/AdminLogin';

interface Partner {
  id: string;
  name: string;
  category: string;
  logo: string;
  description: string;
  specialties: string[];
  rating: number;
  totalDeals: number;
  successRate: number;
  avgProcessingTime: string;
  contactEmail: string;
  contactPhone: string;
  location: string;
}

interface AssetRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  assetType: string;
  assetValue: number;
  requestedAmount: number;
  partnerId: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  priority: 'low' | 'medium' | 'high';
  submittedDate: string;
  description: string;
  documents: string[];
  creditScore: number;
}

const partners: Partner[] = [
  {
    id: 'sunking',
    name: 'SunKing Solar',
    category: 'Solar Energy',
    logo: '☀️',
    description: 'Leading solar energy solutions provider across East Africa',
    specialties: ['Home Solar Systems', 'Commercial Solar', 'Solar Appliances', 'Off-grid Solutions'],
    rating: 4.8,
    totalDeals: 2543,
    successRate: 94,
    avgProcessingTime: '2-3 days',
    contactEmail: 'partnerships@sunking.com',
    contactPhone: '+254 700 123 456',
    location: 'Nairobi, Kenya'
  },
  {
    id: 'dlight',
    name: 'd.light Solar',
    category: 'Solar Energy',
    logo: '🔆',
    description: 'Global solar energy company serving off-grid communities',
    specialties: ['Pay-as-you-go Solar', 'Solar Home Systems', 'Solar Appliances', 'Rural Electrification'],
    rating: 4.7,
    totalDeals: 1876,
    successRate: 91,
    avgProcessingTime: '1-2 days',
    contactEmail: 'kenya@dlight.com',
    contactPhone: '+254 700 789 012',
    location: 'Nairobi, Kenya'
  },
  {
    id: 'watu',
    name: 'Watu Credit',
    category: 'Motorcycle Financing',
    logo: '🏍️',
    description: 'Digital asset financing platform specializing in motorcycle loans',
    specialties: ['Motorcycle Financing', 'Asset Tracking', 'Flexible Payments', 'Insurance Coverage'],
    rating: 4.6,
    totalDeals: 3421,
    successRate: 88,
    avgProcessingTime: '24 hours',
    contactEmail: 'partners@watu.credit',
    contactPhone: '+254 700 345 678',
    location: 'Nairobi, Kenya'
  },
  {
    id: 'mogo',
    name: 'Mogo Auto',
    category: 'Vehicle Financing',
    logo: '🚗',
    description: 'Auto financing solutions for cars, motorcycles, and commercial vehicles',
    specialties: ['Car Loans', 'Motorcycle Loans', 'Commercial Vehicles', 'Asset Insurance'],
    rating: 4.5,
    totalDeals: 2198,
    successRate: 85,
    avgProcessingTime: '3-5 days',
    contactEmail: 'business@mogo.auto',
    contactPhone: '+254 700 567 890',
    location: 'Nairobi, Kenya'
  },
  {
    id: 'safaricom',
    name: 'Safaricom Device Financing',
    category: 'Technology',
    logo: '📱',
    description: 'Leading telecommunications provider offering device financing solutions',
    specialties: ['Smartphone Financing', 'Device Insurance', 'Data Bundles', 'M-Pesa Integration'],
    rating: 4.9,
    totalDeals: 4567,
    successRate: 96,
    avgProcessingTime: '1 hour',
    contactEmail: 'devicefinance@safaricom.co.ke',
    contactPhone: '+254 700 000 000',
    location: 'Nairobi, Kenya'
  },
  {
    id: 'equity',
    name: 'Equity Bank Equipment Finance',
    category: 'Equipment Financing',
    logo: '🏦',
    description: 'Comprehensive equipment financing solutions for businesses',
    specialties: ['Agricultural Equipment', 'Manufacturing Equipment', 'Medical Equipment', 'Construction Equipment'],
    rating: 4.4,
    totalDeals: 1654,
    successRate: 82,
    avgProcessingTime: '7-10 days',
    contactEmail: 'equipment@equitybank.co.ke',
    contactPhone: '+254 763 063 000',
    location: 'Nairobi, Kenya'
  }
];

const mockRequests: AssetRequest[] = [
  {
    id: 'REQ001',
    customerName: 'John Kamau',
    customerPhone: '+254 722 123 456',
    customerEmail: 'john.kamau@email.com',
    assetType: 'Solar Home System',
    assetValue: 65000,
    requestedAmount: 55000,
    partnerId: 'sunking',
    status: 'pending',
    priority: 'high',
    submittedDate: '2024-01-25',
    description: '5kW solar system for rural home with battery backup',
    documents: ['ID Copy', 'Income Statement', 'Property Documents'],
    creditScore: 720
  },
  {
    id: 'REQ002',
    customerName: 'Mary Wanjiku',
    customerPhone: '+254 733 987 654',
    customerEmail: 'mary.wanjiku@email.com',
    assetType: 'Delivery Motorcycle',
    assetValue: 180000,
    requestedAmount: 160000,
    partnerId: 'watu',
    status: 'processing',
    priority: 'medium',
    submittedDate: '2024-01-24',
    description: 'Honda motorcycle for delivery business startup',
    documents: ['ID Copy', 'Business Permit', 'Bank Statements'],
    creditScore: 680
  },
  {
    id: 'REQ003',
    customerName: 'Peter Ochieng',
    customerPhone: '+254 744 555 777',
    customerEmail: 'peter.ochieng@email.com',
    assetType: 'Smartphone',
    assetValue: 35000,
    requestedAmount: 28000,
    partnerId: 'safaricom',
    status: 'approved',
    priority: 'low',
    submittedDate: '2024-01-23',
    description: 'iPhone 13 for business communication',
    documents: ['ID Copy', 'Payslip'],
    creditScore: 650
  },
  {
    id: 'REQ004',
    customerName: 'Grace Muthoni',
    customerPhone: '+254 755 321 987',
    customerEmail: 'grace.muthoni@email.com',
    assetType: 'Pay-as-you-go Solar',
    assetValue: 25000,
    requestedAmount: 20000,
    partnerId: 'dlight',
    status: 'completed',
    priority: 'medium',
    submittedDate: '2024-01-22',
    description: 'Basic solar kit for small household',
    documents: ['ID Copy', 'Residence Proof'],
    creditScore: 590
  },
  {
    id: 'REQ005',
    customerName: 'Samuel Kiprotich',
    customerPhone: '+254 766 444 888',
    customerEmail: 'samuel.kiprotich@email.com',
    assetType: 'Used Car',
    assetValue: 850000,
    requestedAmount: 750000,
    partnerId: 'mogo',
    status: 'pending',
    priority: 'high',
    submittedDate: '2024-01-25',
    description: 'Toyota Probox for taxi business',
    documents: ['ID Copy', 'Driver\'s License', 'PSV License', 'Bank Statements'],
    creditScore: 740
  }
];

const PartnerDashboardPage: React.FC = () => {
  const { toast } = useToast();
  const [selectedPartner, setSelectedPartner] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const filteredRequests = mockRequests.filter(request => {
    const partnerMatch = selectedPartner === 'all' || request.partnerId === selectedPartner;
    const statusMatch = statusFilter === 'all' || request.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || request.priority === priorityFilter;
    return partnerMatch && statusMatch && priorityMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleRequestAction = (requestId: string, action: string) => {
    toast({
      title: `Request ${action}`,
      description: `Request ${requestId} has been ${action.toLowerCase()}`,
    });
  };

  const getPartnerById = (partnerId: string) => {
    return partners.find(p => p.id === partnerId);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} type="admin" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Partner Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage asset financing requests and partner relationships
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="requests">Asset Requests</TabsTrigger>
            <TabsTrigger value="partners">Partners</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">23</div>
                  <p className="text-xs text-muted-foreground">Requires attention</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <CurrencyDisplay amount={12500000} className="text-2xl font-bold" />
                  <p className="text-xs text-muted-foreground">Financing volume</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">89%</div>
                  <p className="text-xs text-muted-foreground">Approval rate</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Requests */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Recent Asset Requests</CardTitle>
                <CardDescription>Latest requests from customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRequests.slice(0, 5).map((request) => {
                    const partner = getPartnerById(request.partnerId);
                    return (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">{partner?.logo}</div>
                          <div>
                            <h4 className="font-medium">{request.customerName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {request.assetType} • <CurrencyDisplay amount={request.requestedAmount} showToggle={false} />
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(request.priority)}>
                            {request.priority}
                          </Badge>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            {/* Filters */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Partner</label>
                    <Select value={selectedPartner} onValueChange={setSelectedPartner}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select partner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Partners</SelectItem>
                        {partners.map((partner) => (
                          <SelectItem key={partner.id} value={partner.id}>
                            {partner.logo} {partner.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Priority</label>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requests List */}
            <div className="grid gap-4">
              {filteredRequests.map((request) => {
                const partner = getPartnerById(request.partnerId);
                return (
                  <Card key={request.id} className="border-0 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-3xl">{partner?.logo}</div>
                          <div>
                            <CardTitle className="text-lg">{request.customerName}</CardTitle>
                            <CardDescription>
                              {request.assetType} via {partner?.name}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(request.priority)}>
                            {request.priority}
                          </Badge>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Asset Value:</span>
                            <CurrencyDisplay amount={request.assetValue} showToggle={false} className="font-medium" />
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Requested Amount:</span>
                            <CurrencyDisplay amount={request.requestedAmount} showToggle={false} className="font-medium" />
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Credit Score:</span>
                            <span className="font-medium">{request.creditScore}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Phone:</span>
                            <span className="font-medium">{request.customerPhone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Email:</span>
                            <span className="font-medium text-sm">{request.customerEmail}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Submitted:</span>
                            <span className="font-medium">{request.submittedDate}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">Description:</p>
                        <p className="text-sm">{request.description}</p>
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">Documents:</p>
                        <div className="flex flex-wrap gap-1">
                          {request.documents.map((doc, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {doc}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {request.status === 'pending' && (
                        <div className="flex gap-2 mt-4">
                          <Button 
                            size="sm" 
                            onClick={() => handleRequestAction(request.id, 'Approved')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRequestAction(request.id, 'Processing')}
                          >
                            Mark Processing
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleRequestAction(request.id, 'Rejected')}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="partners" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {partners.map((partner) => (
                <Card key={partner.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-2">
                      <div className="text-4xl">{partner.logo}</div>
                      <div>
                        <CardTitle className="text-xl">{partner.name}</CardTitle>
                        <Badge variant="secondary">{partner.category}</Badge>
                      </div>
                    </div>
                    <CardDescription>{partner.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{partner.rating}/5.0</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{partner.successRate}% success</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <span>{partner.totalDeals} deals</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span>{partner.avgProcessingTime}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Specialties:</h4>
                      <div className="flex flex-wrap gap-1">
                        {partner.specialties.map((specialty, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">{partner.contactEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">{partner.contactPhone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">{partner.location}</span>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      View Partnership Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Solar Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Vehicle Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">67</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Tech Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">32</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Equipment Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Request Trends</CardTitle>
                <CardDescription>Asset financing request patterns over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Analytics charts would be implemented here with actual data
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PartnerDashboardPage;