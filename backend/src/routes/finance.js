const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const { protect, canAccess } = require('../middleware/auth');

router.use(protect);

router.get('/transactions', canAccess('finance', 'read'), financeController.getTransactions);
router.post('/money-in', canAccess('finance', 'create'), financeController.addRevenue);
router.post('/money-out', canAccess('finance', 'create'), financeController.recordExpense);
router.post('/transfer', canAccess('finance', 'create'), financeController.transferFunds);
router.get('/summary', canAccess('finance', 'read'), financeController.getSummary);

router.route('/transactions/:id')
    .get(canAccess('finance', 'read'), financeController.getTransaction)
    .patch(canAccess('finance', 'update'), financeController.updateTransaction);

// Revert and Revert Request routes
router.post('/transactions/:id/revert', canAccess('finance', 'delete'), financeController.revertTransaction);
router.post('/transactions/:id/revert-request', canAccess('finance', 'create'), financeController.createRevertRequest);
router.get('/revert-requests', canAccess('finance', 'read'), financeController.getRevertRequests);
router.post('/revert-requests/:id/approve', canAccess('finance', 'delete'), financeController.approveRevertRequest);
router.post('/revert-requests/:id/deny', canAccess('finance', 'delete'), financeController.denyRevertRequest);

module.exports = router;
