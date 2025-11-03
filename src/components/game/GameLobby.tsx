
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  TrendingUp, 
  Users, 
  Globe, 
  Star, 
  Zap,
  Clock,
  Target,
  Award
} from 'lucide-react';

interface GameLobbyProps {
  nextGameTime: Date;
  onGameStart: (category: string) => void;
  playerBalance: number;
}

const GameLobby: React.FC<GameLobbyProps> = ({ nextGameTime, onGameStart, playerBalance }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  const categories = [
    {
      id: 'finance',
      name: 'Finance & Investment',
      icon: TrendingUp,
      description: 'Stock markets, crypto, banking',
      difficulty: 'Medium',
      maxPoints: 1000,
      entryFee: 5,
      maxWinnings: 25, // 5x return max
      players: 89,
      color: 'from-green-500 to-emerald-600',
      houseEdge: '8%'
    },
    {
      id: 'business',
      name: 'Business & Economics',
      icon: BookOpen,
      description: 'Entrepreneurship, economics, trade',
      difficulty: 'Hard',
      maxPoints: 1500,
      entryFee: 10,
      maxWinnings: 45, // 4.5x return max
      players: 67,
      color: 'from-blue-500 to-indigo-600',
      houseEdge: '10%'
    },
    {
      id: 'technology',
      name: 'Technology',
      icon: Zap,
      description: 'Fintech, blockchain, innovation',
      difficulty: 'Medium',
      maxPoints: 800,
      entryFee: 5,
      maxWinnings: 22, // 4.4x return max
      players: 134,
      color: 'from-purple-500 to-violet-600',
      houseEdge: '6%'
    },
    {
      id: 'general',
      name: 'General Knowledge',
      icon: Globe,
      description: 'Mixed topics, current events',
      difficulty: 'Easy',
      maxPoints: 500,
      entryFee: 3,
      maxWinnings: 12, // 4x return max
      players: 203,
      color: 'from-orange-500 to-red-600',
      houseEdge: '5%'
    },
    {
      id: 'premium',
      name: 'Premium Challenge',
      icon: Star,
      description: 'High stakes, expert level',
      difficulty: 'Expert',
      maxPoints: 3000,
      entryFee: 25,
      maxWinnings: 100, // 4x return max
      players: 23,
      color: 'from-yellow-500 to-orange-600',
      houseEdge: '15%',
      isPremium: true
    }
  ];

  const selectedCat = categories.find(c => c.id === selectedCategory);
  const canPlay = selectedCat ? playerBalance >= selectedCat.entryFee : false;
  const now = new Date();
  const gameStartingSoon = (nextGameTime.getTime() - now.getTime()) < 300000; // 5 minutes

  const handleCategorySelect = (categoryId: string) => {
    if (!canPlay) return;
    setSelectedCategory(categoryId);
  };

  const handleRegister = () => {
    if (selectedCategory && canPlay) {
      setIsRegistered(true);
      // Could start game immediately or wait for scheduled time
      if (gameStartingSoon) {
        setTimeout(() => onGameStart(selectedCategory), 2000);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Game Status */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-600" />
            Game Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Next Game Starts In:</span>
            <Badge variant={gameStartingSoon ? "destructive" : "secondary"}>
              {gameStartingSoon ? "Starting Soon!" : "Scheduled"}
            </Badge>
          </div>
          
          {!canPlay && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-700">
                Minimum balance of KSh 3 required to play. Please deposit funds to continue.
              </p>
            </div>
          )}

          {isRegistered && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Registered for {categories.find(c => c.id === selectedCategory)?.name}! 
                {gameStartingSoon ? " Get ready!" : " We'll notify you when it's time."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Selection */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Choose Your Category
        </h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          {categories.map((category) => {
            const IconComponent = category.icon;
            const isSelected = selectedCategory === category.id;
            
            return (
              <Card
                key={category.id}
                className={`border-2 transition-all duration-200 cursor-pointer hover:shadow-lg ${
                  isSelected 
                    ? 'border-indigo-500 bg-indigo-50 shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300'
                } ${!canPlay ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => handleCategorySelect(category.id)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color}`}>
                        <IconComponent className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-lg">{category.name}</span>
                    </div>
                    {isSelected && <Badge variant="default">Selected</Badge>}
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Difficulty:</span>
                    <Badge variant={
                      category.difficulty === 'Easy' ? 'secondary' : 
                      category.difficulty === 'Medium' ? 'default' : 'destructive'
                    }>
                      {category.difficulty}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Entry Fee:</span>
                    <span className="font-bold text-red-600">KSh {category.entryFee}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Max Winnings:</span>
                    <span className="font-semibold text-green-600">KSh {category.maxWinnings}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">House Edge:</span>
                    <span className="font-semibold text-orange-600">{category.houseEdge}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Active Players:</span>
                    <span className="flex items-center gap-1 text-blue-600">
                      <Users className="h-3 w-3" />
                      {category.players}
                    </span>
                  </div>
                  
                  {isSelected && (
                    <div className="pt-2">
                      <Progress value={75} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">Registration: 75% full</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Registration Action */}
      {selectedCategory && canPlay && !isRegistered && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Ready to Play?</h3>
              <p className="text-sm text-gray-600">
                Entry fee: <span className="font-bold text-red-600">KSh {selectedCat?.entryFee}</span> 
                {" • "}Max reward: <span className="font-bold text-green-600">
                  KSh {selectedCat?.maxWinnings}
                </span>
                {" • "}House edge: <span className="font-bold text-orange-600">{selectedCat?.houseEdge}</span>
              </p>
              <Button 
                onClick={handleRegister}
                className="w-full md:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                size="lg"
              >
                <Star className="h-4 w-4 mr-2" />
                Register for Game (KSh {selectedCat?.entryFee})
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-indigo-600 mb-1">493</div>
            <div className="text-sm text-gray-600">Total Players Today</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600 mb-1">KSh 45,230</div>
            <div className="text-sm text-gray-600">Total Prizes Today</div>
            <div className="text-xs text-orange-500 mt-1">Revenue: KSh 67,845</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600 mb-1">12</div>
            <div className="text-sm text-gray-600">Games Today</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GameLobby;
