
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Medal, 
  Crown, 
  Star,
  TrendingUp,
  Users,
  Target,
  Calendar
} from 'lucide-react';

const GameLeaderboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  const leaderboardData = {
    today: [
      { rank: 1, name: "Alex M.", email: "alex@example.com", points: 4850, earnings: 485, games: 6, winRate: 95 },
      { rank: 2, name: "Sarah K.", email: "sarah@example.com", points: 4200, earnings: 420, games: 5, winRate: 88 },
      { rank: 3, name: "John D.", email: "john@example.com", points: 3900, earnings: 390, games: 7, winRate: 82 },
      { rank: 4, name: "Mary L.", email: "mary@example.com", points: 3650, earnings: 365, games: 4, winRate: 90 },
      { rank: 5, name: "David R.", email: "david@example.com", points: 3400, earnings: 340, games: 6, winRate: 78 },
      { rank: 6, name: "Lisa P.", email: "lisa@example.com", points: 3200, earnings: 320, games: 5, winRate: 85 },
      { rank: 7, name: "Mike W.", email: "mike@example.com", points: 2950, earnings: 295, games: 4, winRate: 75 },
      { rank: 8, name: "Anna B.", email: "anna@example.com", points: 2800, earnings: 280, games: 3, winRate: 92 },
      { rank: 9, name: "Tom H.", email: "tom@example.com", points: 2650, earnings: 265, games: 5, winRate: 70 },
      { rank: 10, name: "Emma S.", email: "emma@example.com", points: 2500, earnings: 250, games: 4, winRate: 80 }
    ],
    week: [
      { rank: 1, name: "Sarah K.", email: "sarah@example.com", points: 28400, earnings: 2840, games: 35, winRate: 89 },
      { rank: 2, name: "Alex M.", email: "alex@example.com", points: 26800, earnings: 2680, games: 32, winRate: 91 },
      { rank: 3, name: "John D.", email: "john@example.com", points: 24500, earnings: 2450, games: 38, winRate: 85 },
    ],
    month: [
      { rank: 1, name: "Alex M.", email: "alex@example.com", points: 125000, earnings: 12500, games: 145, winRate: 92 },
      { rank: 2, name: "Sarah K.", email: "sarah@example.com", points: 118000, earnings: 11800, games: 138, winRate: 90 },
      { rank: 3, name: "Emma S.", email: "emma@example.com", points: 98500, earnings: 9850, games: 122, winRate: 87 },
    ]
  };

  const currentData = leaderboardData[selectedPeriod as keyof typeof leaderboardData];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-semibold text-gray-500">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "default";
    if (rank <= 3) return "secondary";
    return "outline";
  };

  return (
    <div className="space-y-6">
      {/* Leaderboard Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-600" />
            Leaderboard
          </CardTitle>
          <CardDescription>
            Compete with other players and climb the rankings to win bigger rewards!
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Period Selection */}
      <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/50 backdrop-blur-sm">
          <TabsTrigger value="today" className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            Today
          </TabsTrigger>
          <TabsTrigger value="week" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            This Week
          </TabsTrigger>
          <TabsTrigger value="month" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            This Month
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedPeriod} className="mt-6">
          <div className="space-y-4">
            {/* Top 3 Highlight */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              {currentData.slice(0, 3).map((player, index) => (
                <Card 
                  key={player.rank} 
                  className={`border-0 shadow-lg ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-50 to-amber-50' :
                    index === 1 ? 'bg-gradient-to-r from-gray-50 to-slate-50' :
                    'bg-gradient-to-r from-orange-50 to-amber-50'
                  }`}
                >
                  <CardContent className="pt-6 text-center">
                    <div className="space-y-3">
                      {getRankIcon(player.rank)}
                      <Avatar className="w-12 h-12 mx-auto">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${player.name}`} />
                        <AvatarFallback>{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{player.name}</h3>
                        <div className="text-2xl font-bold text-green-600">
                          {player.points.toLocaleString()} pts
                        </div>
                        <div className="text-sm text-gray-600">
                          KSh {player.earnings.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Full Leaderboard */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Full Rankings</span>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {currentData.length} Players
                  </Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {currentData.map((player) => (
                    <div 
                      key={player.rank}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                        player.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8">
                          {getRankIcon(player.rank)}
                        </div>
                        
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${player.name}`} />
                          <AvatarFallback>{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <h4 className="font-semibold">{player.name}</h4>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span>{player.games} games</span>
                            <span>•</span>
                            <span>{player.winRate}% win rate</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          {player.points.toLocaleString()} pts
                        </div>
                        <div className="text-sm text-gray-600">
                          KSh {player.earnings.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievement Info */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-50 to-purple-50">
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-3 text-center">
                  <div className="space-y-2">
                    <Crown className="h-8 w-8 text-yellow-500 mx-auto" />
                    <h4 className="font-semibold">Top Player Reward</h4>
                    <p className="text-sm text-gray-600">Extra KSh 500 bonus</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Medal className="h-8 w-8 text-gray-400 mx-auto" />
                    <h4 className="font-semibold">Top 10 Players</h4>
                    <p className="text-sm text-gray-600">Special recognition badge</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Star className="h-8 w-8 text-indigo-500 mx-auto" />
                    <h4 className="font-semibold">Monthly Champion</h4>
                    <p className="text-sm text-gray-600">KSh 2,000 grand prize</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GameLeaderboard;
