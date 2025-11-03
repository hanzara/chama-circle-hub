import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Edit, Phone, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { ProvideLoanPaymentModal } from './ProvideLoanPaymentModal';
import { SendLoanFundsModal } from './SendLoanFundsModal';

interface Loan {
  id: string;
  borrower_id: string;
  amount: number;
  total_repayment: number;
  status: string;
  borrower_name: string;
  member_payment_number?: string;
  disbursement_status?: boolean;
  duration_months?: number;
  interest_rate?: number;
}

interface LoanManagementPanelProps {
  chamaId: string;
  loans: Loan[];
  onUpdate?: () => void;
}

export const LoanManagementPanel: React.FC<LoanManagementPanelProps> = ({
  chamaId,
  loans,
  onUpdate
}) => {
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [repaymentAmount, setRepaymentAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSendFundsModal, setShowSendFundsModal] = useState(false);
  const [selectedLoanForPayment, setSelectedLoanForPayment] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Check if current user is admin/chairman
  const [userRole, setUserRole] = useState<string>('member');
  
  React.useEffect(() => {
    const checkUserRole = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('chama_members')
        .select('role')
        .eq('chama_id', chamaId)
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setUserRole(data.role);
      }
    };
    
    checkUserRole();
  }, [user, chamaId]);

  const handleAddRepayment = async () => {
    if (!selectedLoan || !repaymentAmount) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('edit-loan-balance', {
        body: {
          loanId: selectedLoan.id,
          chamaId,
          repaymentAmount: parseFloat(repaymentAmount),
          notes,
          action: 'add_repayment'
        }
      });

      if (error) throw error;

      toast({
        title: "Repayment Recorded",
        description: data.message
      });

      setIsOpen(false);
      setRepaymentAmount('');
      setNotes('');
      onUpdate?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to record repayment",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Loan Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {loans.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No active loans
            </p>
          ) : (
            loans.map((loan) => (
              <div
                key={loan.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{loan.borrower_name}</p>
                    {loan.status === 'approved' && !loan.member_payment_number && (
                      <Badge variant="secondary">Awaiting Payment Details</Badge>
                    )}
                    {loan.status === 'approved' && loan.member_payment_number && !loan.disbursement_status && (
                      <Badge className="bg-yellow-100 text-yellow-800">Ready to Disburse</Badge>
                    )}
                    {loan.disbursement_status && (
                      <Badge className="bg-green-100 text-green-800">Funds Sent</Badge>
                    )}
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                    <span>Principal: <CurrencyDisplay amount={loan.amount} /></span>
                    <span>Due: <CurrencyDisplay amount={loan.total_repayment || loan.amount} /></span>
                  </div>
                  {loan.member_payment_number && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Phone className="h-3 w-3" />
                      <span>{loan.member_payment_number}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {/* Borrower can provide payment details if loan is approved */}
                  {loan.status === 'approved' && !loan.member_payment_number && loan.borrower_id === user?.id && (
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => {
                        setSelectedLoanForPayment(loan);
                        setShowPaymentModal(true);
                      }}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Provide Payment Details
                    </Button>
                  )}
                  
                  {/* Chairman/Admin can send funds if payment details are provided */}
                  {loan.status === 'approved' && 
                   loan.member_payment_number && 
                   !loan.disbursement_status && 
                   (userRole === 'admin' || userRole === 'chairman' || userRole === 'treasurer') && (
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => {
                        setSelectedLoanForPayment(loan);
                        setShowSendFundsModal(true);
                      }}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Funds
                    </Button>
                  )}
                  
                  {/* Record repayment option for active loans */}
                  {(loan.status === 'active' || loan.disbursement_status) && (
                    <Dialog open={isOpen && selectedLoan?.id === loan.id} onOpenChange={(open) => {
                      setIsOpen(open);
                      if (open) setSelectedLoan(loan);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Record Payment
                        </Button>
                      </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Record Loan Repayment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Borrower: {loan.borrower_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Outstanding: <CurrencyDisplay amount={loan.total_repayment || loan.amount} />
                        </p>
                      </div>
                      
                      <Input
                        type="number"
                        placeholder="Repayment Amount"
                        value={repaymentAmount}
                        onChange={(e) => setRepaymentAmount(e.target.value)}
                      />
                      
                      <Textarea
                        placeholder="Notes (optional)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                      
                      <Button
                        onClick={handleAddRepayment}
                        disabled={isLoading}
                        className="w-full"
                      >
                        Record Repayment
                      </Button>
                    </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Modals */}
        {selectedLoanForPayment && (
          <>
            <ProvideLoanPaymentModal
              isOpen={showPaymentModal}
              onClose={() => {
                setShowPaymentModal(false);
                setSelectedLoanForPayment(null);
              }}
              loan={selectedLoanForPayment}
              chamaId={chamaId}
            />
            
            <SendLoanFundsModal
              isOpen={showSendFundsModal}
              onClose={() => {
                setShowSendFundsModal(false);
                setSelectedLoanForPayment(null);
              }}
              loan={selectedLoanForPayment}
              chamaId={chamaId}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};
