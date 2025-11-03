
const express = require('express');
const { body } = require('express-validator');
const investmentController = require('../controllers/investmentController');
const { validateRequest, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// Get user investments
router.get('/', investmentController.getUserInvestments);

// Get investment details
router.get('/:id', validateObjectId('id'), investmentController.getInvestmentDetails);

// Create new investment
router.post('/', [
  body('investmentType').isIn(['project', 'loan', 'chama', 'bond', 'equity']),
  body('amountInvested').isNumeric().isFloat({ min: 100 }),
  body('expectedReturn').isNumeric().isFloat({ min: 0 }),
  validateRequest
], investmentController.createInvestment);

// Update investment
router.put('/:id', validateObjectId('id'), investmentController.updateInvestment);

// Withdraw investment
router.patch('/:id/withdraw', validateObjectId('id'), investmentController.withdrawInvestment);

// Get investment projects
router.get('/projects/all', investmentController.getInvestmentProjects);

// Get specific investment project
router.get('/projects/:id', validateObjectId('id'), investmentController.getInvestmentProject);

// Create investment project
router.post('/projects', [
  body('title').trim().isLength({ min: 5 }),
  body('description').trim().isLength({ min: 20 }),
  body('targetAmount').isNumeric().isFloat({ min: 10000 }),
  body('projectedROI').isFloat({ min: 0, max: 100 }),
  body('duration').isInt({ min: 1, max: 120 }),
  body('category').isIn(['agriculture', 'real_estate', 'technology', 'manufacturing', 'services']),
  validateRequest
], investmentController.createInvestmentProject);

// Invest in project
router.post('/projects/:id/invest', [
  validateObjectId('id'),
  body('amount').isNumeric().isFloat({ min: 100 }),
  validateRequest
], investmentController.investInProject);

// Get investment returns
router.get('/:id/returns', validateObjectId('id'), investmentController.getInvestmentReturns);

// Record investment return (admin only)
router.post('/:id/returns', [
  validateObjectId('id'),
  body('amount').isNumeric().isFloat({ min: 0 }),
  body('type').isIn(['interest', 'principal', 'dividend', 'capital_gain']),
  validateRequest
], investmentController.recordInvestmentReturn);

// Get investment analytics
router.get('/analytics/summary', investmentController.getInvestmentAnalytics);

// Get investment performance
router.get('/analytics/performance', investmentController.getInvestmentPerformance);

module.exports = router;
