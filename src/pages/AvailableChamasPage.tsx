import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, ShoppingCart, Package, Sparkles } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useMarketplaceChamas } from '@/hooks/useMarketplaceChamas';
import { useNavigate } from 'react-router-dom';
import { EnhancedChamaPurchaseModal } from '@/components/chama/EnhancedChamaPurchaseModal';

const AvailableChamasPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: marketplaceChamas, isLoading: loadingMarketplace } = useMarketplaceChamas();
  
  const [selectedChama, setSelectedChama] = useState<any>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const calculatePrice = (maxMembers: number) => {
    return maxMembers * 20;
  };

  const handlePurchaseChama = (chama: any) => {
    setSelectedChama(chama);
    setShowPurchaseModal(true);
  };

  const handlePurchaseSuccess = () => {
    toast({
      title: "🎉 Purchase Successful!",
      description: "Redirecting to your chamas...",
    });
    setTimeout(() => {
      navigate('/chamas');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Chama Marketplace
          </h1>
          <p className="text-lg text-muted-foreground">
            Purchase and own your chama - pricing is 20 KES per member slot
          </p>
        </div>

        {loadingMarketplace ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading marketplace chamas...</p>
          </div>
        ) : marketplaceChamas && marketplaceChamas.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {marketplaceChamas.map((chama: any) => {
              const purchasePrice = calculatePrice(chama.max_members);
              return (
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
                          KES {purchasePrice}
                        </span>
                      </div>
                      <Button 
                        className="w-full group relative overflow-hidden"
                        onClick={() => handlePurchaseChama(chama)}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          Purchase Chama
                          <Sparkles className="h-4 w-4 group-hover:animate-pulse" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Chamas Available</h3>
            <p className="text-muted-foreground">
              All chamas have been purchased. Check back later or create your own!
            </p>
          </div>
        )}

        {/* Enhanced Purchase Modal */}
        <EnhancedChamaPurchaseModal
          open={showPurchaseModal}
          onOpenChange={setShowPurchaseModal}
          chama={selectedChama}
          onSuccess={handlePurchaseSuccess}
        />
      </div>
    </div>
  );
};

export default AvailableChamasPage;
