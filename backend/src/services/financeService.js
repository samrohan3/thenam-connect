const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const Venture = require('../models/Venture');
const AppError = require('../utils/AppError');
const { logActivity } = require('./activityService');
const mongoose = require('mongoose');
const TransactionRevertRequest = require('../models/TransactionRevertRequest');
const User = require('../models/User');
const { createNotification } = require('./notificationService');

// Helper to generate TX reference
const generateRef = async () => {
    const count = await Transaction.countDocuments();
    return `TX-${10000 + count + 1}`;
};

const createMoneyIn = async (data, userId) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const wallet = await Wallet.findOne({ venture: data.venture }).session(session);
        if (!wallet) throw new AppError('Wallet not found for this venture', 404);

        const ref = await generateRef();
        
        const tx = await Transaction.create([{
            ...data,
            type: 'Money In',
            referenceNumber: ref,
            wallet: wallet._id,
            createdBy: userId
        }], { session });

        wallet.balance += data.amount;
        wallet.totalRevenue += data.amount;
        await wallet.save({ session });

        await session.commitTransaction();
        
        await logActivity({
            userId,
            action: 'Added Revenue',
            entity: 'Transaction',
            entityId: tx[0]._id,
            entityName: tx[0].referenceNumber
        });

        return tx[0];
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

const createMoneyOut = async (data, userId) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const wallet = await Wallet.findOne({ venture: data.venture }).session(session);
        if (!wallet) throw new AppError('Wallet not found for this venture', 404);

        if (wallet.balance < data.amount) {
             throw new AppError('Insufficient wallet balance', 400);
        }

        const ref = await generateRef();

        const tx = await Transaction.create([{
            ...data,
            type: 'Money Out',
            referenceNumber: ref,
            wallet: wallet._id,
            createdBy: userId
        }], { session });

        wallet.balance -= data.amount;
        wallet.totalExpense += data.amount;
        await wallet.save({ session });

        await session.commitTransaction();

        await logActivity({
            userId,
            action: 'Recorded Expense',
            entity: 'Transaction',
            entityId: tx[0]._id,
            entityName: tx[0].referenceNumber
        });

        return tx[0];
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

const createTransfer = async (data, userId) => {
     const session = await mongoose.startSession();
     session.startTransaction();
     try {
         const fromWallet = await Wallet.findOne({ venture: data.fromVenture }).session(session);
         const toWallet = await Wallet.findOne({ venture: data.toVenture }).session(session);

         if (!fromWallet) throw new AppError('Source wallet not found', 404);
         if (!toWallet) throw new AppError('Destination wallet not found', 404);
         if (fromWallet.balance < data.amount) throw new AppError('Insufficient balance in source wallet', 400);

         const refBase = await generateRef();
         const outRef = `${refBase}-OUT`;
         const inRef = `${refBase}-IN`;

         const outTx = new Transaction({
             ...data,
             venture: data.fromVenture,
             type: 'Transfer',
             transferDirection: 'out',
             referenceNumber: outRef,
             wallet: fromWallet._id,
             createdBy: userId,
             amount: data.amount,
             source: 'Internal Wallet',
             destination: 'Internal Wallet'
         });

         const inTx = new Transaction({
            ...data,
            venture: data.toVenture,
            type: 'Transfer',
            transferDirection: 'in',
            referenceNumber: inRef,
            wallet: toWallet._id,
            createdBy: userId,
            amount: data.amount,
            source: 'Internal Wallet',
            destination: 'Internal Wallet'
         });

         outTx.pairedTransaction = inTx._id;
         inTx.pairedTransaction = outTx._id;

         await outTx.save({ session });
         await inTx.save({ session });

         fromWallet.balance -= data.amount;
         toWallet.balance += data.amount;

         await fromWallet.save({ session });
         await toWallet.save({ session });

         await session.commitTransaction();

         await logActivity({
            userId,
            action: 'Transferred Funds',
            entity: 'Transaction',
            entityId: outTx._id,
            entityName: refBase
        });

         return { outTx, inTx };

     } catch (error) {
         await session.abortTransaction();
         throw error;
     } finally {
         session.endSession();
     }
};

const listTransactions = async (filter = {}) => {
    return Transaction.find(filter)
        .populate('venture', 'name key gradient')
        .populate('createdBy', 'name')
        .sort({ date: -1, createdAt: -1 })
        .lean();
};

const getTransactionById = async (id) => {
    const tx = await Transaction.findById(id).populate('venture', 'name').lean();
    if (!tx) throw new AppError('Transaction not found', 404);
    return tx;
};

// Simple aggregate for summary. In a real app, you might want more complex date filtering.
const getFinanceSummary = async () => {
    const wallets = await Wallet.find().lean();
    let totalBalance = 0;
    wallets.forEach(w => totalBalance += w.balance);
    
    // Simplistic aggregations for today/month. 
    // Usually you'd do a full MongoDB aggregate here based on dates.
    // For brevity, relying on the dashboard service to do heavy lifting or 
    // doing simple queries here.
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const monthTxs = await Transaction.aggregate([
        { $match: { date: { $gte: startOfMonth }, status: 'Completed' } },
        { $group: {
            _id: '$type',
            total: { $sum: '$amount' },
            count: { $sum: 1 }
        }}
    ]);

    const todayTxs = await Transaction.aggregate([
        { $match: { date: { $gte: startOfDay }, status: 'Completed' } },
        { $group: {
            _id: '$type',
            total: { $sum: '$amount' }
        }}
    ]);

    let inMonth = 0, outMonth = 0, txThisMonth = 0;
    monthTxs.forEach(t => {
        if (t._id === 'Money In') { inMonth = t.total; txThisMonth += t.count; }
        if (t._id === 'Money Out') { outMonth = t.total; txThisMonth += t.count; }
        if (t._id === 'Transfer') { txThisMonth += (t.count/2); } // pairs
    });

    let inToday = 0, outToday = 0;
    todayTxs.forEach(t => {
        if (t._id === 'Money In') inToday = t.total;
        if (t._id === 'Money Out') outToday = t.total;
    });

    return {
        walletBalance: totalBalance,
        inToday,
        outToday,
        inMonth,
        outMonth,
        monthProfit: inMonth - outMonth,
        txThisMonth: Math.floor(txThisMonth)
    };
};

const updateTransactionById = async (id, data, userId) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const tx = await Transaction.findById(id).session(session);
        if (!tx) throw new AppError('Transaction not found', 404);

        const oldAmount = tx.amount;
        const newAmount = data.amount !== undefined ? Number(data.amount) : oldAmount;
        const amountDiff = newAmount - oldAmount;

        // If amount changed and transaction is tied to a wallet, adjust balance
        if (amountDiff !== 0 && tx.wallet) {
            const wallet = await Wallet.findById(tx.wallet).session(session);
            if (wallet) {
                if (tx.type === 'Money In') {
                    wallet.balance += amountDiff;
                    wallet.totalRevenue += amountDiff;
                } else if (tx.type === 'Money Out') {
                    // Check if new amount exceeds current balance
                    if (wallet.balance < amountDiff) {
                        throw new AppError('Insufficient wallet balance to increase expense', 400);
                    }
                    wallet.balance -= amountDiff;
                    wallet.totalExpense += amountDiff;
                } else if (tx.type === 'Transfer') {
                    if (tx.transferDirection === 'out') {
                        if (wallet.balance < amountDiff) {
                            throw new AppError('Insufficient wallet balance to increase transfer', 400);
                        }
                        wallet.balance -= amountDiff;
                    } else if (tx.transferDirection === 'in') {
                        wallet.balance += amountDiff;
                    }
                }
                await wallet.save({ session });
            }
        }

        // Handle paired transaction if it's a Transfer
        if (tx.type === 'Transfer' && tx.pairedTransaction) {
            const pairedTx = await Transaction.findById(tx.pairedTransaction).session(session);
            if (pairedTx) {
                const pairedWallet = await Wallet.findById(pairedTx.wallet).session(session);
                if (pairedWallet && amountDiff !== 0) {
                    if (pairedTx.transferDirection === 'out') {
                        if (pairedWallet.balance < amountDiff) {
                            throw new AppError('Insufficient balance in paired wallet', 400);
                        }
                        pairedWallet.balance -= amountDiff;
                    } else if (pairedTx.transferDirection === 'in') {
                        pairedWallet.balance += amountDiff;
                    }
                    await pairedWallet.save({ session });
                }
                
                // Update amount and description on the paired transaction
                pairedTx.amount = newAmount;
                if (data.reason !== undefined) pairedTx.reason = data.reason;
                if (data.description !== undefined) pairedTx.description = data.description;
                if (data.status !== undefined) pairedTx.status = data.status;
                if (data.date !== undefined) pairedTx.date = data.date;
                await pairedTx.save({ session });
            }
        }

        // Apply fields to transaction
        const updatableFields = [
            'amount', 'reason', 'description', 'source', 'destination', 
            'paymentMethod', 'category', 'status', 'remarks', 'clientName', 
            'proof', 'proofImage', 'attachment', 'date'
        ];
        
        updatableFields.forEach(field => {
            if (data[field] !== undefined) {
                tx[field] = field === 'amount' ? Number(data[field]) : data[field];
            }
        });

        await tx.save({ session });

        await session.commitTransaction();

        await logActivity({
            userId,
            action: 'Updated Transaction',
            entity: 'Transaction',
            entityId: tx._id,
            entityName: tx.referenceNumber
        });

        return tx;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

const revertTransactionLogic = async (id, reason, userId, session) => {
    const tx = await Transaction.findById(id).session(session);
    if (!tx) throw new AppError('Transaction not found', 404);

    if (tx.status === 'Cancelled') {
        throw new AppError('Transaction is already reverted/cancelled', 400);
    }

    const oldAmount = tx.amount;

    // Adjust wallet balance
    if (tx.wallet) {
        const wallet = await Wallet.findById(tx.wallet).session(session);
        if (wallet) {
            if (tx.type === 'Money In') {
                wallet.balance -= oldAmount;
                wallet.totalRevenue -= oldAmount;
            } else if (tx.type === 'Money Out') {
                wallet.balance += oldAmount;
                wallet.totalExpense -= oldAmount;
            } else if (tx.type === 'Transfer') {
                if (tx.transferDirection === 'out') {
                    wallet.balance += oldAmount;
                } else if (tx.transferDirection === 'in') {
                    if (wallet.balance < oldAmount) {
                        throw new AppError('Cannot revert: destination wallet has insufficient balance', 400);
                    }
                    wallet.balance -= oldAmount;
                }
            }
            await wallet.save({ session });
        }
    }

    // Adjust paired transaction if it's a Transfer
    if (tx.type === 'Transfer' && tx.pairedTransaction) {
        const pairedTx = await Transaction.findById(tx.pairedTransaction).session(session);
        if (pairedTx && pairedTx.status !== 'Cancelled') {
            const pairedWallet = await Wallet.findById(pairedTx.wallet).session(session);
            if (pairedWallet) {
                if (pairedTx.transferDirection === 'out') {
                    pairedWallet.balance += oldAmount;
                } else if (pairedTx.transferDirection === 'in') {
                    if (pairedWallet.balance < oldAmount) {
                        throw new AppError('Cannot revert: destination wallet of paired transfer has insufficient balance', 400);
                    }
                    pairedWallet.balance -= oldAmount;
                }
                await pairedWallet.save({ session });
            }
            pairedTx.status = 'Cancelled';
            pairedTx.remarks = `Reverted: ${reason}`;
            await pairedTx.save({ session });
        }
    }

    tx.status = 'Cancelled';
    tx.remarks = `Reverted: ${reason}`;
    await tx.save({ session });

    await logActivity({
        userId,
        action: 'Reverted Transaction',
        entity: 'Transaction',
        entityId: tx._id,
        entityName: tx.referenceNumber
    });

    return tx;
};

const directRevertTransaction = async (transactionId, reason, userId) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const tx = await revertTransactionLogic(transactionId, reason, userId, session);
        await session.commitTransaction();
        return tx;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

const createRevertRequest = async (transactionId, reason, userId, userName) => {
    const tx = await Transaction.findById(transactionId);
    if (!tx) throw new AppError('Transaction not found', 404);

    if (tx.status === 'Cancelled') {
        throw new AppError('Transaction is already reverted/cancelled', 400);
    }

    // Check if there's already a pending request for this transaction
    const existing = await TransactionRevertRequest.findOne({ 
        transaction: transactionId, 
        status: 'pending' 
    });
    if (existing) {
        throw new AppError('A pending revert request already exists for this transaction', 400);
    }

    const request = await TransactionRevertRequest.create({
        transaction: transactionId,
        transactionReference: tx.referenceNumber,
        requestedBy: userId,
        requestedByName: userName,
        reason
    });

    // Send notifications to all Admin/Founder users
    const admins = await User.find({ role: { $in: ['admin', 'founder'] } });
    const populatedTx = await Transaction.findById(transactionId).populate('venture');

    for (const admin of admins) {
        await createNotification({
            userId: admin._id,
            title: 'Transaction Revert Request',
            message: `Transaction ${tx.referenceNumber} (₹${tx.amount}) submitted for revert by ${userName}.`,
            type: 'revert_request',
            entityType: 'Transaction',
            entityId: tx._id,
            icon: 'bell',
            metadata: {
                requestId: request._id,
                transactionId: tx._id,
                transactionReference: tx.referenceNumber,
                requestedByName: userName,
                amount: tx.amount,
                txType: tx.type,
                ventureName: populatedTx?.venture?.name || 'Venture',
                reason
            }
        });
        
        // Emit Socket.IO event to active admins in real-time
        try {
            const { emitToUser } = require('./socketService');
            emitToUser(admin._id.toString(), 'revert_request', {
                id: `revert_request_${request._id}_${Date.now()}`,
                type: 'revert_request',
                title: 'Transaction Revert Request',
                body: `Transaction ${tx.referenceNumber} submitted for revert by ${userName}.`,
                transactionReference: tx.referenceNumber,
                requestedByName: userName,
                amount: tx.amount,
                txType: tx.type,
                ventureName: populatedTx?.venture?.name || 'Venture',
                reason,
                revertRequestId: request._id,
                transactionId: tx._id
            });
        } catch (e) {
            console.error('[socket] Failed to emit revert_request', e);
        }
    }

    return request;
};

const listRevertRequests = async (filter = {}) => {
    return TransactionRevertRequest.find(filter)
        .populate('transaction')
        .populate('requestedBy', 'name email')
        .populate('processedBy', 'name email')
        .sort({ createdAt: -1 })
        .lean();
};

const approveRevertRequest = async (requestId, userId, userName) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const request = await TransactionRevertRequest.findById(requestId).session(session);
        if (!request) throw new AppError('Revert request not found', 404);
        if (request.status !== 'pending') {
            throw new AppError(`Request has already been processed (current status: ${request.status})`, 400);
        }

        const tx = await revertTransactionLogic(request.transaction, request.reason, userId, session);

        request.status = 'approved';
        request.processedBy = userId;
        request.processedByName = userName;
        request.processedAt = new Date();
        await request.save({ session });

        // Notify requesting user
        await createNotification({
            userId: request.requestedBy,
            title: 'Revert Request Approved ✓',
            message: `Your revert request for transaction ${request.transactionReference} was approved by ${userName}.`,
            type: 'revert_processed',
            entityType: 'Transaction',
            entityId: request.transaction,
            icon: 'bell',
            metadata: {
                requestId: request._id,
                status: 'approved',
                transactionReference: request.transactionReference
            }
        });

        try {
            const { emitToUser } = require('./socketService');
            emitToUser(request.requestedBy.toString(), 'revert_processed', {
                id: `revert_processed_${request._id}_${Date.now()}`,
                status: 'approved',
                title: 'Revert Request Approved ✓',
                body: `Your revert request for transaction ${request.transactionReference} was approved by ${userName}.`
            });
        } catch (e) {
            console.error('[socket] Failed to emit approve', e);
        }

        await session.commitTransaction();
        return { request, tx };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

const denyRevertRequest = async (requestId, userId, userName, denialReason) => {
    const request = await TransactionRevertRequest.findById(requestId);
    if (!request) throw new AppError('Revert request not found', 404);
    if (request.status !== 'pending') {
        throw new AppError(`Request has already been processed (current status: ${request.status})`, 400);
    }

    request.status = 'denied';
    request.processedBy = userId;
    request.processedByName = userName;
    request.processedAt = new Date();
    request.denialReason = denialReason || 'No reason provided';
    await request.save();

    await createNotification({
        userId: request.requestedBy,
        title: 'Revert Request Denied ✗',
        message: `Your revert request for transaction ${request.transactionReference} was denied by ${userName}. Reason: ${request.denialReason}`,
        type: 'revert_processed',
        entityType: 'Transaction',
        entityId: request.transaction,
        icon: 'bell',
        metadata: {
            requestId: request._id,
            status: 'denied',
            transactionReference: request.transactionReference,
            denialReason: request.denialReason
        }
    });

    try {
        const { emitToUser } = require('./socketService');
        emitToUser(request.requestedBy.toString(), 'revert_processed', {
            id: `revert_processed_${request._id}_${Date.now()}`,
            status: 'denied',
            title: 'Revert Request Denied ✗',
            body: `Your revert request for transaction ${request.transactionReference} was denied by ${userName}.`,
            denialReason: request.denialReason
        });
    } catch (e) {
        console.error('[socket] Failed to emit deny', e);
    }

    return request;
};

module.exports = {
    createMoneyIn,
    createMoneyOut,
    createTransfer,
    listTransactions,
    getTransactionById,
    getFinanceSummary,
    updateTransactionById,
    directRevertTransaction,
    createRevertRequest,
    listRevertRequests,
    approveRevertRequest,
    denyRevertRequest
};
