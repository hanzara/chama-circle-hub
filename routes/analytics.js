
const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { validatePagination } = require('../middleware/validation');
const { adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// User analytics
router.get('/user/dashboard', analyticsController.getUserDashboard);
router.get('/user/savings', analyticsController.getUserSavingsAnalytics);
router.get('/user/investments', analyticsController.getUserInvestmentAnalytics);
router.get('/user/loans', analyticsController.getUserLoanAnalytics);

// Chama analytics
router.get('/chama/:chamaId/overview', analyticsController.getChamaOverview);
router.get('/chama/:chamaId/contributions', analyticsController.getChamaContributionAnalytics);
router.get('/chama/:chamaId/loans', analyticsController.getChamaLoanAnalytics);
router.get('/chama/:chamaId/members', analyticsController.getChamaMemberAnalytics);
router.get('/chama/:chamaId/performance', analyticsController.getChamaPerformance);

// Platform analytics (admin only)
router.get('/platform/overview', adminMiddleware, analyticsController.getPlatformOverview);
router.get('/platform/users', adminMiddleware, analyticsController.getUserAnalytics);
router.get('/platform/transactions', adminMiddleware, analyticsController.getTransactionAnalytics);
router.get('/platform/growth', adminMiddleware, analyticsController.getGrowthAnalytics);
router.get('/platform/revenue', adminMiddleware, analyticsController.getRevenueAnalytics);

// Financial analytics
router.get('/financial/summary', analyticsController.getFinancialSummary);
router.get('/financial/trends', analyticsController.getFinancialTrends);
router.get('/financial/projections', analyticsController.getFinancialProjections);

// Risk analytics (admin only)
router.get('/risk/assessment', adminMiddleware, analyticsController.getRiskAssessment);
router.get('/risk/loans', adminMiddleware, analyticsController.getLoanRiskAnalytics);
router.get('/risk/portfolio', adminMiddleware, analyticsController.getPortfolioRisk);

// Market analytics
router.get('/market/trends', analyticsController.getMarketTrends);
router.get('/market/opportunities', analyticsController.getMarketOpportunities);

// Performance metrics
router.get('/performance/kpis', adminMiddleware, analyticsController.getKPIs);
router.get('/performance/benchmarks', analyticsController.getPerformanceBenchmarks);

// Custom reports
router.get('/reports/custom', validatePagination, analyticsController.generateCustomReport);
router.get('/reports/export', analyticsController.exportAnalyticsData);

module.exports = router;
