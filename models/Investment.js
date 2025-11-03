
const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  investorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InvestmentProject',
  },
  loanApplicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LoanApplication',
  },
  investmentType: {
    type: String,
    enum: ['project', 'loan', 'chama', 'bond', 'equity'],
    required: true,
  },
  amountInvested: {
    type: Number,
    required: true,
    min: 0,
  },
  expectedReturn: {
    type: Number,
    required: true,
  },
  expectedReturnPercentage: {
    type: Number,
    min: 0,
    max: 100,
  },
  actualReturn: {
    type: Number,
    default: 0,
  },
  investmentDate: {
    type: Date,
    default: Date.now,
  },
  maturityDate: Date,
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled', 'defaulted'],
    default: 'pending',
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  terms: {
    duration: Number, // in months
    interestRate: Number,
    paymentFrequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'annually', 'at_maturity'],
      default: 'monthly',
    },
    earlyWithdrawalPenalty: Number,
  },
  returns: [{
    amount: Number,
    date: Date,
    type: {
      type: String,
      enum: ['interest', 'principal', 'dividend', 'capital_gain'],
    },
    description: String,
  }],
  documents: [{
    type: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    }
  }],
  notes: String,
}, {
  timestamps: true,
});

// Calculate expected return percentage
investmentSchema.pre('save', function(next) {
  if (this.isModified('amountInvested') || this.isModified('expectedReturn')) {
    this.expectedReturnPercentage = ((this.expectedReturn - this.amountInvested) / this.amountInvested) * 100;
  }
  next();
});

module.exports = mongoose.model('Investment', investmentSchema);
