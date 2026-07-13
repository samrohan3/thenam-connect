const Reward = require('../models/Reward');
const Employee = require('../models/Employee');
const AppError = require('../utils/AppError');
const { logActivity } = require('./activityService');
const mongoose = require('mongoose');

const grantReward = async (data, userId) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const employee = await Employee.findById(data.employee).session(session);
        if (!employee) throw new AppError('Employee not found', 404);

        const reward = await Reward.create([{
            ...data,
            createdBy: userId
        }], { session });

        employee.rewardPoints += data.points;
        await employee.save({ session });

        await session.commitTransaction();

        await logActivity({
            userId,
            action: 'Granted Reward',
            entity: 'Reward',
            entityId: reward[0]._id,
            entityName: reward[0].title
        });

        return reward[0];
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

const listRewards = async (filter = {}) => {
    return Reward.find(filter)
        .populate({
            path: 'employee',
            select: 'name avatar department',
            populate: { path: 'venture', select: 'name gradient' }
        })
        .populate('createdBy', 'name')
        .sort({ date: -1, createdAt: -1 })
        .lean();
};

const getLeaderboard = async (limit = 10) => {
    return Employee.find({ rewardPoints: { $gt: 0 } })
        .populate('venture', 'name gradient key')
        .sort({ rewardPoints: -1 })
        .limit(limit)
        .select('name avatar department role rewardPoints venture')
        .lean();
};

module.exports = {
    grantReward,
    listRewards,
    getLeaderboard
};
