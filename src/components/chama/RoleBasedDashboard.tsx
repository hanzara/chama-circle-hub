import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, DollarSign, FileText, Megaphone, Calendar, UserCog } from 'lucide-react';
import { ContributionLeaderboard } from './ContributionLeaderboard';
import { RealtimeContributionFeed } from './RealtimeContributionFeed';
import { AnnouncementComposer } from './AnnouncementComposer';
import { WalletCards } from './WalletCards';
import { RoleManagement } from './RoleManagement';
import { MerryGoRoundSchedule } from './MerryGoRoundSchedule';
import { PendingVerifications } from './PendingVerifications';

import { useChamaMembers } from '@/hooks/useChamaMembers';

interface RoleBasedDashboardProps {
  chamaId: string;
  userRole: string;
  isAdmin: boolean;
  isTreasurer: boolean;
  isSecretary: boolean;
}

export const RoleBasedDashboard: React.FC<RoleBasedDashboardProps> = ({
  chamaId,
  userRole,
  isAdmin,
  isTreasurer,
  isSecretary
}) => {
  const { data: members } = useChamaMembers(chamaId);
  const myMembership = members?.find(m => m.user_id === m.user_id);

  // Determine what features this role can access
  const canVerifyContributions = isAdmin || isTreasurer;
  const canSendAnnouncements = isAdmin || isSecretary;
  const canDownloadReports = isAdmin || isTreasurer;
  const canEditLoans = isAdmin || isTreasurer;

  return (
    <div className="space-y-6">
      {/* Role Badge */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Your Role</h3>
              <p className="text-2xl font-bold capitalize">{userRole}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {isAdmin && 'Full access to all chama features'}
                {isTreasurer && 'Manage finances, verify contributions, generate reports'}
                {isSecretary && 'Send announcements, manage communications'}
                {!isAdmin && !isTreasurer && !isSecretary && 'View and contribute to chama'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">
            <Users className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          {canVerifyContributions && (
            <TabsTrigger value="verify">
              <DollarSign className="h-4 w-4 mr-2" />
              Verify
            </TabsTrigger>
          )}
          {canSendAnnouncements && (
            <TabsTrigger value="announce">
              <Megaphone className="h-4 w-4 mr-2" />
              Announce
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="roles">
              <UserCog className="h-4 w-4 mr-2" />
              Roles
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="schedule">
              <Calendar className="h-4 w-4 mr-2" />
              MGR
            </TabsTrigger>
          )}
          {canDownloadReports && (
            <TabsTrigger value="reports">
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <WalletCards
            chamaId={chamaId}
            savingsBalance={myMembership?.savings_balance || 0}
            mgrBalance={myMembership?.mgr_balance || 0}
            withdrawalLocked={myMembership?.withdrawal_locked ?? true}
            canUnlock={isAdmin}
          />
        </TabsContent>

        {canVerifyContributions && (
          <TabsContent value="verify">
            <PendingVerifications chamaId={chamaId} />
          </TabsContent>
        )}

        {canSendAnnouncements && (
          <TabsContent value="announce">
            <AnnouncementComposer chamaId={chamaId} userRole={userRole} />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="roles">
            <RoleManagement chamaId={chamaId} />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="schedule">
            <MerryGoRoundSchedule chamaId={chamaId} isAdmin={isAdmin} />
          </TabsContent>
        )}

        {canDownloadReports && (
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Download Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Report generation interface coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
