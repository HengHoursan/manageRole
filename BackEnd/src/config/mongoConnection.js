const mongoose = require('mongoose');
const config = require('./environment'); // Import the new config file

const mongoConnection = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri, { // Use config.mongoUri
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
    console.log(`📁 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = mongoConnection;
