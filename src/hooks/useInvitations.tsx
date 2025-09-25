import { useState } from 'react';
import { useToast } from './use-toast';
import { useAuth } from './useAuth';

// Mock implementation since invitation tables and RPCs are not available in the current database schema
export const useInvitations = (chamaId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const createInvitation = ({ email, phoneNumber }: { email?: string; phoneNumber?: string }) => {
    if (!user || !chamaId) {
      toast({
        title: 'Not allowed',
        description: 'You must be signed in and select a chama to create invitations',
        variant: 'destructive',
      });
      return;
    }

    if (!email && !phoneNumber) {
      toast({
        title: 'Missing info',
        description: 'Provide an email or phone number to invite',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    setTimeout(() => {
      setIsCreating(false);
      toast({
        title: 'Feature not available',
        description: 'Invitations are not available in this version',
        variant: 'destructive',
      });
    }, 300);
  };

  return {
    invitations: [] as Array<{
      id: string;
      email?: string | null;
      phone_number?: string | null;
      created_at: string;
      expires_at?: string | null;
      status: 'pending' | 'accepted' | 'rejected' | 'expired';
    }>,
    isLoading: false,
    createInvitation,
    isCreating,
  };
};

export const useAcceptInvitation = () => {
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);

  const mutate = (
    invitationToken: string,
    opts?: { onSuccess?: (data: any) => void; onError?: (err: any) => void }
  ) => {
    setIsPending(true);
    setTimeout(() => {
      setIsPending(false);
      const data = { success: false, message: 'Invitations are not available in this version' };
      toast({
        title: 'Feature not available',
        description: data.message,
        variant: 'destructive',
      });
      opts?.onSuccess?.(data);
    }, 300);
  };

  return { mutate, isPending };
};
