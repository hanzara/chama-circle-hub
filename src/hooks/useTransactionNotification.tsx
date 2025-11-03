import { useToast } from '@/hooks/use-toast';
import { useFeeCalculation } from '@/hooks/useFeeCalculation';

interface TransactionDetails {
  type: 'p2p_send' | 'p2p_receive' | 'withdrawal' | 'deposit' | 'bill_payment' | 'merchant_payment' | 'loan_approval' | 'loan_reminder' | 'chama_contribution' | 'international_receive';
  amount: number;
  recipientName?: string;
  recipientPhone?: string;
  senderName?: string;
  senderPhone?: string;
  agentNumber?: string;
  billProvider?: string;
  accountNumber?: string;
  merchantName?: string;
  loanDuration?: number;
  chamaName?: string;
  currency?: string;
  newBalance: number;
}

export const useTransactionNotification = () => {
  const { toast } = useToast();
  const { calculateFeeLocally } = useFeeCalculation();

  const generateTxnId = () => {
    const prefix = 'V';
    const id = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}${id}`;
  };

  const maskPhone = (phone: string) => {
    if (!phone || phone.length < 4) return phone;
    const last3 = phone.slice(-3);
    const first4 = phone.slice(0, 4);
    return `${first4} *** ${last3}`;
  };

  const formatDateTime = () => {
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    return `${day} ${month} ${year}, ${displayHours}:${minutes} ${ampm}`;
  };

  const calculateFee = (type: string, amount: number): number => {
    switch (type) {
      case 'p2p_send':
        return amount < 1000 ? 5 : 10;
      case 'withdrawal':
        if (amount <= 500) return 20;
        if (amount <= 2500) return 50;
        if (amount <= 5000) return 75;
        return 150;
      case 'deposit':
        return 0;
      case 'bill_payment':
        return 5;
      case 'merchant_payment':
        return 0; // Customer pays 0%
      case 'loan_approval':
        return 0;
      case 'chama_contribution':
        return 5;
      case 'international_receive':
        if (amount <= 5000) return 50;
        if (amount <= 20000) return 100;
        return 200;
      default:
        return 0;
    }
  };

  const showTransactionNotification = (details: TransactionDetails) => {
    const txnId = generateTxnId();
    const fee = calculateFee(details.type, details.amount);
    const dateTime = formatDateTime();
    let title = '';
    let description = '';

    switch (details.type) {
      case 'p2p_send':
        title = '[ChamaYangu] Money Sent 🌟';
        description = `${dateTime}\nYou sent KES ${details.amount.toLocaleString()} to ${maskPhone(details.recipientPhone || '')}.\nFee: KES ${fee} | Bal: KES ${details.newBalance.toLocaleString()}\nTxnID: ${txnId}\nThank you for using ChamaYangu 🌟`;
        break;

      case 'p2p_receive':
        title = '[ChamaYangu] Money Received 🚀';
        description = `${dateTime}\nYou received KES ${details.amount.toLocaleString()} from ${maskPhone(details.senderPhone || '')}.\nBal: KES ${details.newBalance.toLocaleString()}\nTxnID: ${txnId}\nWelcome to smarter payments 🚀`;
        break;

      case 'withdrawal':
        title = '[ChamaYangu] Withdrawal Success 💵';
        description = `${dateTime}\nYou withdrew KES ${details.amount.toLocaleString()}${details.agentNumber ? ` at Agent #${details.agentNumber}` : ''}.\nFee: KES ${fee} | Bal: KES ${details.newBalance.toLocaleString()}\nTxnID: ${txnId}\nThank you for trusting ChamaYangu 🌟`;
        break;

      case 'deposit':
        title = '[ChamaYangu] Deposit Success 💰';
        description = `${dateTime}\nYou deposited KES ${details.amount.toLocaleString()} to your wallet.\nFee: KES ${fee} | Bal: KES ${details.newBalance.toLocaleString()}\nTxnID: ${txnId}\nYour money is safe with us 🔒`;
        break;

      case 'bill_payment':
        title = '[ChamaYangu] Bill Paid ✅';
        description = `${dateTime}\nYou paid KES ${details.amount.toLocaleString()} to ${details.billProvider || 'Provider'}${details.accountNumber ? ` (Acc: ${details.accountNumber})` : ''}.\nFee: KES ${fee} | Bal: KES ${details.newBalance.toLocaleString()}\nTxnID: ${txnId}\nBill payments made easy 🚀`;
        break;

      case 'merchant_payment':
        title = '[ChamaYangu] Payment Success ✅';
        description = `${dateTime}\nYou paid KES ${details.amount.toLocaleString()} to ${details.merchantName || 'Merchant'} via QR.\nNo charge | Bal: KES ${details.newBalance.toLocaleString()}\nTxnID: ${txnId}\nFast & secure payments 🚀`;
        break;

      case 'loan_approval':
        const interestRate = 5;
        const interest = details.amount * (interestRate / 100);
        const totalDue = details.amount + interest;
        title = '[ChamaYangu] Loan Approved ✅';
        description = `${dateTime}\nLoan of KES ${details.amount.toLocaleString()} credited to your wallet.\nRepay in ${details.loanDuration || 30} days | Interest: ${interestRate}%\nTotal Due: KES ${totalDue.toLocaleString()}\nTxnID: ${txnId}\nBorrow smart, grow faster 🌟`;
        break;

      case 'loan_reminder':
        title = '[ChamaYangu] Loan Reminder ⏰';
        description = `${dateTime}\nReminder: Loan of KES ${details.amount.toLocaleString()} due in 5 days.\nRepay on time to maintain your credit score.\nThank you for staying on track! 🌟`;
        break;

      case 'chama_contribution':
        title = '[ChamaYangu] Contribution Made ✅';
        description = `${dateTime}\nYou contributed KES ${details.amount.toLocaleString()} to ${details.chamaName || 'Your Group'}.\nFee: KES ${fee} | Bal: KES ${details.newBalance.toLocaleString()}\nTxnID: ${txnId}\nTogether we grow stronger 🚀`;
        break;

      case 'international_receive':
        title = '[ChamaYangu] International Payment 🌍';
        description = `${dateTime}\nYou received ${details.currency || 'USD'} ${(details.amount / 130).toFixed(2)} (KES ${details.amount.toLocaleString()}) from ${details.senderName || 'abroad'}.\nFee: KES ${fee} | Bal: KES ${details.newBalance.toLocaleString()}\nTxnID: ${txnId}\nGlobal payments, local impact 🌍`;
        break;

      default:
        title = '[ChamaYangu] Transaction Success ✅';
        description = `${dateTime}\nTransaction of KES ${details.amount.toLocaleString()} completed.\nBal: KES ${details.newBalance.toLocaleString()}\nTxnID: ${txnId}\nThank you for using ChamaYangu 🌟`;
    }

    toast({
      title,
      description,
      duration: 8000,
    });
  };

  return { showTransactionNotification };
};
