import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CreditCard, Calendar, ExternalLink } from 'lucide-react';
import { useMonthlyMaintenanceFees } from '@/hooks/useMonthlyMaintenanceFees';
import { format } from 'date-fns';

interface MaintenanceFeeNotificationProps {
  onViewDetails?: () => void;
  className?: string;
}

export const MaintenanceFeeNotification: React.FC<MaintenanceFeeNotificationProps> = ({
  onViewDetails,
  className = ""
}) => {
  const {
    getCurrentFeeStatus,
    formatCurrency
  } = useMonthlyMaintenanceFees();

  const { currentFee, hasPendingFee } = getCurrentFeeStatus();

  if (!hasPendingFee || !currentFee) return null;

  return (
    <Alert className={`border-amber-200 bg-amber-50 ${className}`}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="flex items-center justify-between w-full">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="h-4 w-4" />
              <span className="font-medium">Monthly Maintenance Fee Due</span>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                {formatCurrency(currentFee.fee_amount)}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-amber-700">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Due: {format(new Date(currentFee.due_date), 'MMMM yyyy')}</span>
              </div>
              <div>
                Attempts: {currentFee.attempts}/3
              </div>
            </div>
            <p className="text-sm text-amber-700 mt-1">
              Top up your wallet to automatically settle this fee.
            </p>
          </div>
          {onViewDetails && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onViewDetails}
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Details
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};