import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Info, Calculator } from 'lucide-react';
import CurrencyDisplay from "@/components/CurrencyDisplay";
import { useFeeCalculation } from '@/hooks/useFeeCalculation';

interface FeeDisplayProps {
  transactionType: string;
  amount: number;
  showDetails?: boolean;
  className?: string;
}

export const FeeDisplay: React.FC<FeeDisplayProps> = ({
  transactionType,
  amount,
  showDetails = true,
  className = ""
}) => {
  const { getFeeBreakdown, getTransactionTypeLabel } = useFeeCalculation();
  
  const breakdown = getFeeBreakdown(transactionType, amount);
  
  if (breakdown.fee === 0) {
    return showDetails ? (
      <div className={`text-sm text-green-600 ${className}`}>
        <span className="flex items-center gap-1">
          <Info className="h-4 w-4" />
          No transaction fee
        </span>
      </div>
    ) : null;
  }

  return (
    <Card className={`border-amber-200 bg-amber-50 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Calculator className="h-4 w-4 text-amber-600" />
          Transaction Fee Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Transaction Type:</span>
          <Badge variant="outline">{getTransactionTypeLabel(transactionType)}</Badge>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Amount:</span>
            <CurrencyDisplay amount={breakdown.amount} showToggle={false} />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Transaction Fee:</span>
            <span className="text-red-600 font-medium">
              <CurrencyDisplay amount={breakdown.fee} showToggle={false} />
            </span>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between font-semibold">
            <span className="text-sm">You'll Pay:</span>
            <span className="text-lg">
              <CurrencyDisplay amount={breakdown.amount + breakdown.fee} showToggle={false} />
            </span>
          </div>
          
          <div className="flex items-center justify-between font-semibold">
            <span className="text-sm">You'll Receive:</span>
            <span className="text-lg text-green-600">
              <CurrencyDisplay amount={breakdown.netAmount} showToggle={false} />
            </span>
          </div>
        </div>
        
        {showDetails && breakdown.configuration && (
          <>
            <Separator />
            <div className="text-xs text-gray-500 space-y-1">
              <div>Fee Type: {breakdown.configuration.fee_type}</div>
              {breakdown.configuration.fee_type === 'percentage' && (
                <div>Rate: {breakdown.configuration.percentage_rate}%</div>
              )}
              {breakdown.configuration.fee_type === 'tiered' && (
                <div>Tiered pricing based on amount</div>
              )}
              <div>Effective Rate: {breakdown.feePercentage.toFixed(2)}%</div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

interface SimpleFeeDisplayProps {
  transactionType: string;
  amount: number;
  layout?: 'horizontal' | 'vertical';
  showLabel?: boolean;
}

export const SimpleFeeDisplay: React.FC<SimpleFeeDisplayProps> = ({
  transactionType,
  amount,
  layout = 'horizontal',
  showLabel = true
}) => {
  const { getFeeBreakdown } = useFeeCalculation();
  const breakdown = getFeeBreakdown(transactionType, amount);
  
  if (breakdown.fee === 0) {
    return showLabel ? (
      <span className="text-xs text-green-600">Fee: Free</span>
    ) : null;
  }

  if (layout === 'vertical') {
    return (
      <div className="space-y-1 text-sm">
        {showLabel && <div className="text-gray-600 text-xs">Transaction Fee:</div>}
        <div className="text-red-600 font-medium">
          <CurrencyDisplay amount={breakdown.fee} showToggle={false} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between text-sm">
      {showLabel && <span className="text-gray-600">Fee:</span>}
      <span className="text-red-600 font-medium">
        <CurrencyDisplay amount={breakdown.fee} showToggle={false} />
      </span>
    </div>
  );
};