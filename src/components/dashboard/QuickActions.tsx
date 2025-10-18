import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Plus, 
  Send, 
  HandCoins, 
  Users,
  Wallet,
  ArrowUpDown,
  CreditCard,
  UserPlus
} from 'lucide-react';

interface QuickActionsProps {
  onAction: (action: 'add_money' | 'send' | 'request_loan' | 'join_chama' | 'make_contribution') => void;
  isOffline: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onAction, isOffline }) => {
  const actions = [
    {
      id: 'add_money' as const,
      label: 'Add Money',
      icon: Plus,
      color: 'bg-green-500 hover:bg-green-600',
      disabled: isOffline,
    },
    {
      id: 'make_contribution' as const,
      label: 'Make Contribution',
      icon: CreditCard,
      color: 'bg-primary hover:bg-primary/90',
      disabled: isOffline,
    },
    {
      id: 'send' as const,
      label: 'Send',
      icon: Send,
      color: 'bg-blue-500 hover:bg-blue-600',
      disabled: isOffline,
    },
    {
      id: 'request_loan' as const,
      label: 'Request Loan',
      icon: HandCoins,
      color: 'bg-purple-500 hover:bg-purple-600',
      disabled: isOffline,
    },
    {
      id: 'join_chama' as const,
      label: 'Join Chama',
      icon: UserPlus,
      color: 'bg-orange-500 hover:bg-orange-600',
      disabled: false,
    },
  ];

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-card via-card to-accent/5">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">⚡ Quick Actions</h3>
          <span className="text-xs text-muted-foreground">Choose an action</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="ghost"
                className={`group h-24 flex-col gap-2 relative overflow-hidden transition-all duration-300 ${action.color} text-white ${
                  action.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-xl'
                } ${action.id === 'make_contribution' ? 'ring-2 ring-white/30 shadow-lg' : ''}`}
                onClick={() => !action.disabled && onAction(action.id)}
                disabled={action.disabled}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Icon className="h-6 w-6 relative z-10 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium relative z-10">{action.label}</span>
                {action.id === 'make_contribution' && (
                  <span className="absolute top-1 right-1 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                    ⭐
                  </span>
                )}
              </Button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          {isOffline ? '⚠️ Some actions unavailable while offline' : 'Select an action to get started'}
        </p>
      </CardContent>
    </Card>
  );
};