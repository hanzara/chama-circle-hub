import React, { useState } from 'react';
import { DollarSign, TrendingUp, Award, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useChamaLoans } from '@/hooks/useChamaLoans';
import LoanRequestModal from './LoanRequestModal';
import { RepayLoanModal } from './RepayLoanModal';
import { LoanReportModal } from './LoanReportModal';

interface LoanMemberViewProps {
  chamaId: string;
  chamaData: any;
}

export const LoanMemberView: React.FC<LoanMemberViewProps> = ({ chamaId, chamaData }) => {
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  
  const { loans, isLoading } = useChamaLoans(chamaId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      approved: "default",
      active: "default",
      completed: "default",
      rejected: "destructive"
    };

    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const handleRepayClick = (loan: any) => {
    setSelectedLoan(loan);
    setShowRepayModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeLoans = loans.filter(l => l.status === 'active' || l.status === 'approved');
  const completedLoans = loans.filter(l => l.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">My Loans</h3>
          <p className="text-sm text-muted-foreground">
            Apply for loans and track repayments
          </p>
        </div>
        <Button onClick={() => setShowLoanModal(true)}>
          Apply for Loan
        </Button>
      </div>

      {/* Loan Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Loans</p>
                <p className="text-2xl font-bold">{activeLoans.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedLoans.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Award className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rewards Earned</p>
                <p className="text-2xl font-bold">{completedLoans.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Loans */}
      <div className="space-y-4">
        <h4 className="font-medium">Active Loans</h4>
        {activeLoans.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No Active Loans</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Apply for a loan to get started
              </p>
              <Button onClick={() => setShowLoanModal(true)}>
                Apply for Loan
              </Button>
            </CardContent>
          </Card>
        ) : (
          activeLoans.map((loan) => {
            const amountRemaining = loan.amount - (loan.repaid_amount || 0);
            const progress = ((loan.repaid_amount || 0) / loan.amount) * 100;

            return (
              <Card key={loan.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-lg">
                          {formatCurrency(loan.amount)}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {loan.purpose}
                        </p>
                      </div>
                      {getStatusBadge(loan.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Amount Paid</p>
                        <p className="font-medium">{formatCurrency(loan.repaid_amount || 0)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Remaining Balance</p>
                        <p className="font-medium">{formatCurrency(amountRemaining)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p className="font-medium">{loan.duration_months} months</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Interest Rate</p>
                        <p className="font-medium">{loan.interest_rate}%</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Repayment Progress</span>
                        <span className="font-medium">{progress.toFixed(0)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {loan.status === 'active' && (
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleRepayClick(loan)}
                          className="flex-1"
                        >
                          Repay Loan
                        </Button>
                      </div>
                    )}

                    {loan.status === 'approved' && loan.disbursement_status && !loan.member_payment_number && (
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                          ✅ Your loan has been disbursed! Please provide payment details.
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedLoan(loan);
                            setShowReportModal(true);
                          }}
                        >
                          Provide Payment Details
                        </Button>
                      </div>
                    )}

                    {loan.status === 'approved' && !loan.disbursement_status && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          ✅ Your loan has been approved! Waiting for disbursement.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Completed Loans with Rewards */}
      {completedLoans.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Completed Loans</h4>
          {completedLoans.map((loan) => (
            <Card key={loan.id} className="border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{formatCurrency(loan.amount)}</h4>
                      <Award className="h-5 w-5 text-yellow-500" />
                      <Badge variant="default" className="bg-green-500">Completed</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{loan.purpose}</p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      🏅 Reward Earned: Full repayment completed!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <LoanRequestModal
        isOpen={showLoanModal}
        onClose={() => setShowLoanModal(false)}
        chamaId={chamaId}
        chamaData={chamaData}
      />

      {selectedLoan && (
        <>
          <RepayLoanModal
            isOpen={showRepayModal}
            onClose={() => {
              setShowRepayModal(false);
              setSelectedLoan(null);
            }}
            loan={selectedLoan}
            chamaId={chamaId}
          />
          
          <LoanReportModal
            isOpen={showReportModal}
            onClose={() => {
              setShowReportModal(false);
              setSelectedLoan(null);
            }}
            loan={selectedLoan}
            chamaId={chamaId}
          />
        </>
      )}
    </div>
  );
};