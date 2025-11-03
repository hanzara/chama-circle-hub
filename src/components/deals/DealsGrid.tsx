import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Star, Clock } from 'lucide-react';
import { Deal } from '@/hooks/useDealsAndBills';
import CurrencyDisplay from '@/components/CurrencyDisplay';

interface DealsGridProps {
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
}

const DealsGrid: React.FC<DealsGridProps> = ({ deals, onDealClick }) => {
  const formatExpiryDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Expired';
    if (diffDays === 1) return 'Expires today';
    if (diffDays <= 7) return `Expires in ${diffDays} days`;
    return date.toLocaleDateString();
  };

  if (deals.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Gift className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <CardTitle className="mb-2">No Deals Available</CardTitle>
          <p className="text-muted-foreground">Check back later for exciting offers and discounts!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {deals.map((deal) => (
        <Card key={deal.id} className="group hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge variant={deal.discount_percentage ? "default" : "secondary"}>
                {deal.discount_percentage 
                  ? `${deal.discount_percentage}% OFF` 
                  : `Save KES ${deal.discount_amount}`
                }
              </Badge>
              {deal.merchants && (
                <Badge variant="secondary" className="text-xs">
                  {deal.merchants.category}
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <div>
              <CardTitle className="text-lg mb-1">{deal.title}</CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {deal.description}
              </p>
            </div>

            {deal.merchants && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {deal.merchants.name}
                </Badge>
              </div>
            )}

            {deal.minimum_spend > 0 && (
              <div className="text-sm">
                <span className="text-muted-foreground">Min spend: </span>
                <CurrencyDisplay 
                  amount={deal.minimum_spend} 
                  className="font-medium" 
                  showToggle={false}
                />
              </div>
            )}

            {deal.valid_until && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatExpiryDate(deal.valid_until)}
              </div>
            )}

            <Button 
              className="w-full gap-2"
              onClick={() => onDealClick(deal)}
            >
              <Gift className="h-4 w-4" />
              View Deal
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DealsGrid;