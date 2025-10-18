import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLinkedAccounts } from '@/hooks/useLinkedAccounts';
import { 
  Smartphone, 
  CreditCard, 
  Building2, 
  Star,
  Trash2,
  Check
} from 'lucide-react';
import { formatDistance } from 'date-fns';

export function LinkedAccountsManager() {
  const { linkedAccounts, isLoading, setPrimaryAccount, removeAccount } = useLinkedAccounts();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading accounts...</p>
        </CardContent>
      </Card>
    );
  }

  if (!linkedAccounts || linkedAccounts.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-2">No linked payment methods yet</p>
          <p className="text-sm text-muted-foreground">
            Link a payment method for faster deposits to your wallet
          </p>
        </CardContent>
      </Card>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'mobile_money':
        return <Smartphone className="h-5 w-5" />;
      case 'card':
        return <CreditCard className="h-5 w-5" />;
      case 'bank':
        return <Building2 className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case 'mpesa':
        return <Badge className="bg-green-500">M-Pesa</Badge>;
      case 'airtel_money':
        return <Badge className="bg-red-500">Airtel Money</Badge>;
      default:
        return <Badge variant="outline">{provider}</Badge>;
    }
  };

  return (
    <div className="space-y-3">
      {linkedAccounts.map((account) => (
        <Card
          key={account.id}
          className={`transition-all ${
            account.is_primary ? 'border-primary border-2 bg-primary/5' : ''
          }`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  {getIcon(account.account_type)}
                </div>
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {account.account_name || `${account.provider} Account`}
                    {account.is_primary && (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    {getProviderBadge(account.provider)}
                    {account.phone_number && (
                      <span className="text-sm text-muted-foreground">
                        {account.phone_number}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Saved payment method • Use for quick deposits
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {!account.is_primary && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPrimaryAccount(account.id)}
                    className="gap-1"
                  >
                    <Check className="h-3 w-3" />
                    Set Primary
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeAccount(account.id)}
                  className="text-destructive hover:text-destructive gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Linked {formatDistance(new Date(account.created_at), new Date(), { addSuffix: true })}
              </span>
              {account.last_used_at && (
                <span>
                  Last used {formatDistance(new Date(account.last_used_at), new Date(), { addSuffix: true })}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
