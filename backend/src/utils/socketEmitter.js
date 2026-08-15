const EventEmitter = require('events');

class SocketEmitter extends EventEmitter {}

const socketEmitter = new SocketEmitter();

module.exports = socketEmitter;
