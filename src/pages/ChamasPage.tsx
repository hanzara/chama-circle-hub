import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from 'react-router-dom';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import Navigation from '@/components/Navigation';
import { useChamas, useCreateChama } from '@/hooks/useChamas';

const ChamasPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newChama, setNewChama] = useState({
    name: '',
    description: '',
    contributionAmount: '',
    contributionFrequency: 'monthly',
    maxMembers: '20'
  });

  const { data: myChamas, isLoading } = useChamas();
  const createChamaMutation = useCreateChama();

  const handleCreateChama = () => {
    if (!newChama.name || !newChama.contributionAmount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createChamaMutation.mutate({
      name: newChama.name,
      description: newChama.description,
      contribution_amount: parseInt(newChama.contributionAmount),
      contribution_frequency: newChama.contributionFrequency,
      max_members: parseInt(newChama.maxMembers),
    });

    setNewChama({
      name: '',
      description: '',
      contributionAmount: '',
      contributionFrequency: 'monthly',
      maxMembers: '20'
    });
    setShowCreateForm(false);
  };

  const handleJoinChama = (chamaId: string, chamaName: string) => {
    toast({
      title: "Join Request Sent",
      description: `Your request to join ${chamaName} has been sent`,
    });
  };

  const handleViewDetails = (chamaId: string) => {
    navigate(`/chama/${chamaId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Digital Chamas
          </h1>
          <Button 
            onClick={() => setShowCreateForm(true)} 
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
          >
            <Plus className="h-4 w-4" />
            Create Chama
          </Button>
        </div>

        <Tabs defaultValue="my-chamas" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="my-chamas">My Chamas</TabsTrigger>
            <TabsTrigger value="available">Available Chamas</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="my-chamas" className="space-y-4">
            {showCreateForm && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Create New Chama</CardTitle>
                  <CardDescription>
                    Set up a new savings group with your friends or community
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Chama Name *</Label>
                    <Input
                      id="name"
                      value={newChama.name}
                      onChange={(e) => setNewChama({...newChama, name: e.target.value})}
                      placeholder="Enter chama name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newChama.description}
                      onChange={(e) => setNewChama({...newChama, description: e.target.value})}
                      placeholder="What is this chama for?"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">Contribution Amount (KES) *</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={newChama.contributionAmount}
                        onChange={(e) => setNewChama({...newChama, contributionAmount: e.target.value})}
                        placeholder="5000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="frequency">Frequency</Label>
                      <select
                        id="frequency"
                        value={newChama.contributionFrequency}
                        onChange={(e) => setNewChama({...newChama, contributionFrequency: e.target.value})}
                        className="w-full p-2 border rounded-md bg-background"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="maxMembers">Maximum Members</Label>
                    <Input
                      id="maxMembers"
                      type="number"
                      value={newChama.maxMembers}
                      onChange={(e) => setNewChama({...newChama, maxMembers: e.target.value})}
                      placeholder="20"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateChama} className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                      Create Chama
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="grid grid-cols-4 gap-4">
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-4">
                {myChamas && myChamas.length > 0 ? (
                  myChamas.map((chama) => (
                    <Card key={chama.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {chama.name}
                              <Badge variant="default">
                                Admin
                              </Badge>
                            </CardTitle>
                            <CardDescription>{chama.description}</CardDescription>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewDetails(chama.id)}
                          >
                            View Details
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {chama.current_members}/{chama.max_members} members
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <CurrencyDisplay amount={chama.contribution_amount} showToggle={false} className="text-sm" />
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <CurrencyDisplay amount={chama.total_savings || 0} showToggle={false} className="text-sm" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm capitalize">{chama.contribution_frequency}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-8 text-center">
                      <h3 className="text-lg font-medium mb-2">No Chamas Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Create your first chama to start saving with friends and family.
                      </p>
                      <Button 
                        onClick={() => setShowCreateForm(true)}
                        className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Chama
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="available" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Available Chamas</CardTitle>
                <CardDescription>
                  Browse and join chamas that match your interests and financial goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium mb-2">Discover Perfect Chamas for You</h3>
                  <p className="text-muted-foreground mb-4">
                    From 5-member starter groups to 50-member business networks, find the right fit for your savings journey.
                  </p>
                  <Button 
                    onClick={() => navigate('/available-chamas')}
                    className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                  >
                    Browse Available Chamas
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discover" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Discover Chamas</CardTitle>
                <CardDescription>
                  Find and join existing chamas in your area
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { id: '3', name: 'Tech Entrepreneurs Chama', members: 15, maxMembers: 25, contribution: 10000 },
                    { id: '4', name: 'Women in Business', members: 20, maxMembers: 30, contribution: 7500 },
                    { id: '5', name: 'Youth Development Fund', members: 8, maxMembers: 20, contribution: 2500 }
                  ].map((chama) => (
                    <div key={chama.id} className="flex items-center justify-between p-4 border rounded-lg bg-white/50 hover:bg-white/80 transition-colors">
                      <div>
                        <h3 className="font-medium">{chama.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {chama.members}/{chama.maxMembers} members • 
                          <CurrencyDisplay amount={chama.contribution} showToggle={false} className="ml-1" />
                        </p>
                      </div>
                      <Button onClick={() => handleJoinChama(chama.id, chama.name)} className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                        Request to Join
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <CurrencyDisplay amount={336000} className="text-2xl font-bold" />
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Chamas</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2</div>
                  <p className="text-xs text-muted-foreground">
                    Both performing well
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Next Contribution</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Jan 12</div>
                  <p className="text-xs text-muted-foreground">
                    School Fees Chama
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ChamasPage;
