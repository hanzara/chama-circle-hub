import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Plus, Calendar } from 'lucide-react';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { useNavigate } from 'react-router-dom';

interface SavingsGoal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'paused';
}

interface SavingsGoalsProps {
  goals: SavingsGoal[];
}

export const SavingsGoals: React.FC<SavingsGoalsProps> = ({ goals }) => {
  const navigate = useNavigate();

  const activeGoals = goals.filter(goal => goal.status === 'active');

  if (!activeGoals || activeGoals.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Savings Goals
          </CardTitle>
          <CardDescription>Track your financial targets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No Savings Goals</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Set up your first savings goal to start tracking your progress
            </p>
            <Button onClick={() => navigate('/personal-savings')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Goal
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Savings Goals ({activeGoals.length})
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => navigate('/personal-savings')}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Goal
          </Button>
        </CardTitle>
        <CardDescription>Track your financial targets</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activeGoals.slice(0, 3).map((goal) => {
            const progress = (goal.current_amount / goal.target_amount) * 100;
            const isCompleted = progress >= 100;
            
            return (
              <div key={goal.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{goal.title}</h4>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getPriorityColor(goal.priority)} text-white`}
                    >
                      {goal.priority}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {goal.category}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <CurrencyDisplay 
                      amount={goal.current_amount} 
                      className="font-medium" 
                      showToggle={false} 
                    />
                    <CurrencyDisplay 
                      amount={goal.target_amount} 
                      className="text-muted-foreground" 
                      showToggle={false} 
                    />
                  </div>
                  
                  <Progress 
                    value={Math.min(progress, 100)} 
                    className="h-2"
                  />
                  
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{Math.round(progress)}% complete</span>
                    {goal.target_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Due: {new Date(goal.target_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {isCompleted && (
                  <Badge variant="default" className="w-full justify-center bg-success">
                    🎉 Goal Completed!
                  </Badge>
                )}
              </div>
            );
          })}
          
          {activeGoals.length > 3 && (
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => navigate('/personal-savings')}
            >
              View All Goals ({activeGoals.length})
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};