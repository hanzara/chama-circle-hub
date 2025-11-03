import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target,
  Crown,
  Zap,
  Calendar,
  BarChart3,
  PieChart,
  Settings,
  Lightbulb
} from 'lucide-react';
import CurrencyDisplay from "@/components/CurrencyDisplay";

export const RevenueOptimizationDashboard: React.FC = () => {
  // Mock data - would come from analytics in real implementation
  const revenueMetrics = {
    totalDailyRevenue: 127850,
    totalDailyPrizePayout: 89495,
    netProfit: 38355,
    profitMargin: 30.0,
    activeGames: 15,
    totalPlayers: 742,
    averageEntryFee: 45,
    playerRetention: 68,
    conversionRate: 23.5,
    
    gameTypePerformance: [
      { 
        type: 'Tournament', 
        revenue: 45600, 
        players: 234, 
        profitMargin: 35,
        averageRevPerUser: 195,
        engagement: 'High' 
      },
      { 
        type: 'Predictions', 
        revenue: 38200, 
        players: 189, 
        profitMargin: 28,
        averageRevPerUser: 202,
        engagement: 'Medium' 
      },
      { 
        type: 'Learning', 
        revenue: 22400, 
        players: 156, 
        profitMargin: 42,
        averageRevPerUser: 144,
        engagement: 'High' 
      },
      { 
        type: 'Live Competitions', 
        revenue: 21650, 
        players: 163, 
        profitMargin: 25,
        averageRevPerUser: 133,
        engagement: 'Very High' 
      }
    ],
    
    hourlyData: [
      { hour: '08:00', revenue: 3400, players: 45 },
      { hour: '12:00', revenue: 8900, players: 89 },
      { hour: '16:00', revenue: 15600, players: 134 },
      { hour: '19:00', revenue: 18200, players: 167 },
      { hour: '21:00', revenue: 12800, players: 98 },
      { hour: '23:00', revenue: 7200, players: 56 }
    ],
    
    optimizationOpportunities: [
      {
        title: "Peak Hour Dynamic Pricing",
        description: "Increase entry fees by 20% during 7-9 PM peak hours",
        potentialRevenue: 15600,
        difficulty: "Easy",
        impact: "High"
      },
      {
        title: "Tournament Frequency Increase",
        description: "Add weekend premium tournaments with higher entry fees",
        potentialRevenue: 28000,
        difficulty: "Medium",
        impact: "Very High"
      },
      {
        title: "Referral Program Enhancement",
        description: "Implement gaming-specific referral bonuses",
        potentialRevenue: 12400,
        difficulty: "Easy",
        impact: "Medium"
      },
      {
        title: "VIP Gaming Tier",
        description: "Create premium gaming experience for high-value players",
        potentialRevenue: 35000,
        difficulty: "Hard",
        impact: "Very High"
      },
      {
        title: "Cross-Sell to Chama Members",
        description: "Promote gaming challenges within chama groups",
        potentialRevenue: 18900,
        difficulty: "Medium",
        impact: "High"
      }
    ]
  };

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case 'Very High': return 'bg-green-500';
      case 'High': return 'bg-blue-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Very High': return 'text-purple-600 bg-purple-100';
      case 'High': return 'text-blue-600 bg-blue-100';
      case 'Medium': return 'text-green-600 bg-green-100';
      case 'Low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          💰 Gaming Revenue Optimization
        </h1>
        <p className="text-gray-600">
          Maximize your gaming platform profitability with data-driven insights
        </p>
      </div>

      {/* Revenue Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              <CurrencyDisplay amount={revenueMetrics.totalDailyRevenue} showToggle={false} />
            </div>
            <p className="text-xs text-green-600">+12% from yesterday</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              <CurrencyDisplay amount={revenueMetrics.netProfit} showToggle={false} />
            </div>
            <p className="text-xs text-blue-600">{revenueMetrics.profitMargin}% margin</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Players</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{revenueMetrics.totalPlayers}</div>
            <p className="text-xs text-purple-600">Playing today</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Entry Fee</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">
              <CurrencyDisplay amount={revenueMetrics.averageEntryFee} showToggle={false} />
            </div>
            <p className="text-xs text-orange-600">Per game session</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance Analytics</TabsTrigger>
          <TabsTrigger value="optimization">Optimization Opportunities</TabsTrigger>
          <TabsTrigger value="settings">Revenue Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          {/* Game Type Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Game Type Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueMetrics.gameTypePerformance.map((game, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{game.type}</span>
                        <Badge variant="outline">{game.players} players</Badge>
                        <div className={`w-2 h-2 rounded-full ${getEngagementColor(game.engagement)}`} />
                        <span className="text-xs text-gray-500">{game.engagement} Engagement</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          <CurrencyDisplay amount={game.revenue} showToggle={false} />
                        </div>
                        <div className="text-xs text-gray-500">{game.profitMargin}% margin</div>
                      </div>
                    </div>
                    <Progress value={(game.revenue / revenueMetrics.totalDailyRevenue) * 100} className="h-2" />
                    <div className="text-xs text-gray-600">
                      Average Revenue per User: <CurrencyDisplay amount={game.averageRevPerUser} showToggle={false} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Peak Hours Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Peak Hours Revenue Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {revenueMetrics.hourlyData.map((hour, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="font-medium w-16">{hour.hour}</span>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{hour.players} players</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        <CurrencyDisplay amount={hour.revenue} showToggle={false} />
                      </div>
                      <div className="text-xs text-gray-500">
                        <CurrencyDisplay amount={Math.round(hour.revenue / hour.players)} showToggle={false} /> per player
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Revenue Optimization Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueMetrics.optimizationOpportunities.map((opportunity, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{opportunity.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{opportunity.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-600">
                            +<CurrencyDisplay amount={opportunity.potentialRevenue} showToggle={false} />
                          </div>
                          <div className="text-xs text-gray-500">potential monthly</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-3">
                        <Badge className={getDifficultyColor(opportunity.difficulty)}>
                          {opportunity.difficulty}
                        </Badge>
                        <Badge className={getImpactColor(opportunity.impact)}>
                          {opportunity.impact} Impact
                        </Badge>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500">
                          Implement
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Game Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Minimum Entry Fee</span>
                  <div className="flex items-center gap-2">
                    <CurrencyDisplay amount={10} showToggle={false} />
                    <Button size="sm" variant="outline">Edit</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Maximum Prize Pool</span>
                  <div className="flex items-center gap-2">
                    <CurrencyDisplay amount={100000} showToggle={false} />
                    <Button size="sm" variant="outline">Edit</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">House Edge Range</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">12% - 35%</span>
                    <Button size="sm" variant="outline">Edit</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tournament Frequency</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Daily</span>
                    <Button size="sm" variant="outline">Edit</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Revenue Targets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Daily Revenue Target</span>
                    <span className="font-medium">
                      <CurrencyDisplay amount={150000} showToggle={false} />
                    </span>
                  </div>
                  <Progress value={85} className="h-2" />
                  <div className="text-xs text-gray-500">85% achieved today</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Monthly Revenue Target</span>
                    <span className="font-medium">
                      <CurrencyDisplay amount={4500000} showToggle={false} />
                    </span>
                  </div>
                  <Progress value={72} className="h-2" />
                  <div className="text-xs text-gray-500">72% achieved this month</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Profit Margin Target</span>
                    <span className="font-medium">35%</span>
                  </div>
                  <Progress value={86} className="h-2" />
                  <div className="text-xs text-gray-500">Current: 30% (86% of target)</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};