const Venture = require('../models/Venture');
const Employee = require('../models/Employee');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Transaction = require('../models/Transaction');

const globalSearch = async (query) => {
    if (!query || query.length < 2) return [];

    const regex = new RegExp(query, 'i');

    const [ventures, employees, projects, tasks, transactions] = await Promise.all([
        Venture.find({ name: regex }).select('name key logo status').limit(5).lean(),
        Employee.find({ $or: [{ name: regex }, { email: regex }, { department: regex }] }).select('name email avatar department role').limit(5).lean(),
        Project.find({ name: regex }).select('name status priority').limit(5).lean(),
        Task.find({ title: regex }).select('title status priority deadline').limit(5).lean(),
        Transaction.find({ $or: [{ referenceNumber: regex }, { description: regex }] }).select('referenceNumber type amount status date').limit(5).lean(),
    ]);

    const results = [];

    ventures.forEach(v => results.push({ type: 'Venture', id: v._id, title: v.name, subtitle: v.status, url: `/ventures/${v._id}` }));
    employees.forEach(e => results.push({ type: 'Employee', id: e._id, title: e.name, subtitle: e.department, url: `/team/${e._id}` }));
    projects.forEach(p => results.push({ type: 'Project', id: p._id, title: p.name, subtitle: p.status, url: `/projects/${p._id}` }));
    tasks.forEach(t => results.push({ type: 'Task', id: t._id, title: t.title, subtitle: t.status, url: `/tasks/${t._id}` }));
    transactions.forEach(tx => results.push({ type: 'Transaction', id: tx._id, title: tx.referenceNumber, subtitle: `$${tx.amount} - ${tx.type}`, url: `/finance/${tx._id}` }));

    return results;
};

module.exports = {
    globalSearch
};
