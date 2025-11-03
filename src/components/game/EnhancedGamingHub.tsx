import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Target, 
  Brain, 
  Clock, 
  Users, 
  DollarSign,
  TrendingUp,
  Star,
  Gamepad2,
  Zap
} from 'lucide-react';
import { useEnhancedGaming } from '@/hooks/useEnhancedGaming';
import CurrencyDisplay from "@/components/CurrencyDisplay";
import { SimpleFeeDisplay } from "@/components/shared/FeeDisplay";

const EnhancedGamingHub: React.FC = () => {
  const {
    tournaments,
    predictionGames,
    learningChallenges,
    userTournaments,
    userBets,
    joinTournament,
    placeBet,
    completeChallenge,
    isJoiningTournament,
    isPlacingBet,
    getGamingStats
  } = useEnhancedGaming();

  const [selectedPrediction, setSelectedPrediction] = useState<string>('');
  const [betAmount, setBetAmount] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string>('');

  const gamingStats = getGamingStats();

  const formatTimeRemaining = (endTime: string) => {
    const diff = new Date(endTime).getTime() - new Date().getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          🎮 Gaming Hub
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Compete, predict, learn, and earn! Join tournaments, make predictions, and master financial skills.
        </p>
      </div>

      {/* Gaming Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tournaments Joined</CardTitle>
            <Trophy className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{gamingStats.totalTournaments}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Predictions</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{gamingStats.totalBets}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Wagered</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              <CurrencyDisplay amount={gamingStats.totalBetAmount} showToggle={false} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Winnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">
              <CurrencyDisplay amount={gamingStats.potentialWinnings} showToggle={false} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Gaming Tabs */}
      <Tabs defaultValue="tournaments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tournaments" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Tournaments
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Learn & Earn
          </TabsTrigger>
        </TabsList>

        {/* Tournaments Tab */}
        <TabsContent value="tournaments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tournaments.map(tournament => (
              <Card key={tournament.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant={tournament.status === 'upcoming' ? 'default' : 'secondary'}>
                      {tournament.status}
                    </Badge>
                    <Badge variant="outline">{tournament.game_type}</Badge>
                  </div>
                  <CardTitle className="text-lg">{tournament.name}</CardTitle>
                  <CardDescription>{tournament.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Entry Fee:
                      </span>
                      <CurrencyDisplay amount={tournament.entry_fee} showToggle={false} />
                    </div>
                    <SimpleFeeDisplay 
                      transactionType="game_entry" 
                      amount={tournament.entry_fee}
                      layout="horizontal"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        Prize Pool:
                      </span>
                      <span className="font-bold text-green-600">
                        <CurrencyDisplay amount={tournament.prize_pool} showToggle={false} />
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        Participants:
                      </span>
                      <span>{tournament.current_participants}/{tournament.max_participants}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Starts In:
                      </span>
                      <span>{formatTimeRemaining(tournament.start_time)}</span>
                    </div>
                  </div>
                  
                  <Progress 
                    value={(tournament.current_participants / tournament.max_participants) * 100}
                    className="h-2"
                  />
                  
                  <Button 
                    onClick={() => joinTournament(tournament.id)}
                    disabled={isJoiningTournament || tournament.current_participants >= tournament.max_participants}
                    className="w-full"
                  >
                    {isJoiningTournament ? (
                      <><Zap className="mr-2 h-4 w-4 animate-spin" /> Joining...</>
                    ) : (
                      <>Join Tournament</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {predictionGames.map(prediction => (
              <Card key={prediction.id} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge>{prediction.category}</Badge>
                    <Badge variant="outline">{prediction.prediction_type}</Badge>
                  </div>
                  <CardTitle className="text-lg">{prediction.title}</CardTitle>
                  <CardDescription>{prediction.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Bet Range:</span>
                      <span>
                        <CurrencyDisplay amount={prediction.minimum_bet} showToggle={false} /> - <CurrencyDisplay amount={prediction.maximum_bet} showToggle={false} />
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Pool:</span>
                      <span className="font-bold">
                        <CurrencyDisplay amount={prediction.total_pool} showToggle={false} />
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deadline:</span>
                      <span>{formatTimeRemaining(prediction.deadline)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Your Prediction:</Label>
                    <RadioGroup 
                      value={selectedOption} 
                      onValueChange={setSelectedOption}
                    >
                      {Array.isArray(prediction.options) && prediction.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`${prediction.id}-${index}`} />
                          <Label htmlFor={`${prediction.id}-${index}`}>{option}</Label>
                        </div>
                      ))}
                    </RadioGroup>

                    <div className="space-y-2">
                      <Label>Bet Amount:</Label>
                      <Input
                        type="number"
                        min={prediction.minimum_bet}
                        max={prediction.maximum_bet}
                        value={betAmount}
                        onChange={(e) => setBetAmount(Number(e.target.value))}
                        placeholder={`Min: ${prediction.minimum_bet}`}
                      />
                    </div>

                    <Button
                      onClick={() => placeBet({
                        predictionId: prediction.id,
                        betAmount,
                        predictedOption: selectedOption
                      })}
                      disabled={isPlacingBet || !selectedOption || betAmount < prediction.minimum_bet}
                      className="w-full"
                    >
                      {isPlacingBet ? (
                        <><Zap className="mr-2 h-4 w-4 animate-spin" /> Placing Bet...</>
                      ) : (
                        <>Place Bet</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Learning Challenges Tab */}
        <TabsContent value="challenges" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {learningChallenges.map(challenge => (
              <Card key={challenge.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className={getDifficultyColor(challenge.difficulty)}>
                      {challenge.difficulty}
                    </Badge>
                    <Badge variant="outline">{challenge.category}</Badge>
                  </div>
                  <CardTitle className="text-lg">{challenge.title}</CardTitle>
                  <CardDescription>{challenge.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <Brain className="h-4 w-4" />
                        Questions:
                      </span>
                      <span>{challenge.questions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Time Limit:
                      </span>
                      <span>{Math.floor(challenge.time_limit / 60)} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        Points:
                      </span>
                      <span>{challenge.reward_points}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Reward:
                      </span>
                      <span className="font-bold text-green-600">
                        <CurrencyDisplay amount={challenge.reward_amount} showToggle={false} />
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed By:</span>
                      <span>{challenge.completion_count} users</span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => {
                      // This would open a challenge modal/page
                      console.log('Starting challenge:', challenge.id);
                    }}
                    className="w-full"
                  >
                    <Gamepad2 className="mr-2 h-4 w-4" />
                    Start Challenge
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedGamingHub;