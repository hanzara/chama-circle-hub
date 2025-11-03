import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calculator, Info } from 'lucide-react';
import { useFeeCalculation } from '@/hooks/useFeeCalculation';
import CurrencyDisplay from "@/components/CurrencyDisplay";

interface FeeStructureCardProps {
  transactionTypes?: string[];
  showExamples?: boolean;
  className?: string;
}

export const FeeStructureCard: React.FC<FeeStructureCardProps> = ({
  transactionTypes = [],
  showExamples = true,
  className = ""
}) => {
  const { feeConfigurations, getTransactionTypeLabel, calculateFeeLocally } = useFeeCalculation();
  
  const relevantConfigs = transactionTypes.length > 0 
    ? feeConfigurations.filter(config => transactionTypes.includes(config.transaction_type))
    : feeConfigurations;

  const exampleAmounts = [100, 500, 1000, 5000, 10000];

  const renderFeeStructure = (config: any) => {
    switch (config.fee_type) {
      case 'fixed':
        return <span>KES {config.minimum_fee}</span>;
      
      case 'percentage':
        return (
          <div className="space-y-1">
            <div>{config.percentage_rate}% of amount</div>
            <div className="text-xs text-gray-500">
              Min: KES {config.minimum_fee}
              {config.maximum_fee && ` | Max: KES ${config.maximum_fee}`}
            </div>
          </div>
        );
      
      case 'tiered':
        return (
          <div className="space-y-1">
            {config.tiers.map((tier: any, index: number) => (
              <div key={index} className="text-xs">
                KES {tier.min.toLocaleString()}{tier.max ? ` - ${tier.max.toLocaleString()}` : '+'}: KES {tier.fee}
              </div>
            ))}
          </div>
        );
      
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Transaction Fee Structure
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Fee Configuration Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction Type</TableHead>
                  <TableHead>Fee Structure</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relevantConfigs.map(config => (
                  <TableRow key={config.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {getTransactionTypeLabel(config.transaction_type)}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {config.transaction_type}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {renderFeeStructure(config)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        config.fee_type === 'fixed' ? 'default' : 
                        config.fee_type === 'percentage' ? 'secondary' : 'outline'
                      }>
                        {config.fee_type}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Examples */}
          {showExamples && (
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Info className="h-4 w-4" />
                Fee Examples
              </h4>
              
              {relevantConfigs.slice(0, 3).map(config => (
                <div key={config.id} className="space-y-2">
                  <h5 className="font-medium text-sm">
                    {getTransactionTypeLabel(config.transaction_type)}
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                    {exampleAmounts.map(amount => {
                      const fee = calculateFeeLocally(config.transaction_type, amount);
                      return (
                        <div key={amount} className="bg-gray-50 p-2 rounded text-center">
                          <div className="font-medium">
                            <CurrencyDisplay amount={amount} showToggle={false} />
                          </div>
                          <div className="text-red-600">
                            Fee: <CurrencyDisplay amount={fee} showToggle={false} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Important Notes */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-blue-900 text-sm">Important Notes:</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• All fees are calculated in Kenyan Shillings (KES)</li>
              <li>• Fees are charged at the time of transaction</li>
              <li>• M-Pesa charges may apply separately for mobile money transactions</li>
              <li>• Fee structures are designed to be competitive and fair</li>
              <li>• Premium subscribers may enjoy reduced fees on certain transactions</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};