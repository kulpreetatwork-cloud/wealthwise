import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import logger from '../utils/logger.js';

let io;

/**
 * Initialize Socket.io server
 * @param {http.Server} server - HTTP server instance
 */
export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: config.client.url,
            methods: ['GET', 'POST'],
            credentials: true,
        },
        pingTimeout: 60000,
        pingInterval: 25000,
    });

    // Authentication middleware for socket connections
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication required'));
        }

        try {
            const decoded = jwt.verify(token, config.jwt.secret);
            socket.userId = decoded.id;
            socket.userRole = decoded.role;
            next();
        } catch (error) {
            return next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        logger.info(`User connected: ${socket.userId}`);

        // Join user-specific room for targeted notifications
        socket.join(`user:${socket.userId}`);

        // Handle disconnect
        socket.on('disconnect', (reason) => {
            logger.info(`User disconnected: ${socket.userId} (${reason})`);
        });

        // Handle errors
        socket.on('error', (error) => {
            logger.error(`Socket error for user ${socket.userId}:`, error);
        });
    });

    logger.info('Socket.io initialized');
    return io;
};

/**
 * Get Socket.io instance
 * @returns {Server} Socket.io server instance
 */
export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

/**
 * Emit event to specific user
 * @param {string} userId - User ID to send event to
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
export const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(`user:${userId}`).emit(event, data);
    }
};

/**
 * Emit event to all connected users
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
export const broadcast = (event, data) => {
    if (io) {
        io.emit(event, data);
    }
};
