import mongoose from 'mongoose';
import config from './index.js';
import logger from '../utils/logger.js';

export const connectDatabase = async () => {
  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connected successfully');
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.info('MongoDB disconnected');
  });

  try {
    const conn = await mongoose.connect(config.mongoUri);
    return conn;
  } catch (error) {
    logger.error(`Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB connection closed gracefully');
  } catch (error) {
    logger.error(`Error during MongoDB disconnection: ${error.message}`);
  }
};
