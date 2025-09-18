
const mongoose = require('mongoose');

const mpesaTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  transactionType: {
    type: String,
    enum: ['stk_push', 'b2c', 'c2b', 'reversal'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  merchantRequestId: String,
  checkoutRequestId: String,
  mpesaReceiptNumber: String,
  transactionDate: Date,
  resultCode: Number,
  resultDesc: String,
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'cancelled', 'timeout'],
    default: 'pending',
  },
  accountReference: {
    type: String,
    default: 'ChamaVault',
  },
  transactionDesc: {
    type: String,
    default: 'Payment',
  },
  callbackData: {
    type: mongoose.Schema.Types.Mixed,
  },
  purpose: {
    type: String,
    enum: ['contribution', 'loan_repayment', 'wallet_topup', 'investment', 'withdrawal'],
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    // Reference to related document (chama, loan, etc.)
  },
  relatedModel: {
    type: String,
    enum: ['Chama', 'ChamaLoan', 'Investment', 'UserWallet'],
  },
  charges: {
    mpesaFee: {
      type: Number,
      default: 0,
    },
    platformFee: {
      type: Number,
      default: 0,
    },
    totalCharges: {
      type: Number,
      default: 0,
    }
  },
  retryCount: {
    type: Number,
    default: 0,
  },
  maxRetries: {
    type: Number,
    default: 3,
  },
  lastRetryAt: Date,
  failureReason: String,
}, {
  timestamps: true,
});

// Index for efficient queries
mpesaTransactionSchema.index({ userId: 1, status: 1 });
mpesaTransactionSchema.index({ checkoutRequestId: 1 });
mpesaTransactionSchema.index({ mpesaReceiptNumber: 1 });

module.exports = mongoose.model('MpesaTransaction', mpesaTransactionSchema);
