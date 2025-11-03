
const express = require('express');
const { body } = require('express-validator');
const loanController = require('../controllers/loanController');
const { validateRequest, validateObjectId } = require('../middleware/validation');
const { adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all loan applications for current user
router.get('/applications', loanController.getUserLoanApplications);

// Get all loan applications (admin only)
router.get('/applications/all', adminMiddleware, loanController.getAllLoanApplications);

// Get specific loan application
router.get('/applications/:id', validateObjectId('id'), loanController.getLoanApplication);

// Create new loan application
router.post('/applications', [
  body('fullName').trim().isLength({ min: 2 }),
  body('nationalId').trim().isLength({ min: 6 }),
  body('phoneNumber').isMobilePhone(),
  body('emailAddress').isEmail(),
  body('monthlyIncome').isNumeric().isFloat({ min: 1000 }),
  body('loanAmount').isNumeric().isFloat({ min: 1000 }),
  body('loanTermMonths').isInt({ min: 1, max: 60 }),
  body('loanPurpose').trim().isLength({ min: 10 }),
  validateRequest
], loanController.createLoanApplication);

// Update loan application
router.put('/applications/:id', validateObjectId('id'), loanController.updateLoanApplication);

// Approve loan application (admin only)
router.patch('/applications/:id/approve', 
  validateObjectId('id'), 
  adminMiddleware, 
  loanController.approveLoanApplication
);

// Reject loan application (admin only)
router.patch('/applications/:id/reject', 
  validateObjectId('id'), 
  adminMiddleware, 
  loanController.rejectLoanApplication
);

// Get loan offers for application
router.get('/applications/:id/offers', validateObjectId('id'), loanController.getLoanOffers);

// Create loan offer (investor)
router.post('/applications/:id/offers', [
  validateObjectId('id'),
  body('offeredAmount').isNumeric().isFloat({ min: 1000 }),
  body('offeredInterestRate').isFloat({ min: 0, max: 50 }),
  validateRequest
], loanController.createLoanOffer);

// Accept loan offer
router.patch('/offers/:id/accept', validateObjectId('id'), loanController.acceptLoanOffer);

// Reject loan offer
router.patch('/offers/:id/reject', validateObjectId('id'), loanController.rejectLoanOffer);

// Get loan repayments
router.get('/applications/:id/repayments', validateObjectId('id'), loanController.getLoanRepayments);

// Make loan repayment
router.post('/applications/:id/repayments', [
  validateObjectId('id'),
  body('amount').isNumeric().isFloat({ min: 1 }),
  body('paymentMethod').isIn(['mpesa', 'bank_transfer', 'cash']),
  validateRequest
], loanController.makeLoanRepayment);

// Get chama loans
router.get('/chama/:chamaId', validateObjectId('chamaId'), loanController.getChamaLoans);

// Create chama loan request
router.post('/chama/:chamaId/request', [
  validateObjectId('chamaId'),
  body('amount').isNumeric().isFloat({ min: 100 }),
  body('purpose').trim().isLength({ min: 10 }),
  body('durationMonths').isInt({ min: 1, max: 24 }),
  validateRequest
], loanController.createChamaLoanRequest);

// Approve chama loan (admin/treasurer)
router.patch('/chama/loans/:id/approve', validateObjectId('id'), loanController.approveChamaLoan);

// Make chama loan repayment
router.post('/chama/loans/:id/repayment', [
  validateObjectId('id'),
  body('amount').isNumeric().isFloat({ min: 1 }),
  validateRequest
], loanController.makeChamaLoanRepayment);

module.exports = router;
