import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User, Lightbulb, DollarSign, TrendingUp, Shield } from 'lucide-react';
import { useAIServices } from '@/hooks/useAIServices';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

export const AIFinancialAdvisor: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI Financial Advisor. I can help you with budgeting, saving strategies, investment advice, and financial planning. How can I assist you today?',
      timestamp: new Date(),
      suggestions: [
        'Help me create a budget',
        'Investment opportunities for beginners',
        'How to save for emergencies',
        'Reduce my monthly expenses'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const { chatMutation } = useAIServices();

  const quickActions = [
    { icon: DollarSign, label: 'Budget Help', query: 'Help me create a monthly budget plan' },
    { icon: TrendingUp, label: 'Investment Tips', query: 'What are safe investment options for beginners?' },
    { icon: Shield, label: 'Emergency Fund', query: 'How much should I save for emergencies?' },
    { icon: Lightbulb, label: 'Save Money', query: 'Give me tips to reduce my monthly expenses' },
  ];

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      // Simulate AI response for now
      const responses = [
        "Based on your spending patterns, I recommend allocating 50% for needs, 30% for wants, and 20% for savings and debt repayment.",
        "Consider starting with index funds or ETFs for your investment journey. They offer diversification with lower risk.",
        "An emergency fund should cover 3-6 months of essential expenses. Start with Ksh 10,000 and build gradually.",
        "Track your expenses for a week to identify areas where you can cut costs. Small changes add up over time.",
        "Your financial health is improving! Consider increasing your savings rate by 5% this month.",
      ];

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        suggestions: [
          'Tell me more about this',
          'Show me specific steps',
          'What are the risks?',
          'How do I get started?'
        ]
      };

      setTimeout(() => {
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);

    } catch (error) {
      console.error('Failed to get AI response:', error);
    }
  };

  const handleQuickAction = (query: string) => {
    handleSendMessage(query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>AI Financial Advisor</CardTitle>
            <CardDescription>
              Get personalized financial advice powered by AI
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Quick Actions */}
        <div className="p-4 border-b bg-muted/30">
          <p className="text-sm font-medium mb-2">Quick Actions:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-auto p-2 flex flex-col items-center space-y-1"
                onClick={() => handleQuickAction(action.query)}
              >
                <action.icon className="h-4 w-4" />
                <span className="text-xs text-center">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className={`flex-1 space-y-2 ${message.role === 'user' ? 'items-end' : ''}`}>
                  <div
                    className={`p-3 rounded-lg max-w-[80%] ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  
                  {message.suggestions && (
                    <div className="flex flex-wrap gap-1">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {chatMutation.isPending && (
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about budgeting, investments, savings..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(input)}
              disabled={chatMutation.isPending}
            />
            <Button
              onClick={() => handleSendMessage(input)}
              disabled={!input.trim() || chatMutation.isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};