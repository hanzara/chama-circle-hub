import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PiggyBank, Plus, Target, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { useSavingsGoals } from '@/hooks/useSavingsGoals';
import CurrencyDisplay from '@/components/CurrencyDisplay';

interface SavingsOverviewProps {
  onCreateGoal: () => void;
  onContribute: (goalId: string) => void;
}

const SavingsOverview: React.FC<SavingsOverviewProps> = ({ onCreateGoal, onContribute }) => {
  const { goals, transactions, isLoading } = useSavingsGoals();

  const totalSaved = goals.reduce((sum, goal) => sum + goal.current_amount, 0);
  const totalTargets = goals.reduce((sum, goal) => sum + goal.target_amount, 0);
  const overallProgress = totalTargets > 0 ? (totalSaved / totalTargets) * 100 : 0;

  const recentTransactions = transactions.slice(0, 5);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="group relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white transform hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-blue-100">Total Saved</CardTitle>
            <div className="p-2 bg-white/20 rounded-lg">
              <PiggyBank className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <CurrencyDisplay amount={totalSaved} className="text-3xl font-bold text-white mb-2" showToggle={false} />
            <p className="text-sm text-blue-100 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              {goals.length} active goals
            </p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white transform hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-green-100">Total Targets</CardTitle>
            <div className="p-2 bg-white/20 rounded-lg">
              <Target className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <CurrencyDisplay amount={totalTargets} className="text-3xl font-bold text-white mb-2" showToggle={false} />
            <p className="text-sm text-green-100">
              {overallProgress.toFixed(1)}% achieved
            </p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white transform hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-purple-100">Monthly Target</CardTitle>
            <div className="p-2 bg-white/20 rounded-lg">
              <Calendar className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <CurrencyDisplay 
              amount={goals.filter(g => g.auto_debit_enabled).reduce((sum, g) => sum + g.auto_debit_amount, 0)} 
              className="text-3xl font-bold text-white mb-2" 
              showToggle={false} 
            />
            <p className="text-sm text-purple-100">Auto-save enabled</p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white transform hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-orange-100">This Month</CardTitle>
            <div className="p-2 bg-white/20 rounded-lg">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <CurrencyDisplay 
              amount={recentTransactions
                .filter(t => t.transaction_type === 'deposit' && 
                  new Date(t.created_at).getMonth() === new Date().getMonth())
                .reduce((sum, t) => sum + t.amount, 0)} 
              className="text-3xl font-bold text-white mb-2" 
              showToggle={false} 
            />
            <p className="text-sm text-orange-100">
              {recentTransactions.filter(t => t.transaction_type === 'deposit').length} deposits
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Goals */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Active Savings Goals
            </CardTitle>
            <CardDescription>Track your progress towards financial goals</CardDescription>
          </div>
          <Button onClick={onCreateGoal} className="gap-2">
            <Plus className="h-4 w-4" />
            New Goal
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {goals.length === 0 ? (
            <div className="text-center py-12">
              <PiggyBank className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No savings goals yet</h3>
              <p className="text-muted-foreground mb-4">Create your first savings goal to start building your future</p>
              <Button onClick={onCreateGoal} className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Goal
              </Button>
            </div>
          ) : (
            goals.map((goal) => {
              const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
              const isCompleted = progress >= 100;
              const daysLeft = goal.target_date ? 
                Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : null;

              return (
                <div key={goal.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <PiggyBank className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{goal.goal_name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CurrencyDisplay amount={goal.current_amount} showToggle={false} />
                          <span>of</span>
                          <CurrencyDisplay amount={goal.target_amount} showToggle={false} />
                          {daysLeft && daysLeft > 0 && (
                            <>
                              <span>•</span>
                              <span>{daysLeft} days left</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={isCompleted ? "default" : "secondary"}>
                        {progress.toFixed(1)}%
                      </Badge>
                      {goal.auto_debit_enabled && (
                        <Badge variant="outline" className="text-xs">
                          Auto-save
                        </Badge>
                      )}
                      <Button 
                        size="sm" 
                        onClick={() => onContribute(goal.id)}
                        disabled={isCompleted}
                      >
                        Add Funds
                      </Button>
                    </div>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-2" />
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      {recentTransactions.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest savings transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      transaction.transaction_type === 'deposit' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium capitalize">
                        {transaction.transaction_type}
                        {transaction.notes && ` - ${transaction.notes}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <CurrencyDisplay 
                      amount={transaction.amount} 
                      className={`font-semibold ${
                        transaction.transaction_type === 'deposit' ? 'text-green-600' : 'text-red-600'
                      }`}
                      showToggle={false} 
                    />
                    <Badge variant="outline" className="text-xs mt-1">
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SavingsOverview;