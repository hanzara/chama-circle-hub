import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateChama } from '@/hooks/useChamas';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface CreateChamaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateChamaModal: React.FC<CreateChamaModalProps> = ({
  isOpen,
  onClose
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contribution_amount: '',
    contribution_frequency: 'monthly',
    max_members: '50'
  });

  const { mutate: createChama, isPending } = useCreateChama();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.contribution_amount) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    createChama({
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      contribution_amount: parseFloat(formData.contribution_amount),
      contribution_frequency: formData.contribution_frequency,
      max_members: parseInt(formData.max_members)
    }, {
      onSuccess: () => {
        toast({
          title: "Chama Created! 🎉",
          description: "Your chama has been created successfully"
        });
        onClose();
        setFormData({
          name: '',
          description: '',
          contribution_amount: '',
          contribution_frequency: 'monthly',
          max_members: '50'
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to create chama",
          variant: "destructive"
        });
      }
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Chama</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Chama Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Chama Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Student Finance Group"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={isPending}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of your chama's purpose and goals"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={isPending}
                rows={3}
              />
            </div>

            {/* Contribution Amount */}
            <div className="space-y-2">
              <Label htmlFor="contribution_amount">Contribution Amount (KES) *</Label>
              <Input
                id="contribution_amount"
                type="number"
                placeholder="1000"
                min="1"
                step="1"
                value={formData.contribution_amount}
                onChange={(e) => handleInputChange('contribution_amount', e.target.value)}
                disabled={isPending}
              />
            </div>

            {/* Contribution Frequency */}
            <div className="space-y-2">
              <Label htmlFor="frequency">Contribution Frequency</Label>
              <Select 
                value={formData.contribution_frequency} 
                onValueChange={(value) => handleInputChange('contribution_frequency', value)}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Max Members */}
            <div className="space-y-2">
              <Label htmlFor="max_members">Maximum Members</Label>
              <Input
                id="max_members"
                type="number"
                min="2"
                max="100"
                value={formData.max_members}
                onChange={(e) => handleInputChange('max_members', e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Chama'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};