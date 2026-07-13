const asyncHandler = require('../utils/asyncHandler');
const { success, created } = require('../utils/apiResponse');
const financeService = require('../services/financeService');

const addRevenue = asyncHandler(async (req, res) => {
    const tx = await financeService.createMoneyIn(req.body, req.user.id);
    return created(res, tx, 'Revenue recorded successfully');
});

const recordExpense = asyncHandler(async (req, res) => {
    const tx = await financeService.createMoneyOut(req.body, req.user.id);
    return created(res, tx, 'Expense recorded successfully');
});

const transferFunds = asyncHandler(async (req, res) => {
    const txs = await financeService.createTransfer(req.body, req.user.id);
    return created(res, txs, 'Transfer completed successfully');
});

const getTransactions = asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.venture) filter.venture = req.query.venture;
    if (req.query.type) filter.type = req.query.type;

    const txs = await financeService.listTransactions(filter);
    return success(res, txs, 'Transactions retrieved successfully');
});

const getTransaction = asyncHandler(async (req, res) => {
    const tx = await financeService.getTransactionById(req.params.id);
    return success(res, tx, 'Transaction retrieved successfully');
});

const getSummary = asyncHandler(async (req, res) => {
    const summary = await financeService.getFinanceSummary();
    return success(res, summary, 'Finance summary retrieved successfully');
});

module.exports = {
    addRevenue,
    recordExpense,
    transferFunds,
    getTransactions,
    getTransaction,
    getSummary
};
