import ApiError from '../utils/ApiError.js';

/**
 * Middleware to validate request body against a Zod schema
 * @param {z.ZodSchema} schema - Zod schema to validate against
 */
export const validate = (schema) => (req, res, next) => {
    try {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const errors = result.error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));

            throw ApiError.badRequest('Validation failed', errors);
        }

        // Replace body with parsed data (includes defaults and transformations)
        req.body = result.data;
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Middleware to validate query parameters against a Zod schema
 * @param {z.ZodSchema} schema - Zod schema to validate against
 */
export const validateQuery = (schema) => (req, res, next) => {
    try {
        const result = schema.safeParse(req.query);

        if (!result.success) {
            const errors = result.error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));

            throw ApiError.badRequest('Invalid query parameters', errors);
        }

        req.query = result.data;
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Middleware to validate route parameters against a Zod schema
 * @param {z.ZodSchema} schema - Zod schema to validate against
 */
export const validateParams = (schema) => (req, res, next) => {
    try {
        const result = schema.safeParse(req.params);

        if (!result.success) {
            const errors = result.error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));

            throw ApiError.badRequest('Invalid route parameters', errors);
        }

        req.params = result.data;
        next();
    } catch (error) {
        next(error);
    }
};
