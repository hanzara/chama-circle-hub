
const express = require('express');
const { body, query } = require('express-validator');
const reportController = require('../controllers/reportController');
const { validateRequest, validateObjectId } = require('../middleware/validation');
const { adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Chama reports
router.get('/chama/:chamaId/summary', validateObjectId('chamaId'), reportController.generateChamaSummaryReport);
router.get('/chama/:chamaId/contributions', validateObjectId('chamaId'), reportController.generateChamaContributionReport);
router.get('/chama/:chamaId/loans', validateObjectId('chamaId'), reportController.generateChamaLoanReport);
router.get('/chama/:chamaId/members', validateObjectId('chamaId'), reportController.generateChamaMemberReport);

// User reports
router.get('/user/savings', reportController.generateUserSavingsReport);
router.get('/user/investments', reportController.generateUserInvestmentReport);
router.get('/user/loans', reportController.generateUserLoanReport);
router.get('/user/transactions', reportController.generateUserTransactionReport);

// Financial reports
router.get('/financial/income-statement', [
  query('startDate').isISO8601(),
  query('endDate').isISO8601(),
  validateRequest
], reportController.generateIncomeStatement);

router.get('/financial/balance-sheet', reportController.generateBalanceSheet);

// Platform reports (admin only)
router.get('/platform/overview', adminMiddleware, reportController.generatePlatformOverviewReport);
router.get('/platform/user-activity', adminMiddleware, reportController.generateUserActivityReport);
router.get('/platform/transaction-summary', adminMiddleware, reportController.generateTransactionSummaryReport);

// Custom reports
router.post('/custom', [
  body('reportType').isIn(['savings', 'investments', 'loans', 'transactions', 'members']),
  body('dateRange.start').isISO8601(),
  body('dateRange.end').isISO8601(),
  validateRequest
], reportController.generateCustomReport);

// Export reports
router.get('/export/:reportId', reportController.exportReport);

// Schedule reports
router.post('/schedule', [
  body('reportType').isIn(['monthly_summary', 'quarterly_review', 'annual_report']),
  body('frequency').isIn(['monthly', 'quarterly', 'annually']),
  body('recipients').isArray(),
  validateRequest
], reportController.scheduleReport);

module.exports = router;
