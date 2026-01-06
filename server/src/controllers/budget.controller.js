import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { emitToUser } from '../sockets/index.js';

/**
 * @desc    Get all budgets for user
 * @route   GET /api/budgets
 * @access  Private
 */
export const getBudgets = asyncHandler(async (req, res) => {
    const { active = 'true', period } = req.query;

    const filter = { userId: req.user.id };

    if (active === 'true') {
        filter.isActive = true;
    }

    if (period) {
        filter.period = period;
    }

    const budgets = await Budget.find(filter).sort({ createdAt: -1 });

    // Calculate spent for each budget based on transactions
    const now = new Date();
    const budgetsWithSpent = await Promise.all(
        budgets.map(async (budget) => {
            const budgetObj = budget.toObject();

            // Get period start date
            let periodStart;
            if (budget.period === 'monthly') {
                periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
            } else if (budget.period === 'weekly') {
                const day = now.getDay();
                periodStart = new Date(now);
                periodStart.setDate(now.getDate() - day);
                periodStart.setHours(0, 0, 0, 0);
            } else {
                periodStart = new Date(now.getFullYear(), 0, 1);
            }

            // Calculate spent from transactions
            const result = await Transaction.aggregate([
                {
                    $match: {
                        userId: req.user._id,
                        category: budget.category,
                        type: 'expense',
                        date: { $gte: periodStart, $lte: now },
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$amount' },
                    },
                },
            ]);

            budgetObj.spent = result[0]?.total || 0;
            budgetObj.remaining = Math.max(0, budget.amount - budgetObj.spent);
            budgetObj.percentUsed = budget.amount > 0
                ? Math.min(100, Math.round((budgetObj.spent / budget.amount) * 100))
                : 0;
            budgetObj.status = budgetObj.percentUsed >= 100
                ? 'exceeded'
                : budgetObj.percentUsed >= budget.alertThreshold
                    ? 'warning'
                    : 'on-track';

            return budgetObj;
        })
    );

    ApiResponse.success(res, budgetsWithSpent, 'Budgets retrieved successfully');
});

/**
 * @desc    Get single budget
 * @route   GET /api/budgets/:id
 * @access  Private
 */
export const getBudget = asyncHandler(async (req, res) => {
    const budget = await Budget.findOne({
        _id: req.params.id,
        userId: req.user.id,
    });

    if (!budget) {
        throw ApiError.notFound('Budget not found');
    }

    ApiResponse.success(res, budget, 'Budget retrieved successfully');
});

/**
 * @desc    Create new budget
 * @route   POST /api/budgets
 * @access  Private
 */
export const createBudget = asyncHandler(async (req, res) => {
    const {
        name,
        category,
        amount,
        period,
        startDate,
        endDate,
        isRecurring,
        alertThreshold,
        color,
    } = req.body;

    // Check for existing budget with same category and period
    const existingBudget = await Budget.findOne({
        userId: req.user.id,
        category,
        period,
        isActive: true,
    });

    if (existingBudget) {
        throw ApiError.badRequest(`A budget for "${category}" already exists for this period`);
    }

    const budget = await Budget.create({
        userId: req.user.id,
        name,
        category,
        amount,
        period: period || 'monthly',
        startDate: startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        endDate,
        isRecurring: isRecurring !== false,
        alertThreshold: alertThreshold || 80,
        color,
    });

    // Emit real-time update
    emitToUser(req.user.id, 'budget:created', budget);

    ApiResponse.created(res, budget, 'Budget created successfully');
});

/**
 * @desc    Update budget
 * @route   PUT /api/budgets/:id
 * @access  Private
 */
export const updateBudget = asyncHandler(async (req, res) => {
    const { name, amount, alertThreshold, color, isActive } = req.body;

    const budget = await Budget.findOne({
        _id: req.params.id,
        userId: req.user.id,
    });

    if (!budget) {
        throw ApiError.notFound('Budget not found');
    }

    Object.assign(budget, {
        ...(name && { name }),
        ...(amount !== undefined && { amount }),
        ...(alertThreshold !== undefined && { alertThreshold }),
        ...(color && { color }),
        ...(isActive !== undefined && { isActive }),
    });

    await budget.save();

    // Emit real-time update
    emitToUser(req.user.id, 'budget:updated', budget);

    ApiResponse.success(res, budget, 'Budget updated successfully');
});

/**
 * @desc    Delete budget
 * @route   DELETE /api/budgets/:id
 * @access  Private
 */
export const deleteBudget = asyncHandler(async (req, res) => {
    const budget = await Budget.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.id,
    });

    if (!budget) {
        throw ApiError.notFound('Budget not found');
    }

    // Emit real-time update
    emitToUser(req.user.id, 'budget:deleted', { id: budget._id });

    ApiResponse.success(res, null, 'Budget deleted successfully');
});

/**
 * @desc    Get budget summary/overview
 * @route   GET /api/budgets/summary
 * @access  Private
 */
export const getBudgetSummary = asyncHandler(async (req, res) => {
    const budgets = await Budget.find({ userId: req.user.id, isActive: true });

    let totalBudgeted = 0;
    let totalSpent = 0;
    let onTrack = 0;
    let warning = 0;
    let exceeded = 0;

    const now = new Date();

    for (const budget of budgets) {
        totalBudgeted += budget.amount;

        // Calculate spent for this period
        let periodStart;
        if (budget.period === 'monthly') {
            periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (budget.period === 'weekly') {
            const day = now.getDay();
            periodStart = new Date(now);
            periodStart.setDate(now.getDate() - day);
        } else {
            periodStart = new Date(now.getFullYear(), 0, 1);
        }

        const result = await Transaction.aggregate([
            {
                $match: {
                    userId: req.user._id,
                    category: budget.category,
                    type: 'expense',
                    date: { $gte: periodStart, $lte: now },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' },
                },
            },
        ]);

        const spent = result[0]?.total || 0;
        totalSpent += spent;

        const percentUsed = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
        if (percentUsed >= 100) exceeded++;
        else if (percentUsed >= budget.alertThreshold) warning++;
        else onTrack++;
    }

    ApiResponse.success(res, {
        totalBudgets: budgets.length,
        totalBudgeted,
        totalSpent,
        totalRemaining: Math.max(0, totalBudgeted - totalSpent),
        onTrack,
        warning,
        exceeded,
        percentUsed: totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0,
    }, 'Budget summary retrieved successfully');
});
