
const { body, param, query } = require('express-validator');
const { 
  VALIDATION_PATTERNS, 
  USER_ROLES, 
  CHAMA_ROLES, 
  PAYMENT_METHODS,
  CURRENCIES,
  GENDER_OPTIONS,
  MARITAL_STATUS,
  EMPLOYMENT_STATUS 
} = require('./constants');

// User validation
const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(VALIDATION_PATTERNS.PASSWORD)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Full name must be between 2 and 50 characters'),
  
  body('phoneNumber')
    .matches(VALIDATION_PATTERNS.PHONE_KE)
    .withMessage('Please provide a valid Kenyan phone number'),
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const validateUserUpdate = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Full name must be between 2 and 50 characters'),
  
  body('phoneNumber')
    .optional()
    .matches(VALIDATION_PATTERNS.PHONE_KE)
    .withMessage('Please provide a valid Kenyan phone number'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  
  body('gender')
    .optional()
    .isIn(Object.values(GENDER_OPTIONS))
    .withMessage('Please provide a valid gender'),
];

// Chama validation
const validateChamaCreation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Chama name must be between 3 and 50 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('contributionAmount')
    .isNumeric()
    .isFloat({ min: 100 })
    .withMessage('Contribution amount must be at least 100'),
  
  body('contributionFrequency')
    .isIn(['weekly', 'monthly', 'quarterly'])
    .withMessage('Contribution frequency must be weekly, monthly, or quarterly'),
  
  body('maxMembers')
    .optional()
    .isInt({ min: 2, max: 200 })
    .withMessage('Maximum members must be between 2 and 200'),
];

const validateChamaUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Chama name must be between 3 and 50 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('contributionAmount')
    .optional()
    .isNumeric()
    .isFloat({ min: 100 })
    .withMessage('Contribution amount must be at least 100'),
];

// Contribution validation
const validateContribution = [
  body('amount')
    .isNumeric()
    .isFloat({ min: 1 })
    .withMessage('Amount must be greater than 0'),
  
  body('paymentMethod')
    .isIn(Object.values(PAYMENT_METHODS))
    .withMessage('Invalid payment method'),
  
  body('paymentReference')
    .optional()
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage('Payment reference must be between 5 and 50 characters'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Notes must not exceed 200 characters'),
];

// Loan validation
const validateLoanApplication = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Full name is required'),
  
  body('nationalId')
    .matches(VALIDATION_PATTERNS.KENYAN_ID)
    .withMessage('Please provide a valid Kenyan ID number'),
  
  body('phoneNumber')
    .matches(VALIDATION_PATTERNS.PHONE_KE)
    .withMessage('Please provide a valid phone number'),
  
  body('emailAddress')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('monthlyIncome')
    .isNumeric()
    .isFloat({ min: 1000 })
    .withMessage('Monthly income must be at least 1000'),
  
  body('loanAmount')
    .isNumeric()
    .isFloat({ min: 1000, max: 5000000 })
    .withMessage('Loan amount must be between 1,000 and 5,000,000'),
  
  body('loanTermMonths')
    .isInt({ min: 1, max: 60 })
    .withMessage('Loan term must be between 1 and 60 months'),
  
  body('loanPurpose')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Loan purpose must be between 10 and 200 characters'),
  
  body('employmentStatus')
    .isIn(Object.values(EMPLOYMENT_STATUS))
    .withMessage('Invalid employment status'),
];

const validateChamaLoan = [
  body('amount')
    .isNumeric()
    .isFloat({ min: 100 })
    .withMessage('Loan amount must be at least 100'),
  
  body('purpose')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Loan purpose must be between 10 and 200 characters'),
  
  body('durationMonths')
    .isInt({ min: 1, max: 24 })
    .withMessage('Duration must be between 1 and 24 months'),
];

// Investment validation
const validateInvestment = [
  body('investmentType')
    .isIn(['project', 'loan', 'chama', 'bond', 'equity'])
    .withMessage('Invalid investment type'),
  
  body('amountInvested')
    .isNumeric()
    .isFloat({ min: 100 })
    .withMessage('Investment amount must be at least 100'),
  
  body('expectedReturn')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Expected return must be a positive number'),
];

const validateInvestmentProject = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Project title must be between 5 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Description must be between 20 and 1000 characters'),
  
  body('targetAmount')
    .isNumeric()
    .isFloat({ min: 10000 })
    .withMessage('Target amount must be at least 10,000'),
  
  body('projectedROI')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Projected ROI must be between 0 and 100 percent'),
  
  body('duration')
    .isInt({ min: 1, max: 120 })
    .withMessage('Duration must be between 1 and 120 months'),
  
  body('category')
    .isIn(['agriculture', 'real_estate', 'technology', 'manufacturing', 'services'])
    .withMessage('Invalid project category'),
];

// M-Pesa validation
const validateMpesaPayment = [
  body('phoneNumber')
    .matches(VALIDATION_PATTERNS.PHONE_KE)
    .withMessage('Please provide a valid phone number'),
  
  body('amount')
    .isNumeric()
    .isFloat({ min: 1, max: 300000 })
    .withMessage('Amount must be between 1 and 300,000'),
  
  body('accountReference')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Account reference must be between 1 and 20 characters'),
  
  body('transactionDesc')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Transaction description must be between 1 and 20 characters'),
];

// Profile validation
const validateProfileUpdate = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Full name must be between 2 and 50 characters'),
  
  body('phoneNumber')
    .optional()
    .matches(VALIDATION_PATTERNS.PHONE_KE)
    .withMessage('Please provide a valid phone number'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .custom((value) => {
      const age = new Date().getFullYear() - new Date(value).getFullYear();
      if (age < 18 || age > 100) {
        throw new Error('Age must be between 18 and 100');
      }
      return true;
    }),
  
  body('gender')
    .optional()
    .isIn(Object.values(GENDER_OPTIONS))
    .withMessage('Invalid gender option'),
  
  body('occupation')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Occupation must be between 2 and 50 characters'),
  
  body('monthlyIncome')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Monthly income must be a positive number'),
];

const validateBankDetails = [
  body('bankName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Bank name is required'),
  
  body('accountNumber')
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage('Account number must be between 5 and 20 characters'),
  
  body('branchName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Branch name must be between 2 and 50 characters'),
];

// Parameter validation
const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage(`Invalid ${paramName}`)
];

// Query validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (req.query.startDate && new Date(value) <= new Date(req.query.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
];

// Admin validation
const validateRoleUpdate = [
  body('role')
    .isIn(Object.values(USER_ROLES))
    .withMessage('Invalid user role'),
];

const validateChamaRoleUpdate = [
  body('role')
    .isIn(Object.values(CHAMA_ROLES))
    .withMessage('Invalid chama role'),
];

// Notification validation
const validateNotification = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  
  body('message')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Message must be between 1 and 500 characters'),
  
  body('type')
    .isIn(['info', 'success', 'warning', 'error'])
    .withMessage('Invalid notification type'),
  
  body('category')
    .optional()
    .isIn(['system', 'chama', 'loan', 'investment', 'payment', 'security'])
    .withMessage('Invalid notification category'),
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateChamaCreation,
  validateChamaUpdate,
  validateContribution,
  validateLoanApplication,
  validateChamaLoan,
  validateInvestment,
  validateInvestmentProject,
  validateMpesaPayment,
  validateProfileUpdate,
  validateBankDetails,
  validateObjectId,
  validatePagination,
  validateDateRange,
  validateRoleUpdate,
  validateChamaRoleUpdate,
  validateNotification,
};
