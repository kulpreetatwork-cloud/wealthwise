import rateLimit from 'express-rate-limit';

/**
 * Global API limiter
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 500 requests per windowMs (increased for development)
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests, please try again later.',
    },
});

/**
 * Stricter limiter for auth routes (login, register)
 */
export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 200, // Limit each IP to 200 requests per hour (increased for development)
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many login attempts, please try again after an hour.',
    },
});

/**
 * Limiter for sensitive operations (password reset, etc)
 */
export const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per 15 mins
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many attempts, please try again later.',
    },
});
