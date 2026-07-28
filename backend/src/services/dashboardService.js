const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Employee = require('../models/Employee');
const Team = require('../models/Team');
const Venture = require('../models/Venture');
const Project = require('../models/Project');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

const getDashboardStats = async () => {
  const [
    wallets,
    activeEmployees,
    totalEmployees,
    totalTeams,
    activeVentures,
    activeProjects,
    completedProjects,
    pendingTasks,
    completedTasks,
    recentJoinings,
    teamDistribution,
    allVentures
  ] = await Promise.all([
    Wallet.find().lean(),
    Employee.countDocuments({ status: 'Active' }),
    Employee.countDocuments(),
    Team.countDocuments({ status: 'Active' }),
    Venture.countDocuments({ status: 'active' }),
    Project.countDocuments({ status: { $in: ['In Progress', 'Planning', 'Testing', 'On Hold'] } }),
    Project.countDocuments({ status: 'Completed' }),
    Task.countDocuments({ status: { $ne: 'Completed' } }),
    Task.countDocuments({ status: 'Completed' }),
    Employee.find()
      .populate('venture', 'name')
      .populate('team', 'teamName')
      .sort({ joiningDate: -1, createdAt: -1 })
      .limit(5)
      .lean(),
    Team.aggregate([
      { $match: { status: 'Active' } },
      {
        $lookup: {
          from: 'ventures',
          localField: 'venture',
          foreignField: '_id',
          as: 'ventureInfo'
        }
      },
      {
        $project: {
          teamName: 1,
          memberCount: { $size: { $ifNull: ['$members', []] } },
          ventureName: { $arrayElemAt: ['$ventureInfo.name', 0] }
        }
      }
    ]),
    Venture.find().lean()
  ]);

  const ventureCreditMap = {};
  wallets.forEach(w => {
    if (w.venture) {
      ventureCreditMap[String(w.venture)] = w.totalRevenue || 0;
    }
  });

  const txAgg = await Transaction.aggregate([
    { $match: { type: 'Money In' } },
    { $group: { _id: '$venture', totalAmount: { $sum: '$amount' } } }
  ]);

  txAgg.forEach(t => {
    if (t._id) {
      const vId = String(t._id);
      ventureCreditMap[vId] = Math.max(ventureCreditMap[vId] || 0, t.totalAmount || 0);
    }
  });

  const ventureCredits = allVentures.map(v => ({
    ventureId: v._id,
    ventureName: v.name,
    creditAmount: ventureCreditMap[String(v._id)] || 0
  }));

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
    totalEmployees,
    totalTeams,
    activeVentures,
    activeProjects,
    completedProjects,
    pendingTasks,
    completedTasks,
    recentJoinings,
    teamDistribution,
    ventureCredits
  };
};

const getDashboardCharts = async () => {
  const now = new Date();
  const currentYear = now.getFullYear();

  const monthlyData = await Transaction.aggregate([
    {
      $match: {
        status: 'Completed',
        date: { $gte: new Date(currentYear, 0, 1) },
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
