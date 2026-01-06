import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc    Get all accounts for user
 * @route   GET /api/accounts
 * @access  Private
 */
export const getAccounts = asyncHandler(async (req, res) => {
    const accounts = await Account.find({ userId: req.user.id, isActive: true })
        .sort({ createdAt: -1 });

    ApiResponse.success(res, accounts, 'Accounts retrieved successfully');
});

/**
 * @desc    Create new account
 * @route   POST /api/accounts
 * @access  Private
 */
export const createAccount = asyncHandler(async (req, res) => {
    const { name, type, balance, currency, institution, color, icon } = req.body;

    const account = await Account.create({
        userId: req.user.id,
        name,
        type,
        balance: balance || 0,
        currency: currency || req.user.profile?.currency || 'USD',
        institution,
        color,
        icon,
    });

    ApiResponse.created(res, account, 'Account created successfully');
});

/**
 * @desc    Get single account
 * @route   GET /api/accounts/:id
 * @access  Private
 */
export const getAccount = asyncHandler(async (req, res) => {
    const account = await Account.findOne({
        _id: req.params.id,
        userId: req.user.id,
    });

    if (!account) {
        throw ApiError.notFound('Account not found');
    }

    ApiResponse.success(res, account, 'Account retrieved successfully');
});

/**
 * @desc    Update account
 * @route   PUT /api/accounts/:id
 * @access  Private
 */
export const updateAccount = asyncHandler(async (req, res) => {
    const { name, type, currency, institution, color, icon, includeInTotal } = req.body;

    const account = await Account.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        {
            $set: {
                ...(name && { name }),
                ...(type && { type }),
                ...(currency && { currency }),
                ...(institution !== undefined && { institution }),
                ...(color && { color }),
                ...(icon && { icon }),
                ...(includeInTotal !== undefined && { includeInTotal }),
            },
        },
        { new: true, runValidators: true }
    );

    if (!account) {
        throw ApiError.notFound('Account not found');
    }

    ApiResponse.success(res, account, 'Account updated successfully');
});

/**
 * @desc    Delete account (soft delete)
 * @route   DELETE /api/accounts/:id
 * @access  Private
 */
export const deleteAccount = asyncHandler(async (req, res) => {
    const account = await Account.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        { isActive: false },
        { new: true }
    );

    if (!account) {
        throw ApiError.notFound('Account not found');
    }

    ApiResponse.success(res, null, 'Account deleted successfully');
});

/**
 * @desc    Update account balance
 * @route   PUT /api/accounts/:id/balance
 * @access  Private
 */
export const updateBalance = asyncHandler(async (req, res) => {
    const { balance } = req.body;

    if (balance === undefined || balance === null) {
        throw ApiError.badRequest('Balance is required');
    }

    const account = await Account.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        { balance },
        { new: true, runValidators: true }
    );

    if (!account) {
        throw ApiError.notFound('Account not found');
    }

    ApiResponse.success(res, account, 'Balance updated successfully');
});

/**
 * @desc    Get account summary (total balance, by type)
 * @route   GET /api/accounts/summary
 * @access  Private
 */
export const getAccountSummary = asyncHandler(async (req, res) => {
    const [totalBalance, balanceByType] = await Promise.all([
        Account.getTotalBalance(req.user.id),
        Account.getBalanceByType(req.user.id),
    ]);

    const summary = {
        totalBalance: totalBalance.total,
        accountCount: totalBalance.count,
        byType: balanceByType.reduce((acc, item) => {
            acc[item._id] = { total: item.total, count: item.count };
            return acc;
        }, {}),
    };

    ApiResponse.success(res, summary, 'Account summary retrieved successfully');
});
