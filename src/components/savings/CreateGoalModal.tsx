import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Target, Calendar, Repeat, DollarSign } from 'lucide-react';
import { useSavingsGoals } from '@/hooks/useSavingsGoals';
import CurrencyDisplay from '@/components/CurrencyDisplay';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateGoalModal: React.FC<CreateGoalModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    goal_name: '',
    target_amount: '',
    target_date: '',
    auto_debit_enabled: false,
    auto_debit_amount: '',
    auto_debit_frequency: 'monthly' as 'weekly' | 'monthly',
    is_public: false,
  });

  const { createGoal, isCreating } = useSavingsGoals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.goal_name || !formData.target_amount) {
      return;
    }

    await createGoal({
      goal_name: formData.goal_name,
      target_amount: parseFloat(formData.target_amount),
      target_date: formData.target_date || undefined,
      auto_debit_enabled: formData.auto_debit_enabled,
      auto_debit_amount: formData.auto_debit_enabled ? parseFloat(formData.auto_debit_amount) || 0 : 0,
      auto_debit_frequency: formData.auto_debit_frequency,
      is_public: formData.is_public,
    });

    // Reset form
    setFormData({
      goal_name: '',
      target_amount: '',
      target_date: '',
      auto_debit_enabled: false,
      auto_debit_amount: '',
      auto_debit_frequency: 'monthly',
      is_public: false,
    });
    
    onClose();
  };

  const calculateMonthsToGoal = () => {
    if (!formData.target_amount || !formData.auto_debit_amount || !formData.auto_debit_enabled) return null;
    
    const targetAmount = parseFloat(formData.target_amount);
    const monthlyAmount = parseFloat(formData.auto_debit_amount);
    
    if (monthlyAmount <= 0) return null;
    
    const multiplier = formData.auto_debit_frequency === 'weekly' ? 4.33 : 1; // ~4.33 weeks per month
    const effectiveMonthlyAmount = monthlyAmount * multiplier;
    
    return Math.ceil(targetAmount / effectiveMonthlyAmount);
  };

  const monthsToGoal = calculateMonthsToGoal();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Create Savings Goal
          </DialogTitle>
          <DialogDescription>
            Set up a new savings goal with optional auto-debit to help you reach your target
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Goal Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goal_name">Goal Name</Label>
              <Input
                id="goal_name"
                placeholder="e.g., Emergency Fund, Vacation, New Car"
                value={formData.goal_name}
                onChange={(e) => setFormData({ ...formData, goal_name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target_amount">Target Amount (KES)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="target_amount"
                    type="number"
                    placeholder="100000"
                    value={formData.target_amount}
                    onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                    className="pl-10"
                    min="100"
                    step="100"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_date">Target Date (Optional)</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="target_date"
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                    className="pl-10"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Auto-Debit Settings */}
          <Card className="border-dashed">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-1">
                  <h4 className="font-medium flex items-center gap-2">
                    <Repeat className="h-4 w-4" />
                    Auto-Save Setup
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically transfer money to this goal on a schedule
                  </p>
                </div>
                <Switch
                  checked={formData.auto_debit_enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, auto_debit_enabled: checked })}
                />
              </div>

              {formData.auto_debit_enabled && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="auto_debit_amount">Amount per Transfer</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="auto_debit_amount"
                          type="number"
                          placeholder="5000"
                          value={formData.auto_debit_amount}
                          onChange={(e) => setFormData({ ...formData, auto_debit_amount: e.target.value })}
                          className="pl-10"
                          min="100"
                          step="100"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select 
                        value={formData.auto_debit_frequency} 
                        onValueChange={(value: 'weekly' | 'monthly') => 
                          setFormData({ ...formData, auto_debit_frequency: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {monthsToGoal && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">
                        📊 Projection: You'll reach your goal in approximately {monthsToGoal} months
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Based on your auto-save schedule
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="space-y-1">
              <h4 className="font-medium">Public Goal</h4>
              <p className="text-sm text-muted-foreground">
                Allow others to see this goal (amount will be hidden)
              </p>
            </div>
            <Switch
              checked={formData.is_public}
              onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
            />
          </div>

          {/* Goal Preview */}
          {formData.goal_name && formData.target_amount && (
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Goal Preview</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{formData.goal_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Target: <CurrencyDisplay amount={parseFloat(formData.target_amount)} showToggle={false} />
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    {formData.auto_debit_enabled && formData.auto_debit_amount && (
                      <p className="text-muted-foreground">
                        <CurrencyDisplay amount={parseFloat(formData.auto_debit_amount)} showToggle={false} /> 
                        /{formData.auto_debit_frequency}
                      </p>
                    )}
                    {formData.target_date && (
                      <p className="text-muted-foreground">
                        Due: {new Date(formData.target_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Goal'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGoalModal;