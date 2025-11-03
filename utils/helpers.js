
const crypto = require('crypto');

// Generate random string
const generateRandomString = (length = 10) => {
  return crypto.randomBytes(length).toString('hex').substring(0, length);
};

// Generate random number
const generateRandomNumber = (min = 1000, max = 9999) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Format currency
const formatCurrency = (amount, currency = 'KES') => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency === 'KES' ? 'KES' : 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

// Format phone number to international format
const formatPhoneNumber = (phoneNumber) => {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Handle Kenyan numbers
  if (digits.startsWith('254')) {
    return digits;
  } else if (digits.startsWith('0')) {
    return '254' + digits.substring(1);
  } else if (digits.length === 9) {
    return '254' + digits;
  }
  
  return digits;
};

// Calculate age from date of birth
const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Calculate date difference in days
const daysDifference = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000;
  const firstDate = new Date(date1);
  const secondDate = new Date(date2);
  
  return Math.round(Math.abs((firstDate - secondDate) / oneDay));
};

// Add days to date
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Add months to date
const addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

// Generate reference number
const generateReference = (prefix = 'REF', length = 8) => {
  const timestamp = Date.now().toString().slice(-4);
  const random = generateRandomString(length - 4);
  return `${prefix}${timestamp}${random}`.toUpperCase();
};

// Calculate loan schedule
const calculateLoanSchedule = (principal, annualRate, termMonths, startDate = new Date()) => {
  const monthlyRate = annualRate / 100 / 12;
  const monthlyPayment = monthlyRate === 0 ? 
    principal / termMonths :
    principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
    (Math.pow(1 + monthlyRate, termMonths) - 1);

  const schedule = [];
  let balance = principal;
  
  for (let i = 1; i <= termMonths; i++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance -= principalPayment;
    
    const dueDate = addMonths(startDate, i);
    
    schedule.push({
      paymentNumber: i,
      dueDate,
      paymentAmount: Math.round(monthlyPayment * 100) / 100,
      principalAmount: Math.round(principalPayment * 100) / 100,
      interestAmount: Math.round(interestPayment * 100) / 100,
      remainingBalance: Math.max(0, Math.round(balance * 100) / 100)
    });
  }
  
  return schedule;
};

// Calculate compound interest
const calculateCompoundInterest = (principal, rate, time, compoundingFrequency = 12) => {
  const amount = principal * Math.pow(1 + (rate / 100) / compoundingFrequency, compoundingFrequency * time);
  return Math.round(amount * 100) / 100;
};

// Generate OTP
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  
  return otp;
};

// Mask sensitive data
const maskData = (data, type = 'default') => {
  if (!data) return data;
  
  switch (type) {
    case 'email':
      const [username, domain] = data.split('@');
      const maskedUsername = username.length > 2 ? 
        username.charAt(0) + '*'.repeat(username.length - 2) + username.slice(-1) : 
        username;
      return `${maskedUsername}@${domain}`;
      
    case 'phone':
      return data.length > 4 ? 
        '*'.repeat(data.length - 4) + data.slice(-4) : 
        data;
        
    case 'id':
      return data.length > 4 ? 
        data.slice(0, 2) + '*'.repeat(data.length - 4) + data.slice(-2) : 
        data;
        
    default:
      return data.length > 4 ? 
        '*'.repeat(data.length - 4) + data.slice(-4) : 
        data;
  }
};

// Validate Kenyan ID number
const validateKenyanID = (idNumber) => {
  const cleaned = idNumber.replace(/\s/g, '');
  
  // Must be 8 digits
  if (!/^\d{8}$/.test(cleaned)) {
    return false;
  }
  
  // Additional validation logic can be added here
  return true;
};

// Calculate percentage
const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100 * 100) / 100;
};

// Paginate array
const paginateArray = (array, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    data: array.slice(startIndex, endIndex),
    pagination: {
      page,
      limit,
      total: array.length,
      pages: Math.ceil(array.length / limit)
    }
  };
};

// Deep clone object
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Remove duplicates from array
const removeDuplicates = (array, key = null) => {
  if (!key) {
    return [...new Set(array)];
  }
  
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

// Sort array of objects
const sortByKey = (array, key, order = 'asc') => {
  return array.sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];
    
    if (order === 'desc') {
      return bValue > aValue ? 1 : -1;
    }
    
    return aValue > bValue ? 1 : -1;
  });
};

module.exports = {
  generateRandomString,
  generateRandomNumber,
  formatCurrency,
  formatPhoneNumber,
  calculateAge,
  daysDifference,
  addDays,
  addMonths,
  generateReference,
  calculateLoanSchedule,
  calculateCompoundInterest,
  generateOTP,
  maskData,
  validateKenyanID,
  calculatePercentage,
  paginateArray,
  deepClone,
  removeDuplicates,
  sortByKey,
};
