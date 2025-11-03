import React, { useEffect, useState } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { useRealtimeContributions } from '@/hooks/useRealtimeContributions';
import { useStuckPaymentReconciliation } from '@/hooks/useStuckPaymentReconciliation';
import { usePaystackBalanceSync } from '@/hooks/usePaystackBalanceSync';
import { ContributionPopup } from '@/components/shared/ContributionPopup';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ActiveChamasCarousel } from '@/components/dashboard/ActiveChamasCarousel';
import { SavingsGoals } from '@/components/dashboard/SavingsGoals';
import { UpcomingContributions } from '@/components/dashboard/UpcomingContributions';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { NotificationsAlerts } from '@/components/dashboard/NotificationsAlerts';
import { InvitationsPanel } from '@/components/chama/InvitationsPanel';
import { AddMoneyModal } from '@/components/modals/AddMoneyModal';
import { SendMoneyModal } from '@/components/modals/SendMoneyModal';
import { MakeContributionModal } from '@/components/dashboard/MakeContributionModal';
import { WithdrawModal } from '@/components/chama/WithdrawModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertCircle, Wifi } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { recentContribution } = useRealtimeContributions();
  const { syncBalance } = usePaystackBalanceSync();
  
  // Auto-reconcile stuck Paystack payments
  useStuckPaymentReconciliation();
  
  const {
    data,
    isLoading,
    error,
    isOffline,
    lastUpdated,
    refreshDashboard,
    handleQuickAction,
    trackDashboardEvent,
  } = useDashboard();

  // Modal states
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [showSendMoneyModal, setShowSendMoneyModal] = useState(false);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Auto-sync Paystack balance on mount
  useEffect(() => {
    if (!isOffline) {
      syncBalance();
    }
  }, []);

  // Track dashboard view on mount
  useEffect(() => {
    trackDashboardEvent('dashboard_open');
  }, [trackDashboardEvent]);

  // Handle quick actions
  const onQuickAction = (actionType: 'add_money' | 'send' | 'request_loan' | 'join_chama' | 'make_contribution' | 'withdraw') => {
    const result = handleQuickAction(actionType);
    if (!result) return; // Action was blocked (e.g., offline)

    switch (actionType) {
      case 'add_money':
        setShowAddMoneyModal(true);
        break;
      case 'make_contribution':
        setShowContributionModal(true);
        break;
      case 'send':
        setShowSendMoneyModal(true);
        break;
      case 'withdraw':
        setShowWithdrawModal(true);
        break;
      case 'request_loan':
        navigate('/apply-loan');
        break;
      case 'join_chama':
        navigate('/available-chamas');
        break;
    }
  };

  // Handle modal success callbacks
  const handleMoneyOperationSuccess = () => {
    refreshDashboard(); // Refresh dashboard data after successful operation
  };

  // Handle notification actions
  const handleNotificationDismiss = (notificationId: string) => {
    // TODO: Implement notification dismissal
    toast({
      title: "Notification dismissed",
      description: "The notification has been removed.",
    });
  };

  const handleNotificationRead = (notificationId: string) => {
    // TODO: Implement mark as read
    toast({
      title: "Marked as read",
      description: "The notification has been marked as read.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-emerald-50/30">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-emerald-50/30">
        <div className="container mx-auto px-6 py-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Unable to Load Dashboard</h2>
              <p className="text-muted-foreground mb-4">
                {isOffline 
                  ? "You're currently offline. Please check your connection."
                  : "There was an error loading your dashboard data."
                }
              </p>
              <Button onClick={refreshDashboard} disabled={isOffline}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const {
    walletBalance = 0,
    activeChamas = [],
    savingsGoals = [],
    upcomingContributions = [],
    recentTransactions = [],
    notifications = [],
  } = data || {};

  // Filter to only show Aqua/Acqua Avengers (case-insensitive)
  const filteredChamas = activeChamas.filter((chama: any) =>
    /a(c)?qua avengers/i.test((chama?.name || '').trim())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-emerald-50/30">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.05),transparent_70%)] animate-pulse" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(16,185,129,0.05),transparent_70%)] animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Connection Status Bar */}
        {isOffline && (
          <div className="mb-6">
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-800">
                    You're offline. Some features may not be available.
                  </span>
                </div>
                <Badge variant="secondary" className="bg-orange-200 text-orange-800">
                  Offline Mode
                </Badge>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="mb-8">
          <DashboardHeader
            walletBalance={walletBalance}
            isOffline={isOffline}
            lastUpdated={lastUpdated}
            onAddMoney={() => onQuickAction('add_money')}
            onSettings={() => navigate('/settings')}
          />
        </div>

        {/* Pending Invitations */}
        <div className="mb-8">
          <InvitationsPanel />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions
            onAction={onQuickAction}
            isOffline={isOffline}
          />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Chamas */}
            <ActiveChamasCarousel
              chamas={filteredChamas}
              onViewChama={(chamaId) => {
                trackDashboardEvent('view_chama_card', { chamaId });
                navigate(`/chama/${chamaId}`);
              }}
            />

            {/* Recent Transactions */}
            <RecentTransactions transactions={recentTransactions} />
          </div>

          {/* Right Column - Side Content */}
          <div className="space-y-6">
            {/* Notifications */}
            {notifications.length > 0 && (
              <NotificationsAlerts
                notifications={notifications}
                onDismiss={handleNotificationDismiss}
                onMarkAsRead={handleNotificationRead}
              />
            )}

            {/* Upcoming Contributions */}
            <UpcomingContributions contributions={upcomingContributions} />

            {/* Savings Goals */}
            <SavingsGoals goals={savingsGoals} />
          </div>
        </div>

        {/* Refresh Button */}
        <div className="fixed bottom-6 right-6">
          <Button
            onClick={refreshDashboard}
            disabled={isOffline}
            size="sm"
            className="shadow-lg"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Modals */}
        <AddMoneyModal
          isOpen={showAddMoneyModal}
          onClose={() => setShowAddMoneyModal(false)}
          onSuccess={handleMoneyOperationSuccess}
        />
        
        <SendMoneyModal
          isOpen={showSendMoneyModal}
          onClose={() => setShowSendMoneyModal(false)}
          onSuccess={handleMoneyOperationSuccess}
          walletBalance={walletBalance}
        />

        <MakeContributionModal
          isOpen={showContributionModal}
          onClose={() => setShowContributionModal(false)}
          onSuccess={handleMoneyOperationSuccess}
        />

        <WithdrawModal
          open={showWithdrawModal}
          onOpenChange={setShowWithdrawModal}
          chamaId=""
          mgrBalance={walletBalance}
        />

        {/* Real-time contribution popup */}
        {recentContribution && (
          <ContributionPopup
            memberName={recentContribution.member_name}
            amount={recentContribution.amount}
            chamaName={recentContribution.chama_name}
            isVisible={true}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;