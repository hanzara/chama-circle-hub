
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAcceptInvitation } from '@/hooks/useInvitations';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import { Loader2, UserPlus } from 'lucide-react';

const JoinChamaPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const acceptInvitation = useAcceptInvitation();
  const [invitationToken, setInvitationToken] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setInvitationToken(token);
    } else {
      navigate('/');
    }
  }, [searchParams, navigate]);

  const handleAcceptInvitation = () => {
    if (!user) {
      // Redirect to login first
      navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    if (invitationToken) {
      acceptInvitation.mutate(invitationToken, {
        onSuccess: (data: any) => {
          if (data?.success) {
            // Redirect to chamas page after successful join
            setTimeout(() => navigate('/chamas'), 2000);
          }
        }
      });
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
              <CardTitle>Join Chama</CardTitle>
              <CardDescription>
                You've been invited to join a savings group
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!user ? (
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    You need to sign in first to join this chama
                  </p>
                  <Button 
                    onClick={handleAcceptInvitation}
                    className="w-full"
                  >
                    Sign In to Join
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Click the button below to accept the invitation and join the chama
                  </p>
                  <Button 
                    onClick={handleAcceptInvitation}
                    disabled={acceptInvitation.isPending}
                    className="w-full"
                  >
                    {acceptInvitation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      'Accept Invitation'
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default JoinChamaPage;
