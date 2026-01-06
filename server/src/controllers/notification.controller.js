import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { emitToUser } from '../sockets/index.js';

/**
 * @desc    Get all notifications for user
 * @route   GET /api/notifications
 * @access  Private
 */
export const getNotifications = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, unreadOnly = 'false' } = req.query;

    const filter = { userId: req.user.id };
    if (unreadOnly === 'true') {
        filter.isRead = false;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total, unreadCount] = await Promise.all([
        Notification.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        Notification.countDocuments(filter),
        Notification.getUnreadCount(req.user.id),
    ]);

    ApiResponse.success(res, {
        notifications,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
        },
        unreadCount,
    }, 'Notifications retrieved successfully');
});

/**
 * @desc    Get unread count
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
    const count = await Notification.getUnreadCount(req.user.id);
    ApiResponse.success(res, { count }, 'Unread count retrieved');
});

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
export const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findOne({
        _id: req.params.id,
        userId: req.user.id,
    });

    if (!notification) {
        throw ApiError.notFound('Notification not found');
    }

    if (!notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date();
        await notification.save();
    }

    emitToUser(req.user.id, 'notification:read', { id: notification._id });

    ApiResponse.success(res, notification, 'Notification marked as read');
});

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
    const count = await Notification.markAllAsRead(req.user.id);

    emitToUser(req.user.id, 'notification:readAll', { count });

    ApiResponse.success(res, { count }, `${count} notifications marked as read`);
});

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
export const deleteNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.id,
    });

    if (!notification) {
        throw ApiError.notFound('Notification not found');
    }

    ApiResponse.success(res, null, 'Notification deleted');
});

/**
 * @desc    Delete all read notifications
 * @route   DELETE /api/notifications/clear-read
 * @access  Private
 */
export const clearReadNotifications = asyncHandler(async (req, res) => {
    const result = await Notification.deleteMany({
        userId: req.user.id,
        isRead: true,
    });

    ApiResponse.success(res, { count: result.deletedCount }, 'Read notifications cleared');
});

/**
 * @desc    Create notification (internal use or admin)
 * @route   POST /api/notifications
 * @access  Private
 */
export const createNotification = asyncHandler(async (req, res) => {
    const { type, title, message, priority, actionUrl, data } = req.body;

    const notification = await Notification.create({
        userId: req.user.id,
        type,
        title,
        message,
        priority: priority || 'medium',
        actionUrl,
        data,
    });

    // Emit to user
    emitToUser(req.user.id, 'notification:new', notification);

    ApiResponse.created(res, notification, 'Notification created');
});
