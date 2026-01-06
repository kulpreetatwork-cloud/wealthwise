import mongoose from 'mongoose';
import config from './index.js';
import logger from '../utils/logger.js';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.mongodb.uri, {
            // Mongoose 8 uses these defaults, but we specify for clarity
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        logger.info(`MongoDB Connected: ${conn.connection.host}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            logger.error(`MongoDB connection error: ${err}`);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            logger.info('MongoDB reconnected');
        });

        return conn;
    } catch (error) {
        logger.error(`MongoDB connection failed: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
