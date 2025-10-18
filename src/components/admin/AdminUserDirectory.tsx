
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Users, 
  Building2, 
  Eye, 
  Ban, 
  CheckCircle, 
  Mail,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';

const AdminUserDirectory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data - replace with actual API calls
  const users = [
    {
      id: '1',
      name: 'Joseph Nzai',
      email: 'joseph.nzai@email.com',
      phone: '+254705448355',
      status: 'active',
      chamasCount: 3,
      totalContributions: 150000,
      creditScore: 785,
      joinDate: '2024-01-15',
      location: 'Kilifi, Kenya',
      verified: true
    },
    {
      id: '2', 
      name: 'Mary Wanjiku',
      email: 'mary.wanjiku@email.com',
      phone: '+254702345678',
      status: 'active',
      chamasCount: 2,
      totalContributions: 95000,
      creditScore: 720,
      joinDate: '2024-02-20',
      location: 'Mombasa, Kenya',
      verified: true
    },
    {
      id: '3',
      name: 'Peter Otieno',
      email: 'peter.otieno@email.com',
      phone: '+254703456789',
      status: 'suspended',
      chamasCount: 1,
      totalContributions: 25000,
      creditScore: 550,
      joinDate: '2024-03-10',
      location: 'Kisumu, Kenya', 
      verified: false
    }
  ];

  const chamas = [
    {
      id: '1',
      name: 'Makini Self Help Group',
      members: 25,
      totalSavings: 2400000,
      status: 'active',
      createdDate: '2024-01-01',
      region: 'Kilifi',
      verified: true
    },
    {
      id: '2',
      name: 'Women Empowerment Chama',
      members: 18,
      totalSavings: 1800000,
      status: 'active', 
      createdDate: '2024-02-15',
      region: 'Mombasa',
      verified: true
    },
    {
      id: '3',
      name: 'Youth Business Fund',
      members: 12,
      totalSavings: 800000,
      status: 'pending',
      createdDate: '2024-03-20',
      region: 'Kisumu',
      verified: false
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredChamas = chamas.filter(chama => {
    const matchesSearch = chama.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || chama.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            User & Group Directory
          </CardTitle>
          <CardDescription>
            Search, filter, and manage all platform users and groups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search users, groups, emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('active')}
                size="sm"
              >
                Active
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('pending')}
                size="sm"
              >
                Pending
              </Button>
              <Button
                variant={filterStatus === 'suspended' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('suspended')}
                size="sm"
              >
                Suspended
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur-sm">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users ({filteredUsers.length})
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Groups ({filteredChamas.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{user.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={user.status === 'active' ? 'default' : user.status === 'suspended' ? 'destructive' : 'secondary'}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Badge>
                        {user.verified && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Chamas: </span>
                        {user.chamasCount}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Credit Score: </span>
                        <span className={user.creditScore >= 700 ? 'text-green-600' : user.creditScore >= 600 ? 'text-yellow-600' : 'text-red-600'}>
                          {user.creditScore}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Contributions: </span>
                        KES {user.totalContributions.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {user.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Joined {user.joinDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Ban className="h-4 w-4 mr-1" />
                      {user.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          {filteredChamas.map((chama) => (
            <Card key={chama.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                        {chama.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{chama.name}</h3>
                        <p className="text-sm text-muted-foreground">{chama.region}</p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={chama.status === 'active' ? 'default' : 'secondary'}>
                          {chama.status.charAt(0).toUpperCase() + chama.status.slice(1)}
                        </Badge>
                        {chama.verified && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Members: </span>
                        {chama.members}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Total Savings: </span>
                        KES {(chama.totalSavings / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Created: </span>
                        {chama.createdDate}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {chama.verified ? 'Verified' : 'Verify'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminUserDirectory;
