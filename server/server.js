import http from 'http';
import app from './src/app.js';
import config from './src/config/index.js';
import connectDB from './src/config/database.js';
import logger from './src/utils/logger.js';
import { initializeSocket } from './src/sockets/index.js';
import { initializeJobs } from './src/jobs/scheduler.js';

const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

// Start server
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Initialize scheduled jobs
        initializeJobs();

        server.listen(config.port, () => {
            logger.info(`🚀 Server running in ${config.env} mode on port ${config.port}`);
            logger.info(`📍 Health check: http://localhost:${config.port}/health`);
        });
    } catch (error) {
        logger.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION! Shutting down...', err);
    server.close(() => {
        process.exit(1);
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        logger.info('Process terminated.');
    });
});

startServer();
