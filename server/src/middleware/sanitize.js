import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';

/**
 * Sanitize request data to prevent NoSQL injection
 */
export const sanitizeMongo = mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        console.warn(`Sanitized NoSQL injection attempt on field: ${key}`);
    },
});

/**
 * Prevent XSS attacks by sanitizing user input
 */
export const sanitizeXss = xss();

/**
 * Prevent HTTP Parameter Pollution
 */
export const preventHpp = hpp({
    whitelist: [
        'type',
        'category',
        'status',
        'sort',
        'page',
        'limit',
    ],
});

/**
 * Custom sanitization middleware
 */
export const customSanitize = (req, res, next) => {
    // Trim all string values in body
    if (req.body && typeof req.body === 'object') {
        trimObject(req.body);
    }

    // Trim query params
    if (req.query && typeof req.query === 'object') {
        trimObject(req.query);
    }

    next();
};

/**
 * Recursively trim string values in an object
 */
const trimObject = (obj) => {
    for (const key in obj) {
        if (typeof obj[key] === 'string') {
            obj[key] = obj[key].trim();
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            trimObject(obj[key]);
        }
    }
};

/**
 * Request size limiter for specific routes
 */
export const limitPayload = (maxSize = '10kb') => {
    return (req, res, next) => {
        const contentLength = parseInt(req.get('Content-Length') || '0', 10);
        const maxBytes = parseSize(maxSize);

        if (contentLength > maxBytes) {
            return res.status(413).json({
                success: false,
                message: `Payload too large. Maximum size is ${maxSize}`,
            });
        }

        next();
    };
};

/**
 * Parse size string to bytes
 */
const parseSize = (size) => {
    const units = {
        b: 1,
        kb: 1024,
        mb: 1024 * 1024,
        gb: 1024 * 1024 * 1024,
    };

    const match = size.toLowerCase().match(/^(\d+)(b|kb|mb|gb)?$/);
    if (!match) return 10240; // Default 10kb

    const num = parseInt(match[1], 10);
    const unit = match[2] || 'b';

    return num * units[unit];
};
