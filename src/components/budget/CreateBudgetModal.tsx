import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Target, Loader2 } from 'lucide-react';
import { useBudgetTracker } from '@/hooks/useBudgetTracker';
import CurrencyDisplay from '@/components/CurrencyDisplay';

interface CreateBudgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEFAULT_CATEGORIES = [
  'Food',
  'Transport',
  'Data',
  'Rent',
  'School Fees',
  'Entertainment',
  'Shopping',
  'Health',
  'Other'
];

const CreateBudgetModal: React.FC<CreateBudgetModalProps> = ({ open, onOpenChange }) => {
  const { createBudget, isCreatingBudget } = useBudgetTracker();
  
  const [formData, setFormData] = useState({
    totalIncome: '',
    totalBudget: '',
    categories: DEFAULT_CATEGORIES.map(cat => ({
      category: cat,
      limit: '',
    })),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalBudget = parseFloat(formData.totalBudget);
    const totalIncome = parseFloat(formData.totalIncome) || 0;
    
    const categories = formData.categories
      .filter(cat => cat.limit && parseFloat(cat.limit) > 0)
      .map(cat => ({
        category: cat.category,
        limit: parseFloat(cat.limit),
      }));

    if (categories.length === 0) {
      return;
    }

    await createBudget({
      totalBudget,
      totalIncome,
      categories,
    });

    onOpenChange(false);
    setFormData({
      totalIncome: '',
      totalBudget: '',
      categories: DEFAULT_CATEGORIES.map(cat => ({
        category: cat,
        limit: '',
      })),
    });
  };

  const updateCategoryLimit = (index: number, limit: string) => {
    const newCategories = [...formData.categories];
    newCategories[index].limit = limit;
    setFormData({ ...formData, categories: newCategories });
  };

  const addCustomCategory = () => {
    setFormData({
      ...formData,
      categories: [...formData.categories, { category: '', limit: '' }],
    });
  };

  const removeCategory = (index: number) => {
    const newCategories = formData.categories.filter((_, i) => i !== index);
    setFormData({ ...formData, categories: newCategories });
  };

  const updateCategoryName = (index: number, category: string) => {
    const newCategories = [...formData.categories];
    newCategories[index].category = category;
    setFormData({ ...formData, categories: newCategories });
  };

  const getTotalCategoryLimits = () => {
    return formData.categories
      .filter(cat => cat.limit)
      .reduce((sum, cat) => sum + parseFloat(cat.limit), 0);
  };

  const totalCategoryLimits = getTotalCategoryLimits();
  const totalBudget = parseFloat(formData.totalBudget) || 0;
  const isBalanced = Math.abs(totalCategoryLimits - totalBudget) < 0.01;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Create Monthly Budget
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Income and Total Budget */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalIncome">Monthly Income (Optional)</Label>
              <Input
                id="totalIncome"
                type="number"
                placeholder="50000"
                value={formData.totalIncome}
                onChange={(e) => setFormData({ ...formData, totalIncome: e.target.value })}
                min="0"
                step="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalBudget">Total Budget *</Label>
              <Input
                id="totalBudget"
                type="number"
                placeholder="40000"
                value={formData.totalBudget}
                onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
                min="0"
                step="100"
                required
              />
            </div>
          </div>

          {/* Budget Balance Check */}
          {totalBudget > 0 && totalCategoryLimits > 0 && (
            <Card className={isBalanced ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Total Budget:</span>
                  <CurrencyDisplay amount={totalBudget} className="font-medium" showToggle={false} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Category Total:</span>
                  <CurrencyDisplay amount={totalCategoryLimits} className="font-medium" showToggle={false} />
                </div>
                <div className="flex items-center justify-between text-sm font-semibold border-t pt-2 mt-2">
                  <span>Difference:</span>
                  <CurrencyDisplay 
                    amount={totalBudget - totalCategoryLimits} 
                    className={isBalanced ? 'text-green-600' : 'text-orange-600'} 
                    showToggle={false} 
                  />
                </div>
                {!isBalanced && (
                  <p className="text-xs text-orange-600 mt-2">
                    {totalCategoryLimits > totalBudget 
                      ? 'Your category limits exceed your total budget'
                      : 'You have unallocated budget remaining'
                    }
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Category Limits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Category Limits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.categories.map((category, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder="Category name"
                      value={category.category}
                      onChange={(e) => updateCategoryName(index, e.target.value)}
                      readOnly={index < DEFAULT_CATEGORIES.length}
                      className={index < DEFAULT_CATEGORIES.length ? 'bg-muted' : ''}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="Budget limit"
                      value={category.limit}
                      onChange={(e) => updateCategoryLimit(index, e.target.value)}
                      min="0"
                      step="100"
                    />
                  </div>
                  {index >= DEFAULT_CATEGORIES.length && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeCategory(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addCustomCategory}
                className="w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Custom Category
              </Button>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isCreatingBudget || !formData.totalBudget}
              className="gap-2"
            >
              {isCreatingBudget ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4" />
                  Create Budget
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBudgetModal;