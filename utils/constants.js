
// Application constants
const APP_NAME = 'ChamaVault';
const APP_VERSION = '1.0.0';

// API response codes
const RESPONSE_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  INTERNAL_ERROR: 500,
};

// User roles
const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  BANK: 'bank',
  SUPER_ADMIN: 'super_admin',
};

// Chama member roles
const CHAMA_ROLES = {
  ADMIN: 'admin',
  TREASURER: 'treasurer',
  SECRETARY: 'secretary',
  MEMBER: 'member',
};

// Transaction statuses
const TRANSACTION_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  TIMEOUT: 'timeout',
};

// Loan statuses
const LOAN_STATUS = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  FUNDED: 'funded',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  DEFAULTED: 'defaulted',
};

// Investment types
const INVESTMENT_TYPES = {
  PROJECT: 'project',
  LOAN: 'loan',
  CHAMA: 'chama',
  BOND: 'bond',
  EQUITY: 'equity',
};

// Investment statuses
const INVESTMENT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DEFAULTED: 'defaulted',
};

// Notification types
const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  CONTRIBUTION: 'contribution',
  LOAN: 'loan',
  INVESTMENT: 'investment',
  PAYMENT: 'payment',
};

// Notification categories
const NOTIFICATION_CATEGORIES = {
  SYSTEM: 'system',
  CHAMA: 'chama',
  LOAN: 'loan',
  INVESTMENT: 'investment',
  PAYMENT: 'payment',
  SECURITY: 'security',
};

// Payment methods
const PAYMENT_METHODS = {
  MPESA: 'mpesa',
  BANK_TRANSFER: 'bank_transfer',
  CASH: 'cash',
  CARD: 'card',
};

// Currencies
const CURRENCIES = {
  KES: 'KES',
  USD: 'USD',
  EUR: 'EUR',
};

// Countries
const COUNTRIES = {
  KENYA: 'Kenya',
  UGANDA: 'Uganda',
  TANZANIA: 'Tanzania',
  RWANDA: 'Rwanda',
};

// Languages
const LANGUAGES = {
  ENGLISH: 'en',
  SWAHILI: 'sw',
};

// Gender options
const GENDER_OPTIONS = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
  PREFER_NOT_TO_SAY: 'prefer_not_to_say',
};

// Marital status options
const MARITAL_STATUS = {
  SINGLE: 'single',
  MARRIED: 'married',
  DIVORCED: 'divorced',
  WIDOWED: 'widowed',
  SEPARATED: 'separated',
};

// Employment status options
const EMPLOYMENT_STATUS = {
  EMPLOYED: 'employed',
  SELF_EMPLOYED: 'self_employed',
  UNEMPLOYED: 'unemployed',
  STUDENT: 'student',
  RETIRED: 'retired',
};

// KYC document types
const KYC_DOCUMENT_TYPES = {
  NATIONAL_ID: 'national_id',
  PASSPORT: 'passport',
  DRIVING_LICENSE: 'driving_license',
  UTILITY_BILL: 'utility_bill',
  BANK_STATEMENT: 'bank_statement',
};

// KYC statuses
const KYC_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
};

// File types
const ALLOWED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/jpg'],
  DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALL: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
};

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  PROFILE_PHOTO: 2 * 1024 * 1024, // 2MB
  DOCUMENT: 5 * 1024 * 1024, // 5MB
  BULK_UPLOAD: 10 * 1024 * 1024, // 10MB
};

// Pagination defaults
const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
};

// Rate limiting
const RATE_LIMITS = {
  GENERAL: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window
  },
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // requests per window
  },
  MPESA: {
    windowMs: 60 * 1000, // 1 minute
    max: 3, // requests per window
  },
};

// Email templates
const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  PASSWORD_RESET: 'password_reset',
  CONTRIBUTION_REMINDER: 'contribution_reminder',
  LOAN_APPROVAL: 'loan_approval',
  INVESTMENT_UPDATE: 'investment_update',
  MONTHLY_STATEMENT: 'monthly_statement',
};

// Report types
const REPORT_TYPES = {
  SAVINGS: 'savings',
  INVESTMENTS: 'investments',
  LOANS: 'loans',
  TRANSACTIONS: 'transactions',
  MEMBERS: 'members',
  FINANCIAL: 'financial',
};

// Date formats
const DATE_FORMATS = {
  ISO: 'YYYY-MM-DD',
  DISPLAY: 'DD/MM/YYYY',
  TIMESTAMP: 'YYYY-MM-DD HH:mm:ss',
  MONTH_YEAR: 'MMMM YYYY',
};

// Risk levels
const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  VERY_HIGH: 'very_high',
};

// Interest rates (annual percentage)
const INTEREST_RATES = {
  CHAMA_LOAN: {
    LOW_RISK: 10,
    MEDIUM_RISK: 15,
    HIGH_RISK: 20,
  },
  PERSONAL_LOAN: {
    LOW_RISK: 12,
    MEDIUM_RISK: 18,
    HIGH_RISK: 24,
  },
  INVESTMENT: {
    LOW_RISK: 8,
    MEDIUM_RISK: 12,
    HIGH_RISK: 18,
  },
};

// M-Pesa configuration
const MPESA_CONFIG = {
  TRANSACTION_TYPES: {
    STK_PUSH: 'stk_push',
    B2C: 'b2c',
    C2B: 'c2b',
    REVERSAL: 'reversal',
  },
  COMMAND_IDS: {
    BUSINESS_PAYMENT: 'BusinessPayment',
    SALARY_PAYMENT: 'SalaryPayment',
    PROMOTION_PAYMENT: 'PromotionPayment',
  },
  RESULT_CODES: {
    SUCCESS: 0,
    INSUFFICIENT_FUNDS: 1,
    LESS_THAN_MINIMUM: 2,
    MORE_THAN_MAXIMUM: 3,
    EXCEEDED_DAILY_LIMIT: 4,
    EXCEEDED_MINIMUM_BALANCE: 5,
    UNRESOLVED_PRIMARY_PARTY: 6,
    UNRESOLVED_RECEIVER_PARTY: 7,
    INVALID_ACCOUNT: 8,
    GENERIC_ERROR: 1000,
  },
};

// Validation patterns
const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_KE: /^(254|0)[17]\d{8}$/,
  KENYAN_ID: /^\d{8}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
};

// Error messages
const ERROR_MESSAGES = {
  INVALID_EMAIL: 'Please provide a valid email address',
  INVALID_PHONE: 'Please provide a valid phone number',
  INVALID_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, and number',
  USER_NOT_FOUND: 'User not found',
  INVALID_CREDENTIALS: 'Invalid email or password',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  FORBIDDEN: 'Access denied',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation failed',
  INTERNAL_ERROR: 'Internal server error',
  DUPLICATE_ENTRY: 'This record already exists',
  INSUFFICIENT_FUNDS: 'Insufficient funds',
  TRANSACTION_FAILED: 'Transaction failed',
};

module.exports = {
  APP_NAME,
  APP_VERSION,
  RESPONSE_CODES,
  USER_ROLES,
  CHAMA_ROLES,
  TRANSACTION_STATUS,
  LOAN_STATUS,
  INVESTMENT_TYPES,
  INVESTMENT_STATUS,
  NOTIFICATION_TYPES,
  NOTIFICATION_CATEGORIES,
  PAYMENT_METHODS,
  CURRENCIES,
  COUNTRIES,
  LANGUAGES,
  GENDER_OPTIONS,
  MARITAL_STATUS,
  EMPLOYMENT_STATUS,
  KYC_DOCUMENT_TYPES,
  KYC_STATUS,
  ALLOWED_FILE_TYPES,
  FILE_SIZE_LIMITS,
  PAGINATION_DEFAULTS,
  RATE_LIMITS,
  EMAIL_TEMPLATES,
  REPORT_TYPES,
  DATE_FORMATS,
  RISK_LEVELS,
  INTEREST_RATES,
  MPESA_CONFIG,
  VALIDATION_PATTERNS,
  ERROR_MESSAGES,
};
