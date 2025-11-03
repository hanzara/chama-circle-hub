import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  DollarSign, 
  Percent, 
  Calendar, 
  User, 
  Plus, 
  TrendingUp,
  Shield,
  Clock,
  Star,
  Loader2
} from 'lucide-react';
import { useLoanMarketplace } from '@/hooks/useLoanMarketplace';
import CurrencyDisplay from '@/components/CurrencyDisplay';

interface LoanMarketplaceProps {
  onAcceptOffer?: (offerId: string, amount: number, termMonths: number) => void;
}

const LoanMarketplace: React.FC<LoanMarketplaceProps> = ({ onAcceptOffer }) => {
  const [showCreateOfferModal, setShowCreateOfferModal] = useState(false);
  const [showAcceptOfferModal, setShowAcceptOfferModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [offerForm, setOfferForm] = useState({
    offered_amount: '',
    offered_interest_rate: '',
  });
  const [acceptForm, setAcceptForm] = useState({
    requestedAmount: '',
    requestedTermMonths: '',
  });

  const { 
    availableOffers, 
    myOffers, 
    isLoading, 
    createOffer, 
    acceptOffer, 
    isCreating, 
    isAccepting 
  } = useLoanMarketplace();

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!offerForm.offered_amount || !offerForm.offered_interest_rate) {
      return;
    }

    await createOffer({
      offered_amount: parseFloat(offerForm.offered_amount),
      offered_interest_rate: parseFloat(offerForm.offered_interest_rate),
    });

    setOfferForm({
      offered_amount: '',
      offered_interest_rate: '',
    });
    setShowCreateOfferModal(false);
  };

  const handleAcceptOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOffer || !acceptForm.requestedAmount || !acceptForm.requestedTermMonths) {
      return;
    }

    await acceptOffer({
      offerId: selectedOffer.id,
      requestedAmount: parseFloat(acceptForm.requestedAmount),
      requestedTermMonths: parseInt(acceptForm.requestedTermMonths),
    });

    setAcceptForm({
      requestedAmount: '',
      requestedTermMonths: '',
    });
    setSelectedOffer(null);
    setShowAcceptOfferModal(false);

    if (onAcceptOffer) {
      onAcceptOffer(selectedOffer.id, parseFloat(acceptForm.requestedAmount), parseInt(acceptForm.requestedTermMonths));
    }
  };

  const openAcceptModal = (offer: any) => {
    setSelectedOffer(offer);
    setAcceptForm({
      requestedAmount: Math.min(offer.offered_amount, 50000).toString(),
      requestedTermMonths: '12',
    });
    setShowAcceptOfferModal(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Loan Marketplace</h2>
          <p className="text-muted-foreground">Browse available loans or create your own offer</p>
        </div>
        <Button onClick={() => setShowCreateOfferModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Offer
        </Button>
      </div>

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse">Browse Offers ({availableOffers.length})</TabsTrigger>
          <TabsTrigger value="my-offers">My Offers ({myOffers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          {availableOffers.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No offers available</h3>
                <p className="text-muted-foreground">Check back later or create your own loan offer</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableOffers.map((offer) => (
                <Card key={offer.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Lender</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>4.8</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary">P2P</Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-xs font-medium">Amount</span>
                        </div>
                        <CurrencyDisplay 
                          amount={offer.offered_amount} 
                          className="text-lg font-bold text-green-600" 
                          showToggle={false} 
                        />
                      </div>
                      
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                          <Percent className="h-4 w-4" />
                          <span className="text-xs font-medium">Rate</span>
                        </div>
                        <p className="text-lg font-bold text-blue-600">
                          {offer.offered_interest_rate}%
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={offer.status === 'pending' ? "secondary" : "default"}>
                          {offer.status}
                        </Badge>
                      </div>
                    </div>

                    <Button 
                      className="w-full gap-2" 
                      onClick={() => openAcceptModal(offer)}
                      disabled={offer.status !== 'pending'}
                    >
                      <Shield className="h-4 w-4" />
                      {offer.status !== 'pending' ? 'Not Available' : 'Accept Offer'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-offers" className="space-y-4">
          {myOffers.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No offers created</h3>
                <p className="text-muted-foreground mb-4">Start lending by creating your first loan offer</p>
                <Button onClick={() => setShowCreateOfferModal(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create First Offer
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myOffers.map((offer) => (
                <Card key={offer.id} className="border-0 shadow-md">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">My Loan Offer</CardTitle>
                      <Badge variant={offer.status === 'pending' ? "default" : "secondary"}>
                        {offer.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-primary/10 rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-primary mb-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-xs font-medium">Amount</span>
                        </div>
                        <CurrencyDisplay 
                          amount={offer.offered_amount} 
                          className="text-lg font-bold text-primary" 
                          showToggle={false} 
                        />
                      </div>
                      
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                          <Percent className="h-4 w-4" />
                          <span className="text-xs font-medium">Rate</span>
                        </div>
                        <p className="text-lg font-bold text-blue-600">
                          {offer.offered_interest_rate}%
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <span className="font-medium">{offer.status}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Created {new Date(offer.created_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Offer Modal */}
      <Dialog open={showCreateOfferModal} onOpenChange={setShowCreateOfferModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create Loan Offer
            </DialogTitle>
            <DialogDescription>
              Set up your loan offer terms to start lending in the marketplace
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateOffer} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Loan Amount (KES)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="50000"
                value={offerForm.offered_amount}
                onChange={(e) => setOfferForm({ ...offerForm, offered_amount: e.target.value })}
                min="1000"
                step="1000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Interest Rate (%)</Label>
              <Input
                id="rate"
                type="number"
                placeholder="15"
                value={offerForm.offered_interest_rate}
                onChange={(e) => setOfferForm({ ...offerForm, offered_interest_rate: e.target.value })}
                min="1"
                max="50"
                step="0.5"
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowCreateOfferModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating} className="gap-2">
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Offer
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Accept Offer Modal */}
      <Dialog open={showAcceptOfferModal} onOpenChange={setShowAcceptOfferModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Accept Loan Offer
            </DialogTitle>
            <DialogDescription>
              Specify the amount and term for your loan request
            </DialogDescription>
          </DialogHeader>

          {selectedOffer && (
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Available Amount:</span>
                <CurrencyDisplay 
                  amount={selectedOffer.offered_amount} 
                  className="font-semibold" 
                  showToggle={false} 
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Interest Rate:</span>
                <span className="font-semibold">{selectedOffer.offered_interest_rate}%</span>
              </div>
            </div>
          )}

          <form onSubmit={handleAcceptOffer} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="requestedAmount">Requested Amount (KES)</Label>
              <Input
                id="requestedAmount"
                type="number"
                placeholder="25000"
                value={acceptForm.requestedAmount}
                onChange={(e) => setAcceptForm({ ...acceptForm, requestedAmount: e.target.value })}
                min="1000"
                max={selectedOffer?.offered_amount || 1000000}
                step="1000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requestedTerm">Loan Term (Months)</Label>
              <Input
                id="requestedTerm"
                type="number"
                placeholder="12"
                value={acceptForm.requestedTermMonths}
                onChange={(e) => setAcceptForm({ ...acceptForm, requestedTermMonths: e.target.value })}
                min="1"
                max="60"
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowAcceptOfferModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isAccepting} className="gap-2">
                {isAccepting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    Accept Offer
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoanMarketplace;