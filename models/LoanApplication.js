
const mongoose = require('mongoose');

const loanApplicationSchema = new mongoose.Schema({
  borrowerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  nationalId: {
    type: String,
    required: true,
    unique: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  maritalStatus: {
    type: String,
    enum: ['single', 'married', 'divorced', 'widowed'],
  },
  nationality: {
    type: String,
    default: 'Kenyan',
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  emailAddress: {
    type: String,
    required: true,
  },
  physicalAddress: {
    type: String,
    required: true,
  },
  postalAddress: String,
  employmentStatus: {
    type: String,
    required: true,
    enum: ['employed', 'self-employed', 'unemployed', 'student'],
  },
  employerBusinessName: String,
  jobTitleBusinessType: String,
  employerAddress: String,
  employmentLengthMonths: Number,
  monthlyIncome: {
    type: Number,
    required: true,
    min: 0,
  },
  loanAmount: {
    type: Number,
    required: true,
    min: 1000,
  },
  loanPurpose: {
    type: String,
    required: true,
  },
  loanTermMonths: {
    type: Number,
    required: true,
    min: 1,
    max: 60,
  },
  interestRate: Number,
  monthlyPayment: Number,
  totalAmount: Number,
  repaymentFrequency: {
    type: String,
    enum: ['weekly', 'monthly'],
    default: 'monthly',
  },
  repaymentSource: String,
  bankName: String,
  bankAccountNumber: String,
  bankBranch: String,
  mpesaNumber: String,
  guarantors: [{
    name: String,
    phoneNumber: String,
    relationship: String,
    idNumber: String,
  }],
  collateral: [{
    type: String,
    description: String,
    estimatedValue: Number,
  }],
  creditScore: {
    type: Number,
    min: 300,
    max: 850,
  },
  riskRating: {
    type: String,
    enum: ['low', 'medium', 'high'],
  },
  eligibilityScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'funded', 'active', 'completed', 'defaulted'],
    default: 'pending',
  },
  fundingProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  approvedAt: Date,
  fundedAt: Date,
  disbursedAt: Date,
  nextPaymentDue: Date,
  termsAccepted: {
    type: Boolean,
    default: false,
  },
  creditCheckConsent: {
    type: Boolean,
    default: false,
  },
  dataSharingConsent: {
    type: Boolean,
    default: false,
  },
  documents: [{
    type: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    }
  }],
  rejectionReason: String,
}, {
  timestamps: true,
});

// Calculate risk rating before saving
loanApplicationSchema.pre('save', function(next) {
  if (this.isModified('monthlyIncome') || this.isModified('loanAmount') || this.isModified('employmentLengthMonths')) {
    const debtToIncomeRatio = (this.loanAmount / this.loanTermMonths) / this.monthlyIncome;
    let riskScore = 0;
    
    if (debtToIncomeRatio > 0.5) riskScore += 3;
    else if (debtToIncomeRatio > 0.3) riskScore += 2;
    
    if (this.employmentLengthMonths < 6) riskScore += 2;
    else if (this.employmentLengthMonths < 12) riskScore += 1;
    
    if (this.collateral && this.collateral.length > 0) riskScore -= 1;
    
    if (riskScore >= 4) this.riskRating = 'high';
    else if (riskScore >= 2) this.riskRating = 'medium';
    else this.riskRating = 'low';
    
    // Set interest rate based on risk
    if (!this.interestRate) {
      switch (this.riskRating) {
        case 'low': this.interestRate = 12.0; break;
        case 'medium': this.interestRate = 18.0; break;
        case 'high': this.interestRate = 24.0; break;
      }
    }
    
    // Calculate monthly payment
    const principal = this.loanAmount;
    const monthlyRate = this.interestRate / 100 / 12;
    const numPayments = this.loanTermMonths;
    
    if (monthlyRate === 0) {
      this.monthlyPayment = principal / numPayments;
    } else {
      this.monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                            (Math.pow(1 + monthlyRate, numPayments) - 1);
    }
    
    this.totalAmount = this.monthlyPayment * numPayments;
  }
  next();
});

module.exports = mongoose.model('LoanApplication', loanApplicationSchema);
