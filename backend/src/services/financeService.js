const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const Venture = require('../models/Venture');
const AppError = require('../utils/AppError');
const { logActivity } = require('./activityService');
const mongoose = require('mongoose');

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

module.exports = {
    createMoneyIn,
    createMoneyOut,
    createTransfer,
    listTransactions,
    getTransactionById,
    getFinanceSummary
};
