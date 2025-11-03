import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface VerifyContributionButtonProps {
  contributionId: string;
  chamaId: string;
  amount: number;
  onVerified?: () => void;
}

export const VerifyContributionButton: React.FC<VerifyContributionButtonProps> = ({
  contributionId,
  chamaId,
  amount,
  onVerified
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [notes, setNotes] = useState('');
  const [action, setAction] = useState<'verify' | 'reject' | null>(null);
  const { toast } = useToast();

  const handleVerify = async (verified: boolean) => {
    setAction(verified ? 'verify' : 'reject');
    setIsOpen(true);
  };

  const confirmAction = async () => {
    if (!action) return;

    setIsVerifying(true);

    try {
      const { error } = await supabase.functions.invoke('verify-contribution', {
        body: {
          contributionId,
          chamaId,
          verified: action === 'verify',
          notes
        }
      });

      if (error) throw error;

      toast({
        title: action === 'verify' ? 'Contribution Verified' : 'Contribution Rejected',
        description: `KES ${amount} has been ${action === 'verify' ? 'verified' : 'rejected'}`,
      });

      setIsOpen(false);
      setNotes('');
      setAction(null);
      
      if (onVerified) onVerified();

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to verify contribution',
        variant: 'destructive'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="text-green-600 hover:bg-green-50"
          onClick={() => handleVerify(true)}
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Verify
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-red-600 hover:bg-red-50"
          onClick={() => handleVerify(false)}
        >
          <XCircle className="h-4 w-4 mr-1" />
          Reject
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'verify' ? 'Verify' : 'Reject'} Contribution
            </DialogTitle>
            <DialogDescription>
              {action === 'verify' 
                ? 'Confirm that this contribution of KES ' + amount + ' has been received.'
                : 'Provide a reason for rejecting this contribution.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Textarea
              placeholder={action === 'verify' ? 'Add notes (optional)...' : 'Reason for rejection...'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              disabled={isVerifying || (action === 'reject' && !notes.trim())}
              className={action === 'verify' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {isVerifying ? 'Processing...' : action === 'verify' ? 'Verify' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
