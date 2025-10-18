import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DollarSign, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CurrencyDisplay from '@/components/CurrencyDisplay';

interface Loan {
  id: string;
  borrower_id: string;
  amount: number;
  total_repayment: number;
  status: string;
  borrower_name: string;
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
  const { toast } = useToast();

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
                <div>
                  <p className="font-medium">{loan.borrower_name}</p>
                  <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                    <span>Principal: <CurrencyDisplay amount={loan.amount} /></span>
                    <span>Due: <CurrencyDisplay amount={loan.total_repayment || loan.amount} /></span>
                  </div>
                </div>
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
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
