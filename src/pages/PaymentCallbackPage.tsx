import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const PaymentCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('Verifying your payment...');
  const [amount, setAmount] = useState<number>(0);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 15; // Poll for webhook for 30 seconds (2s interval)
    const maxManualAttempts = 5; // Then manual verification for 10 seconds
    let isManualVerification = false;
    
    const verifyPayment = async () => {
      const reference = searchParams.get('reference');
      
      if (!reference) {
        setStatus('failed');
        setMessage('Invalid payment reference');
        return;
      }

      try {
        attempts++;
        
        if (!isManualVerification) {
          console.log(`🔍 Checking webhook status (${attempts}/${maxAttempts})...`);
          setMessage(`Waiting for payment confirmation... (${attempts}/${maxAttempts})`);
        } else {
          console.log(`🔄 Manual verification (${attempts - maxAttempts}/${maxManualAttempts})...`);
          setMessage(`Verifying with Paystack... (${attempts - maxAttempts}/${maxManualAttempts})`);
        }
        
        // Check if webhook has updated the transaction
        const { data: transaction, error } = await supabase
          .from('mpesa_transactions')
          .select('user_id, amount, status, result_desc, transaction_type, purpose, id')
          .eq('checkout_request_id', reference)
          .single();

        if (error) {
          console.error('❌ Transaction not found:', error);
          
          // Switch to manual verification
          if (attempts >= maxAttempts && !isManualVerification) {
            isManualVerification = true;
            attempts = maxAttempts;
            console.log('⚠️ Webhook delayed, initiating manual verification...');
            setMessage('Webhook delayed, verifying with Paystack...');
            setTimeout(() => verifyPayment(), 1000);
            return;
          }
          
          if (attempts < maxAttempts + maxManualAttempts) {
            setTimeout(() => verifyPayment(), 2000);
            return;
          }
          
          setStatus('failed');
          setMessage('Transaction not found. Please contact support if money was deducted.');
          return;
        }

        console.log('📊 Transaction status:', transaction.status);
        
        // ✅ WEBHOOK SUCCESS - Transaction marked as successful
        if (transaction.status === 'success') {
          const platformFee = transaction.amount * 0.025;
          const netAmount = transaction.amount - platformFee;
          
          console.log('✅ Payment successful! Fetching updated wallet balance...');
          
          // Fetch current wallet balance to show user
          const { data: wallet } = await supabase
            .from('user_central_wallets')
            .select('balance')
            .eq('user_id', transaction.user_id)
            .single();
          
          if (wallet) {
            setWalletBalance(wallet.balance);
            console.log('💰 Current wallet balance:', wallet.balance);
          }
          
          setStatus('success');
          setAmount(netAmount);
          setMessage(`Payment successful! KES ${netAmount.toFixed(2)} credited to your wallet.`);
          
          // Invalidate queries to refresh dashboard
          queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
          queryClient.invalidateQueries({ queryKey: ['central-wallet'] });
          queryClient.invalidateQueries({ queryKey: ['user-central-wallet'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
          
          toast({
            title: "✅ Payment Successful",
            description: `KES ${netAmount.toFixed(2)} added to your wallet`,
            duration: 8000,
          });
          
          return; // Stop polling
        } 
        
        // ❌ PAYMENT FAILED
        if (transaction.status === 'failed') {
          setStatus('failed');
          setMessage(transaction.result_desc || 'Payment failed. Please try again.');
          return; // Stop polling
        } 
        
        // ⏳ STILL PENDING - Need manual verification after webhook timeout
        if (attempts >= maxAttempts && !isManualVerification) {
          isManualVerification = true;
          attempts = maxAttempts;
          console.log('⚠️ Webhook not responding, calling Paystack API directly...');
          
          try {
            const { data: verifyData } = await supabase.functions.invoke('paystack-integration', {
              body: {
                action: 'verify',
                reference: reference,
              }
            });

            console.log('📡 Paystack verification:', verifyData);
            
            if (verifyData?.success && verifyData?.data?.status === 'success') {
              console.log('✅ Paystack confirmed payment, triggering manual credit...');
              
              await supabase.functions.invoke('manual-credit-payment', {
                body: { reference }
              });
              
              // Re-check after manual credit
              setTimeout(() => verifyPayment(), 2000);
              return;
            } else if (verifyData?.data?.status === 'failed') {
              setStatus('failed');
              setMessage(verifyData?.data?.gateway_response || 'Payment declined by provider.');
              return;
            }
          } catch (verifyErr) {
            console.error('❌ Manual verification error:', verifyErr);
          }
          
          // Continue polling
          setTimeout(() => verifyPayment(), 2000);
          return;
        }
        
        // Continue polling if still pending
        if (attempts < maxAttempts + maxManualAttempts) {
          setTimeout(() => verifyPayment(), 2000);
        } else {
          // Final timeout
          setStatus('failed');
          setMessage('Verification timed out. Check your wallet in a few moments or contact support if money was deducted.');
        }
        
      } catch (err) {
        console.error('❌ Verification error:', err);
        
        if (attempts < maxAttempts + maxManualAttempts) {
          setTimeout(() => verifyPayment(), 2000);
          return;
        }
        
        setStatus('failed');
        setMessage('Verification failed. Please check your wallet or contact support.');
      }
    };

    verifyPayment();
  }, [searchParams, toast, queryClient]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'verifying' && (
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            )}
            {status === 'failed' && (
              <XCircle className="h-16 w-16 text-destructive" />
            )}
          </div>
          <CardTitle>
            {status === 'verifying' && 'Verifying Payment'}
            {status === 'success' && 'Payment Successful'}
            {status === 'failed' && 'Payment Failed'}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
          {status === 'success' && amount > 0 && (
            <div className="mt-4 space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Amount Credited</p>
                <p className="text-2xl font-bold text-green-600">
                  + KES {amount.toFixed(2)}
                </p>
              </div>
              {walletBalance !== null && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">Current Wallet Balance</p>
                  <p className="text-3xl font-bold text-primary">
                    KES {walletBalance.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {status !== 'verifying' && (
            <>
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                Go to Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                Go to Home
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCallbackPage;
