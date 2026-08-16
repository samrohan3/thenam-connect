/**
 * socketService.js
 * 
 * Singleton that holds the Socket.IO server instance and exposes
 * helper functions for targeted event emission.
 * 
 * Usage:
 *   const { setIo, emitToUser, emitToAll } = require('./socketService');
 * 
 *   // In server.js after io is created:
 *   setIo(io);
 * 
 *   // Anywhere in the app:
 *   emitToUser(userId, 'announcement:new', data);
 *   emitToAll('announcement:new', data);
 */

let _io = null;

const setIo = (io) => {
  _io = io;
};

const getIo = () => _io;

/**
 * Emit an event to a specific authenticated user.
 * Users join a room named `user:{userId}` on connection.
 */
const emitToUser = (userId, event, data) => {
  if (!_io) {
    console.warn('[socketService] IO not initialized, cannot emit to user:', userId);
    return;
  }
  _io.to(`user:${userId}`).emit(event, data);
};

/**
 * Emit an event to ALL connected clients.
 */
const emitToAll = (event, data) => {
  if (!_io) {
    console.warn('[socketService] IO not initialized, cannot broadcast:', event);
    return;
  }
  _io.emit(event, data);
};

/**
 * Emit an event to all users with a specific role.
 * Rooms named `role:{roleName}` must be joined on connection.
 */
const emitToRole = (role, event, data) => {
  if (!_io) return;
  _io.to(`role:${role}`).emit(event, data);
};

module.exports = {
  setIo,
  getIo,
  emitToUser,
  emitToAll,
  emitToRole
};
