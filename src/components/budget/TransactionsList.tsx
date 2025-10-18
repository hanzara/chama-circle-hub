import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  CreditCard,
  Calendar,
  Tag,
  Edit3
} from 'lucide-react';
import { Transaction, useBudgetTracker } from '@/hooks/useBudgetTracker';
import CurrencyDisplay from '@/components/CurrencyDisplay';

interface TransactionsListProps {
  transactions: Transaction[];
}

const CATEGORIES = [
  'Food',
  'Transport',
  'Data',
  'Rent',
  'School Fees',
  'Entertainment',
  'Shopping',
  'Health',
  'Other',
];

const TransactionsList: React.FC<TransactionsListProps> = ({ transactions }) => {
  const { updateTransactionCategory } = useBudgetTracker();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = !searchTerm || 
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.merchant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || transaction.budget_category === filterCategory;
    const matchesType = filterType === 'all' || transaction.transaction_type === filterType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleCategoryUpdate = async (transactionId: string, newCategory: string) => {
    await updateTransactionCategory({ id: transactionId, budget_category: newCategory });
    setEditingCategory(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTransactionIcon = (type: string) => {
    return type === 'income' ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
          
          {(searchTerm || filterCategory !== 'all' || filterType !== 'all') && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('all');
                setFilterType('all');
              }}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {transactions.length === 0 ? (
              'No transactions recorded yet'
            ) : (
              'No transactions match your filters'
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {getTransactionIcon(transaction.transaction_type)}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {transaction.description || transaction.merchant_name || 'Transaction'}
                      </span>
                      {transaction.auto_categorized && (
                        <Badge variant="secondary" className="text-xs">
                          Auto
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(transaction.transaction_date)}
                      </div>
                      
                      {transaction.payment_method && (
                        <div className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          {transaction.payment_method.replace('_', ' ')}
                        </div>
                      )}
                      
                      {transaction.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {transaction.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Category with edit option */}
                  <div className="flex items-center gap-2">
                    {editingCategory === transaction.id ? (
                      <Select
                        value={transaction.budget_category || transaction.category}
                        onValueChange={(value) => handleCategoryUpdate(transaction.id, value)}
                      >
                        <SelectTrigger className="w-[120px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        <Badge variant="outline" className="text-xs">
                          {transaction.budget_category || transaction.category}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCategory(transaction.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Amount */}
                  <CurrencyDisplay
                    amount={transaction.amount}
                    className={`font-semibold ${
                      transaction.transaction_type === 'income' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}
                    showToggle={false}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionsList;