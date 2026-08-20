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

const updateTransaction = asyncHandler(async (req, res) => {
    const tx = await financeService.updateTransactionById(req.params.id, req.body, req.user.id);
    return success(res, tx, 'Transaction updated successfully');
});

const revertTransaction = asyncHandler(async (req, res) => {
    const isAdmin = req.userRole === 'admin' || req.userRole === 'founder';
    if (!isAdmin) {
        return res.status(403).json({ success: false, message: 'Forbidden: Only administrators can directly revert a transaction' });
    }
    const { reason } = req.body;
    if (!reason) {
        return res.status(400).json({ success: false, message: 'Revert reason is required' });
    }
    const tx = await financeService.directRevertTransaction(req.params.id, reason, req.user.id);
    return success(res, tx, 'Transaction reverted successfully');
});

const createRevertRequest = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    if (!reason) {
        return res.status(400).json({ success: false, message: 'Reason is required for submitting a revert request' });
    }
    const request = await financeService.createRevertRequest(req.params.id, reason, req.user.id, req.user.name);
    return created(res, request, 'Revert request sent to Admin successfully');
});

const getRevertRequests = asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const requests = await financeService.listRevertRequests(filter);
    return success(res, requests, 'Revert requests retrieved successfully');
});

const approveRevertRequest = asyncHandler(async (req, res) => {
    const isAdmin = req.userRole === 'admin' || req.userRole === 'founder';
    if (!isAdmin) {
        return res.status(403).json({ success: false, message: 'Forbidden: Only administrators can approve revert requests' });
    }
    const { request, tx } = await financeService.approveRevertRequest(req.params.id, req.user.id, req.user.name);
    return success(res, { request, tx }, 'Revert request approved successfully');
});

const denyRevertRequest = asyncHandler(async (req, res) => {
    const isAdmin = req.userRole === 'admin' || req.userRole === 'founder';
    if (!isAdmin) {
        return res.status(403).json({ success: false, message: 'Forbidden: Only administrators can deny revert requests' });
    }
    const { denialReason } = req.body;
    const request = await financeService.denyRevertRequest(req.params.id, req.user.id, req.user.name, denialReason);
    return success(res, request, 'Revert request denied successfully');
});

module.exports = {
    addRevenue,
    recordExpense,
    transferFunds,
    getTransactions,
    getTransaction,
    getSummary,
    updateTransaction,
    revertTransaction,
    createRevertRequest,
    getRevertRequests,
    approveRevertRequest,
    denyRevertRequest
};
