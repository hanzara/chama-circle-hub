import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Plus, 
  Calendar,
  DollarSign,
  Target,
  Activity,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  ArrowUpCircle
} from 'lucide-react';
import { useBudgetTracker } from '@/hooks/useBudgetTracker';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import CreateBudgetModal from './CreateBudgetModal';
import AddTransactionModal from './AddTransactionModal';
import CategorySpendModal from './CategorySpendModal';
import CategoryTopUpModal from './CategoryTopUpModal';
import TransactionsList from './TransactionsList';
import BudgetAlerts from './BudgetAlerts';
import type { Database } from '@/integrations/supabase/types';

type BudgetCategory = Database['public']['Tables']['budget_categories']['Row'];

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

const BudgetDashboard: React.FC = () => {
  const [showCreateBudget, setShowCreateBudget] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showSpendModal, setShowSpendModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BudgetCategory | null>(null);
  
  const {
    budget,
    categories,
    transactions,
    alerts,
    currentMonth,
    spendingByCategory,
    remainingBudget,
    isLoading,
    spendFromCategory,
    topUpCategory,
    isSpending,
    isToppingUp,
    setCurrentMonth,
  } = useBudgetTracker();

  const handleSpendClick = (category: BudgetCategory) => {
    setSelectedCategory(category);
    setShowSpendModal(true);
  };

  const handleTopUpClick = (category: BudgetCategory) => {
    setSelectedCategory(category);
    setShowTopUpModal(true);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const currentDate = new Date(currentMonth);
    if (direction === 'prev') {
      currentDate.setMonth(currentDate.getMonth() - 1);
    } else {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentMonth(currentDate.toISOString().slice(0, 7) + '-01');
  };

  const getMonthName = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Prepare chart data
  const pieChartData = Object.entries(spendingByCategory).map(([category, amount], index) => ({
    name: category,
    value: amount,
    color: COLORS[index % COLORS.length],
  }));

  const barChartData = remainingBudget.map(category => ({
    category: category.category,
    budgeted: category.budget_limit,
    spent: category.spent_amount,
    remaining: category.remaining,
  }));

  const totalSpent = Object.values(spendingByCategory).reduce((sum, amount) => sum + amount, 0);
  const totalBudget = budget?.total_budget || 0;
  const remainingTotal = totalBudget - totalSpent;
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Budget Tracker</h1>
          <p className="text-muted-foreground">Track your spending and manage your budget</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMonthChange('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[140px] text-center">
              {getMonthName(currentMonth)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMonthChange('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          {!budget ? (
            <Button onClick={() => setShowCreateBudget(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Budget
            </Button>
          ) : (
            <Button onClick={() => setShowAddTransaction(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
          )}
        </div>
      </div>

      {!budget ? (
        /* No Budget State */
        <Card className="text-center py-12">
          <CardContent>
            <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="mb-2">No Budget Set</CardTitle>
            <CardDescription className="mb-6">
              Create your first budget to start tracking your spending and manage your finances better.
            </CardDescription>
            <Button onClick={() => setShowCreateBudget(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Budget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Budget Alerts */}
          {alerts.length > 0 && <BudgetAlerts alerts={alerts} />}

          {/* Overview Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CurrencyDisplay 
                  amount={totalBudget} 
                  className="text-2xl font-bold"
                  showToggle={false} 
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CurrencyDisplay 
                  amount={totalSpent} 
                  className="text-2xl font-bold text-red-600"
                  showToggle={false} 
                />
                <p className="text-xs text-muted-foreground">
                  {spentPercentage.toFixed(1)}% of budget
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Remaining</CardTitle>
                {remainingTotal >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </CardHeader>
              <CardContent>
                <CurrencyDisplay 
                  amount={remainingTotal} 
                  className={`text-2xl font-bold ${remainingTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  showToggle={false} 
                />
                <p className="text-xs text-muted-foreground">
                  {remainingTotal >= 0 ? 'Under budget' : 'Over budget'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{transactions.length}</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Details */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Spending by Category Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
                <CardDescription>
                  Visual breakdown of your expenses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`KES ${value.toLocaleString()}`, 'Amount']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No spending data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Budget vs Actual */}
            <Card>
              <CardHeader>
                <CardTitle>Budget vs Actual</CardTitle>
                <CardDescription>
                  Compare budgeted amounts with actual spending
                </CardDescription>
              </CardHeader>
              <CardContent>
                {barChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="category" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          `KES ${value.toLocaleString()}`, 
                          name === 'budgeted' ? 'Budgeted' : name === 'spent' ? 'Spent' : 'Remaining'
                        ]}
                      />
                      <Bar dataKey="budgeted" fill="#10b981" name="budgeted" />
                      <Bar dataKey="spent" fill="#ef4444" name="spent" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No budget data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Category Progress with Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Category Budget Management</CardTitle>
              <CardDescription>
                Track spending, make payments, and top-up your budgets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {remainingBudget.map((category) => (
                  <div key={category.id} className="space-y-3 pb-6 border-b last:border-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg">{category.category}</span>
                        {category.percentage >= 100 && (
                          <Badge variant="destructive" className="text-xs">
                            Over budget
                          </Badge>
                        )}
                        {category.percentage >= 80 && category.percentage < 100 && (
                          <Badge variant="secondary" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Low budget
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSpendClick(category)}
                          disabled={category.remaining_balance <= 0}
                          className="gap-1"
                        >
                          <CreditCard className="h-3 w-3" />
                          Spend
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTopUpClick(category)}
                          className="gap-1"
                        >
                          <ArrowUpCircle className="h-3 w-3" />
                          Top-Up
                        </Button>
                      </div>
                    </div>

                    {/* Budget Details */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Allocated</p>
                        <CurrencyDisplay 
                          amount={category.allocated_amount} 
                          className="font-medium"
                          showToggle={false} 
                        />
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Spent</p>
                        <CurrencyDisplay 
                          amount={category.spent_amount} 
                          className="font-medium text-red-600"
                          showToggle={false} 
                        />
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Remaining</p>
                        <CurrencyDisplay 
                          amount={category.remaining_balance} 
                          className={`font-semibold ${
                            category.remaining_balance <= 0 ? 'text-red-600' : 'text-green-600'
                          }`}
                          showToggle={false} 
                        />
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <Progress 
                        value={Math.min(category.percentage, 100)} 
                        className={`h-3 ${
                          category.percentage >= 100 
                            ? '[&>div]:bg-red-500' 
                            : category.percentage >= 80 
                            ? '[&>div]:bg-yellow-500' 
                            : '[&>div]:bg-green-500'
                        }`}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{category.percentage.toFixed(1)}% used</span>
                        {category.remaining_balance <= 0 && (
                          <span className="text-red-600 font-medium">
                            ⚠️ Out of funds - Top-up required
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <TransactionsList transactions={transactions} />
        </>
      )}

      {/* Modals */}
      <CreateBudgetModal 
        open={showCreateBudget} 
        onOpenChange={setShowCreateBudget}
      />
      
      <AddTransactionModal 
        open={showAddTransaction} 
        onOpenChange={setShowAddTransaction}
      />

      <CategorySpendModal
        open={showSpendModal}
        onOpenChange={setShowSpendModal}
        category={selectedCategory}
        onSpend={spendFromCategory}
        isProcessing={isSpending}
      />

      <CategoryTopUpModal
        open={showTopUpModal}
        onOpenChange={setShowTopUpModal}
        category={selectedCategory}
        onTopUp={topUpCategory}
        isProcessing={isToppingUp}
      />
    </div>
  );
};

export default BudgetDashboard;