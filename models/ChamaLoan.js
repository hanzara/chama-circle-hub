
const mongoose = require('mongoose');

const chamaLoanSchema = new mongoose.Schema({
  chamaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chama',
    required: true,
  },
  borrowerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChamaMember',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  interestRate: {
    type: Number,
    default: 5.0,
    min: 0,
    max: 100,
  },
  durationMonths: {
    type: Number,
    required: true,
    min: 1,
  },
  monthlyPayment: {
    type: Number,
    required: true,
  },
  totalRepayment: {
    type: Number,
    required: true,
  },
  purpose: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'active', 'completed', 'defaulted'],
    default: 'pending',
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChamaMember',
  },
  approvedAt: Date,
  disbursedAt: Date,
  dueDate: Date,
  repaidAmount: {
    type: Number,
    default: 0,
  },
  guarantors: [{
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChamaMember',
    },
    guaranteeAmount: Number,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    }
  }],
  collateral: {
    type: String,
    trim: true,
  },
  rejectionReason: String,
}, {
  timestamps: true,
});

// Calculate monthly payment before saving
chamaLoanSchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isModified('interestRate') || this.isModified('durationMonths')) {
    const principal = this.amount;
    const monthlyRate = this.interestRate / 100 / 12;
    const numPayments = this.durationMonths;
    
    if (monthlyRate === 0) {
      this.monthlyPayment = principal / numPayments;
    } else {
      this.monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                            (Math.pow(1 + monthlyRate, numPayments) - 1);
    }
    
    this.totalRepayment = this.monthlyPayment * numPayments;
  }
  next();
});

module.exports = mongoose.model('ChamaLoan', chamaLoanSchema);
