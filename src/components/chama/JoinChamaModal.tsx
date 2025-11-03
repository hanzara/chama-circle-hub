import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useJoinChamaRequest } from "@/hooks/useJoinChamaRequest";

interface JoinChamaModalProps {
  isOpen: boolean;
  onClose: () => void;
  chamaId: string;
  chamaName: string;
}

export const JoinChamaModal: React.FC<JoinChamaModalProps> = ({
  isOpen,
  onClose,
  chamaId,
  chamaName,
}) => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [occupation, setOccupation] = useState('');
  const [reason, setReason] = useState('');
  
  const joinMutation = useJoinChamaRequest();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await joinMutation.mutateAsync({
      chamaId,
      details: {
        full_name: fullName,
        phone_number: phoneNumber,
        occupation,
        reason,
      }
    });

    // Reset form and close
    setFullName('');
    setPhoneNumber('');
    setOccupation('');
    setReason('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Join {chamaName}</DialogTitle>
          <DialogDescription>
            Fill in your details to request to join this chama. The admin will review your request.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <Label htmlFor="phoneNumber">Phone Number *</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="0712345678"
              required
            />
          </div>

          <div>
            <Label htmlFor="occupation">Occupation</Label>
            <Input
              id="occupation"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              placeholder="Your occupation"
            />
          </div>

          <div>
            <Label htmlFor="reason">Why do you want to join? *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Tell us why you want to join this chama"
              rows={4}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={joinMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={joinMutation.isPending}
            >
              {joinMutation.isPending ? 'Sending Request...' : 'Send Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
