import mongoose from 'mongoose';

const billSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Bill name is required'],
            trim: true,
            maxlength: [100, 'Bill name cannot exceed 100 characters'],
        },
        amount: {
            type: Number,
            required: [true, 'Bill amount is required'],
            min: [0.01, 'Amount must be greater than 0'],
        },
        category: {
            type: String,
            required: true,
            enum: ['utilities', 'rent', 'mortgage', 'insurance', 'subscription', 'loan', 'credit_card', 'other'],
        },
        dueDate: {
            type: Date,
            required: [true, 'Due date is required'],
        },
        frequency: {
            type: String,
            required: true,
            enum: ['once', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'],
            default: 'monthly',
        },
        linkedAccountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
        },
        isPaid: {
            type: Boolean,
            default: false,
        },
        paidDate: {
            type: Date,
        },
        autoPay: {
            type: Boolean,
            default: false,
        },
        reminderDays: {
            type: Number,
            default: 3, // Remind 3 days before
            min: 0,
            max: 30,
        },
        reminderSent: {
            type: Boolean,
            default: false,
        },
        notes: {
            type: String,
            maxlength: [500, 'Notes cannot exceed 500 characters'],
        },
        color: {
            type: String,
            default: '#f59e0b',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
billSchema.index({ userId: 1, isActive: 1 });
billSchema.index({ userId: 1, dueDate: 1 });
billSchema.index({ userId: 1, isPaid: 1 });

// Virtual for days until due
billSchema.virtual('daysUntilDue').get(function () {
    const now = new Date();
    const due = new Date(this.dueDate);
    const diff = due - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Virtual for status
billSchema.virtual('status').get(function () {
    if (this.isPaid) return 'paid';
    const days = this.daysUntilDue;
    if (days < 0) return 'overdue';
    if (days <= this.reminderDays) return 'upcoming';
    return 'scheduled';
});

// Static method to get upcoming bills
billSchema.statics.getUpcoming = async function (userId, days = 30) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.find({
        userId,
        isActive: true,
        isPaid: false,
        dueDate: { $gte: now, $lte: futureDate },
    })
        .sort({ dueDate: 1 })
        .populate('linkedAccountId', 'name');
};

// Static method to get overdue bills
billSchema.statics.getOverdue = async function (userId) {
    const now = new Date();

    return this.find({
        userId,
        isActive: true,
        isPaid: false,
        dueDate: { $lt: now },
    })
        .sort({ dueDate: 1 })
        .populate('linkedAccountId', 'name');
};

// Static method to get bills summary
billSchema.statics.getSummary = async function (userId) {
    const now = new Date();
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [unpaid, paid, overdue] = await Promise.all([
        this.find({
            userId,
            isActive: true,
            isPaid: false,
            dueDate: { $lte: monthEnd },
        }),
        this.find({
            userId,
            isActive: true,
            isPaid: true,
            paidDate: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) },
        }),
        this.find({
            userId,
            isActive: true,
            isPaid: false,
            dueDate: { $lt: now },
        }),
    ]);

    const unpaidTotal = unpaid.reduce((sum, b) => sum + b.amount, 0);
    const paidTotal = paid.reduce((sum, b) => sum + b.amount, 0);
    const overdueTotal = overdue.reduce((sum, b) => sum + b.amount, 0);

    return {
        unpaidCount: unpaid.length,
        unpaidTotal,
        paidCount: paid.length,
        paidTotal,
        overdueCount: overdue.length,
        overdueTotal,
        totalMonthly: unpaidTotal + paidTotal,
    };
};

const Bill = mongoose.model('Bill', billSchema);

export default Bill;
