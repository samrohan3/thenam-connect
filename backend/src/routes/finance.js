const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/transactions', financeController.getTransactions);
router.post('/money-in', financeController.addRevenue);
router.post('/money-out', financeController.recordExpense);
router.post('/transfer', financeController.transferFunds);
router.get('/summary', financeController.getSummary);

router.route('/transactions/:id')
    .get(financeController.getTransaction);

module.exports = router;
