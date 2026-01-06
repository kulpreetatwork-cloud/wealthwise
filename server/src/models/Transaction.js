import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        accountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true,
        },
        type: {
            type: String,
            required: [true, 'Transaction type is required'],
            enum: ['income', 'expense', 'transfer'],
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0.01, 'Amount must be greater than 0'],
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true,
        },
        subcategory: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        merchant: {
            type: String,
            trim: true,
            maxlength: [100, 'Merchant name cannot exceed 100 characters'],
        },
        date: {
            type: Date,
            required: [true, 'Transaction date is required'],
            default: Date.now,
        },
        isRecurring: {
            type: Boolean,
            default: false,
        },
        recurringRule: {
            frequency: {
                type: String,
                enum: ['daily', 'weekly', 'monthly', 'yearly'],
            },
            nextDate: Date,
            endDate: Date,
        },
        tags: [{
            type: String,
            trim: true,
        }],
        aiCategorized: {
            type: Boolean,
            default: false,
        },
        notes: {
            type: String,
            maxlength: [1000, 'Notes cannot exceed 1000 characters'],
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes for common queries
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ userId: 1, accountId: 1 });
transactionSchema.index({ userId: 1, date: -1, type: 1 });

// Static method to get monthly summary
transactionSchema.statics.getMonthlySummary = async function (userId, year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const result = await this.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                date: { $gte: startDate, $lte: endDate },
            },
        },
        {
            $group: {
                _id: '$type',
                total: { $sum: '$amount' },
                count: { $sum: 1 },
            },
        },
    ]);

    const summary = {
        income: 0,
        expense: 0,
        transfer: 0,
        incomeCount: 0,
        expenseCount: 0,
    };

    result.forEach((item) => {
        summary[item._id] = item.total;
        summary[`${item._id}Count`] = item.count;
    });

    summary.net = summary.income - summary.expense;

    return summary;
};

// Static method to get spending by category
transactionSchema.statics.getSpendingByCategory = async function (userId, startDate, endDate) {
    const result = await this.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                type: 'expense',
                date: { $gte: startDate, $lte: endDate },
            },
        },
        {
            $group: {
                _id: '$category',
                total: { $sum: '$amount' },
                count: { $sum: 1 },
            },
        },
        {
            $sort: { total: -1 },
        },
    ]);

    return result;
};

// Static method to get recent transactions
transactionSchema.statics.getRecent = async function (userId, limit = 10) {
    return this.find({ userId })
        .sort({ date: -1 })
        .limit(limit)
        .populate('accountId', 'name type color');
};

// Static method to get daily spending trend
transactionSchema.statics.getDailyTrend = async function (userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const result = await this.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                date: { $gte: startDate },
            },
        },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                    type: '$type',
                },
                total: { $sum: '$amount' },
            },
        },
        {
            $sort: { '_id.date': 1 },
        },
    ]);

    return result;
};

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
