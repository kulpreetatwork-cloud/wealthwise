import Goal from '../models/Goal.js';
import Account from '../models/Account.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { emitToUser } from '../sockets/index.js';

/**
 * @desc    Get all goals for user
 * @route   GET /api/goals
 * @access  Private
 */
export const getGoals = asyncHandler(async (req, res) => {
    const { active = 'true', category, completed } = req.query;

    const filter = { userId: req.user.id };

    if (active === 'true') {
        filter.isActive = true;
    }

    if (category) {
        filter.category = category;
    }

    if (completed === 'true') {
        filter.isCompleted = true;
    } else if (completed === 'false') {
        filter.isCompleted = false;
    }

    const goals = await Goal.find(filter)
        .sort({ priority: -1, targetDate: 1 })
        .populate('linkedAccountId', 'name type balance');

    ApiResponse.success(res, goals, 'Goals retrieved successfully');
});

/**
 * @desc    Get single goal
 * @route   GET /api/goals/:id
 * @access  Private
 */
export const getGoal = asyncHandler(async (req, res) => {
    const goal = await Goal.findOne({
        _id: req.params.id,
        userId: req.user.id,
    }).populate('linkedAccountId', 'name type balance');

    if (!goal) {
        throw ApiError.notFound('Goal not found');
    }

    ApiResponse.success(res, goal, 'Goal retrieved successfully');
});

/**
 * @desc    Create new goal
 * @route   POST /api/goals
 * @access  Private
 */
export const createGoal = asyncHandler(async (req, res) => {
    const {
        name,
        description,
        targetAmount,
        currentAmount,
        category,
        targetDate,
        priority,
        autoContribute,
        linkedAccountId,
        color,
        icon,
    } = req.body;

    // Validate target date is in the future
    if (new Date(targetDate) <= new Date()) {
        throw ApiError.badRequest('Target date must be in the future');
    }

    // Validate linked account if provided
    if (linkedAccountId) {
        const account = await Account.findOne({ _id: linkedAccountId, userId: req.user.id });
        if (!account) {
            throw ApiError.notFound('Linked account not found');
        }
    }

    const goal = await Goal.create({
        userId: req.user.id,
        name,
        description,
        targetAmount,
        currentAmount: currentAmount || 0,
        category,
        targetDate,
        priority: priority || 'medium',
        autoContribute,
        linkedAccountId,
        color,
        icon,
    });

    await goal.populate('linkedAccountId', 'name type balance');

    // Emit real-time update
    emitToUser(req.user.id, 'goal:created', goal);

    ApiResponse.created(res, goal, 'Goal created successfully');
});

/**
 * @desc    Update goal
 * @route   PUT /api/goals/:id
 * @access  Private
 */
export const updateGoal = asyncHandler(async (req, res) => {
    const {
        name,
        description,
        targetAmount,
        targetDate,
        priority,
        autoContribute,
        linkedAccountId,
        color,
        icon,
        isActive,
    } = req.body;

    const goal = await Goal.findOne({
        _id: req.params.id,
        userId: req.user.id,
    });

    if (!goal) {
        throw ApiError.notFound('Goal not found');
    }

    Object.assign(goal, {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(targetAmount && { targetAmount }),
        ...(targetDate && { targetDate }),
        ...(priority && { priority }),
        ...(autoContribute && { autoContribute }),
        ...(linkedAccountId && { linkedAccountId }),
        ...(color && { color }),
        ...(icon && { icon }),
        ...(isActive !== undefined && { isActive }),
    });

    await goal.save();
    await goal.populate('linkedAccountId', 'name type balance');

    // Emit real-time update
    emitToUser(req.user.id, 'goal:updated', goal);

    ApiResponse.success(res, goal, 'Goal updated successfully');
});

/**
 * @desc    Add contribution to goal
 * @route   POST /api/goals/:id/contribute
 * @access  Private
 */
export const contributeToGoal = asyncHandler(async (req, res) => {
    const { amount, note } = req.body;

    if (!amount || amount <= 0) {
        throw ApiError.badRequest('Valid contribution amount is required');
    }

    const goal = await Goal.findOne({
        _id: req.params.id,
        userId: req.user.id,
    });

    if (!goal) {
        throw ApiError.notFound('Goal not found');
    }

    if (goal.isCompleted) {
        throw ApiError.badRequest('This goal is already completed');
    }

    // Update goal amount
    goal.currentAmount += amount;
    await goal.save();
    await goal.populate('linkedAccountId', 'name type balance');

    // Emit real-time update
    emitToUser(req.user.id, 'goal:contribution', {
        goalId: goal._id,
        amount,
        newTotal: goal.currentAmount,
        isCompleted: goal.isCompleted,
    });

    const message = goal.isCompleted
        ? '🎉 Congratulations! Goal completed!'
        : 'Contribution added successfully';

    ApiResponse.success(res, goal, message);
});

/**
 * @desc    Withdraw from goal
 * @route   POST /api/goals/:id/withdraw
 * @access  Private
 */
export const withdrawFromGoal = asyncHandler(async (req, res) => {
    const { amount, reason } = req.body;

    if (!amount || amount <= 0) {
        throw ApiError.badRequest('Valid withdrawal amount is required');
    }

    const goal = await Goal.findOne({
        _id: req.params.id,
        userId: req.user.id,
    });

    if (!goal) {
        throw ApiError.notFound('Goal not found');
    }

    if (amount > goal.currentAmount) {
        throw ApiError.badRequest('Withdrawal amount exceeds current balance');
    }

    // Update goal amount
    goal.currentAmount -= amount;

    // If was completed, mark as incomplete
    if (goal.isCompleted && goal.currentAmount < goal.targetAmount) {
        goal.isCompleted = false;
        goal.completedAt = null;
    }

    await goal.save();

    ApiResponse.success(res, goal, 'Withdrawal successful');
});

/**
 * @desc    Delete goal
 * @route   DELETE /api/goals/:id
 * @access  Private
 */
export const deleteGoal = asyncHandler(async (req, res) => {
    const goal = await Goal.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.id,
    });

    if (!goal) {
        throw ApiError.notFound('Goal not found');
    }

    // Emit real-time update
    emitToUser(req.user.id, 'goal:deleted', { id: goal._id });

    ApiResponse.success(res, null, 'Goal deleted successfully');
});

/**
 * @desc    Get goals summary
 * @route   GET /api/goals/summary
 * @access  Private
 */
export const getGoalsSummary = asyncHandler(async (req, res) => {
    const summary = await Goal.getGoalsSummary(req.user.id);

    // Get goals by status
    const goals = await Goal.find({ userId: req.user.id, isActive: true, isCompleted: false });

    let onTrack = 0;
    let behind = 0;
    let atRisk = 0;

    goals.forEach((goal) => {
        const status = goal.status;
        if (status === 'on-track') onTrack++;
        else if (status === 'behind') behind++;
        else if (status === 'at-risk') atRisk++;
    });

    ApiResponse.success(res, {
        ...summary,
        onTrack,
        behind,
        atRisk,
    }, 'Goals summary retrieved successfully');
});
