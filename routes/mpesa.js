
const express = require('express');
const { body } = require('express-validator');
const mpesaController = require('../controllers/mpesaController');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Initiate STK Push
router.post('/stk-push', [
  body('phoneNumber').isMobilePhone('any'),
  body('amount').isNumeric().isFloat({ min: 1 }),
  body('accountReference').optional().trim(),
  body('transactionDesc').optional().trim(),
  validateRequest
], mpesaController.initiateSTKPush);

// M-Pesa callback (no auth required)
router.post('/callback', mpesaController.handleCallback);

// Check transaction status
router.get('/status/:checkoutRequestId', mpesaController.checkTransactionStatus);

// Get user M-Pesa transactions
router.get('/transactions', mpesaController.getUserTransactions);

// Get transaction details
router.get('/transactions/:id', mpesaController.getTransactionDetails);

// Retry failed transaction
router.post('/transactions/:id/retry', mpesaController.retryTransaction);

// B2C - Send money to user (admin only)
router.post('/b2c', [
  body('phoneNumber').isMobilePhone('any'),
  body('amount').isNumeric().isFloat({ min: 1 }),
  body('commandID').optional().isIn(['BusinessPayment', 'SalaryPayment', 'PromotionPayment']),
  validateRequest
], mpesaController.sendMoneyB2C);

// C2B - Register URLs (admin only)
router.post('/c2b/register', mpesaController.registerC2BUrls);

// C2B confirmation (no auth required)
router.post('/c2b/confirmation', mpesaController.handleC2BConfirmation);

// C2B validation (no auth required)
router.post('/c2b/validation', mpesaController.handleC2BValidation);

// Account balance inquiry (admin only)
router.get('/balance', mpesaController.checkAccountBalance);

// Transaction reversal (admin only)
router.post('/reversal', [
  body('transactionID').trim().isLength({ min: 1 }),
  body('amount').isNumeric().isFloat({ min: 1 }),
  body('receiverParty').trim().isLength({ min: 1 }),
  validateRequest
], mpesaController.reverseTransaction);

// Generate M-Pesa report
router.get('/reports/transactions', mpesaController.generateTransactionReport);

// Get M-Pesa statistics
router.get('/stats', mpesaController.getMpesaStatistics);

// Test M-Pesa connection
router.get('/test', mpesaController.testConnection);

module.exports = router;
