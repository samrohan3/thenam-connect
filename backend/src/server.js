require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/database');
const { Server } = require('socket.io');
const socketEmitter = require('./utils/socketEmitter');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB Atlas first
    await connectDB();

    // Only start server after successful connection
    const server = app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(` Thenam ERP Backend Foundation is running!       `);
      console.log(` Address: http://localhost:${PORT}               `);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'} `);
      console.log(`=================================================`);
    });

    // Initialize Socket.io
    const io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true
      }
    });

    // Handle global invalidate events from Mongoose hooks
    socketEmitter.on('invalidate', (keys) => {
      io.emit('invalidate', keys);
    });

    io.on('connection', (socket) => {
      console.log('Client connected to socket:', socket.id);
      socket.on('disconnect', () => {
        console.log('Client disconnected from socket:', socket.id);
      });
    });

  } catch (error) {
    console.error('Server failed to start due to database connection failure.');
    process.exit(1);
  }
};

startServer();
