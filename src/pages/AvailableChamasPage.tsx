import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, ShoppingCart, Package, UserPlus } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useMarketplaceChamas, usePurchaseMarketplaceChama } from '@/hooks/useMarketplaceChamas';
import { useMpesaIntegration } from '@/hooks/useMpesaIntegration';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAvailableChamasToJoin } from '@/hooks/useChamasData';
import { JoinChamaModal } from '@/components/chama/JoinChamaModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AvailableChamasPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { stkPushMutation, isProcessingPayment } = useMpesaIntegration();
  const { data: marketplaceChamas, isLoading: loadingMarketplace } = useMarketplaceChamas();
  const { data: regularChamas, isLoading: loadingRegular } = useAvailableChamasToJoin();
  const purchaseMutation = usePurchaseMarketplaceChama();
  
  const [selectedChama, setSelectedChama] = useState<any>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joiningChama, setJoiningChama] = useState<any>(null);

  const handlePurchaseChama = (chama: any) => {
    setSelectedChama(chama);
    setShowPaymentDialog(true);
  };

  const handleJoinChama = (chama: any) => {
    setJoiningChama(chama);
    setShowJoinModal(true);
  };

  const handlePayment = async () => {
    if (!selectedChama || !phoneNumber) {
      toast({
        title: "Missing Information",
        description: "Phone number is required for payment",
        variant: "destructive",
      });
      return;
    }

    try {
      // Process M-Pesa payment
      await stkPushMutation.mutateAsync({
        phoneNumber: phoneNumber,
        amount: selectedChama.purchase_amount,
        description: `Purchase ${selectedChama.name}`,
        purpose: 'registration',
        chamaId: selectedChama.id
      });

      // Purchase the chama
      await purchaseMutation.mutateAsync({
        chamaId: selectedChama.id,
        amount: selectedChama.purchase_amount
      });

      setShowPaymentDialog(false);
      setPhoneNumber('');
      setSelectedChama(null);

      // Navigate to user's chamas page
      setTimeout(() => {
        navigate('/chamas');
      }, 2000);

    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Available Chamas
          </h1>
          <p className="text-lg text-muted-foreground">
            Browse and join active chamas or purchase pre-made marketplace chamas.
          </p>
        </div>

        <Tabs defaultValue="regular" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="regular">Regular Chamas</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          </TabsList>

          {/* Regular Chamas Tab */}
          <TabsContent value="regular" className="mt-6">
            {loadingRegular ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading chamas...</p>
              </div>
            ) : regularChamas && regularChamas.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {regularChamas.map((chama: any) => (
                  <Card key={chama.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Users className="h-8 w-8 text-primary" />
                        <Badge variant="secondary">
                          {chama.current_members}/{chama.max_members} Members
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{chama.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {chama.description || 'No description available'}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Monthly Contribution:</span>
                          <span className="font-semibold">KES {chama.contribution_amount?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Frequency:</span>
                          <span className="font-semibold capitalize">{chama.contribution_frequency}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge variant={chama.status === 'active' ? 'default' : 'secondary'}>
                            {chama.status}
                          </Badge>
                        </div>
                      </div>

                      <Button 
                        className="w-full"
                        onClick={() => handleJoinChama(chama)}
                        disabled={chama.current_members >= chama.max_members}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        {chama.current_members >= chama.max_members ? 'Full' : 'Join Chama'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Chamas Available</h3>
                <p className="text-muted-foreground">
                  No active chamas to join right now. Check the marketplace or create your own!
                </p>
              </div>
            )}
          </TabsContent>

          {/* Marketplace Chamas Tab */}
          <TabsContent value="marketplace" className="mt-6">
            {loadingMarketplace ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading marketplace chamas...</p>
              </div>
            ) : marketplaceChamas && marketplaceChamas.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {marketplaceChamas.map((chama: any) => (
              <Card key={chama.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Package className="h-8 w-8 text-primary" />
                    <Badge variant="secondary">{chama.max_members} Members</Badge>
                  </div>
                  <CardTitle className="text-xl">{chama.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{chama.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Max Members: {chama.max_members}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ShoppingCart className="h-4 w-4" />
                      <span>Monthly Contribution: KES {chama.contribution_amount?.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-medium">Purchase Price:</span>
                      <span className="text-2xl font-bold text-primary">
                        KES {chama.purchase_amount}
                      </span>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => handlePurchaseChama(chama)}
                      disabled={purchaseMutation.isPending || isProcessingPayment}
                    >
                      Purchase Chama
                    </Button>
                  </div>
                </CardContent>
              </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Chamas Available</h3>
                <p className="text-muted-foreground">
                  All marketplace chamas have been purchased. Check back later!
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Purchase Chama</DialogTitle>
              <DialogDescription>
                Pay KES {selectedChama?.purchase_amount} to purchase {selectedChama?.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="bg-primary/10 p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Chama:</span>
                  <span className="font-bold">{selectedChama?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Max Members:</span>
                  <span className="font-bold">{selectedChama?.max_members}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Purchase Price:</span>
                  <span className="font-bold text-lg text-primary">KES {selectedChama?.purchase_amount}</span>
                </div>
              </div>

              <div>
                <Label htmlFor="phoneNumber">M-Pesa Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0712345678"
                  className="mt-1"
                />
              </div>

              <Button 
                onClick={handlePayment}
                className="w-full"
                disabled={isProcessingPayment || purchaseMutation.isPending || !phoneNumber}
                size="lg"
              >
                {isProcessingPayment || purchaseMutation.isPending ? 'Processing...' : 'Pay with M-Pesa'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Join Chama Modal */}
        {joiningChama && (
          <JoinChamaModal
            isOpen={showJoinModal}
            onClose={() => {
              setShowJoinModal(false);
              setJoiningChama(null);
            }}
            chamaId={joiningChama.id}
            chamaName={joiningChama.name}
          />
        )}
      </div>
    </div>
  );
};

export default AvailableChamasPage;
