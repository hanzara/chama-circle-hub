import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Wallet,
  TrendingUp,
  Info
} from 'lucide-react';
import { useMonthlyMaintenanceFees } from '@/hooks/useMonthlyMaintenanceFees';
import { useAuth } from '@/hooks/useAuth';
import { format, addMonths } from 'date-fns';

export const MaintenanceFeeCenter: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const {
    maintenanceFees,
    feesLoading,
    isProcessingFees,
    isGeneratingFees,
    getCurrentFeeStatus,
    getFeeStatistics,
    getStatusText,
    getStatusColor,
    formatCurrency,
    processMaintenanceFees,
    generateMaintenanceFees
  } = useMonthlyMaintenanceFees();

  if (!user) return null;

  const { currentFee, hasPendingFee, hasCurrentMonthFee, nextDueDate } = getCurrentFeeStatus();
  const stats = getFeeStatistics();

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary">Monthly Maintenance Fees</h1>
        <p className="text-muted-foreground">
          Manage your KES 10 monthly maintenance fee for keeping your account active
        </p>
      </div>

      {/* Current Status Alert */}
      {hasPendingFee && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                You have a pending maintenance fee of {formatCurrency(currentFee?.fee_amount || 10)} 
                due for {format(new Date(currentFee?.due_date || new Date()), 'MMMM yyyy')}
              </span>
              <Badge variant="secondary" className="ml-2">
                {currentFee?.attempts || 0} attempts
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Wallet className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-lg font-semibold">{formatCurrency(stats.totalPaid)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-lg font-semibold">{formatCurrency(stats.totalPending)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Paid Months</p>
                <p className="text-lg font-semibold">{stats.paidCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Next Due</p>
                <p className="text-lg font-semibold">
                  {format(nextDueDate, 'MMM dd')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fee Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Monthly Maintenance Fee Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly Fee:</span>
                <span className="font-semibold">{formatCurrency(10)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Billing Cycle:</span>
                <span className="font-semibold">1st of every month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-semibold">Auto-deducted from wallet</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge className={currentFee ? getStatusColor(currentFee.status) : 'text-green-600 bg-green-50'}>
                  {currentFee ? getStatusText(currentFee.status) : 'No current fee'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Auto-Settlement:</span>
                <span className="font-semibold">When wallet is topped up</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Attempts:</span>
                <span className="font-semibold">3 per month</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Maintenance fee is automatically deducted on the 1st of each month</li>
              <li>• If your wallet has insufficient balance, the fee becomes pending</li>
              <li>• Pending fees are automatically settled when you top up your wallet</li>
              <li>• This fee helps maintain your account and platform services</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Fee History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Fee History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {feesLoading ? (
            <div className="text-center py-8">Loading fee history...</div>
          ) : maintenanceFees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No maintenance fees found. Fees are generated on the 1st of each month.
            </div>
          ) : (
            <div className="space-y-3">
              {maintenanceFees.map((fee) => (
                <div key={fee.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`h-3 w-3 rounded-full ${
                      fee.status === 'deducted' ? 'bg-green-500' :
                      fee.status === 'pending' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <p className="font-medium">
                        {format(new Date(fee.due_date), 'MMMM yyyy')}
                      </p>
                      {fee.deducted_at && (
                        <p className="text-sm text-muted-foreground">
                          Paid on {format(new Date(fee.deducted_at), 'MMM dd, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(fee.fee_amount)}</p>
                    <Badge className={getStatusColor(fee.status)}>
                      {getStatusText(fee.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Controls */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Admin Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => generateMaintenanceFees()}
                disabled={isGeneratingFees}
                variant="outline"
              >
                {isGeneratingFees ? 'Generating...' : 'Generate Monthly Fees'}
              </Button>
              <Button
                onClick={() => processMaintenanceFees()}
                disabled={isProcessingFees}
                variant="outline"
              >
                {isProcessingFees ? 'Processing...' : 'Process Pending Fees'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              These functions are for testing and administrative purposes only.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};