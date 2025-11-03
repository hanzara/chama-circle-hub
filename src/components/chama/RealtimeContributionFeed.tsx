import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Sparkles } from 'lucide-react';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RealtimeContributionFeedProps {
  chamaId: string;
}

interface Contribution {
  id: string;
  member_id: string;
  amount: number;
  created_at: string;
  profiles?: {
    email: string;
    full_name?: string;
  };
}

export const RealtimeContributionFeed: React.FC<RealtimeContributionFeedProps> = ({ chamaId }) => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [recentContribution, setRecentContribution] = useState<Contribution | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Subscribe to real-time contribution updates
    const channel = supabase
      .channel('contribution-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chama_contributions_new',
          filter: `chama_id=eq.${chamaId}`
        },
        async (payload) => {
          console.log('New contribution received:', payload);
          
          // Fetch contributor details
          const { data: memberData } = await supabase
            .from('chama_members')
            .select('user_id')
            .eq('id', payload.new.member_id)
            .single();

          if (memberData) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('email, full_name')
              .eq('user_id', memberData.user_id)
              .single();

            const newContribution: Contribution = {
              id: payload.new.id,
              member_id: payload.new.member_id,
              amount: payload.new.amount,
              created_at: payload.new.created_at,
              profiles: profileData || undefined
            };

            setContributions(prev => [newContribution, ...prev].slice(0, 10));
            setRecentContribution(newContribution);

            // Show celebration toast
            toast({
              title: '🎉 New Contribution!',
              description: `${newContribution.profiles?.full_name || newContribution.profiles?.email || 'A member'} just contributed KES ${payload.new.amount}`,
            });

            // Clear recent highlight after 3 seconds
            setTimeout(() => setRecentContribution(null), 3000);
          }
        }
      )
      .subscribe();

    // Fetch initial contributions
    const fetchInitialContributions = async () => {
      const { data } = await supabase
        .from('chama_contributions_new')
        .select(`
          *,
          chama_members!inner(
            user_id,
            profiles:user_id(email, full_name)
          )
        `)
        .eq('chama_id', chamaId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        const formatted = data.map(c => ({
          ...c,
          profiles: (c.chama_members as any)?.profiles
        }));
        setContributions(formatted);
      }
    };

    fetchInitialContributions();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chamaId, toast]);

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Live Contribution Feed
          {recentContribution && (
            <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {contributions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No contributions yet. Be the first!</p>
            </div>
          ) : (
            contributions.map((contribution) => {
              const isRecent = recentContribution?.id === contribution.id;
              
              return (
                <div
                  key={contribution.id}
                  className={`
                    p-3 rounded-lg border transition-all duration-300
                    ${isRecent 
                      ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-300 shadow-lg scale-105' 
                      : 'bg-muted/30 border-transparent hover:bg-muted/50'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-white font-medium
                        ${isRecent ? 'bg-gradient-to-r from-green-500 to-blue-500 animate-pulse' : 'bg-gradient-to-r from-blue-500 to-purple-500'}
                      `}>
                        {contribution.profiles?.full_name?.[0] || contribution.profiles?.email?.[0] || 'M'}
                      </div>
                      <div>
                        <p className="font-medium">
                          {contribution.profiles?.full_name || contribution.profiles?.email || 'Member'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(contribution.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <CurrencyDisplay 
                        amount={contribution.amount} 
                        className={`font-bold ${isRecent ? 'text-green-600' : ''}`}
                        showToggle={false}
                      />
                      {isRecent && (
                        <Badge className="bg-green-500 text-white mt-1">
                          Just now!
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
