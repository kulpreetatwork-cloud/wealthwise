import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const aiConversationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        title: {
            type: String,
            default: 'New Conversation',
            maxlength: 100,
        },
        messages: [messageSchema],
        context: {
            type: {
                type: String,
                enum: ['general', 'transaction', 'budget', 'goal', 'investment'],
                default: 'general',
            },
            referenceId: {
                type: mongoose.Schema.Types.ObjectId,
            },
        },
        isArchived: {
            type: Boolean,
            default: false,
        },
        lastMessageAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
aiConversationSchema.index({ userId: 1, updatedAt: -1 });
aiConversationSchema.index({ userId: 1, isArchived: 1 });

// Auto-generate title from first message
aiConversationSchema.pre('save', function (next) {
    if (this.isNew && this.messages.length > 0) {
        const firstMessage = this.messages[0].content;
        this.title = firstMessage.substring(0, 50) + (firstMessage.length > 50 ? '...' : '');
    }
    if (this.messages.length > 0) {
        this.lastMessageAt = new Date();
    }
    next();
});

// Static method to get user's conversations
aiConversationSchema.statics.getUserConversations = async function (userId, options = {}) {
    const { limit = 20, skip = 0, includeArchived = false } = options;

    const query = { userId };
    if (!includeArchived) {
        query.isArchived = false;
    }

    return this.find(query)
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('title lastMessageAt context createdAt');
};

// Instance method to add a message
aiConversationSchema.methods.addMessage = async function (role, content) {
    this.messages.push({ role, content });
    this.lastMessageAt = new Date();
    return this.save();
};

// Instance method to get recent messages for context
aiConversationSchema.methods.getRecentMessages = function (count = 10) {
    return this.messages.slice(-count);
};

const AIConversation = mongoose.model('AIConversation', aiConversationSchema);

export default AIConversation;
