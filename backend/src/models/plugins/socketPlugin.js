const socketEmitter = require('../../utils/socketEmitter');

const mapModelToKeys = (modelName) => {
  const map = {
    'Message': ['chat-messages', 'direct-messages'],
    'Conversation': ['direct-users', 'direct-conversation'],
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
};

module.exports = function socketPlugin(schema, options) {
  // Emit after a new document is saved (new message creation)
  schema.post('save', function (doc) {
    if (!doc) return;
    const keys = mapModelToKeys(doc.constructor.modelName);
    if (keys.length > 0) {
      socketEmitter.emit('invalidate', keys);
    }
  });

  // Emit after a document is deleted
  schema.post('remove', function (doc) {
    if (!doc) return;
    const keys = mapModelToKeys(doc.constructor.modelName);
    if (keys.length > 0) {
      socketEmitter.emit('invalidate', keys);
    }
  });

  // Emit after findOneAndUpdate (targeted single doc updates like status changes)
  schema.post('findOneAndUpdate', function () {
    if (!this.model) return;
    const keys = mapModelToKeys(this.model.modelName);
    if (keys.length > 0) {
      socketEmitter.emit('invalidate', keys);
    }
  });

  // Emit after findOneAndDelete
  schema.post('findOneAndDelete', function () {
    if (!this.model) return;
    const keys = mapModelToKeys(this.model.modelName);
    if (keys.length > 0) {
      socketEmitter.emit('invalidate', keys);
    }
  });

  // NOTE: updateMany and updateOne are intentionally NOT hooked here.
  // They are used for read-receipt marking (readAt timestamps) which
  // would cause spurious invalidations and duplicate message renders.
  // New message creation uses save(), which IS hooked above.
};
