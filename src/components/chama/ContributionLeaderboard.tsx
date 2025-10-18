import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, RefreshCw, ArrowUpDown, DollarSign } from 'lucide-react';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCSVExport } from '@/hooks/useCSVExport';
import { VerifyContributionButton } from './VerifyContributionButton';

interface ContributionLeaderboardProps {
  chamaId: string;
  canDownload?: boolean;
  canVerify?: boolean;
  userRole?: string;
}

type SortOption = 'most_contributing' | 'top_saver' | 'ascending' | 'descending' | 'alphabetical';

export const ContributionLeaderboard: React.FC<ContributionLeaderboardProps> = ({
  chamaId,
  canDownload = false,
  canVerify = false,
  userRole
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('most_contributing');
  const { exportToCSV } = useCSVExport();

  const { data: members, isLoading, refetch } = useQuery({
    queryKey: ['chama-leaderboard', chamaId, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('chama_members')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq('chama_id', chamaId)
        .eq('is_active', true);

      // Apply sorting
      switch (sortBy) {
        case 'most_contributing':
          query = query.order('total_contributed', { ascending: false });
          break;
        case 'top_saver':
          query = query.order('savings_balance', { ascending: false });
          break;
        case 'ascending':
          query = query.order('total_contributed', { ascending: true });
          break;
        case 'descending':
          query = query.order('total_contributed', { ascending: false });
          break;
        case 'alphabetical':
          // Will sort by email since we have profiles joined
          break;
      }

      const { data, error } = await query;
      if (error) throw error;

      // Additional client-side sort for alphabetical
      if (sortBy === 'alphabetical') {
        return (data || []).sort((a, b) => {
          const aEmail = (a.profiles as any)?.email || '';
          const bEmail = (b.profiles as any)?.email || '';
          return aEmail.localeCompare(bEmail);
        });
      }

      return data || [];
    },
    enabled: !!chamaId
  });

  const handleDownload = () => {
    if (!members) return;

    const exportData = members.map((m, i) => ({
      rank: i + 1,
      email: (m.profiles as any)?.email || 'N/A',
      total_contributed: m.total_contributed || 0,
      savings_balance: m.savings_balance || 0,
      mgr_balance: m.mgr_balance || 0,
      role: m.role,
      last_contribution: m.last_contribution_date || 'Never'
    }));

    exportToCSV(
      exportData,
      'chama-contributions',
      ['Rank', 'Email', 'Total Contributed', 'Savings Balance', 'MGR Balance', 'Role', 'Last Contribution']
    );
  };

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              🏆 Contribution Leaderboard
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Top contributors ranked by total savings
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-[180px]">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="most_contributing">Most Contributing</SelectItem>
                <SelectItem value="top_saver">Top Saver</SelectItem>
                <SelectItem value="ascending">Ascending</SelectItem>
                <SelectItem value="descending">Descending</SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => refetch()}
              className="hover:bg-primary/10 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            {canDownload && (
              <Button variant="outline" size="icon" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gradient-to-r from-muted/50 to-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : members && members.length > 0 ? (
          <div className="space-y-3">
            {members.map((member, index) => (
              <div
                key={member.id}
                className="group relative flex items-center justify-between p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg hover:from-primary/10 hover:to-secondary/10 transition-all hover:shadow-md border border-transparent hover:border-primary/20"
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                    ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg shadow-yellow-500/50' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-lg shadow-gray-400/50' :
                      index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/50' :
                      'bg-gradient-to-br from-muted-foreground/20 to-muted-foreground/10'}
                  `}>
                    {index < 3 && (
                      <div className="absolute -top-1 -right-1 text-xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </div>
                    )}
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-base">{(member.profiles as any)?.email || 'Member'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {member.role}
                      </Badge>
                      {member.last_contribution_date && (
                        <span className="text-xs text-muted-foreground">
                          Last: {new Date(member.last_contribution_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <CurrencyDisplay 
                    amount={member.total_contributed || 0} 
                    className="font-bold text-lg"
                  />
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>Savings:</span>
                    <CurrencyDisplay amount={member.savings_balance || 0} className="font-medium" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center">
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-muted-foreground">No contributions yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Be the first to contribute to this chama!
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};