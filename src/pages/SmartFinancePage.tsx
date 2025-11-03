import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Bot, Brain, TrendingUp, Target, Lightbulb, DollarSign, 
  PieChart, BookOpen, Award, MessageCircle, Calculator,
  AlertTriangle, CheckCircle, Star, Zap, Trophy,
  Clock, ArrowUp, ArrowDown, Send, Mic, Plus
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';
import { useSmartFinance } from '@/hooks/useSmartFinance';
import { useAIServices } from '@/hooks/useAIServices';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import CreateGoalModal from '@/components/CreateGoalModal';
import GoalContributionModal from '@/components/GoalContributionModal';

const SmartFinancePage = () => {
  const [chatMessage, setChatMessage] = useState('');
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState('');
  const [newGoalDate, setNewGoalDate] = useState('');
  const [showCreateGoalModal, setShowCreateGoalModal] = useState(false);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  // Use Smart Finance hooks
  const {
    profile,
    transactions,
    goals,
    recommendations,
    chatHistory,
    analytics,
    isLoadingProfile,
    isLoadingTransactions,
    updateProfile,
    addTransaction,
    saveGoal,
    sendChat,
    dismissRecommendation,
    isSendingChat
  } = useSmartFinance();

  const { aiAnalysisQuery } = useAIServices();

  // Convert chat history to the expected format
  const formattedChatHistory = chatHistory.map(chat => ({
    type: chat.message_type === 'user' ? 'user' : 'bot',
    message: chat.message,
    timestamp: new Date(chat.created_at)
  }));

  // Generate chart data from transactions
  const generateChartData = () => {
    if (!transactions.length) return [];

    const monthlyData = {};
    const currentDate = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = date.toISOString().substring(0, 7);
      monthlyData[monthKey] = {
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        income: 0,
        expenses: 0,
        savings: 0
      };
    }

    // Process transactions
    transactions.forEach(transaction => {
      const monthKey = transaction.transaction_date.substring(0, 7);
      if (monthlyData[monthKey]) {
        if (transaction.transaction_type === 'income') {
          monthlyData[monthKey].income += transaction.amount;
        } else if (transaction.transaction_type === 'expense') {
          monthlyData[monthKey].expenses += transaction.amount;
        }
      }
    });

    // Calculate savings for each month
    Object.keys(monthlyData).forEach(key => {
      monthlyData[key].savings = monthlyData[key].income - monthlyData[key].expenses;
    });

    return Object.values(monthlyData);
  };

  // Generate expense categories from transactions
  const generateExpenseCategories = () => {
    if (!transactions.length) return [];

    const categories = {};
    const currentMonth = new Date().toISOString().substring(0, 7);
    
    transactions
      .filter(t => t.transaction_type === 'expense' && t.transaction_date.startsWith(currentMonth))
      .forEach(transaction => {
        if (categories[transaction.category]) {
          categories[transaction.category] += transaction.amount;
        } else {
          categories[transaction.category] = transaction.amount;
        }
      });

    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff0000', '#0000ff'];
    return Object.entries(categories).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));
  };

  const handleSendMessage = () => {
    if (chatMessage.trim() && !isSendingChat) {
      sendChat(chatMessage);
      setChatMessage('');
    }
  };

  const handleCreateGoal = () => {
    if (newGoalName && newGoalAmount) {
      saveGoal({
        title: newGoalName,
        target_amount: parseFloat(newGoalAmount),
        target_date: newGoalDate || undefined,
        category: 'savings',
        priority: 'medium',
        status: 'active',
        current_amount: 0
      });
      setNewGoalName('');
      setNewGoalAmount('');
      setNewGoalDate('');
    }
  };

  // Default data for charts if no data available
  const expenseData = generateChartData();
  const expenseCategories = generateExpenseCategories();
  
  // AI Analysis data
  const aiAnalysis = aiAnalysisQuery.data;
  const creditScore = aiAnalysis?.creditScore || 650;

  const learningModules = [
    { title: 'Budgeting Basics', duration: '10 min', completed: true, points: 100 },
    { title: 'Investment Fundamentals', duration: '15 min', completed: true, points: 150 },
    { title: 'Digital Banking Safety', duration: '8 min', completed: false, points: 80 },
    { title: 'Micro-Investment Strategies', duration: '12 min', completed: false, points: 120 },
    { title: 'Building Credit Score', duration: '10 min', completed: false, points: 100 },
  ];

  const achievements = [
    { title: 'Savings Streak', description: '7 days of consistent saving', icon: Trophy, unlocked: true },
    { title: 'Budget Master', description: 'Stayed within budget for 2 weeks', icon: Target, unlocked: true },
    { title: 'Learning Champion', description: 'Completed 5 financial courses', icon: BookOpen, unlocked: false },
    { title: 'Investment Pioneer', description: 'Made your first investment', icon: TrendingUp, unlocked: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Smart Finance AI
              </h1>
              <p className="text-gray-600">Your personal AI-powered financial wellness companion</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">This Month Income</p>
                    <p className="text-2xl font-bold">
                      <CurrencyDisplay amount={analytics.monthlyIncome} showToggle={false} />
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Saved</p>
                    <p className="text-2xl font-bold">
                      <CurrencyDisplay amount={analytics.monthlySavings} showToggle={false} />
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">AI Score</p>
                    <p className="text-2xl font-bold">{Math.round((creditScore / 850) * 100)}/100</p>
                  </div>
                  <Bot className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">Goals Progress</p>
                    <p className="text-2xl font-bold">{analytics.activeGoalsCount}/{analytics.activeGoalsCount + analytics.completedGoalsCount}</p>
                  </div>
                  <Target className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="advisor" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="advisor" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI Advisor
            </TabsTrigger>
            <TabsTrigger value="tracker" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Smart Tracker
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Suggestions
            </TabsTrigger>
            <TabsTrigger value="learn" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Learn
            </TabsTrigger>
          </TabsList>

          {/* AI Advisor Tab */}
          <TabsContent value="advisor" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chat Interface */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    AI Finance Advisor Chat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96 mb-4 p-4 border rounded-lg">
                    <div className="space-y-4">
                      {formattedChatHistory.map((msg, index) => (
                        <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-sm p-3 rounded-lg ${
                            msg.type === 'user' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {msg.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask me anything about your finances..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button variant="outline">
                      <Mic className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Questions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      "How can I save more?",
                      "Best investment for Ksh 5,000?",
                      "Reduce my expenses by 20%",
                      "Emergency fund advice",
                      "Side hustle ideas"
                    ].map((question, index) => (
                      <Button 
                        key={index}
                        variant="outline" 
                        className="w-full text-left justify-start text-sm"
                        onClick={() => setChatMessage(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">AI Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Great Progress!</p>
                        <p className="text-xs text-gray-600">Your savings rate improved by 15% this month</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Watch Out</p>
                        <p className="text-xs text-gray-600">Transport costs are 20% above average</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Opportunity</p>
                        <p className="text-xs text-gray-600">You could invest Ksh 1,000 for better returns</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Smart Tracker Tab */}
          <TabsContent value="tracker" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cash Flow Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Cash Flow Prediction</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={expenseData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="income" stroke="#8884d8" strokeWidth={2} />
                      <Line type="monotone" dataKey="expenses" stroke="#82ca9d" strokeWidth={2} />
                      <Line type="monotone" dataKey="savings" stroke="#ffc658" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Expense Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Expense Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={expenseCategories}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                      >
                        {expenseCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  
                  <div className="mt-4 space-y-2">
                    {expenseCategories.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-sm">{category.name}</span>
                        </div>
                        <span className="text-sm font-medium">Ksh {category.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

              {/* Recent Transactions (Auto-categorized) */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions (Auto-categorized)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{transaction.description || transaction.category}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {transaction.category}
                            </Badge>
                            {transaction.auto_categorized && (
                              <Badge variant="outline" className="text-xs">
                                <Bot className="h-3 w-3 mr-1" />
                                Auto
                              </Badge>
                            )}
                          </div>
                        </div>
                        <span className={`font-bold ${
                          transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.transaction_type === 'income' ? '+' : '-'}
                          <CurrencyDisplay amount={Math.abs(transaction.amount)} showToggle={false} />
                        </span>
                      </div>
                    ))}

                    {transactions.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>No transactions yet</p>
                        <p className="text-sm">Start adding transactions to see insights</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal) => (
                <Card key={goal.id} className="relative overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{goal.title}</span>
                      <Badge variant={goal.status === 'active' ? 'default' : 'destructive'}>
                        {goal.status === 'active' ? 'Active' : goal.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span><CurrencyDisplay amount={goal.current_amount} showToggle={false} /> / <CurrencyDisplay amount={goal.target_amount} showToggle={false} /></span>
                      </div>
                      <Progress value={(goal.current_amount / goal.target_amount) * 100} className="h-2" />
                      <p className="text-xs text-gray-600 mt-1">
                        {Math.round((goal.current_amount / goal.target_amount) * 100)}% complete
                      </p>
                    </div>
                    
                    {goal.target_date && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Deadline:</span>
                        <span className="font-medium">{new Date(goal.target_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                     <Button 
                       size="sm" 
                       className="w-full"
                       onClick={() => {
                         setSelectedGoal(goal);
                         setShowContributionModal(true);
                       }}
                     >
                       <Plus className="h-4 w-4 mr-2" />
                       Add Contribution
                     </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Create New Goal Button */}
            <Card className="border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors cursor-pointer">
              <CardContent 
                className="flex items-center justify-center py-12"
                onClick={() => setShowCreateGoalModal(true)}
              >
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                    <Plus className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Create New Goal</h3>
                    <p className="text-sm text-gray-600">Set a financial target and track your progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-6">
            {recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recommendations.slice(0, 3).map((rec) => (
                    <div key={rec.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-green-700">{rec.title}</h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => dismissRecommendation(rec.id)}
                        >
                          Dismiss
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">{rec.description}</p>
                      {rec.expected_impact && (
                        <div className="text-sm">
                          <span className="text-green-600 font-medium">💰 Impact: KES {rec.expected_impact.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Investment Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Investment Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { 
                      title: 'Money Market Fund', 
                      risk: 'Low', 
                      returns: '8-12%', 
                      minAmount: 1000,
                      description: 'Perfect for your emergency fund with daily liquidity'
                    },
                    { 
                      title: 'Digital Chama Investment', 
                      risk: 'Medium', 
                      returns: '15-20%', 
                      minAmount: 500,
                      description: 'Join a tech-savvy chama focused on digital assets'
                    },
                    { 
                      title: 'SACCO Shares', 
                      risk: 'Low', 
                      returns: '10-15%', 
                      minAmount: 5000,
                      description: 'Stable returns with loan access benefits'
                    }
                  ].map((investment, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{investment.title}</h4>
                        <Badge variant={investment.risk === 'Low' ? 'default' : 'secondary'}>
                          {investment.risk} Risk
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{investment.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span>Returns: <strong>{investment.returns}</strong></span>
                        <span>Min: <strong>Ksh {investment.minAmount.toLocaleString()}</strong></span>
                      </div>
                      <Button size="sm" className="w-full mt-2">Learn More</Button>
                    </div>
                  ))}
                    </CardContent>
                  </Card>

                  {/* Loan Opportunities */}
                  <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Loan Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { 
                      title: 'Quick Cash Loan', 
                      amount: 5000, 
                      rate: '2%/month', 
                      qualification: 'High',
                      purpose: 'Emergency expenses or short-term needs'
                    },
                    { 
                      title: 'Asset Finance', 
                      amount: 50000, 
                      rate: '1.5%/month', 
                      qualification: 'Medium',
                      purpose: 'Buy motorcycle, equipment, or business assets'
                    },
                    { 
                      title: 'Business Loan', 
                      amount: 25000, 
                      rate: '1.8%/month', 
                      qualification: 'Medium',
                      purpose: 'Start or expand your business'
                    }
                  ].map((loan, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{loan.title}</h4>
                        <Badge variant={loan.qualification === 'High' ? 'default' : 'secondary'}>
                          {loan.qualification} Qualification
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{loan.purpose}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span>Amount: <strong>Ksh {loan.amount.toLocaleString()}</strong></span>
                        <span>Rate: <strong>{loan.rate}</strong></span>
                      </div>
                      <Button size="sm" className="w-full mt-2">Apply Now</Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* AI Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Personalized AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      title: 'Optimize Transport Costs',
                      description: 'Switch to monthly matatu passes to save Ksh 400/month',
                      impact: 'Save Ksh 4,800/year',
                      action: 'Set up automatic pass purchase'
                    },
                    {
                      title: 'Automate Your Savings',
                      description: 'Set up automatic transfer of Ksh 500 every payday',
                      impact: 'Save Ksh 13,000/year effortlessly',
                      action: 'Connect bank account'
                    },
                    {
                      title: 'Reduce Data Costs',
                      description: 'Switch to a cheaper data plan or use WiFi more',
                      impact: 'Save Ksh 200/month',
                      action: 'Compare data plans'
                    },
                    {
                      title: 'Start Side Income',
                      description: 'Your skills match online tutoring opportunities',
                      impact: 'Earn extra Ksh 3,000/month',
                      action: 'Join tutoring platform'
                    }
                  ].map((rec, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <h4 className="font-medium text-green-700">{rec.title}</h4>
                      <p className="text-sm text-gray-600">{rec.description}</p>
                      <div className="text-sm">
                        <span className="text-green-600 font-medium">💰 {rec.impact}</span>
                      </div>
                      <Button size="sm" variant="outline" className="w-full">
                        {rec.action}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learn Tab */}
          <TabsContent value="learn" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Learning Progress */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Financial Learning Modules
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {learningModules.map((module, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          module.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {module.completed ? <CheckCircle className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                        </div>
                        <div>
                          <h4 className="font-medium">{module.title}</h4>
                          <p className="text-sm text-gray-600">{module.duration} • {module.points} points</p>
                        </div>
                      </div>
                      <Button size="sm" variant={module.completed ? "outline" : "default"}>
                        {module.completed ? 'Review' : 'Start'}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Achievements & Gamification */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Learning Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">750</div>
                      <p className="text-sm text-gray-600">Total Points</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">5</div>
                      <p className="text-sm text-gray-600">Courses Completed</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">12</div>
                      <p className="text-sm text-gray-600">Day Streak</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Achievements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {achievements.map((achievement, index) => (
                      <div key={index} className={`flex items-center gap-3 p-2 rounded-lg ${
                        achievement.unlocked ? 'bg-green-50' : 'bg-gray-50'
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          achievement.unlocked ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'
                        }`}>
                          <achievement.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <h5 className={`text-sm font-medium ${
                            achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {achievement.title}
                          </h5>
                          <p className="text-xs text-gray-600">{achievement.description}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Featured Content */}
            <Card>
              <CardHeader>
                <CardTitle>What Millionaires Know - Daily Lessons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      title: "The Power of Compound Interest",
                      lesson: "Start with Ksh 100/day, grow to millions over 20 years",
                      time: "5 min read",
                      featured: true
                    },
                    {
                      title: "Multiple Income Streams",
                      lesson: "How to create 3-5 different income sources",
                      time: "8 min read",
                      featured: false
                    },
                    {
                      title: "Asset vs Liability Mindset",
                      lesson: "Buy things that put money in your pocket",
                      time: "6 min read",
                      featured: false
                    }
                  ].map((lesson, index) => (
                    <div key={index} className={`p-4 border rounded-lg ${
                      lesson.featured ? 'bg-gradient-to-r from-blue-50 to-green-50 border-blue-200' : ''
                    }`}>
                      <h4 className="font-medium mb-2">{lesson.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{lesson.lesson}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{lesson.time}</span>
                        {lesson.featured && <Badge>Featured</Badge>}
                      </div>
                      <Button size="sm" className="w-full mt-3">Read Now</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          </Tabs>

          {/* Modals */}
          <CreateGoalModal 
            isOpen={showCreateGoalModal}
            onClose={() => setShowCreateGoalModal(false)}
          />
          
          <GoalContributionModal 
            goal={selectedGoal}
            isOpen={showContributionModal}
            onClose={() => {
              setShowContributionModal(false);
              setSelectedGoal(null);
            }}
          />
        </div>
      </div>
    );
  };
  
  export default SmartFinancePage;