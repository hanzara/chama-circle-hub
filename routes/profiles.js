
const express = require('express');
const multer = require('multer');
const { body } = require('express-validator');
const profileController = require('../controllers/profileController');
const { validateRequest, validateFileUpload } = require('../middleware/validation');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Get current user profile
router.get('/', profileController.getProfile);

// Update user profile
router.put('/', [
  body('fullName').optional().trim().isLength({ min: 2 }),
  body('phoneNumber').optional().isMobilePhone(),
  body('dateOfBirth').optional().isISO8601(),
  body('gender').optional().isIn(['male', 'female', 'other', 'prefer_not_to_say']),
  body('occupation').optional().trim(),
  body('monthlyIncome').optional().isNumeric(),
  validateRequest
], profileController.updateProfile);

// Upload profile photo
router.post('/photo', 
  upload.single('profilePhoto'),
  validateFileUpload(['image/jpeg', 'image/png', 'image/jpg'], 2 * 1024 * 1024),
  profileController.uploadProfilePhoto
);

// Delete profile photo
router.delete('/photo', profileController.deleteProfilePhoto);

// Update KYC documents
router.post('/kyc/documents', 
  upload.single('document'),
  validateFileUpload(['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']),
  [
    body('documentType').isIn(['national_id', 'passport', 'driving_license', 'utility_bill', 'bank_statement']),
    validateRequest
  ],
  profileController.uploadKYCDocument
);

// Get KYC status
router.get('/kyc/status', profileController.getKYCStatus);

// Update preferences
router.put('/preferences', [
  body('language').optional().isIn(['en', 'sw']),
  body('currency').optional().isIn(['KES', 'USD']),
  body('notifications.email').optional().isBoolean(),
  body('notifications.sms').optional().isBoolean(),
  body('notifications.push').optional().isBoolean(),
  validateRequest
], profileController.updatePreferences);

// Get user statistics
router.get('/statistics', profileController.getUserStatistics);

// Update bank details
router.put('/bank-details', [
  body('bankName').trim().isLength({ min: 2 }),
  body('accountNumber').trim().isLength({ min: 5 }),
  body('branchName').optional().trim(),
  validateRequest
], profileController.updateBankDetails);

// Update emergency contact
router.put('/emergency-contact', [
  body('name').trim().isLength({ min: 2 }),
  body('phoneNumber').isMobilePhone(),
  body('relationship').trim().isLength({ min: 2 }),
  validateRequest
], profileController.updateEmergencyContact);

// Get user achievements
router.get('/achievements', profileController.getUserAchievements);

// Update profile visibility
router.put('/privacy', [
  body('profileVisibility').isIn(['public', 'chama_members', 'private']),
  body('showInvestments').isBoolean(),
  validateRequest
], profileController.updatePrivacySettings);

// Deactivate account
router.post('/deactivate', [
  body('reason').trim().isLength({ min: 10 }),
  body('password').isLength({ min: 6 }),
  validateRequest
], profileController.deactivateAccount);

// Request data export
router.post('/export-data', profileController.requestDataExport);

module.exports = router;
