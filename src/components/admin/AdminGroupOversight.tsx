
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Eye, 
  CheckCircle, 
  AlertTriangle,
  Ban,
  Search,
  Filter
} from 'lucide-react';

const AdminGroupOversight: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

  const chamas = [
    {
      id: '1',
      name: 'Makini Self Help Group',
      admin: 'Joseph Nzai',
      members: 25,
      maxMembers: 30,
      totalSavings: 2400000,
      monthlyContribution: 5000,
      contributionFrequency: 'monthly',
      status: 'active',
      verified: true,
      region: 'Kilifi',
      createdDate: '2024-01-15',
      creditScore: 825,
      loanActivity: 12,
      riskLevel: 'low'
    },
    {
      id: '2',
      name: 'Women Empowerment Chama',
      admin: 'Mary Wanjiku',
      members: 18,
      maxMembers: 25,
      totalSavings: 1800000,
      monthlyContribution: 3000,
      contributionFrequency: 'monthly',
      status: 'active',
      verified: true,
      region: 'Mombasa',
      createdDate: '2024-02-20',
      creditScore: 780,
      loanActivity: 8,
      riskLevel: 'low'
    },
    {
      id: '3',
      name: 'Suspicious Group',
      admin: 'Unknown User',
      members: 5,
      maxMembers: 50,
      totalSavings: 50000,
      monthlyContribution: 10000,
      contributionFrequency: 'weekly',
      status: 'flagged',
      verified: false,
      region: 'Kisumu',
      createdDate: '2024-07-10',
      creditScore: 420,
      loanActivity: 0,
      riskLevel: 'high'
    }
  ];

  const filteredChamas = chamas.filter(chama => {
    const matchesSearch = chama.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chama.admin.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || chama.status === statusFilter;
    const matchesRegion = regionFilter === 'all' || chama.region === regionFilter;
    
    return matchesSearch && matchesStatus && matchesRegion;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'flagged':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Flagged</Badge>;
      case 'suspended':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Suspended</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Low Risk</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium Risk</Badge>;
      case 'high':
        return <Badge className="bg-red-100 text-red-800 border-red-200">High Risk</Badge>;
      default:
        return <Badge variant="outline">{risk}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Chama Group Oversight
          </CardTitle>
          <CardDescription>
            Monitor all chamas: member activity, savings balance, and loan performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search chamas by name or admin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>

              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="Nairobi">Nairobi</SelectItem>
                  <SelectItem value="Mombasa">Mombasa</SelectItem>
                  <SelectItem value="Kisumu">Kisumu</SelectItem>
                  <SelectItem value="Nakuru">Nakuru</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chamas List */}
      <div className="space-y-4">
        {filteredChamas.map((chama) => (
          <Card key={chama.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                      {chama.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{chama.name}</h3>
                      <p className="text-sm text-muted-foreground">Admin: {chama.admin}</p>
                    </div>
                  </div>

                  {/* Status and Verification Badges */}
                  <div className="flex items-center gap-2 mb-4">
                    {getStatusBadge(chama.status)}
                    {getRiskBadge(chama.riskLevel)}
                    {chama.verified ? (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                        Unverified
                      </Badge>
                    )}
                  </div>

                  {/* Chama Stats */}
                  <div className="grid gap-4 md:grid-cols-6 mb-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Members</p>
                      <p className="font-semibold">{chama.members}/{chama.maxMembers}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Savings</p>
                      <p className="font-semibold text-green-600">KES {(chama.totalSavings / 1000000).toFixed(1)}M</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Contribution</p>
                      <p className="font-semibold">KES {chama.monthlyContribution.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Credit Score</p>
                      <p className={`font-semibold ${chama.creditScore >= 700 ? 'text-green-600' : chama.creditScore >= 600 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {chama.creditScore}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Loan Activity</p>
                      <p className="font-semibold">{chama.loanActivity} loans</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Region</p>
                      <p className="font-semibold">{chama.region}</p>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Created: {chama.createdDate} • {chama.contributionFrequency} contributions
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  
                  {!chama.verified && (
                    <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Verify
                    </Button>
                  )}
                  
                  {chama.status === 'flagged' && (
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Investigate
                    </Button>
                  )}
                  
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Ban className="h-4 w-4 mr-1" />
                    Suspend
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Chamas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chamas.length}</div>
            <p className="text-xs text-muted-foreground">Platform-wide</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chamas.reduce((sum, chama) => sum + chama.members, 0)}</div>
            <p className="text-xs text-muted-foreground">Total members</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KES {(chamas.reduce((sum, chama) => sum + chama.totalSavings, 0) / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">Combined savings</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Groups</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {chamas.filter(c => c.status === 'flagged').length}
            </div>
            <p className="text-xs text-muted-foreground">Need review</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminGroupOversight;
