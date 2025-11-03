
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Star, 
  CheckCircle, 
  XCircle, 
  Trophy,
  Target,
  Zap
} from 'lucide-react';

interface TriviaQuestionProps {
  gameId: string;
  onGameEnd: () => void;
}

const TriviaQuestion: React.FC<TriviaQuestionProps> = ({ 
  gameId, 
  onGameEnd
}) => {
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('playing');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [streak, setStreak] = useState(0);
  const [category] = useState('finance'); // Default category
  const [maxWinnings] = useState(500); // Default max winnings

  const getQuestionsForCategory = (cat: string) => {
    const questionSets = {
      finance: [
        {
          id: 1,
          question: "What does ROI stand for in investment terms?",
          options: ["Return on Investment", "Rate of Interest", "Risk of Investment", "Revenue over Income"],
          correct: 0,
          difficulty: "Easy",
          points: 100
        },
        {
          id: 2,
          question: "Which Central Bank rate affects loan interest rates in Kenya?",
          options: ["Base Rate", "CBR (Central Bank Rate)", "Prime Rate", "LIBOR"],
          correct: 1,
          difficulty: "Medium",
          points: 150
        },
        {
          id: 3,
          question: "What percentage of your income should ideally go to savings?",
          options: ["5-10%", "10-15%", "20-30%", "50%"],
          correct: 2,
          difficulty: "Hard",
          points: 200
        },
        {
          id: 4,
          question: "In investment, what does 'blue chip' refer to?",
          options: ["New startups", "Large, stable companies", "Cryptocurrency", "Government bonds"],
          correct: 1,
          difficulty: "Easy",
          points: 120
        },
        {
          id: 5,
          question: "What is compound interest?",
          options: ["Interest on principal only", "Interest on interest + principal", "Bank charges", "Loan penalty"],
          correct: 1,
          difficulty: "Easy",
          points: 100
        }
      ],
      business: [
        {
          id: 1,
          question: "What is a business model canvas?",
          options: ["A painting tool", "Strategic planning framework", "Marketing strategy", "Financial statement"],
          correct: 1,
          difficulty: "Medium",
          points: 150
        },
        {
          id: 2,
          question: "In business, what does B2B stand for?",
          options: ["Business to Business", "Back to Back", "Buy to Build", "Brand to Brand"],
          correct: 0,
          difficulty: "Easy",
          points: 100
        },
        {
          id: 3,
          question: "What is the break-even point?",
          options: ["Maximum profit", "Revenue equals costs", "Minimum sales", "Market share"],
          correct: 1,
          difficulty: "Hard",
          points: 250
        },
        {
          id: 4,
          question: "Which factor is NOT part of SWOT analysis?",
          options: ["Strengths", "Weaknesses", "Operations", "Threats"],
          correct: 2,
          difficulty: "Medium",
          points: 180
        },
        {
          id: 5,
          question: "What is working capital?",
          options: ["Fixed assets", "Current assets - current liabilities", "Total revenue", "Annual profit"],
          correct: 1,
          difficulty: "Hard",
          points: 300
        }
      ],
      technology: [
        {
          id: 1,
          question: "What does API stand for?",
          options: ["Application Programming Interface", "Advanced Programming Integration", "Automated Program Interface", "Application Process Integration"],
          correct: 0,
          difficulty: "Easy",
          points: 100
        },
        {
          id: 2,
          question: "Which technology enables M-Pesa transactions?",
          options: ["Internet", "SMS/USSD", "Bluetooth", "WiFi only"],
          correct: 1,
          difficulty: "Medium",
          points: 150
        },
        {
          id: 3,
          question: "What is machine learning?",
          options: ["Teaching machines manually", "AI that learns from data", "Computer repair", "Software installation"],
          correct: 1,
          difficulty: "Hard",
          points: 200
        },
        {
          id: 4,
          question: "In fintech, what does KYC stand for?",
          options: ["Keep Your Cash", "Know Your Customer", "Kenya Youth Corps", "Key Yield Calculation"],
          correct: 1,
          difficulty: "Medium",
          points: 170
        },
        {
          id: 5,
          question: "What is cloud computing?",
          options: ["Weather prediction", "Internet-based computing services", "Sky photography", "Air traffic control"],
          correct: 1,
          difficulty: "Easy",
          points: 120
        }
      ],
      general: [
        {
          id: 1,
          question: "What is the capital of Kenya?",
          options: ["Mombasa", "Nairobi", "Kisumu", "Nakuru"],
          correct: 1,
          difficulty: "Easy",
          points: 50
        },
        {
          id: 2,
          question: "Which year did Kenya gain independence?",
          options: ["1962", "1963", "1964", "1965"],
          correct: 1,
          difficulty: "Easy",
          points: 60
        },
        {
          id: 3,
          question: "What does GDP stand for?",
          options: ["Gross Domestic Product", "General Development Plan", "Global Data Processing", "Government Development Program"],
          correct: 0,
          difficulty: "Medium",
          points: 100
        },
        {
          id: 4,
          question: "Who is the current president of Kenya?",
          options: ["Uhuru Kenyatta", "William Ruto", "Raila Odinga", "Kalonzo Musyoka"],
          correct: 1,
          difficulty: "Easy",
          points: 70
        },
        {
          id: 5,
          question: "What is inflation?",
          options: ["Currency appreciation", "General price increase", "Economic growth", "Interest rates"],
          correct: 1,
          difficulty: "Medium",
          points: 120
        }
      ],
      premium: [
        {
          id: 1,
          question: "In derivatives trading, what is a 'put option'?",
          options: ["Right to buy", "Right to sell", "Obligation to buy", "Obligation to sell"],
          correct: 1,
          difficulty: "Expert",
          points: 400
        },
        {
          id: 2,
          question: "What is the Sharpe ratio used for?",
          options: ["Risk-adjusted returns", "Market volatility", "Company valuation", "Currency exchange"],
          correct: 0,
          difficulty: "Expert",
          points: 500
        },
        {
          id: 3,
          question: "In blockchain, what is a 'smart contract'?",
          options: ["Legal document", "Self-executing contract with terms in code", "Insurance policy", "Employment agreement"],
          correct: 1,
          difficulty: "Expert",
          points: 450
        },
        {
          id: 4,
          question: "What does VaR measure in risk management?",
          options: ["Variable Returns", "Value at Risk", "Volatility Ratio", "Variance Analysis"],
          correct: 1,
          difficulty: "Expert",
          points: 600
        },
        {
          id: 5,
          question: "In fintech, what is DeFi?",
          options: ["Digital Finance", "Decentralized Finance", "Default Finance", "Defined Finance"],
          correct: 1,
          difficulty: "Expert",
          points: 550
        }
      ]
    };
    return questionSets[cat as keyof typeof questionSets] || questionSets.general;
  };

  const questions = getQuestionsForCategory(category);

  useEffect(() => {
    if (gameState === 'playing' && !showResult) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState, showResult, currentQuestion]);

  useEffect(() => {
    if (gameState === 'playing') {
      setTimeLeft(15);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  }, [currentQuestion, gameState]);

  const handleTimeUp = () => {
    setShowResult(true);
    setStreak(0);
    setTimeout(handleNextQuestion, 2000);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null || showResult) return;

    setSelectedAnswer(answerIndex.toString());
    setShowResult(true);

    const question = questions[currentQuestion];
    const isCorrect = answerIndex === question.correct;
    
    if (isCorrect) {
      const bonusMultiplier = streak >= 3 ? 1.5 : 1;
      const points = Math.floor(question.points * bonusMultiplier);
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }

    setTimeout(handleNextQuestion, 2000);
  };

  const handleNextQuestion = () => {
    if (currentQuestion + 1 >= questions.length) {
      // Calculate earnings based on performance and category
      const totalPossiblePoints = questions.reduce((sum, q) => sum + q.points, 0);
      const performanceRatio = score / totalPossiblePoints;
      
      // Apply diminishing returns - house edge built in
      let finalEarnings = 0;
      if (performanceRatio >= 0.9) {
        finalEarnings = maxWinnings; // Perfect or near-perfect score
      } else if (performanceRatio >= 0.7) {
        finalEarnings = Math.floor(maxWinnings * 0.6); // Good score
      } else if (performanceRatio >= 0.5) {
        finalEarnings = Math.floor(maxWinnings * 0.3); // Average score
      } else if (performanceRatio >= 0.3) {
        finalEarnings = Math.floor(maxWinnings * 0.1); // Poor score
      }
      // Below 30% = no winnings (house keeps entry fee)
      
      setGameState('finished');
      setTimeout(() => onGameEnd(), 3000);
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  if (gameState === 'waiting') {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6 text-center">
          <div className="space-y-4">
            <Clock className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="text-lg font-semibold">Waiting for Game to Start</h3>
            <p className="text-gray-600">Please register in the Game Lobby first!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'finished') {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="pt-6 text-center">
          <div className="space-y-4">
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-800">Game Complete!</h2>
            <div className="grid gap-4 md:grid-cols-3 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{score}</div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">KSh {Math.floor(score * 0.1)}</div>
                <div className="text-sm text-gray-600">Earnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{streak}</div>
                <div className="text-sm text-gray-600">Best Streak</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion) / questions.length) * 100;

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Badge variant="secondary">
                Question {currentQuestion + 1} of {questions.length}
              </Badge>
              <Badge variant={question.difficulty === 'Easy' ? 'secondary' : question.difficulty === 'Medium' ? 'default' : 'destructive'}>
                {question.difficulty}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-semibold">{score} pts</span>
              </div>
              {streak > 0 && (
                <div className="flex items-center gap-1">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <span className="font-semibold">{streak}x streak</span>
                </div>
              )}
            </div>
          </div>
          
          <Progress value={progress} className="mb-4" />
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Time remaining:</span>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-red-500" />
              <span className={`font-bold ${timeLeft <= 5 ? 'text-red-600' : 'text-gray-700'}`}>
                {timeLeft}s
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl leading-relaxed">{question.question}</CardTitle>
          <CardDescription>
            Worth {question.points} points {streak >= 3 && "(+50% streak bonus)"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {question.options.map((option, index) => {
            let buttonClass = "w-full p-4 text-left border-2 transition-all duration-200 ";
            
            if (showResult) {
              if (index === question.correct) {
                buttonClass += "border-green-500 bg-green-50 text-green-700";
              } else if (selectedAnswer === index.toString()) {
                buttonClass += "border-red-500 bg-red-50 text-red-700";
              } else {
                buttonClass += "border-gray-200 bg-gray-50 text-gray-500";
              }
            } else if (selectedAnswer === index.toString()) {
              buttonClass += "border-indigo-500 bg-indigo-50";
            } else {
              buttonClass += "border-gray-200 hover:border-gray-300 hover:bg-gray-50";
            }

            return (
              <Button
                key={index}
                variant="outline"
                className={buttonClass}
                onClick={() => handleAnswerSelect(index)}
                disabled={selectedAnswer !== null || showResult}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{option}</span>
                  {showResult && (
                    <div>
                      {index === question.correct ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : selectedAnswer === index.toString() ? (
                        <XCircle className="h-5 w-5 text-red-600" />
                      ) : null}
                    </div>
                  )}
                </div>
              </Button>
            );
          })}

          {showResult && (
            <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="text-center">
                {selectedAnswer !== null && parseInt(selectedAnswer) === question.correct ? (
                  <div className="text-green-600">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                    <p className="font-semibold">Correct! +{question.points} points</p>
                  </div>
                ) : (
                  <div className="text-red-600">
                    <XCircle className="h-8 w-8 mx-auto mb-2" />
                    <p className="font-semibold">
                      {selectedAnswer !== null ? "Incorrect!" : "Time's up!"} 
                      {" "}The answer was: {question.options[question.correct]}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TriviaQuestion;
