import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Budget name is required'],
            trim: true,
            maxlength: [100, 'Budget name cannot exceed 100 characters'],
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true,
        },
        amount: {
            type: Number,
            required: [true, 'Budget amount is required'],
            min: [0.01, 'Budget amount must be greater than 0'],
        },
        spent: {
            type: Number,
            default: 0,
        },
        period: {
            type: String,
            required: true,
            enum: ['weekly', 'monthly', 'yearly'],
            default: 'monthly',
        },
        startDate: {
            type: Date,
            required: true,
            default: () => {
                const now = new Date();
                return new Date(now.getFullYear(), now.getMonth(), 1);
            },
        },
        endDate: {
            type: Date,
        },
        isRecurring: {
            type: Boolean,
            default: true,
        },
        alertThreshold: {
            type: Number,
            default: 80, // Alert when 80% spent
            min: 0,
            max: 100,
        },
        alertSent: {
            type: Boolean,
            default: false,
        },
        color: {
            type: String,
            default: '#6366f1',
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
budgetSchema.index({ userId: 1, isActive: 1 });
budgetSchema.index({ userId: 1, category: 1 });
budgetSchema.index({ userId: 1, period: 1, startDate: 1 });

// Virtual for remaining amount
budgetSchema.virtual('remaining').get(function () {
    return Math.max(0, this.amount - this.spent);
});

// Virtual for percentage used
budgetSchema.virtual('percentUsed').get(function () {
    if (this.amount === 0) return 0;
    return Math.min(100, Math.round((this.spent / this.amount) * 100));
});

// Virtual for status
budgetSchema.virtual('status').get(function () {
    const percent = this.percentUsed;
    if (percent >= 100) return 'exceeded';
    if (percent >= this.alertThreshold) return 'warning';
    return 'on-track';
});

// Static method to get current period budgets
budgetSchema.statics.getCurrentBudgets = async function (userId) {
    const now = new Date();

    return this.find({
        userId,
        isActive: true,
        startDate: { $lte: now },
        $or: [
            { endDate: { $gte: now } },
            { endDate: null },
            { isRecurring: true },
        ],
    }).sort({ percentUsed: -1 });
};

// Static method to update budget spent amounts from transactions
budgetSchema.statics.updateSpentAmounts = async function (userId, category, amount, isAdd = true) {
    const now = new Date();

    // Find active budgets for this category
    const budgets = await this.find({
        userId,
        category,
        isActive: true,
        startDate: { $lte: now },
        $or: [
            { endDate: { $gte: now } },
            { endDate: null },
        ],
    });

    for (const budget of budgets) {
        if (isAdd) {
            budget.spent += amount;
        } else {
            budget.spent = Math.max(0, budget.spent - amount);
        }
        await budget.save();
    }

    return budgets;
};

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;
