
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DynamicTabs, MainTab } from "@/components/ui/dynamic-tabs";
import { 
  Gamepad2, 
  Clock, 
  Trophy, 
  Star, 
  Coins, 
  Target,
  Users,
  TrendingUp,
  Play,
  Crown,
  Zap,
  Lock,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import ScheduledGameLobby from '@/components/game/ScheduledGameLobby';
import TriviaQuestion from '@/components/game/TriviaQuestion';
import EnhancedTriviaGame from '@/components/game/EnhancedTriviaGame';
import GameLeaderboard from '@/components/game/GameLeaderboard';
import GameWallet from '@/components/game/GameWallet';
import GameSubscription from '@/components/game/GameSubscription';
import HouseAnalytics from '@/components/game/HouseAnalytics';

const TriviaGamePage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { toast } = useToast();
  const [activeMainTab, setActiveMainTab] = useState('game');
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);

  // Redirect to auth if not logged in
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <Card className="relative w-full max-w-md border-0 bg-slate-800/50 backdrop-blur-xl shadow-2xl border border-slate-700/50 animate-scale-in">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full border border-red-500/30">
              <Lock className="h-8 w-8 text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Authentication Required
            </CardTitle>
            <CardDescription className="text-slate-300 text-base">
              Join the premium trivia experience
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
              <p className="text-slate-200 font-medium mb-2">🎯 What awaits you:</p>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-400" />
                  <span>Real money rewards</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Star className="h-4 w-4 text-blue-400" />
                  <span>Financial education</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-4 w-4 text-green-400" />
                  <span>Compete globally</span>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => window.location.href = '/auth'}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold py-3 rounded-lg shadow-lg hover-scale transition-all duration-200"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Playing Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleGameStart = (gameId: string) => {
    setCurrentGameId(gameId);
    setActiveMainTab('game');
    toast({
      title: "Game Starting!",
      description: "Get ready for the trivia challenge!",
    });
  };

  const getMainTabs = (): MainTab[] => [
    {
      id: 'game',
      label: 'Game Center',
      icon: <Play className="h-4 w-4" />,
      subtabs: [
        {
          id: 'lobby',
          label: 'Game Lobby',
          content: (
            <ScheduledGameLobby onGameStart={handleGameStart} />
          )
        },
        {
          id: 'play',
          label: 'Play Now',
          content: <EnhancedTriviaGame />
        },
        {
          id: 'scheduled',
          label: 'Tournament Mode',
          content: currentGameId ? (
            <TriviaQuestion 
              gameId={currentGameId}
              onGameEnd={() => {
                setCurrentGameId(null);
                toast({
                  title: "Game Complete!",
                  description: "Check your wallet for earnings!",
                });
              }}
            />
          ) : (
            <ScheduledGameLobby onGameStart={handleGameStart} />
          )
        },
        {
          id: 'leaderboard',
          label: 'Leaderboard',
          content: <GameLeaderboard />
        }
      ]
    },
    {
      id: 'wallet',
      label: 'Wallet & Finance',
      icon: <Coins className="h-4 w-4" />,
      subtabs: [
        {
          id: 'balance',
          label: 'Game Wallet',
          content: (
            <GameWallet 
              balance={5000}
              points={250}
              onBalanceUpdate={(newBalance) => {
                toast({
                  title: "Balance Updated (MOCK)",
                  description: `New balance: KSh ${newBalance.toLocaleString()}`,
                });
              }}
            />
          )
        },
        {
          id: 'premium',
          label: 'Premium Plans',
          content: (
            <GameSubscription 
              currentBalance={profile?.balance || 0}
              onSubscribe={(cost) => {
                toast({
                  title: "Premium Activated!",
                  description: "You can now earn double points in games!",
                });
              }}
            />
          )
        }
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <TrendingUp className="h-4 w-4" />,
      content: <HouseAnalytics />
    }
  ];

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <Card className="relative w-full max-w-md border-0 bg-slate-800/50 backdrop-blur-xl shadow-2xl border border-slate-700/50">
          <CardContent className="p-8 text-center">
            <div className="relative mb-6">
              <div className="animate-spin h-12 w-12 border-4 border-purple-500/30 border-t-purple-400 rounded-full mx-auto"></div>
              <div className="absolute inset-0 animate-ping h-12 w-12 border-2 border-purple-400/20 rounded-full mx-auto"></div>
            </div>
            <h3 className="text-xl font-semibold text-slate-200 mb-2">Loading Your Profile</h3>
            <p className="text-slate-400">Preparing your gaming experience...</p>
            <div className="mt-4 flex justify-center space-x-1">
              <div className="h-2 w-2 bg-purple-400 rounded-full animate-pulse"></div>
              <div className="h-2 w-2 bg-purple-400 rounded-full animate-pulse delay-100"></div>
              <div className="h-2 w-2 bg-purple-400 rounded-full animate-pulse delay-200"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full mb-4 backdrop-blur-sm border border-purple-500/30">
            <Trophy className="h-6 w-6 text-yellow-400 mr-2" />
            <span className="text-yellow-400 font-medium">Premium Trivia Experience</span>
          </div>
          
          <h1 className="text-3xl md:text-6xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Investment Trivia
            </span>
            <br />
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              & Win Real Money
            </span>
          </h1>
          
          <p className="text-slate-300 mt-4 text-lg md:text-xl max-w-2xl mx-auto">
            Master financial knowledge while earning real cash rewards through engaging trivia challenges
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-full backdrop-blur-sm border border-slate-700/50">
              <Users className="h-4 w-4 text-cyan-400" />
              <span className="text-slate-200 font-medium">{profile?.username || 'Player'}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-full backdrop-blur-sm border border-green-500/30">
              <Coins className="h-4 w-4 text-green-400" />
              <span className="text-green-300 font-bold">KSh {(profile?.balance || 0).toLocaleString()}</span>
            </div>
            {profile?.is_premium && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-full backdrop-blur-sm border border-yellow-500/30">
                <Crown className="h-4 w-4 text-yellow-400" />
                <span className="text-yellow-300 font-medium">Premium</span>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Stats Dashboard */}
        {profile && (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8 animate-fade-in">
            {/* Balance Card */}
            <Card className="group border-0 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover-scale overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-medium text-slate-300">Wallet Balance</CardTitle>
                <div className="p-2 rounded-lg bg-green-500/20 border border-green-500/30">
                  <Coins className="h-4 w-4 text-green-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl md:text-3xl font-bold text-green-400 mb-1">
                  KSh {(profile.balance ?? 0).toLocaleString()}
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Available for games
                </p>
              </CardContent>
            </Card>

            {/* Points Card */}
            <Card className="group border-0 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover-scale overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-medium text-slate-300">Total Points</CardTitle>
                <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
                  <Star className="h-4 w-4 text-blue-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl md:text-3xl font-bold text-blue-400 mb-1">
                  {(profile.total_points ?? 0).toLocaleString()}
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Skill points earned
                </p>
              </CardContent>
            </Card>

            {/* Games Played Card */}
            <Card className="group border-0 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover-scale overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-medium text-slate-300">Games Played</CardTitle>
                <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                  <Gamepad2 className="h-4 w-4 text-purple-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl md:text-3xl font-bold text-purple-400 mb-1">
                  {profile.games_played}
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Total challenges
                </p>
              </CardContent>
            </Card>

            {/* Win Rate Card */}
            <Card className="group border-0 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover-scale overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-medium text-slate-300">Win Rate</CardTitle>
                <div className="p-2 rounded-lg bg-orange-500/20 border border-orange-500/30">
                  <Trophy className="h-4 w-4 text-orange-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl md:text-3xl font-bold text-orange-400 mb-1">
                  {profile.games_played > 0 ? Math.round((profile.games_won / profile.games_played) * 100) : 0}%
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Success rate
                </p>
              </CardContent>
            </Card>

            {/* Total Earnings Card */}
            <Card className="group border-0 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover-scale overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-medium text-slate-300">Total Earnings</CardTitle>
                <div className="p-2 rounded-lg bg-teal-500/20 border border-teal-500/30">
                  <TrendingUp className="h-4 w-4 text-teal-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl md:text-3xl font-bold text-teal-400 mb-1">
                  KSh {(profile.total_earnings ?? 0).toLocaleString()}
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Coins className="h-3 w-3" />
                  Lifetime rewards
                </p>
              </CardContent>
            </Card>

            {/* Win Streak Card */}
            <Card className="group border-0 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover-scale overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-medium text-slate-300">Win Streak</CardTitle>
                <div className="p-2 rounded-lg bg-pink-500/20 border border-pink-500/30">
                  <Crown className="h-4 w-4 text-pink-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl md:text-3xl font-bold text-pink-400 mb-1">
                  {profile.current_streak}
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Current streak
                </p>
                {profile.current_streak > 0 && (
                  <div className="mt-2">
                    <Progress value={(profile.current_streak / (profile.best_streak || 5)) * 100} className="h-1" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <DynamicTabs
          mainTabs={getMainTabs()}
          defaultTab="game"
          onTabChange={(mainTabId) => {
            setActiveMainTab(mainTabId);
          }}
        />
      </div>
    </div>
  );
};

export default TriviaGamePage;
