require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB Atlas first
    await connectDB();

    // Only start server after successful connection
    app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(` Thenam ERP Backend Foundation is running!       `);
      console.log(` Address: http://localhost:${PORT}               `);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'} `);
      console.log(`=================================================`);
    });
  } catch (error) {
    console.error('Server failed to start due to database connection failure.');
    process.exit(1);
  }
};

startServer();
