const socketEmitter = require('../../utils/socketEmitter');

const mapModelToKeys = (modelName) => {
  const map = {
    'Message': ['chat-messages'],
    'Conversation': ['direct-messages', 'direct-users', 'direct-conversation'],
    'Transaction': ['transactions', 'finance-summary', 'dashboard-stats'],
    'Task': ['tasks', 'dashboard-stats'],
    'Project': ['projects', 'dashboard-stats'],
    'Employee': ['employees', 'teams', 'dashboard-stats'],
    'Team': ['teams', 'employees', 'dashboard-stats'],
    'Venture': ['ventures', 'dashboard-stats'],
    'Notification': ['notifications'],
    'Announcement': ['announcements'],
    'WorkspaceLink': ['workspace-links', 'recent-workspace-links'],
    'Wallet': ['finance-summary', 'dashboard-stats'],
    'User': ['users', 'direct-users'],
  };
  return map[modelName] || [];
}

module.exports = function socketPlugin(schema, options) {
    const notifyDoc = function(doc) {
        if (!doc) return;
        const keys = mapModelToKeys(doc.constructor.modelName);
        if (keys.length > 0) {
            socketEmitter.emit('invalidate', keys);
        }
    };

    const notifyQuery = function() {
        if (!this.model) return;
        const keys = mapModelToKeys(this.model.modelName);
        if (keys.length > 0) {
            socketEmitter.emit('invalidate', keys);
        }
    };

    // Document hooks
    schema.post('save', notifyDoc);
    schema.post('remove', notifyDoc);

    // Query hooks
    schema.post('findOneAndUpdate', notifyQuery);
    schema.post('findOneAndDelete', notifyQuery);
    schema.post('findOneAndRemove', notifyQuery);
    schema.post('deleteOne', notifyQuery);
    schema.post('deleteMany', notifyQuery);
    schema.post('updateOne', notifyQuery);
    schema.post('updateMany', notifyQuery);
};
