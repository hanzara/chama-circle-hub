import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Send, FileText, CheckCircle, Phone } from 'lucide-react';
import { useChamaLoans } from '@/hooks/useChamaLoans';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { ProvideLoanPaymentModal } from './ProvideLoanPaymentModal';
import { SendLoanFundsModal } from './SendLoanFundsModal';
import { LoanReportModal } from './LoanReportModal';
import { DisburseLoanModal } from './DisburseLoanModal';

interface LoanLeaderViewProps {
  chamaId: string;
  userRole: string;
}

export const LoanLeaderView: React.FC<LoanLeaderViewProps> = ({ chamaId, userRole }) => {
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSendFundsModal, setShowSendFundsModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDisburseModal, setShowDisburseModal] = useState(false);
  
  const { 
    loans, 
    isLoading, 
    approveLoan, 
    isApproving,
    rejectLoan,
    isRejecting
  } = useChamaLoans(chamaId);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

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

  const handleProvidePayment = (loan: any) => {
    setSelectedLoan(loan);
    setShowPaymentModal(true);
  };

  const handleSendFunds = (loan: any) => {
    setSelectedLoan(loan);
    setShowSendFundsModal(true);
  };

  const handleDisburse = (loan: any) => {
    setSelectedLoan(loan);
    setShowDisburseModal(true);
  };

  const handleViewReport = (loan: any) => {
    setSelectedLoan(loan);
    setShowReportModal(true);
  };

  const handleApproveLoan = async (loanId: string) => {
    approveLoan({ loanId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['chama-loans', chamaId] });
      }
    });
  };

  const handleRejectLoan = async (loanId: string) => {
    rejectLoan({ loanId, reason: 'Loan application rejected' }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['chama-loans', chamaId] });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Loan Management</h3>
        <p className="text-sm text-muted-foreground">
          Review and manage member loan applications
        </p>
      </div>

      {loans.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No Loan Applications</h3>
            <p className="text-sm text-muted-foreground">
              Loan applications from members will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member Name</TableHead>
                <TableHead>Loan Amount</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Amount Remaining</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Number</TableHead>
                <TableHead>Actions</TableHead>
                <TableHead>Report</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.map((loan) => {
                const amountRemaining = loan.amount - (loan.amount_paid || 0);
                const isBorrower = loan.borrower_id === user?.id;
                const canSendFunds = ['admin', 'chairman', 'treasurer'].includes(userRole);
                
                return (
                  <TableRow key={loan.id}>
                    <TableCell className="font-medium">
                      Member
                    </TableCell>
                    <TableCell>{formatCurrency(loan.amount)}</TableCell>
                    <TableCell>{formatCurrency(loan.amount_paid || 0)}</TableCell>
                    <TableCell>{formatCurrency(amountRemaining)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(loan.status)}
                        {loan.status === 'approved' && !loan.member_payment_number && (
                          <Badge variant="secondary" className="text-xs">Awaiting Payment Details</Badge>
                        )}
                        {loan.status === 'approved' && loan.member_payment_number && !loan.disbursement_status && (
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">Ready to Disburse</Badge>
                        )}
                        {loan.disbursement_status && (
                          <Badge className="bg-green-100 text-green-800 text-xs">Funds Sent</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {loan.member_payment_number ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {loan.member_payment_number}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Not provided</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {/* Admin/Chairman approves pending loans */}
                        {loan.status === 'pending' && canSendFunds && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApproveLoan(loan.id)}
                              disabled={isApproving}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectLoan(loan.id)}
                              disabled={isRejecting}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        
                        {/* Admin/Chairman disburses approved loans */}
                        {loan.status === 'approved' && !loan.member_payment_number && !loan.disbursement_status && canSendFunds && (
                          <Button
                            size="sm"
                            onClick={() => handleDisburse(loan)}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Disburse Loan
                          </Button>
                        )}
                        
                        {/* Borrower provides payment details */}
                        {loan.status === 'approved' && !loan.member_payment_number && isBorrower && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleProvidePayment(loan)}
                          >
                            <Phone className="h-4 w-4 mr-1" />
                            Add Payment Number
                          </Button>
                        )}
                        
                        {/* Chairman/Admin sends funds */}
                        {loan.status === 'approved' && 
                         loan.member_payment_number && 
                         !loan.disbursement_status && 
                         canSendFunds && (
                          <Button
                            size="sm"
                            onClick={() => handleSendFunds(loan)}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Send Funds
                          </Button>
                        )}
                        
                        {loan.disbursement_status && (
                          <Badge variant="default" className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Disbursed
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewReport(loan)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modals */}
      {selectedLoan && (
        <>
          <DisburseLoanModal
            isOpen={showDisburseModal}
            onClose={() => {
              setShowDisburseModal(false);
              setSelectedLoan(null);
              queryClient.invalidateQueries({ queryKey: ['chama-loans', chamaId] });
            }}
            loan={selectedLoan}
            chamaId={chamaId}
          />
          
          <ProvideLoanPaymentModal
            isOpen={showPaymentModal}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedLoan(null);
              queryClient.invalidateQueries({ queryKey: ['chama-loans', chamaId] });
            }}
            loan={selectedLoan}
            chamaId={chamaId}
          />
          
          <SendLoanFundsModal
            isOpen={showSendFundsModal}
            onClose={() => {
              setShowSendFundsModal(false);
              setSelectedLoan(null);
              queryClient.invalidateQueries({ queryKey: ['chama-loans', chamaId] });
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