import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Home, Car, Plane, GraduationCap, Heart, Briefcase, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSmartFinance } from '@/hooks/useSmartFinance';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const goalTemplates = [
  {
    icon: Home,
    title: "Buy a House",
    description: "Save for your dream home",
    category: "real_estate",
    suggestedAmount: 2000000
  },
  {
    icon: Car,
    title: "Buy a Car",
    description: "Get your new vehicle",
    category: "vehicle",
    suggestedAmount: 800000
  },
  {
    icon: Plane,
    title: "Vacation Trip",
    description: "Plan your dream vacation",
    category: "travel",
    suggestedAmount: 150000
  },
  {
    icon: GraduationCap,
    title: "Education Fund",
    description: "Invest in education",
    category: "education",
    suggestedAmount: 500000
  },
  {
    icon: Heart,
    title: "Emergency Fund",
    description: "Build financial security",
    category: "emergency",
    suggestedAmount: 300000
  },
  {
    icon: Briefcase,
    title: "Business Capital",
    description: "Start your business",
    category: "business",
    suggestedAmount: 1000000
  }
];

const CreateGoalModal: React.FC<CreateGoalModalProps> = ({ isOpen, onClose }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [customGoal, setCustomGoal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_amount: '',
    target_date: '',
    category: 'savings',
    priority: 'medium'
  });

  const { toast } = useToast();
  const { saveGoal, isSavingGoal } = useSmartFinance();

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setFormData({
      ...formData,
      title: template.title,
      description: template.description,
      target_amount: template.suggestedAmount.toString(),
      category: template.category
    });
    setCustomGoal(false);
  };

  const handleCustomGoal = () => {
    setCustomGoal(true);
    setSelectedTemplate(null);
    setFormData({
      title: '',
      description: '',
      target_amount: '',
      target_date: '',
      category: 'savings',
      priority: 'medium'
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.target_amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await saveGoal({
        title: formData.title,
        description: formData.description,
        target_amount: parseFloat(formData.target_amount),
        target_date: formData.target_date || undefined,
        category: formData.category,
        priority: formData.priority as 'low' | 'medium' | 'high',
        status: 'active',
        current_amount: 0
      });

      toast({
        title: "Goal Created",
        description: `Successfully created goal: ${formData.title}`,
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        target_amount: '',
        target_date: '',
        category: 'savings',
        priority: 'medium'
      });
      setSelectedTemplate(null);
      setCustomGoal(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Create New Financial Goal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!selectedTemplate && !customGoal && (
            <>
              <div>
                <h3 className="text-lg font-medium mb-4">Choose a Goal Template</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goalTemplates.map((template, index) => (
                    <Card 
                      key={index}
                      className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-300"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <template.icon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{template.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                            <p className="text-sm font-medium text-blue-600 mt-2">
                              Suggested: KES {template.suggestedAmount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={handleCustomGoal}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Custom Goal
                </Button>
              </div>
            </>
          )}

          {(selectedTemplate || customGoal) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Goal Details</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSelectedTemplate(null);
                    setCustomGoal(false);
                  }}
                >
                  Back to Templates
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Goal Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter goal title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target_amount">Target Amount (KES) *</Label>
                  <Input
                    id="target_amount"
                    type="number"
                    placeholder="Enter target amount"
                    value={formData.target_amount}
                    onChange={(e) => handleInputChange('target_amount', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your goal (optional)"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target_date">Target Date</Label>
                  <Input
                    id="target_date"
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => handleInputChange('target_date', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="real_estate">Real Estate</SelectItem>
                      <SelectItem value="vehicle">Vehicle</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="emergency">Emergency Fund</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value) => handleInputChange('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleSubmit}
                  disabled={isSavingGoal || !formData.title || !formData.target_amount}
                  className="flex-1"
                >
                  {isSavingGoal ? 'Creating Goal...' : 'Create Goal'}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGoalModal;