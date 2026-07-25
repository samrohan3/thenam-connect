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
    .get(canAccess('finance', 'read'), financeController.getTransaction);

module.exports = router;
