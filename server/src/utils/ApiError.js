/**
 * Custom API Error class for consistent error handling
 */
class ApiError extends Error {
    constructor(statusCode, message, isOperational = true, errors = []) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = isOperational;
        this.errors = errors;

        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(message = 'Bad Request', errors = []) {
        return new ApiError(400, message, true, errors);
    }

    static unauthorized(message = 'Unauthorized') {
        return new ApiError(401, message);
    }

    static forbidden(message = 'Forbidden') {
        return new ApiError(403, message);
    }

    static notFound(message = 'Resource not found') {
        return new ApiError(404, message);
    }

    static conflict(message = 'Conflict') {
        return new ApiError(409, message);
    }

    static tooManyRequests(message = 'Too many requests') {
        return new ApiError(429, message);
    }

    static internal(message = 'Internal server error') {
        return new ApiError(500, message, false);
    }
}

export default ApiError;
