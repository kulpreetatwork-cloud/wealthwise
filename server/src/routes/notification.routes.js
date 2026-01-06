import express from 'express';
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
    createNotification,
} from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Get unread count (before /:id routes)
router.get('/unread-count', getUnreadCount);

// Mark all as read
router.put('/read-all', markAllAsRead);

// Clear read notifications
router.delete('/clear-read', clearReadNotifications);

// CRUD routes
router.route('/')
    .get(getNotifications)
    .post(createNotification);

router.route('/:id')
    .delete(deleteNotification);

router.put('/:id/read', markAsRead);

export default router;
