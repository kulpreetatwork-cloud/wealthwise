import Bill from '../models/Bill.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { emitToUser } from '../sockets/index.js';

/**
 * @desc    Get all bills for user
 * @route   GET /api/bills
 * @access  Private
 */
export const getBills = asyncHandler(async (req, res) => {
    const { status, category, active = 'true' } = req.query;

    const filter = { userId: req.user.id };
    if (active === 'true') filter.isActive = true;
    if (category) filter.category = category;
    if (status === 'paid') filter.isPaid = true;
    if (status === 'unpaid') filter.isPaid = false;

    const bills = await Bill.find(filter)
        .sort({ dueDate: 1 })
        .populate('linkedAccountId', 'name');

    ApiResponse.success(res, bills, 'Bills retrieved successfully');
});

/**
 * @desc    Get bills summary
 * @route   GET /api/bills/summary
 * @access  Private
 */
export const getBillsSummary = asyncHandler(async (req, res) => {
    const summary = await Bill.getSummary(req.user.id);
    ApiResponse.success(res, summary, 'Bills summary retrieved successfully');
});

/**
 * @desc    Get upcoming bills
 * @route   GET /api/bills/upcoming
 * @access  Private
 */
export const getUpcomingBills = asyncHandler(async (req, res) => {
    const { days = 30 } = req.query;
    const bills = await Bill.getUpcoming(req.user.id, parseInt(days, 10));
    ApiResponse.success(res, bills, 'Upcoming bills retrieved successfully');
});

/**
 * @desc    Get overdue bills
 * @route   GET /api/bills/overdue
 * @access  Private
 */
export const getOverdueBills = asyncHandler(async (req, res) => {
    const bills = await Bill.getOverdue(req.user.id);
    ApiResponse.success(res, bills, 'Overdue bills retrieved successfully');
});

/**
 * @desc    Get single bill
 * @route   GET /api/bills/:id
 * @access  Private
 */
export const getBill = asyncHandler(async (req, res) => {
    const bill = await Bill.findOne({
        _id: req.params.id,
        userId: req.user.id,
    }).populate('linkedAccountId', 'name');

    if (!bill) {
        throw ApiError.notFound('Bill not found');
    }

    ApiResponse.success(res, bill, 'Bill retrieved successfully');
});

/**
 * @desc    Create new bill
 * @route   POST /api/bills
 * @access  Private
 */
export const createBill = asyncHandler(async (req, res) => {
    const {
        name,
        amount,
        category,
        dueDate,
        frequency,
        linkedAccountId,
        autoPay,
        reminderDays,
        notes,
        color,
    } = req.body;

    const bill = await Bill.create({
        userId: req.user.id,
        name,
        amount,
        category,
        dueDate,
        frequency: frequency || 'monthly',
        linkedAccountId,
        autoPay: autoPay || false,
        reminderDays: reminderDays ?? 3,
        notes,
        color,
    });

    emitToUser(req.user.id, 'bill:created', bill);

    ApiResponse.created(res, bill, 'Bill created successfully');
});

/**
 * @desc    Update bill
 * @route   PUT /api/bills/:id
 * @access  Private
 */
export const updateBill = asyncHandler(async (req, res) => {
    const { name, amount, dueDate, autoPay, reminderDays, notes, color, isActive } = req.body;

    const bill = await Bill.findOne({
        _id: req.params.id,
        userId: req.user.id,
    });

    if (!bill) {
        throw ApiError.notFound('Bill not found');
    }

    Object.assign(bill, {
        ...(name && { name }),
        ...(amount !== undefined && { amount }),
        ...(dueDate && { dueDate }),
        ...(autoPay !== undefined && { autoPay }),
        ...(reminderDays !== undefined && { reminderDays }),
        ...(notes !== undefined && { notes }),
        ...(color && { color }),
        ...(isActive !== undefined && { isActive }),
    });

    await bill.save();

    emitToUser(req.user.id, 'bill:updated', bill);

    ApiResponse.success(res, bill, 'Bill updated successfully');
});

/**
 * @desc    Mark bill as paid
 * @route   POST /api/bills/:id/pay
 * @access  Private
 */
export const markBillPaid = asyncHandler(async (req, res) => {
    const bill = await Bill.findOne({
        _id: req.params.id,
        userId: req.user.id,
    });

    if (!bill) {
        throw ApiError.notFound('Bill not found');
    }

    if (bill.isPaid) {
        throw ApiError.badRequest('Bill is already paid');
    }

    bill.isPaid = true;
    bill.paidDate = new Date();

    // If recurring, create next bill
    if (bill.frequency !== 'once') {
        const nextDueDate = new Date(bill.dueDate);
        switch (bill.frequency) {
            case 'weekly':
                nextDueDate.setDate(nextDueDate.getDate() + 7);
                break;
            case 'biweekly':
                nextDueDate.setDate(nextDueDate.getDate() + 14);
                break;
            case 'monthly':
                nextDueDate.setMonth(nextDueDate.getMonth() + 1);
                break;
            case 'quarterly':
                nextDueDate.setMonth(nextDueDate.getMonth() + 3);
                break;
            case 'yearly':
                nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
                break;
        }

        // Create next recurring bill
        await Bill.create({
            userId: bill.userId,
            name: bill.name,
            amount: bill.amount,
            category: bill.category,
            dueDate: nextDueDate,
            frequency: bill.frequency,
            linkedAccountId: bill.linkedAccountId,
            autoPay: bill.autoPay,
            reminderDays: bill.reminderDays,
            notes: bill.notes,
            color: bill.color,
        });
    }

    await bill.save();

    emitToUser(req.user.id, 'bill:paid', bill);

    ApiResponse.success(res, bill, 'Bill marked as paid');
});

/**
 * @desc    Delete bill
 * @route   DELETE /api/bills/:id
 * @access  Private
 */
export const deleteBill = asyncHandler(async (req, res) => {
    const bill = await Bill.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.id,
    });

    if (!bill) {
        throw ApiError.notFound('Bill not found');
    }

    emitToUser(req.user.id, 'bill:deleted', { id: bill._id });

    ApiResponse.success(res, null, 'Bill deleted successfully');
});
