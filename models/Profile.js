
const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  profilePhoto: {
    type: String, // URL to profile photo
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
  },
  nationality: {
    type: String,
    default: 'Kenyan',
  },
  idNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: {
      type: String,
      default: 'Kenya',
    }
  },
  occupation: String,
  employer: String,
  monthlyIncome: {
    type: Number,
    min: 0,
  },
  emergencyContact: {
    name: String,
    phoneNumber: String,
    relationship: String,
  },
  bankDetails: {
    bankName: String,
    accountNumber: String,
    branchName: String,
    swiftCode: String,
  },
  creditScore: {
    type: Number,
    min: 300,
    max: 850,
    default: 650,
  },
  loanEligibility: {
    type: Number,
    default: 10000,
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  kycDocuments: [{
    type: {
      type: String,
      enum: ['national_id', 'passport', 'driving_license', 'utility_bill', 'bank_statement'],
    },
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    }
  }],
  preferences: {
    language: {
      type: String,
      enum: ['en', 'sw'],
      default: 'en',
    },
    currency: {
      type: String,
      enum: ['KES', 'USD'],
      default: 'KES',
    },
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true,
      },
      marketing: {
        type: Boolean,
        default: false,
      }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'chama_members', 'private'],
        default: 'chama_members',
      },
      showInvestments: {
        type: Boolean,
        default: false,
      }
    }
  },
  socialLinks: {
    facebook: String,
    twitter: String,
    linkedin: String,
    instagram: String,
  },
  bio: {
    type: String,
    maxlength: 500,
  },
  achievements: [{
    title: String,
    description: String,
    dateEarned: {
      type: Date,
      default: Date.now,
    },
    category: {
      type: String,
      enum: ['savings', 'investment', 'loan_repayment', 'leadership', 'community'],
    }
  }],
  statistics: {
    totalSavings: {
      type: Number,
      default: 0,
    },
    totalInvestments: {
      type: Number,
      default: 0,
    },
    chamasJoined: {
      type: Number,
      default: 0,
    },
    loansRepaid: {
      type: Number,
      default: 0,
    },
    memberSince: {
      type: Date,
      default: Date.now,
    }
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Profile', profileSchema);
