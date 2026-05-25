const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const logger = require('./logger.js');

dotenv.config();

const connectMongoDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/interview_db';
  try {
    const conn = await mongoose.connect(mongoUri);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || 'interview_db',
  process.env.MYSQL_USER || 'root',
  process.env.MYSQL_PASSWORD || 'rootpassword',
  {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: process.env.MYSQL_PORT || 3306,
    dialect: 'mysql',
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectMySQL = async () => {
  try {
    await sequelize.authenticate();
    logger.info('MySQL Connected.');
    console.log('MySQL Connected.');
  } catch (error) {
    logger.error(`MySQL connection error: ${error.message}`);
    console.error(`MySQL connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  connectMongoDB,
  connectMySQL
};
