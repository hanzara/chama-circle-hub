
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, FileText } from 'lucide-react';
import CurrencyDisplay from '@/components/CurrencyDisplay';

interface ExpenseManagementProps {
  chamaData: any;
}

const ExpenseManagement: React.FC<ExpenseManagementProps> = ({ chamaData }) => {
  const { toast } = useToast();
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const expenses = [
    { id: '1', description: 'Meeting hall rental', category: 'Events', amount: 5000, date: '2024-01-10', status: 'approved', receipts: 1 },
    { id: '2', description: 'Stationary and printing', category: 'Office', amount: 2500, date: '2024-01-05', status: 'pending', receipts: 1 },
    { id: '3', description: 'Annual registration fees', category: 'Legal', amount: 15000, date: '2023-12-20', status: 'approved', receipts: 2 }
  ];

  const handleRecordExpense = () => {
    toast({
      title: "Expense Recorded",
      description: "Expense has been recorded and is pending approval",
    });
    setShowExpenseForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Expense Management</h2>
          <p className="text-muted-foreground">Track and manage group expenses</p>
        </div>
        <Button onClick={() => setShowExpenseForm(true)} className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Record Expense
        </Button>
      </div>

      {showExpenseForm && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Record New Expense</CardTitle>
            <CardDescription>Add a new expense for approval</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expenseAmount">Amount (KES) *</Label>
                <Input id="expenseAmount" type="number" placeholder="5000" />
              </div>
              <div>
                <Label htmlFor="expenseCategory">Category</Label>
                <select id="expenseCategory" className="w-full p-2 border rounded-md bg-background">
                  <option value="Events">Events</option>
                  <option value="Office">Office</option>
                  <option value="Legal">Legal</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="expenseDescription">Description *</Label>
              <Input id="expenseDescription" placeholder="Brief description of the expense" />
            </div>
            <div>
              <Label htmlFor="expenseReceipt">Upload Receipt</Label>
              <Input id="expenseReceipt" type="file" accept="image/*,application/pdf" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRecordExpense}>Record Expense</Button>
              <Button variant="outline" onClick={() => setShowExpenseForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>Track all group expenditures</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg bg-white/50 hover:bg-white/80 transition-colors">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-medium">{expense.description}</h3>
                    <p className="text-sm text-muted-foreground">{expense.category} • {expense.date}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {expense.receipts} receipt(s)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <CurrencyDisplay amount={expense.amount} showToggle={false} className="font-medium" />
                  <Badge variant={expense.status === 'approved' ? 'secondary' : 'destructive'} className="ml-2">
                    {expense.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseManagement;
