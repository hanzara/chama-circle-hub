import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, DollarSign, Clock, Percent, MessageSquare } from 'lucide-react';
import { usePeerLending } from '@/hooks/usePeerLending';

interface PeerLendingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PeerLendingModal: React.FC<PeerLendingModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    borrowerEmail: '',
    amount: '',
    interestRate: '10',
    durationMonths: '6',
    purpose: '',
    offerMessage: ''
  });

  const { createOffer, isLoading } = usePeerLending();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.borrowerEmail || !formData.amount) {
      return;
    }

    const success = await createOffer(
      formData.borrowerEmail,
      parseFloat(formData.amount),
      parseFloat(formData.interestRate),
      parseInt(formData.durationMonths),
      formData.purpose || undefined,
      formData.offerMessage || undefined
    );

    if (success) {
      setFormData({
        borrowerEmail: '',
        amount: '',
        interestRate: '10',
        durationMonths: '6',
        purpose: '',
        offerMessage: ''
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Create Loan Offer
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="borrowerEmail">Borrower Email</Label>
            <Input
              id="borrowerEmail"
              type="email"
              placeholder="Enter borrower's email"
              value={formData.borrowerEmail}
              onChange={(e) => setFormData({ ...formData, borrowerEmail: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (KES)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="10000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="pl-10"
                  min="100"
                  step="100"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interestRate">Interest Rate (%)</Label>
              <div className="relative">
                <Percent className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="interestRate"
                  type="number"
                  placeholder="10"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                  className="pl-10"
                  min="0"
                  max="50"
                  step="0.5"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="durationMonths">Duration (Months)</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="durationMonths"
                type="number"
                placeholder="6"
                value={formData.durationMonths}
                onChange={(e) => setFormData({ ...formData, durationMonths: e.target.value })}
                className="pl-10"
                min="1"
                max="60"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose (Optional)</Label>
            <Input
              id="purpose"
              placeholder="e.g., Business expansion, Emergency"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="offerMessage">Message (Optional)</Label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="offerMessage"
                placeholder="Add a personal message..."
                value={formData.offerMessage}
                onChange={(e) => setFormData({ ...formData, offerMessage: e.target.value })}
                className="pl-10"
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Send Offer'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PeerLendingModal;