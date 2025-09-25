
const { validationResult } = require('express-validator');

// Generic validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Sanitize input data
const sanitizeInput = (req, res, next) => {
  // Remove any potential XSS attempts
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach(key => {
        obj[key] = sanitize(obj[key]);
      });
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
};

// File upload validation
const validateFileUpload = (allowedTypes = [], maxSize = 5 * 1024 * 1024) => {
  return (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        error: 'Invalid file type',
        allowedTypes: allowedTypes
      });
    }

    // Check file size
    if (req.file.size > maxSize) {
      return res.status(400).json({ 
        error: 'File too large',
        maxSize: `${maxSize / (1024 * 1024)}MB`
      });
    }

    next();
  };
};

// Pagination validation
const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const maxLimit = 100;

  if (page < 1) {
    return res.status(400).json({ error: 'Page must be greater than 0' });
  }

  if (limit < 1 || limit > maxLimit) {
    return res.status(400).json({ 
      error: `Limit must be between 1 and ${maxLimit}` 
    });
  }

  req.pagination = {
    page,
    limit,
    skip: (page - 1) * limit
  };

  next();
};

// MongoDB ObjectId validation
const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: `Invalid ${paramName}` });
    }
    next();
  };
};

module.exports = {
  validateRequest,
  sanitizeInput,
  validateFileUpload,
  validatePagination,
  validateObjectId,
};
