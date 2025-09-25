import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Clock, 
  Star, 
  Coins, 
  Zap, 
  Target,
  Brain,
  TrendingUp,
  Award,
  Flame,
  Crown,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  points: number;
}

interface GameStats {
  streak: number;
  totalPoints: number;
  questionsAnswered: number;
  correctAnswers: number;
  earnedMoney: number;
}

const FINANCIAL_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "What is the recommended emergency fund size for most people?",
    options: ["1-2 months of expenses", "3-6 months of expenses", "1 year of expenses", "No emergency fund needed"],
    correctAnswer: 1,
    explanation: "Financial experts recommend 3-6 months of living expenses as an emergency fund to cover unexpected costs.",
    difficulty: "easy",
    category: "Personal Finance",
    points: 50
  },
  {
    id: 2,
    question: "What does 'compound interest' mean?",
    options: ["Interest paid only on principal", "Interest earned on interest", "Interest that decreases over time", "Interest paid monthly"],
    correctAnswer: 1,
    explanation: "Compound interest is interest calculated on the initial principal and accumulated interest from previous periods.",
    difficulty: "medium",
    category: "Investments",
    points: 100
  },
  {
    id: 3,
    question: "In Kenya, what is the maximum amount covered by Deposit Protection Fund for bank deposits?",
    options: ["KES 100,000", "KES 500,000", "KES 1,000,000", "KES 2,000,000"],
    correctAnswer: 1,
    explanation: "The Kenya Deposit Insurance Corporation protects deposits up to KES 500,000 per depositor per bank.",
    difficulty: "hard",
    category: "Banking",
    points: 150
  },
  {
    id: 4,
    question: "What is a Chama in Kenyan financial culture?",
    options: ["A type of bank loan", "A savings and investment group", "A mobile money service", "A government bond"],
    correctAnswer: 1,
    explanation: "A Chama is a traditional rotating savings and credit association where members pool money for investments.",
    difficulty: "easy",
    category: "Local Finance",
    points: 50
  },
  {
    id: 5,
    question: "What is the annual percentage rate (APR)?",
    options: ["Interest rate per month", "Total cost of borrowing per year", "Bank's profit margin", "Inflation rate"],
    correctAnswer: 1,
    explanation: "APR represents the total annual cost of a loan including interest rate and all fees, expressed as a percentage.",
    difficulty: "medium",
    category: "Credit & Loans",
    points: 100
  }
];

const EnhancedTriviaGame: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats>({
    streak: 0,
    totalPoints: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    earnedMoney: 0
  });
  const [timeLeft, setTimeLeft] = useState(30);
  const [isGameActive, setIsGameActive] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [questions] = useState(FINANCIAL_QUESTIONS);
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGameActive && timeLeft > 0 && !isAnswered) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isAnswered) {
      handleTimeUp();
    }
    return () => clearInterval(interval);
  }, [isGameActive, timeLeft, isAnswered]);

  const startGame = () => {
    setIsGameActive(true);
    setCurrentQuestion(0);
    setTimeLeft(30);
    setIsAnswered(false);
    setSelectedAnswer(null);
    setShowResults(false);
    setGameStats({
      streak: 0,
      totalPoints: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      earnedMoney: 0
    });
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    
    const question = questions[currentQuestion];
    const isCorrect = answerIndex === question.correctAnswer;
    
    const newStats = {
      ...gameStats,
      questionsAnswered: gameStats.questionsAnswered + 1,
      correctAnswers: isCorrect ? gameStats.correctAnswers + 1 : gameStats.correctAnswers,
      streak: isCorrect ? gameStats.streak + 1 : 0,
      totalPoints: isCorrect ? gameStats.totalPoints + question.points + (gameStats.streak * 10) : gameStats.totalPoints,
      earnedMoney: isCorrect ? gameStats.earnedMoney + (question.points * 0.1) : gameStats.earnedMoney
    };
    
    setGameStats(newStats);

    if (isCorrect) {
      toast({
        title: "Correct! 🎉",
        description: `+${question.points + (gameStats.streak * 10)} points! Streak: ${newStats.streak}`,
      });
    } else {
      toast({
        title: "Incorrect 😞",
        description: question.explanation,
        variant: "destructive",
      });
    }
  };

  const handleTimeUp = () => {
    setIsAnswered(true);
    setGameStats(prev => ({
      ...prev,
      questionsAnswered: prev.questionsAnswered + 1,
      streak: 0
    }));
    toast({
      title: "Time's Up! ⏰",
      description: "You ran out of time for this question.",
      variant: "destructive",
    });
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setTimeLeft(30);
    } else {
      endGame();
    }
  };

  const endGame = () => {
    setIsGameActive(false);
    setShowResults(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStreakBonus = () => {
    if (gameStats.streak >= 5) return { multiplier: 3, icon: <Crown className="h-4 w-4" />, text: "Legendary!" };
    if (gameStats.streak >= 3) return { multiplier: 2, icon: <Flame className="h-4 w-4" />, text: "On Fire!" };
    if (gameStats.streak >= 2) return { multiplier: 1.5, icon: <Zap className="h-4 w-4" />, text: "Hot Streak!" };
    return { multiplier: 1, icon: <Target className="h-4 w-4" />, text: "Building..." };
  };

  if (!isGameActive && !showResults) {
    return (
      <Card className="border-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30">
            <Brain className="h-12 w-12 text-purple-400" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Financial Mastery Challenge
          </CardTitle>
          <p className="text-slate-300 mt-2">Test your financial knowledge and earn real rewards!</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <Trophy className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">Points</div>
              <div className="text-sm text-gray-300">Earn rewards</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <Clock className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">30s</div>
              <div className="text-sm text-gray-300">Per question</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <Coins className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">Real Money</div>
              <div className="text-sm text-gray-300">Cash rewards</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <Star className="h-6 w-6 text-purple-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">Streak Bonus</div>
              <div className="text-sm text-gray-300">Multiplier rewards</div>
            </div>
          </div>
          
          <Button 
            onClick={startGame}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 text-lg"
          >
            Start Challenge
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showResults) {
    const accuracy = gameStats.questionsAnswered > 0 ? (gameStats.correctAnswers / gameStats.questionsAnswered) * 100 : 0;
    const performance = accuracy >= 80 ? "Excellent" : accuracy >= 60 ? "Good" : "Needs Improvement";
    
    return (
      <Card className="border-0 bg-gradient-to-br from-green-600/10 to-blue-600/10 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full border border-green-500/30">
            <Award className="h-12 w-12 text-green-400" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            Challenge Complete!
          </CardTitle>
          <p className="text-slate-300 mt-2">Here are your results:</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{gameStats.totalPoints}</div>
              <div className="text-sm text-gray-300">Total Points</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{accuracy.toFixed(0)}%</div>
              <div className="text-sm text-gray-300">Accuracy</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">KES {gameStats.earnedMoney.toFixed(2)}</div>
              <div className="text-sm text-gray-300">Earned</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">{performance}</div>
              <div className="text-sm text-gray-300">Performance</div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button 
              onClick={startGame}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3"
            >
              Play Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQ = questions[currentQuestion];
  const streakBonus = getStreakBonus();

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <Card className="border-0 bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Badge className={`${getDifficultyColor(currentQ.difficulty)} text-white`}>
                {currentQ.difficulty.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-slate-300 border-slate-600">
                {currentQ.category}
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="h-4 w-4" />
                <span className={`font-mono ${timeLeft <= 10 ? 'text-red-400' : ''}`}>
                  {timeLeft}s
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                {streakBonus.icon}
                <span>{gameStats.streak} {streakBonus.text}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-slate-300">
              Question {currentQuestion + 1} of {questions.length}
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-300">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400" />
                {gameStats.totalPoints}
              </div>
              <div className="flex items-center gap-1">
                <Coins className="h-4 w-4 text-green-400" />
                KES {gameStats.earnedMoney.toFixed(2)}
              </div>
            </div>
          </div>
          <Progress value={(timeLeft / 30) * 100} className="mt-2" />
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="border-0 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-xl text-slate-200">{currentQ.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQ.options.map((option, index) => {
            let buttonClass = "w-full p-4 text-left bg-slate-700/30 hover:bg-slate-600/50 border border-slate-600/50 text-slate-200 transition-all";
            
            if (isAnswered) {
              if (index === currentQ.correctAnswer) {
                buttonClass += " bg-green-600/30 border-green-500/50 text-green-300";
              } else if (index === selectedAnswer && index !== currentQ.correctAnswer) {
                buttonClass += " bg-red-600/30 border-red-500/50 text-red-300";
              }
            } else if (selectedAnswer === index) {
              buttonClass += " bg-blue-600/30 border-blue-500/50";
            }

            return (
              <Button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={buttonClass}
                disabled={isAnswered}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{option}</span>
                  {isAnswered && index === currentQ.correctAnswer && (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  )}
                  {isAnswered && index === selectedAnswer && index !== currentQ.correctAnswer && (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )}
                </div>
              </Button>
            );
          })}
          
          {isAnswered && (
            <div className="mt-6 p-4 bg-blue-600/10 border border-blue-500/30 rounded-lg">
              <h4 className="font-semibold text-blue-300 mb-2">Explanation:</h4>
              <p className="text-slate-300 text-sm">{currentQ.explanation}</p>
              <Button 
                onClick={nextQuestion}
                className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {currentQuestion < questions.length - 1 ? 'Next Question' : 'View Results'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedTriviaGame;