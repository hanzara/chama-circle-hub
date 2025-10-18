import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Send, FileText, CheckCircle } from 'lucide-react';
import { useChamaLoans } from '@/hooks/useChamaLoans';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { DisburseLoanModal } from './DisburseLoanModal';
import { SendFundsModal } from './SendFundsModal';
import { LoanReportModal } from './LoanReportModal';

interface LoanLeaderViewProps {
  chamaId: string;
  userRole: string;
}

export const LoanLeaderView: React.FC<LoanLeaderViewProps> = ({ chamaId, userRole }) => {
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [showDisburseModal, setShowDisburseModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  
  const { loans, isLoading } = useChamaLoans(chamaId);
  const { toast } = useToast();

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

  const handleDisburse = (loan: any) => {
    setSelectedLoan(loan);
    setShowDisburseModal(true);
  };

  const handleSend = (loan: any) => {
    setSelectedLoan(loan);
    setShowSendModal(true);
  };

  const handleViewReport = (loan: any) => {
    setSelectedLoan(loan);
    setShowReportModal(true);
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
                <TableHead>Disbursement</TableHead>
                <TableHead>Report</TableHead>
                <TableHead>Send</TableHead>
                <TableHead>Reward</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.map((loan) => {
                const amountRemaining = loan.amount - (loan.amount_paid || 0);
                
                return (
                  <TableRow key={loan.id}>
                    <TableCell className="font-medium">
                      Member
                    </TableCell>
                    <TableCell>{formatCurrency(loan.amount)}</TableCell>
                    <TableCell>{formatCurrency(loan.amount_paid || 0)}</TableCell>
                    <TableCell>{formatCurrency(amountRemaining)}</TableCell>
                    <TableCell>{getStatusBadge(loan.status)}</TableCell>
                    <TableCell>
                      {loan.status === 'approved' && !loan.disbursement_status ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDisburse(loan)}
                        >
                          Disburse
                        </Button>
                      ) : loan.disbursement_status ? (
                        <Badge variant="default">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Disbursed
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
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
                    <TableCell>
                      {loan.disbursement_status && loan.member_payment_number && loan.status !== 'active' ? (
                        <Button
                          size="sm"
                          onClick={() => handleSend(loan)}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Send
                        </Button>
                      ) : loan.status === 'active' ? (
                        <Badge variant="default">Sent</Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {loan.reward_status ? (
                        <Award className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
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
            }}
            loan={selectedLoan}
            chamaId={chamaId}
          />
          
          <SendFundsModal
            isOpen={showSendModal}
            onClose={() => {
              setShowSendModal(false);
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