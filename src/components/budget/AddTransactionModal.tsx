import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from 'lucide-react';
import { useBudgetTracker } from '@/hooks/useBudgetTracker';

interface AddTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TRANSACTION_TYPES = [
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
];

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

const PAYMENT_METHODS = [
  'Mobile Money',
  'Cash',
  'Bank Transfer',
  'Card',
  'Other',
];

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ open, onOpenChange }) => {
  const { addTransaction, isAddingTransaction } = useBudgetTracker();
  
  const [formData, setFormData] = useState({
    amount: '',
    transaction_type: 'expense',
    category: '',
    description: '',
    merchant_name: '',
    payment_method: '',
    location: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await addTransaction({
      amount: parseFloat(formData.amount),
      transaction_type: formData.transaction_type,
      category: formData.category,
      description: formData.description || undefined,
      merchant_name: formData.merchant_name || undefined,
      payment_method: formData.payment_method || undefined,
      location: formData.location || undefined,
      notes: formData.notes || undefined,
    });

    onOpenChange(false);
    setFormData({
      amount: '',
      transaction_type: 'expense',
      category: '',
      description: '',
      merchant_name: '',
      payment_method: '',
      location: '',
      notes: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Transaction
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (KES) *</Label>
            <Input
              id="amount"
              type="number"
              placeholder="1000"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Transaction Type */}
          <div className="space-y-2">
            <Label>Transaction Type *</Label>
            <Select 
              value={formData.transaction_type} 
              onValueChange={(value) => setFormData({ ...formData, transaction_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {TRANSACTION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g., Lunch at KFC"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Merchant Name */}
            <div className="space-y-2">
              <Label htmlFor="merchant">Merchant</Label>
              <Input
                id="merchant"
                placeholder="e.g., Safaricom"
                value={formData.merchant_name}
                onChange={(e) => setFormData({ ...formData, merchant_name: e.target.value })}
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select 
                value={formData.payment_method} 
                onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method} value={method.toLowerCase().replace(' ', '_')}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Westlands, Nairobi"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this transaction..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isAddingTransaction || !formData.amount || !formData.category}
              className="gap-2"
            >
              {isAddingTransaction ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Transaction
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionModal;