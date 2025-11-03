import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AddBillProviderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProviderAdded: () => void;
}

const AddBillProviderModal: React.FC<AddBillProviderModalProps> = ({ 
  open, 
  onOpenChange, 
  onProviderAdded 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    provider_name: '',
    provider_type: '',
    paybill_number: '',
    till_number: '',
    account_number: '',
    provider_code: '',
    category: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add bill providers",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('user_bill_providers')
        .insert({
          user_id: user.id,
          provider_name: formData.provider_name,
          provider_type: formData.provider_type,
          paybill_number: formData.provider_type === 'paybill' ? formData.paybill_number : null,
          till_number: formData.provider_type === 'till' ? formData.till_number : null,
          account_number: formData.provider_type === 'account' ? formData.account_number : null,
          provider_code: formData.provider_code || null,
          category: formData.category,
        });

      if (error) throw error;

      toast({
        title: "Success! 🎉",
        description: "Bill provider added successfully",
      });

      setFormData({
        provider_name: '',
        provider_type: '',
        paybill_number: '',
        till_number: '',
        account_number: '',
        provider_code: '',
        category: '',
      });

      onProviderAdded();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error adding bill provider:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add bill provider",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderNumberInput = () => {
    switch (formData.provider_type) {
      case 'paybill':
        return (
          <div className="space-y-2">
            <Label htmlFor="paybill_number">Paybill Number *</Label>
            <Input
              id="paybill_number"
              placeholder="e.g. 123456"
              value={formData.paybill_number}
              onChange={(e) => setFormData({ ...formData, paybill_number: e.target.value })}
              required
            />
          </div>
        );
      case 'till':
        return (
          <div className="space-y-2">
            <Label htmlFor="till_number">Till Number *</Label>
            <Input
              id="till_number"
              placeholder="e.g. 123456"
              value={formData.till_number}
              onChange={(e) => setFormData({ ...formData, till_number: e.target.value })}
              required
            />
          </div>
        );
      case 'account':
        return (
          <div className="space-y-2">
            <Label htmlFor="account_number">Account Number *</Label>
            <Input
              id="account_number"
              placeholder="e.g. 1234567890"
              value={formData.account_number}
              onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
              required
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Bill Provider
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider_name">Provider Name *</Label>
            <Input
              id="provider_name"
              placeholder="e.g. Kenya Power, Safaricom"
              value={formData.provider_name}
              onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider_type">Payment Type *</Label>
            <Select
              value={formData.provider_type}
              onValueChange={(value) => setFormData({ ...formData, provider_type: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paybill">Paybill</SelectItem>
                <SelectItem value="till">Till Number</SelectItem>
                <SelectItem value="account">Account Number</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {renderNumberInput()}

          <div className="space-y-2">
            <Label htmlFor="provider_code">Provider Code (Optional)</Label>
            <Input
              id="provider_code"
              placeholder="e.g. KPLC, SAF"
              value={formData.provider_code}
              onChange={(e) => setFormData({ ...formData, provider_code: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="telecom">Telecom</SelectItem>
                <SelectItem value="banking">Banking</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="government">Government</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.provider_name || !formData.provider_type || !formData.category}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Provider
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBillProviderModal;