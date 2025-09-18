import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  Users, 
  Coins, 
  Trophy, 
  Lock,
  CheckCircle,
  AlertCircle,
  Crown
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useScheduledGames } from '@/hooks/useScheduledGames';

interface ScheduledGameLobbyProps {
  onGameStart: (gameId: string) => void;
}

const ScheduledGameLobby: React.FC<ScheduledGameLobbyProps> = ({ onGameStart }) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { 
    games, 
    userRegistrations, 
    loading, 
    registerForGame, 
    isUserRegistered, 
    getTimeUntilStart 
  } = useScheduledGames();

  const [registering, setRegistering] = useState<string | null>(null);

  const handleGameRegistration = async (gameId: string) => {
    if (!profile) return;
    
    setRegistering(gameId);
    const result = await registerForGame(gameId, profile.balance);
    
    if (result.success) {
      // Deduct the entry fee from profile balance
      const game = games.find(g => g.id === gameId);
      if (game) {
        // This would be handled by the hook, but we need to refresh profile data
        window.location.reload(); // Simple refresh for now
      }
    }
    
    setRegistering(null);
  };

  const canAccessGame = (game: any) => {
    const { expired } = getTimeUntilStart(game.scheduled_start);
    const isRegistered = isUserRegistered(game.id);
    return expired && isRegistered;
  };

  if (!user) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
        <CardHeader className="text-center">
          <CardTitle className="text-red-700 flex items-center justify-center gap-2">
            <Lock className="h-5 w-5" />
            Authentication Required
          </CardTitle>
          <CardDescription className="text-red-600">
            Please login to access the trivia games
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User's Registered Games */}
      {userRegistrations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Your Registered Games
          </h3>
          <div className="grid gap-4">
            {userRegistrations.map(registration => {
              const game = registration.scheduled_games;
              if (!game) return null;
              
              const { expired, timeString } = getTimeUntilStart(game.scheduled_start);
              const canPlay = canAccessGame(game);
              
              return (
                <Card 
                  key={registration.id} 
                  className={`border-0 shadow-lg transition-all ${
                    canPlay 
                      ? 'bg-gradient-to-br from-green-50 to-green-100 ring-2 ring-green-200' 
                      : 'bg-gradient-to-br from-blue-50 to-blue-100'
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {game.game_categories?.is_premium && (
                            <Crown className="h-4 w-4 text-yellow-600" />
                          )}
                          {game.title}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {game.game_categories?.description}
                        </CardDescription>
                      </div>
                      <Badge variant={canPlay ? "default" : "secondary"} className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {canPlay ? 'Play Now!' : timeString}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="font-semibold text-green-700">KSh {game.entry_fee}</div>
                        <div className="text-xs text-muted-foreground">Entry Fee Paid</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-orange-700">KSh {game.max_winnings}</div>
                        <div className="text-xs text-muted-foreground">Max Winnings</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-blue-700">{game.max_players}</div>
                        <div className="text-xs text-muted-foreground">Max Players</div>
                      </div>
                    </div>
                    
                    {canPlay ? (
                      <Button 
                        onClick={() => onGameStart(game.id)}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        Start Playing!
                      </Button>
                    ) : (
                      <Button disabled className="w-full">
                        {expired ? 'Game Starting Soon...' : `Starts in ${timeString}`}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Games */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-purple-600" />
          Available Games
        </h3>
        
        {games.length === 0 ? (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No scheduled games available at the moment.</p>
              <p className="text-sm text-gray-500 mt-2">Check back later for new games!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {games.map(game => {
              const { timeString } = getTimeUntilStart(game.scheduled_start);
              const registered = isUserRegistered(game.id);
              const hasEnoughBalance = profile ? profile.balance >= game.entry_fee : false;
              const isPremiumGame = game.game_categories?.is_premium;
              const canRegister = !registered && hasEnoughBalance && 
                               new Date() < new Date(game.registration_deadline);
              
              return (
                <Card 
                  key={game.id} 
                  className={`border-0 shadow-lg transition-all ${
                    isPremiumGame 
                      ? 'bg-gradient-to-br from-yellow-50 to-amber-100' 
                      : 'bg-gradient-to-br from-purple-50 to-pink-100'
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {isPremiumGame && <Crown className="h-4 w-4 text-yellow-600" />}
                          {game.title}
                          {registered && <CheckCircle className="h-4 w-4 text-green-600" />}
                        </CardTitle>
                        <CardDescription>
                          {game.game_categories?.description}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeString}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className={`font-semibold ${hasEnoughBalance ? 'text-green-700' : 'text-red-700'}`}>
                          KSh {game.entry_fee}
                        </div>
                        <div className="text-xs text-muted-foreground">Entry Fee</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-orange-700">KSh {game.max_winnings}</div>
                        <div className="text-xs text-muted-foreground">Max Winnings</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-blue-700 flex items-center justify-center gap-1">
                          <Users className="h-3 w-3" />
                          {game.max_players}
                        </div>
                        <div className="text-xs text-muted-foreground">Max Players</div>
                      </div>
                    </div>

                    {/* Prize Pool Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Prize Pool</span>
                        <span>KSh {game.prize_pool}</span>
                      </div>
                      <Progress value={(game.prize_pool / (game.max_winnings * 2)) * 100} className="h-2" />
                    </div>
                    
                    {registered ? (
                      <Button disabled className="w-full bg-green-600">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Registered
                      </Button>
                    ) : canRegister ? (
                      <Button 
                        onClick={() => handleGameRegistration(game.id)}
                        disabled={registering === game.id}
                        className="w-full"
                      >
                        {registering === game.id ? 'Registering...' : `Register (KSh ${game.entry_fee})`}
                      </Button>
                    ) : (
                      <Button disabled className="w-full">
                        {!hasEnoughBalance ? 'Insufficient Balance' : 'Registration Closed'}
                      </Button>
                    )}

                    {isPremiumGame && (
                      <p className="text-xs text-yellow-700 mt-2 flex items-center gap-1">
                        <Crown className="h-3 w-3" />
                        Premium members get bonus points and higher payouts
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduledGameLobby;