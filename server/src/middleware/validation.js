import { body, param, query, validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/**
 * Middleware to handle validation errors
 */
export const validate = (validations) => {
    return async (req, res, next) => {
        // Run all validations
        await Promise.all(validations.map((validation) => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        const extractedErrors = errors.array().map((err) => ({
            field: err.path,
            message: err.msg,
        }));

        throw ApiError.badRequest('Validation failed', extractedErrors);
    };
};

// Common validation rules
export const commonRules = {
    // ID validation
    mongoId: (field = 'id') =>
        param(field)
            .isMongoId()
            .withMessage(`Invalid ${field} format`),

    // Pagination
    pagination: [
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page must be a positive integer'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('Limit must be between 1 and 100'),
    ],

    // Date range
    dateRange: [
        query('startDate')
            .optional()
            .isISO8601()
            .withMessage('Invalid start date format'),
        query('endDate')
            .optional()
            .isISO8601()
            .withMessage('Invalid end date format'),
    ],
};

// Transaction validation rules
export const transactionRules = {
    create: [
        body('accountId')
            .isMongoId()
            .withMessage('Valid account ID is required'),
        body('type')
            .isIn(['income', 'expense', 'transfer'])
            .withMessage('Type must be income, expense, or transfer'),
        body('amount')
            .isFloat({ min: 0.01 })
            .withMessage('Amount must be greater than 0'),
        body('category')
            .trim()
            .notEmpty()
            .withMessage('Category is required')
            .isLength({ max: 50 })
            .withMessage('Category cannot exceed 50 characters'),
        body('date')
            .optional()
            .isISO8601()
            .withMessage('Invalid date format'),
        body('description')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('Description cannot exceed 500 characters'),
        body('merchant')
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage('Merchant cannot exceed 100 characters'),
    ],
};

// Account validation rules
export const accountRules = {
    create: [
        body('name')
            .trim()
            .notEmpty()
            .withMessage('Account name is required')
            .isLength({ max: 100 })
            .withMessage('Name cannot exceed 100 characters'),
        body('type')
            .isIn(['checking', 'savings', 'credit', 'investment', 'cash'])
            .withMessage('Invalid account type'),
        body('balance')
            .optional()
            .isFloat()
            .withMessage('Balance must be a number'),
        body('currency')
            .optional()
            .isIn(['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'])
            .withMessage('Invalid currency'),
    ],
};

// Budget validation rules
export const budgetRules = {
    create: [
        body('name')
            .trim()
            .notEmpty()
            .withMessage('Budget name is required')
            .isLength({ max: 100 })
            .withMessage('Name cannot exceed 100 characters'),
        body('amount')
            .isFloat({ min: 0.01 })
            .withMessage('Amount must be greater than 0'),
        body('category')
            .trim()
            .notEmpty()
            .withMessage('Category is required'),
        body('period')
            .isIn(['weekly', 'monthly', 'yearly'])
            .withMessage('Period must be weekly, monthly, or yearly'),
    ],
};

// Goal validation rules
export const goalRules = {
    create: [
        body('name')
            .trim()
            .notEmpty()
            .withMessage('Goal name is required')
            .isLength({ max: 100 })
            .withMessage('Name cannot exceed 100 characters'),
        body('targetAmount')
            .isFloat({ min: 0.01 })
            .withMessage('Target amount must be greater than 0'),
        body('targetDate')
            .isISO8601()
            .withMessage('Valid target date is required'),
        body('category')
            .optional()
            .isIn(['emergency', 'vacation', 'home', 'car', 'education', 'retirement', 'wedding', 'other'])
            .withMessage('Invalid goal category'),
    ],
    contribute: [
        body('amount')
            .isFloat({ min: 0.01 })
            .withMessage('Contribution amount must be greater than 0'),
    ],
};

// Auth validation rules
export const authRules = {
    register: [
        body('email')
            .trim()
            .isEmail()
            .normalizeEmail()
            .withMessage('Valid email is required'),
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters')
            .matches(/\d/)
            .withMessage('Password must contain a number')
            .matches(/[a-z]/)
            .withMessage('Password must contain a lowercase letter')
            .matches(/[A-Z]/)
            .withMessage('Password must contain an uppercase letter'),
        body('role')
            .optional()
            .isIn(['individual', 'student', 'business'])
            .withMessage('Invalid role'),
    ],
    login: [
        body('email')
            .trim()
            .isEmail()
            .normalizeEmail()
            .withMessage('Valid email is required'),
        body('password')
            .notEmpty()
            .withMessage('Password is required'),
    ],
};

// Investment validation rules
export const investmentRules = {
    create: [
        body('name')
            .trim()
            .notEmpty()
            .withMessage('Investment name is required')
            .isLength({ max: 100 })
            .withMessage('Name cannot exceed 100 characters'),
        body('type')
            .isIn(['stock', 'etf', 'mutual_fund', 'bond', 'crypto', 'real_estate', 'commodity', 'other'])
            .withMessage('Invalid investment type'),
        body('shares')
            .isFloat({ min: 0 })
            .withMessage('Shares must be 0 or greater'),
        body('purchasePrice')
            .isFloat({ min: 0 })
            .withMessage('Purchase price must be 0 or greater'),
    ],
};

// Bill validation rules
export const billRules = {
    create: [
        body('name')
            .trim()
            .notEmpty()
            .withMessage('Bill name is required')
            .isLength({ max: 100 })
            .withMessage('Name cannot exceed 100 characters'),
        body('amount')
            .isFloat({ min: 0.01 })
            .withMessage('Amount must be greater than 0'),
        body('category')
            .isIn(['utilities', 'rent', 'mortgage', 'insurance', 'subscription', 'loan', 'credit_card', 'other'])
            .withMessage('Invalid bill category'),
        body('dueDate')
            .isISO8601()
            .withMessage('Valid due date is required'),
        body('frequency')
            .optional()
            .isIn(['once', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'])
            .withMessage('Invalid frequency'),
    ],
};
