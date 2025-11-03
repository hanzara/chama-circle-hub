
const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');
const { validateRequest, validateObjectId, validatePagination } = require('../middleware/validation');
const { adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Apply admin middleware to all routes
router.use(adminMiddleware);

// User management
router.get('/users', validatePagination, adminController.getAllUsers);
router.get('/users/:id', validateObjectId('id'), adminController.getUserDetails);
router.patch('/users/:id/activate', validateObjectId('id'), adminController.activateUser);
router.patch('/users/:id/deactivate', validateObjectId('id'), adminController.deactivateUser);
router.patch('/users/:id/role', [
  validateObjectId('id'),
  body('role').isIn(['user', 'admin', 'bank']),
  validateRequest
], adminController.updateUserRole);

// Chama management
router.get('/chamas', validatePagination, adminController.getAllChamas);
router.get('/chamas/:id', validateObjectId('id'), adminController.getChamaDetails);
router.patch('/chamas/:id/status', [
  validateObjectId('id'),
  body('status').isIn(['active', 'inactive', 'suspended']),
  validateRequest
], adminController.updateChamaStatus);

// Loan management
router.get('/loans', validatePagination, adminController.getAllLoans);
router.get('/loans/pending', validatePagination, adminController.getPendingLoans);
router.patch('/loans/:id/approve', validateObjectId('id'), adminController.approveLoan);
router.patch('/loans/:id/reject', [
  validateObjectId('id'),
  body('reason').trim().isLength({ min: 10 }),
  validateRequest
], adminController.rejectLoan);

// Investment management
router.get('/investments', validatePagination, adminController.getAllInvestments);
router.get('/investments/projects', validatePagination, adminController.getInvestmentProjects);
router.patch('/investments/projects/:id/verify', validateObjectId('id'), adminController.verifyInvestmentProject);

// Transaction management
router.get('/transactions', validatePagination, adminController.getAllTransactions);
router.get('/transactions/mpesa', validatePagination, adminController.getMpesaTransactions);
router.get('/transactions/failed', validatePagination, adminController.getFailedTransactions);

// Notification management
router.get('/notifications', validatePagination, adminController.getAllNotifications);
router.post('/notifications/broadcast', [
  body('title').trim().isLength({ min: 1 }),
  body('message').trim().isLength({ min: 1 }),
  body('type').isIn(['info', 'success', 'warning', 'error']),
  validateRequest
], adminController.broadcastNotification);

// System settings
router.get('/settings', adminController.getSystemSettings);
router.put('/settings', adminController.updateSystemSettings);

// Reports
router.get('/reports/users', adminController.generateUserReport);
router.get('/reports/chamas', adminController.generateChamaReport);
router.get('/reports/transactions', adminController.generateTransactionReport);
router.get('/reports/revenue', adminController.generateRevenueReport);

// Audit logs
router.get('/audit-logs', validatePagination, adminController.getAuditLogs);

// Dashboard data
router.get('/dashboard', adminController.getAdminDashboard);

// Platform statistics
router.get('/stats/overview', adminController.getPlatformStats);
router.get('/stats/growth', adminController.getGrowthStats);
router.get('/stats/financial', adminController.getFinancialStats);

// Backup and maintenance
router.post('/backup', adminController.createBackup);
router.get('/maintenance', adminController.getMaintenanceStatus);
router.post('/maintenance/toggle', adminController.toggleMaintenance);

module.exports = router;
