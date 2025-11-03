import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, Medal, Star, TrendingUp, Target, Users, 
  DollarSign, Calendar, Award, Crown, Zap
} from 'lucide-react';
import CurrencyDisplay from '@/components/CurrencyDisplay';

interface MemberLeaderboardProps {
  chamaId: string;
  currentUserId: string;
}

const MemberLeaderboard: React.FC<MemberLeaderboardProps> = ({ chamaId, currentUserId }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'yearly' | 'alltime'>('monthly');

  // Mock leaderboard data - would come from backend
  const leaderboardData = {
    monthly: [
      {
        id: 'user-1',
        rank: 1,
        name: 'Jane Smith',
        netWorth: 450000,
        monthlyContribution: 18000,
        loans: 45000,
        dividends: 12000,
        overallScore: 95,
        streak: 24,
        badges: ['top-contributor', 'consistent-saver', 'loan-champion']
      },
      {
        id: 'user-2', 
        rank: 2,
        name: 'John Doe',
        netWorth: 425000,
        monthlyContribution: 15000,
        loans: 50000,
        dividends: 10500,
        overallScore: 88,
        streak: 18,
        badges: ['reliable-member', 'investment-pro']
      },
      {
        id: currentUserId,
        rank: 3,
        name: 'You',
        netWorth: 405000,
        monthlyContribution: 16500,
        loans: 35000,
        dividends: 8900,
        overallScore: 85,
        streak: 12,
        badges: ['growing-saver', 'team-player']
      },
      {
        id: 'user-4',
        name: 'Michael Brown',
        rank: 4,
        netWorth: 380000,
        monthlyContribution: 14000,
        loans: 40000,
        dividends: 7800,
        overallScore: 80,
        streak: 8,
        badges: ['steady-contributor']
      },
      {
        id: 'user-5',
        name: 'Sarah Wilson',
        rank: 5,
        netWorth: 350000,
        monthlyContribution: 12000,
        loans: 25000,
        dividends: 6500,
        overallScore: 75,
        streak: 15,
        badges: ['new-member']
      }
    ]
  };

  const achievements = [
    {
      id: 'top-contributor',
      name: 'Top Contributor',
      description: 'Highest monthly contribution',
      icon: <Crown className="h-5 w-5 text-yellow-500" />,
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200'
    },
    {
      id: 'consistent-saver',
      name: 'Consistent Saver', 
      description: '6+ months of on-time contributions',
      icon: <Star className="h-5 w-5 text-blue-500" />,
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      id: 'loan-champion',
      name: 'Loan Champion',
      description: 'Perfect loan repayment record',
      icon: <Trophy className="h-5 w-5 text-green-500" />,
      color: 'bg-green-50 text-green-700 border-green-200'
    },
    {
      id: 'investment-pro',
      name: 'Investment Pro',
      description: 'High ROI on investments',
      icon: <TrendingUp className="h-5 w-5 text-purple-500" />,
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      id: 'reliable-member',
      name: 'Reliable Member',
      description: 'Consistent participation',
      icon: <Award className="h-5 w-5 text-orange-500" />,
      color: 'bg-orange-50 text-orange-700 border-orange-200'
    }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">#{rank}</div>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) return 'default';
    if (rank <= 5) return 'secondary';
    return 'outline';
  };

  const getBadgeInfo = (badgeId: string) => {
    return achievements.find(a => a.id === badgeId);
  };

  const currentUserData = leaderboardData.monthly.find(member => member.id === currentUserId);

  const LeaderboardRow = ({ member, index }: { member: any; index: number }) => (
    <div className={`flex items-center justify-between p-4 rounded-lg border ${
      member.id === currentUserId 
        ? 'bg-blue-50 border-blue-200 shadow-md' 
        : 'bg-white hover:bg-gray-50'
    } transition-colors`}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {getRankIcon(member.rank)}
          <Badge variant={getRankBadge(member.rank)}>
            #{member.rank}
          </Badge>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium">
              {member.name}
              {member.id === currentUserId && (
                <Badge variant="outline" className="ml-2 text-xs">You</Badge>
              )}
            </h4>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              <CurrencyDisplay amount={member.netWorth} showToggle={false} />
            </span>
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {member.streak} days
            </span>
            <span>Score: {member.overallScore}</span>
          </div>
        </div>
      </div>

      <div className="text-right space-y-2">
        <div className="flex gap-1">
          {member.badges?.slice(0, 2).map((badgeId: string) => {
            const badgeInfo = getBadgeInfo(badgeId);
            return badgeInfo ? (
              <div key={badgeId} className={`p-1 rounded border ${badgeInfo.color}`}>
                {badgeInfo.icon}
              </div>
            ) : null;
          })}
          {member.badges?.length > 2 && (
            <div className="p-1 rounded border bg-gray-50 text-gray-600">
              +{member.badges.length - 2}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Member Leaderboard</h2>
          <p className="text-muted-foreground">Rankings based on net worth, contributions, and performance</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={selectedPeriod === 'monthly' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('monthly')}
            size="sm"
          >
            This Month
          </Button>
          <Button 
            variant={selectedPeriod === 'yearly' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('yearly')}
            size="sm"
          >
            This Year
          </Button>
          <Button 
            variant={selectedPeriod === 'alltime' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('alltime')}
            size="sm"
          >
            All Time
          </Button>
        </div>
      </div>

      <Tabs defaultValue="leaderboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="space-y-6">
          {/* Your Position Card */}
          {currentUserData && (
            <Card className="border-2 border-blue-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Your Position
                </CardTitle>
                <CardDescription>Your current ranking and stats</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {getRankIcon(currentUserData.rank)}
                      <span className="text-2xl font-bold">#{currentUserData.rank}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Current Rank</p>
                  </div>
                  <div className="text-center">
                    <CurrencyDisplay 
                      amount={currentUserData.netWorth}
                      className="text-xl font-bold text-blue-600"
                      showToggle={false}
                    />
                    <p className="text-sm text-muted-foreground">Net Worth</p>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">{currentUserData.overallScore}</div>
                    <p className="text-sm text-muted-foreground">Overall Score</p>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-orange-600">{currentUserData.streak}</div>
                    <p className="text-sm text-muted-foreground">Day Streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Full Leaderboard */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Monthly Rankings
              </CardTitle>
              <CardDescription>Member rankings for {selectedPeriod} period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboardData.monthly.map((member, index) => (
                  <LeaderboardRow key={member.id} member={member} index={index} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Achievement System
              </CardTitle>
              <CardDescription>Unlock badges and recognition for your contributions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className={`p-4 rounded-lg border ${achievement.color}`}>
                    <div className="flex items-start gap-3">
                      {achievement.icon}
                      <div>
                        <h4 className="font-medium">{achievement.name}</h4>
                        <p className="text-sm mt-1">{achievement.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {Math.floor(Math.random() * 15) + 1} earned this
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Average Net Worth</CardTitle>
              </CardHeader>
              <CardContent>
                <CurrencyDisplay amount={402000} className="text-2xl font-bold" showToggle={false} />
                <p className="text-xs text-muted-foreground mt-1">Group average</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Top Contributor</CardTitle>
              </CardHeader>
              <CardContent>
                <CurrencyDisplay amount={18000} className="text-2xl font-bold" showToggle={false} />
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground mt-1">Days</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
              <CardDescription>Group performance analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-green-800">Members contributing on time</span>
                  <Badge className="bg-green-100 text-green-800">85%</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium text-blue-800">Average monthly growth</span>
                  <Badge className="bg-blue-100 text-blue-800">+12.5%</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium text-purple-800">Group investment ROI</span>
                  <Badge className="bg-purple-100 text-purple-800">+8.2%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MemberLeaderboard;