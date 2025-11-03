import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useAcceptInvitation } from '@/hooks/useInvitations';
import Navigation from '@/components/Navigation';
import { Loader2, UserPlus, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const joinSchema = z.object({
  full_name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address').max(255),
  phone_number: z.string().trim().min(10, 'Phone number must be at least 10 digits').max(15),
});

const JoinChamaPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { mutate: acceptInvitation, isPending: isAccepting } = useAcceptInvitation();
  const [invitationToken, setInvitationToken] = useState<string | null>(null);
  const [chamaName, setChamaName] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setInvitationToken(token);
      fetchChamaDetails(token);
    } else {
      navigate('/');
    }
  }, [searchParams, navigate]);

  const fetchChamaDetails = async (token: string) => {
    try {
      const { data, error } = await supabase
        .from('member_invitations')
        .select('chama_id, chamas(name)')
        .eq('invitation_token', token)
        .eq('status', 'pending')
        .single();

      if (error) throw error;
      if (data?.chamas) {
        setChamaName((data.chamas as any).name);
      }
    } catch (error) {
      console.error('Error fetching chama details:', error);
    }
  };

  const handleAccept = () => {
    if (!invitationToken) return;
    
    acceptInvitation(invitationToken, {
      onSuccess: () => {
        navigate('/chamas');
      },
    });
  };

  const handleReject = () => {
    toast({
      title: 'Invitation Declined',
      description: 'You have declined the invitation to join this chama.',
    });
    navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      joinSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
        return;
      }
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.rpc('submit_join_request', {
        p_invitation_token: invitationToken,
        p_full_name: formData.full_name,
        p_email: formData.email,
        p_phone_number: formData.phone_number,
      });

      if (error) throw error;

      const result = data as { success?: boolean; message?: string } | null;
      if (result?.success === false) {
        throw new Error(result?.message || 'Failed to submit join request');
      }

      toast({
        title: 'Request Submitted!',
        description: result?.message || 'Your request to join has been sent to the admin for approval.',
      });

      setTimeout(() => navigate('/'), 2000);
    } catch (error: any) {
      console.error('Error submitting join request:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit join request',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!invitationToken) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="h-8 w-8 text-white" />
              </div>
              <CardTitle>Join {chamaName || 'Chama'}</CardTitle>
              <CardDescription>
                Fill in your details to request to join this savings group
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user && !showForm ? (
                <div className="space-y-6">
                  <p className="text-center text-muted-foreground">
                    Would you like to join this chama?
                  </p>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={handleAccept}
                      disabled={isAccepting}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {isAccepting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Accepting...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Accept Invitation
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={handleReject}
                      disabled={isAccepting}
                      variant="outline"
                      className="flex-1"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Decline
                    </Button>
                  </div>

                  <button
                    onClick={() => setShowForm(true)}
                    className="text-sm text-muted-foreground hover:text-foreground underline w-full text-center"
                  >
                    Not you? Fill in different details
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      required
                    />
                    {errors.full_name && (
                      <p className="text-sm text-destructive">{errors.full_name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number *</Label>
                    <Input
                      id="phone_number"
                      type="tel"
                      placeholder="0712345678"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      required
                    />
                    {errors.phone_number && (
                      <p className="text-sm text-destructive">{errors.phone_number}</p>
                    )}
                  </div>

                  <Button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Request to Join'
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    The admin will review your request and you'll be notified once approved
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default JoinChamaPage;
