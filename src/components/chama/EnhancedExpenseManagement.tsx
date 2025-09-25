
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, FileText, Upload, CheckCircle, XCircle, Clock } from 'lucide-react';
import CurrencyDisplay from '@/components/CurrencyDisplay';

interface EnhancedExpenseManagementProps {
  chamaData: any;
}

const EnhancedExpenseManagement: React.FC<EnhancedExpenseManagementProps> = ({ chamaData }) => {
  const { toast } = useToast();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: 'Events',
    receipts: null as File[] | null,
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`/api/expenses/chama/${chamaData.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setExpenses(data.expenses || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const handleRecordExpense = async () => {
    if (!formData.amount || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const expenseData = new FormData();
      expenseData.append('chamaId', chamaData.id);
      expenseData.append('amount', formData.amount);
      expenseData.append('description', formData.description);
      expenseData.append('category', formData.category);
      
      if (formData.receipts) {
        formData.receipts.forEach((file, index) => {
          expenseData.append(`receipts`, file);
        });
      }

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: expenseData,
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Expense Recorded! 📋",
          description: "Expense has been recorded and is pending approval",
        });
        
        setFormData({
          amount: '',
          description: '',
          category: 'Events',
          receipts: null,
        });
        setShowExpenseForm(false);
        fetchExpenses();
      } else {
        throw new Error(data.error || 'Failed to record expense');
      }
    } catch (error: any) {
      console.error('Error recording expense:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to record expense",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFormData({ ...formData, receipts: Array.from(files) });
    }
  };

  const approveExpense = async (expenseId: string) => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: "Expense Approved ✅",
          description: "The expense has been approved",
        });
        fetchExpenses();
      }
    } catch (error) {
      console.error('Error approving expense:', error);
    }
  };

  const rejectExpense = async (expenseId: string) => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: "Expense Rejected ❌",
          description: "The expense has been rejected",
        });
        fetchExpenses();
      }
    } catch (error) {
      console.error('Error rejecting expense:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-orange-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-orange-100 text-orange-800">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Enhanced Expense Management</h2>
          <p className="text-muted-foreground">Track and manage group expenses with approval workflow</p>
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
            <CardDescription>Add a new expense with receipt upload for approval</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expenseAmount">Amount (KES) *</Label>
                <Input 
                  id="expenseAmount" 
                  type="number" 
                  placeholder="5000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="expenseCategory">Category *</Label>
                <select 
                  id="expenseCategory" 
                  className="w-full p-2 border rounded-md bg-background"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
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
              <Input 
                id="expenseDescription" 
                placeholder="Brief description of the expense"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="expenseReceipt">Upload Receipts</Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="expenseReceipt" 
                  type="file" 
                  accept="image/*,application/pdf"
                  multiple
                  onChange={handleFileUpload}
                />
                <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
              {formData.receipts && (
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.receipts.length} file(s) selected
                </p>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleRecordExpense}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Recording...' : 'Record Expense'}
              </Button>
              <Button variant="outline" onClick={() => setShowExpenseForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Expense Records</CardTitle>
          <CardDescription>All recorded expenses with approval status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Receipts</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense: any, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {new Date(expense.expenseDate || expense.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-sm text-muted-foreground">
                        Recorded by {expense.recordedBy?.userId?.fullName || 'Unknown'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{expense.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <CurrencyDisplay amount={expense.amount} showToggle={false} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(expense.status)}
                      {getStatusBadge(expense.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span className="text-sm">
                        {expense.receipts?.length || 0} receipt(s)
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {expense.status === 'pending' && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600"
                          onClick={() => approveExpense(expense._id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600"
                          onClick={() => rejectExpense(expense._id)}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedExpenseManagement;
