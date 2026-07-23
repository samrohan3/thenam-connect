const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Employee = require('../models/Employee');
const Venture = require('../models/Venture');
const Project = require('../models/Project');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

const getDashboardStats = async () => {
    const [
        wallets,
        activeEmployees,
        activeVentures,
        activeProjects,
        completedProjects,
        pendingTasks,
        completedTasks
    ] = await Promise.all([
        Wallet.find().lean(),
        Employee.countDocuments({ status: 'Active' }),
        Venture.countDocuments({ status: 'active' }),
        Project.countDocuments({ status: { $in: ['Active', 'Planning', 'Testing'] } }),
        Project.countDocuments({ status: 'Completed' }),
        Task.countDocuments({ status: { $ne: 'Completed' } }),
        Task.countDocuments({ status: 'Completed' })
    ]);

    let totalRevenue = 0, totalExpense = 0, totalBalance = 0;
    wallets.forEach(w => {
        totalRevenue += w.totalRevenue;
        totalExpense += w.totalExpense;
        totalBalance += w.balance;
    });

    return {
        totalRevenue,
        totalExpense,
        totalBalance,
        profit: totalRevenue - totalExpense,
        activeEmployees,
        activeVentures,
        activeProjects,
        completedProjects,
        pendingTasks,
        completedTasks
    };
};

const getDashboardCharts = async () => {
    // A real implementation would aggregate by month for the last 12 months.
    // Simplifying here for the boilerplate.
    const now = new Date();
    const currentYear = now.getFullYear();

    const monthlyData = await Transaction.aggregate([
        {
            $match: {
                status: 'Completed',
                date: { $gte: new Date(currentYear, 0, 1) }, // This year
                type: { $in: ['Money In', 'Money Out'] }
            }
        },
        {
            $group: {
                _id: {
                    month: { $month: "$date" },
                    type: "$type"
                },
                total: { $sum: "$amount" }
            }
        }
    ]);

    // Format into something the frontend can easily consume
    const series = Array.from({ length: 12 }, (_, i) => ({
        month: new Date(0, i).toLocaleString('default', { month: 'short' }),
        revenue: 0,
        expense: 0,
        profit: 0
    }));

    monthlyData.forEach(item => {
        const monthIndex = item._id.month - 1;
        if (item._id.type === 'Money In') {
            series[monthIndex].revenue = item.total;
        } else {
            series[monthIndex].expense = item.total;
        }
        series[monthIndex].profit = series[monthIndex].revenue - series[monthIndex].expense;
    });

    return {
        revenueSeries: series
    };
};

const getRecentActivities = async () => {
    return ActivityLog.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('user', 'name avatar')
        .lean();
};

module.exports = {
    getDashboardStats,
    getDashboardCharts,
    getRecentActivities
};
