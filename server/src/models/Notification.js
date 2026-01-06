import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        type: {
            type: String,
            required: true,
            enum: [
                'transaction',
                'budget_warning',
                'budget_exceeded',
                'goal_progress',
                'goal_completed',
                'bill_reminder',
                'bill_overdue',
                'account_update',
                'system',
                'ai_insight',
            ],
        },
        title: {
            type: String,
            required: [true, 'Notification title is required'],
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        message: {
            type: String,
            required: [true, 'Message is required'],
            maxlength: [500, 'Message cannot exceed 500 characters'],
        },
        data: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        readAt: {
            type: Date,
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },
        actionUrl: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, type: 1 });

// Static method to create and emit notification
notificationSchema.statics.createAndEmit = async function (data, emitFn) {
    const notification = await this.create(data);
    if (emitFn) {
        emitFn(data.userId.toString(), 'notification:new', notification);
    }
    return notification;
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function (userId) {
    return this.countDocuments({ userId, isRead: false });
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = async function (userId) {
    const result = await this.updateMany(
        { userId, isRead: false },
        { isRead: true, readAt: new Date() }
    );
    return result.modifiedCount;
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
