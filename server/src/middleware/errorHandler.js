import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import config from '../config/index.js';

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;

    // Log error
    logger.error(`${err.message}`, {
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        error = ApiError.badRequest('Invalid resource ID');
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        error = ApiError.conflict(`${field} already exists`);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((e) => ({
            field: e.path,
            message: e.message,
        }));
        error = ApiError.badRequest('Validation failed', errors);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = ApiError.unauthorized('Invalid token');
    }

    if (err.name === 'TokenExpiredError') {
        error = ApiError.unauthorized('Token expired');
    }

    // Default to 500 server error
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        message,
        errors: error.errors || [],
        ...(config.env === 'development' && { stack: error.stack }),
    });
};

/**
 * 404 Not Found handler for undefined routes
 */
const notFoundHandler = (req, res, next) => {
    next(ApiError.notFound(`Route ${req.originalUrl} not found`));
};

export { errorHandler, notFoundHandler };
