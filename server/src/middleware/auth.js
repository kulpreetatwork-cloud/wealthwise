import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Protect routes - verify JWT access token
 */
export const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Get token from Authorization header
    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        throw ApiError.unauthorized('Please log in to access this resource');
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, config.jwt.secret);

        // Check if user still exists
        const user = await User.findById(decoded.id);
        if (!user) {
            throw ApiError.unauthorized('The user belonging to this token no longer exists');
        }

        // Check if user changed password after token was issued
        if (user.changedPasswordAfter(decoded.iat)) {
            throw ApiError.unauthorized('Password was recently changed. Please log in again.');
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            throw ApiError.unauthorized('Invalid or expired token');
        }
        throw error;
    }
});

/**
 * Restrict access to specific roles
 * @param  {...string} roles - Allowed roles
 */
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw ApiError.forbidden('You do not have permission to perform this action');
        }
        next();
    };
};

/**
 * Check if user has completed role selection
 */
export const requireRole = asyncHandler(async (req, res, next) => {
    if (!req.user.role) {
        throw ApiError.forbidden('Please select a role to continue');
    }
    next();
});

/**
 * Optional auth - attach user if token exists, but don't require it
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, config.jwt.secret);
            const user = await User.findById(decoded.id);
            if (user && !user.changedPasswordAfter(decoded.iat)) {
                req.user = user;
            }
        } catch (error) {
            // Token invalid, but that's okay for optional auth
        }
    }

    next();
});
