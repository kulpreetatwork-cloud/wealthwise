import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { emitToUser } from '../sockets/index.js';

/**
 * @desc    Get all transactions for user with filters
 * @route   GET /api/transactions
 * @access  Private
 */
export const getTransactions = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 20,
        type,
        category,
        accountId,
        startDate,
        endDate,
        search,
        sortBy = 'date',
        sortOrder = 'desc',
    } = req.query;

    // Build filter
    const filter = { userId: req.user.id };

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (accountId) filter.accountId = accountId;

    if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);
    }

    if (search) {
        filter.$or = [
            { description: { $regex: search, $options: 'i' } },
            { merchant: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } },
        ];
    }

    // Build sort
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
        Transaction.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('accountId', 'name type color'),
        Transaction.countDocuments(filter),
    ]);

    const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
    };

    ApiResponse.success(res, { transactions, pagination }, 'Transactions retrieved successfully');
});

/**
 * @desc    Get single transaction
 * @route   GET /api/transactions/:id
 * @access  Private
 */
export const getTransaction = asyncHandler(async (req, res) => {
    const transaction = await Transaction.findOne({
        _id: req.params.id,
        userId: req.user.id,
    }).populate('accountId', 'name type color');

    if (!transaction) {
        throw ApiError.notFound('Transaction not found');
    }

    ApiResponse.success(res, transaction, 'Transaction retrieved successfully');
});

/**
 * @desc    Create new transaction
 * @route   POST /api/transactions
 * @access  Private
 */
export const createTransaction = asyncHandler(async (req, res) => {
    const {
        accountId,
        type,
        amount,
        category,
        subcategory,
        description,
        merchant,
        date,
        isRecurring,
        recurringRule,
        tags,
        notes,
    } = req.body;

    // Verify account belongs to user
    const account = await Account.findOne({ _id: accountId, userId: req.user.id });
    if (!account) {
        throw ApiError.notFound('Account not found');
    }

    // Create transaction
    const transaction = await Transaction.create({
        userId: req.user.id,
        accountId,
        type,
        amount,
        category,
        subcategory,
        description,
        merchant,
        date: date || new Date(),
        isRecurring,
        recurringRule,
        tags,
        notes,
    });

    // Update account balance
    if (type === 'income') {
        account.balance += amount;
    } else if (type === 'expense') {
        account.balance -= amount;
    }
    await account.save();

    // Populate account info
    await transaction.populate('accountId', 'name type color');

    // Emit real-time update
    emitToUser(req.user.id, 'transaction:created', transaction);

    ApiResponse.created(res, transaction, 'Transaction created successfully');
});

/**
 * @desc    Update transaction
 * @route   PUT /api/transactions/:id
 * @access  Private
 */
export const updateTransaction = asyncHandler(async (req, res) => {
    const { amount, type, category, subcategory, description, merchant, date, tags, notes } = req.body;

    const transaction = await Transaction.findOne({
        _id: req.params.id,
        userId: req.user.id,
    });

    if (!transaction) {
        throw ApiError.notFound('Transaction not found');
    }

    // Calculate balance difference if amount or type changed
    const account = await Account.findById(transaction.accountId);
    if (account) {
        // Reverse old transaction
        if (transaction.type === 'income') {
            account.balance -= transaction.amount;
        } else if (transaction.type === 'expense') {
            account.balance += transaction.amount;
        }

        // Apply new transaction
        const newType = type || transaction.type;
        const newAmount = amount !== undefined ? amount : transaction.amount;
        if (newType === 'income') {
            account.balance += newAmount;
        } else if (newType === 'expense') {
            account.balance -= newAmount;
        }
        await account.save();
    }

    // Update transaction
    Object.assign(transaction, {
        ...(amount !== undefined && { amount }),
        ...(type && { type }),
        ...(category && { category }),
        ...(subcategory !== undefined && { subcategory }),
        ...(description !== undefined && { description }),
        ...(merchant !== undefined && { merchant }),
        ...(date && { date }),
        ...(tags && { tags }),
        ...(notes !== undefined && { notes }),
    });

    await transaction.save();
    await transaction.populate('accountId', 'name type color');

    // Emit real-time update
    emitToUser(req.user.id, 'transaction:updated', transaction);

    ApiResponse.success(res, transaction, 'Transaction updated successfully');
});

/**
 * @desc    Delete transaction
 * @route   DELETE /api/transactions/:id
 * @access  Private
 */
export const deleteTransaction = asyncHandler(async (req, res) => {
    const transaction = await Transaction.findOne({
        _id: req.params.id,
        userId: req.user.id,
    });

    if (!transaction) {
        throw ApiError.notFound('Transaction not found');
    }

    // Reverse the balance change
    const account = await Account.findById(transaction.accountId);
    if (account) {
        if (transaction.type === 'income') {
            account.balance -= transaction.amount;
        } else if (transaction.type === 'expense') {
            account.balance += transaction.amount;
        }
        await account.save();
    }

    await Transaction.findByIdAndDelete(transaction._id);

    // Emit real-time update
    emitToUser(req.user.id, 'transaction:deleted', { id: transaction._id });

    ApiResponse.success(res, null, 'Transaction deleted successfully');
});

/**
 * @desc    Get transaction statistics
 * @route   GET /api/transactions/stats
 * @access  Private
 */
export const getTransactionStats = asyncHandler(async (req, res) => {
    const { period = '30' } = req.query;
    const days = parseInt(period, 10);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const [summary, byCategory, topMerchants] = await Promise.all([
        // Overall summary
        Transaction.aggregate([
            {
                $match: {
                    userId: req.user._id,
                    date: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 },
                    avg: { $avg: '$amount' },
                },
            },
        ]),
        // By category (expenses only)
        Transaction.getSpendingByCategory(req.user.id, startDate, new Date()),
        // Top merchants
        Transaction.aggregate([
            {
                $match: {
                    userId: req.user._id,
                    type: 'expense',
                    date: { $gte: startDate },
                    merchant: { $exists: true, $ne: '' },
                },
            },
            {
                $group: {
                    _id: '$merchant',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { total: -1 } },
            { $limit: 5 },
        ]),
    ]);

    const stats = {
        summary: summary.reduce((acc, item) => {
            acc[item._id] = { total: item.total, count: item.count, avg: Math.round(item.avg) };
            return acc;
        }, {}),
        byCategory,
        topMerchants,
        period: days,
    };

    ApiResponse.success(res, stats, 'Transaction statistics retrieved successfully');
});
