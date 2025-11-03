import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowUpRight, ArrowDownRight, Users, Send, HandCoins, Clock, 
  CheckCircle, XCircle, AlertCircle, Plus, Eye
} from 'lucide-react';
import { usePeerLending } from '@/hooks/usePeerLending';
import { useAuth } from '@/hooks/useAuth';
import PeerLendingModal from '@/components/PeerLendingModal';
import PinVerificationModal from '@/components/PinVerificationModal';
import CurrencyDisplay from '@/components/CurrencyDisplay';

const PeerLendingContent = () => {
  const { offers, transactions, isLoading, respondToOffer, disburseLoan } = usePeerLending();
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinAction, setPinAction] = useState<{
    type: 'accept' | 'reject' | 'disburse';
    offerId: string;
    response?: 'accepted' | 'rejected';
  } | null>(null);

  // Calculate stats
  const myOffers = offers.filter(offer => offer.lender_id === user?.id);
  const receivedOffers = offers.filter(offer => offer.borrower_id === user?.id);
  const totalLent = myOffers.reduce((sum, offer) => 
    offer.status === 'disbursed' ? sum + offer.amount : sum, 0
  );
  const expectedReturns = myOffers.reduce((sum, offer) => 
    offer.status === 'disbursed' ? sum + (offer.amount * (1 + offer.interest_rate / 100)) : sum, 0
  );
  const activeLoans = myOffers.filter(offer => offer.status === 'disbursed').length;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
      accepted: { label: 'Accepted', variant: 'default' as const, icon: CheckCircle },
      rejected: { label: 'Rejected', variant: 'destructive' as const, icon: XCircle },
      disbursed: { label: 'Disbursed', variant: 'default' as const, icon: CheckCircle },
      completed: { label: 'Completed', variant: 'default' as const, icon: CheckCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || AlertCircle;

    return (
      <Badge variant={config?.variant || 'secondary'} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config?.label || status}
      </Badge>
    );
  };

  const handleOfferAction = (offerId: string, action: 'accept' | 'reject' | 'disburse', response?: 'accepted' | 'rejected') => {
    setPinAction({ type: action, offerId, response });
    setShowPinModal(true);
  };

  const handlePinVerification = async (pin: string) => {
    if (!pinAction) return false;

    const { type, offerId, response } = pinAction;

    if (type === 'disburse') {
      return await disburseLoan(offerId, pin);
    } else {
      return await respondToOffer(offerId, response!, pin);
    }
  };

  return (
    <div className="grid gap-6">
      {/* Lending Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Lent</p>
                <CurrencyDisplay amount={totalLent} className="text-2xl font-bold" showToggle={false} />
              </div>
              <ArrowUpRight className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expected Returns</p>
                <CurrencyDisplay amount={expectedReturns} className="text-2xl font-bold text-green-600" showToggle={false} />
              </div>
              <ArrowDownRight className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Loans</p>
                <p className="text-2xl font-bold">{activeLoans}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create New Offer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Peer Lending
          </CardTitle>
          <CardDescription>Create loan offers or manage existing ones</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowCreateModal(true)} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Create New Loan Offer
          </Button>
        </CardContent>
      </Card>

      {/* My Offers */}
      {myOffers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>My Loan Offers</CardTitle>
            <CardDescription>Offers you've sent to others</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {myOffers.map((offer) => (
              <div key={offer.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">To: {offer.borrower_email}</p>
                    <p className="text-sm text-muted-foreground">
                      Amount: <CurrencyDisplay amount={offer.amount} showToggle={false} className="inline" />
                    </p>
                  </div>
                  {getStatusBadge(offer.status)}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Interest Rate:</span> {offer.interest_rate}%
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration:</span> {offer.duration_months} months
                  </div>
                </div>

                {offer.purpose && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Purpose:</span> {offer.purpose}
                  </div>
                )}

                {offer.status === 'accepted' && (
                  <Button 
                    size="sm" 
                    onClick={() => handleOfferAction(offer.id, 'disburse')}
                    disabled={isLoading}
                  >
                    <HandCoins className="h-4 w-4 mr-2" />
                    Disburse Loan
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Received Offers */}
      {receivedOffers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Loan Offers for You</CardTitle>
            <CardDescription>Offers you've received from others</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {receivedOffers.map((offer) => (
              <div key={offer.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">From: {offer.lender_id}</p>
                    <p className="text-sm text-muted-foreground">
                      Amount: <CurrencyDisplay amount={offer.amount} showToggle={false} className="inline" />
                    </p>
                  </div>
                  {getStatusBadge(offer.status)}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Interest Rate:</span> {offer.interest_rate}%
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration:</span> {offer.duration_months} months
                  </div>
                </div>

                {offer.offer_message && (
                  <div className="text-sm bg-muted p-3 rounded">
                    <span className="text-muted-foreground">Message:</span> {offer.offer_message}
                  </div>
                )}

                {offer.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleOfferAction(offer.id, 'accept', 'accepted')}
                      disabled={isLoading}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleOfferAction(offer.id, 'reject', 'rejected')}
                      disabled={isLoading}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your peer lending transaction history</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium capitalize">{transaction.transaction_type}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <CurrencyDisplay amount={transaction.amount} showToggle={false} className="font-medium" />
                  {getStatusBadge(transaction.status)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {offers.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <HandCoins className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Peer Lending Activity Yet</h3>
            <p className="text-muted-foreground mb-6">
              Start by creating your first loan offer to help friends and family
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Offer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <PeerLendingModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <PinVerificationModal
        isOpen={showPinModal}
        onClose={() => {
          setShowPinModal(false);
          setPinAction(null);
        }}
        onVerify={handlePinVerification}
        title="Verify Transaction"
        description="Please enter your 4-digit PIN to confirm this transaction."
        isLoading={isLoading}
      />
    </div>
  );
};

export default PeerLendingContent;