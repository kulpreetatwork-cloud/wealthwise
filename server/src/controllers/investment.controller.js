import Investment from '../models/Investment.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { emitToUser } from '../sockets/index.js';

/**
 * @desc    Get all investments for user
 * @route   GET /api/investments
 * @access  Private
 */
export const getInvestments = asyncHandler(async (req, res) => {
    const { type, active = 'true' } = req.query;

    const filter = { userId: req.user.id };
    if (active === 'true') filter.isActive = true;
    if (type) filter.type = type;

    const investments = await Investment.find(filter)
        .sort({ currentValue: -1 })
        .populate('linkedAccountId', 'name');

    ApiResponse.success(res, investments, 'Investments retrieved successfully');
});

/**
 * @desc    Get portfolio summary
 * @route   GET /api/investments/summary
 * @access  Private
 */
export const getPortfolioSummary = asyncHandler(async (req, res) => {
    const summary = await Investment.getPortfolioSummary(req.user.id);
    ApiResponse.success(res, summary, 'Portfolio summary retrieved successfully');
});

/**
 * @desc    Get single investment
 * @route   GET /api/investments/:id
 * @access  Private
 */
export const getInvestment = asyncHandler(async (req, res) => {
    const investment = await Investment.findOne({
        _id: req.params.id,
        userId: req.user.id,
    }).populate('linkedAccountId', 'name');

    if (!investment) {
        throw ApiError.notFound('Investment not found');
    }

    ApiResponse.success(res, investment, 'Investment retrieved successfully');
});

/**
 * @desc    Create new investment
 * @route   POST /api/investments
 * @access  Private
 */
export const createInvestment = asyncHandler(async (req, res) => {
    const {
        name,
        symbol,
        type,
        shares,
        purchasePrice,
        currentPrice,
        purchaseDate,
        linkedAccountId,
        notes,
        color,
    } = req.body;

    const investment = await Investment.create({
        userId: req.user.id,
        name,
        symbol,
        type,
        shares,
        purchasePrice,
        currentPrice: currentPrice || purchasePrice,
        purchaseDate: purchaseDate || new Date(),
        linkedAccountId,
        notes,
        color,
    });

    emitToUser(req.user.id, 'investment:created', investment);

    ApiResponse.created(res, investment, 'Investment added successfully');
});

/**
 * @desc    Update investment
 * @route   PUT /api/investments/:id
 * @access  Private
 */
export const updateInvestment = asyncHandler(async (req, res) => {
    const { name, shares, currentPrice, notes, color, isActive } = req.body;

    const investment = await Investment.findOne({
        _id: req.params.id,
        userId: req.user.id,
    });

    if (!investment) {
        throw ApiError.notFound('Investment not found');
    }

    Object.assign(investment, {
        ...(name && { name }),
        ...(shares !== undefined && { shares }),
        ...(currentPrice !== undefined && { currentPrice }),
        ...(notes !== undefined && { notes }),
        ...(color && { color }),
        ...(isActive !== undefined && { isActive }),
    });

    await investment.save();

    emitToUser(req.user.id, 'investment:updated', investment);

    ApiResponse.success(res, investment, 'Investment updated successfully');
});

/**
 * @desc    Delete investment
 * @route   DELETE /api/investments/:id
 * @access  Private
 */
export const deleteInvestment = asyncHandler(async (req, res) => {
    const investment = await Investment.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.id,
    });

    if (!investment) {
        throw ApiError.notFound('Investment not found');
    }

    emitToUser(req.user.id, 'investment:deleted', { id: investment._id });

    ApiResponse.success(res, null, 'Investment deleted successfully');
});
