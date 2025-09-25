import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Target,
  PieChart,
  BarChart3,
  Calculator,
  Crown
} from 'lucide-react';

const HouseAnalytics: React.FC = () => {
  const houseStats = {
    totalRevenue: 67845,
    totalPrizes: 45230,
    netProfit: 22615,
    profitMargin: 33.3,
    activeGames: 12,
    totalPlayers: 493,
    averageEntryFee: 32,
    payoutRatio: 66.7,
    categoryPerformance: [
      { name: 'General Knowledge', revenue: 15240, players: 203, profitMargin: 25 },
      { name: 'Finance & Investment', revenue: 18960, players: 89, profitMargin: 15 },
      { name: 'Business & Economics', revenue: 16750, players: 67, profitMargin: 20 },
      { name: 'Technology', revenue: 12690, players: 134, profitMargin: 12 },
      { name: 'Premium Challenge', revenue: 4205, players: 23, profitMargin: 30 }
    ],
    hourlyRevenue: [
      { hour: '9:00', revenue: 2340 },
      { hour: '12:00', revenue: 4560 },
      { hour: '15:00', revenue: 8920 },
      { hour: '18:00', revenue: 6750 },
      { hour: '21:00', revenue: 5430 }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">KSh {houseStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-green-600">Today's income</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">KSh {houseStats.netProfit.toLocaleString()}</div>
            <p className="text-xs text-blue-600">{houseStats.profitMargin}% margin</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Players</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{houseStats.totalPlayers}</div>
            <p className="text-xs text-purple-600">Playing today</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payout Ratio</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{houseStats.payoutRatio}%</div>
            <p className="text-xs text-orange-600">Of revenue paid out</p>
          </CardContent>
        </Card>
      </div>

      {/* Profit Breakdown */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Profit Breakdown
          </CardTitle>
          <CardDescription>Revenue vs Prizes paid out today</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Revenue</span>
            <span className="font-bold text-green-600">KSh {houseStats.totalRevenue.toLocaleString()}</span>
          </div>
          <Progress value={100} className="h-3 bg-gray-200" />
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Prizes Paid</span>
            <span className="font-bold text-red-600">-KSh {houseStats.totalPrizes.toLocaleString()}</span>
          </div>
          <Progress value={houseStats.payoutRatio} className="h-3" />
          
          <div className="flex items-center justify-between border-t pt-2">
            <span className="text-sm font-semibold">House Profit</span>
            <span className="font-bold text-green-700">KSh {houseStats.netProfit.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Category Performance */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Category Performance
          </CardTitle>
          <CardDescription>Revenue and profit margins by game category</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {houseStats.categoryPerformance.map((category, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{category.name}</span>
                  <Badge variant="secondary">{category.players} players</Badge>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">KSh {category.revenue.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{category.profitMargin}% margin</div>
                </div>
              </div>
              <Progress value={(category.revenue / houseStats.totalRevenue) * 100} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Revenue Optimization Tips */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-600" />
            Revenue Optimization
          </CardTitle>
          <CardDescription>Tips to maximize profitability</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-white rounded-lg border">
            <h4 className="font-semibold text-sm mb-1">🎯 Increase Premium Games</h4>
            <p className="text-xs text-gray-600">Premium games have 30% profit margin vs 12-25% for regular games</p>
          </div>
          
          <div className="p-3 bg-white rounded-lg border">
            <h4 className="font-semibold text-sm mb-1">⚡ Optimize Difficulty</h4>
            <p className="text-xs text-gray-600">Harder questions = lower win rates = higher house edge</p>
          </div>
          
          <div className="p-3 bg-white rounded-lg border">
            <h4 className="font-semibold text-sm mb-1">💰 Dynamic Pricing</h4>
            <p className="text-xs text-gray-600">Increase entry fees during peak hours (3PM-9PM)</p>
          </div>
          
          <div className="p-3 bg-white rounded-lg border">
            <h4 className="font-semibold text-sm mb-1">🎁 Bonus Games</h4>
            <p className="text-xs text-gray-600">Special events with higher entry fees but attractive marketing</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Game Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Minimum Entry Fee</span>
              <Badge>KSh 10</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Maximum Prize Multiplier</span>
              <Badge>4x</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">House Edge Range</span>
              <Badge>12% - 30%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Today's Highlights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Best Performing Category</span>
              <Badge variant="default">Finance</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Peak Revenue Hour</span>
              <Badge variant="secondary">3:00 PM</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Average Game Duration</span>
              <Badge variant="outline">3.5 min</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HouseAnalytics;