import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Goal name is required'],
            trim: true,
            maxlength: [100, 'Goal name cannot exceed 100 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        targetAmount: {
            type: Number,
            required: [true, 'Target amount is required'],
            min: [1, 'Target amount must be at least $1'],
        },
        currentAmount: {
            type: Number,
            default: 0,
            min: 0,
        },
        category: {
            type: String,
            required: true,
            enum: [
                'Emergency Fund',
                'Vacation',
                'Home',
                'Car',
                'Education',
                'Retirement',
                'Wedding',
                'Electronics',
                'Debt Payoff',
                'Investment',
                'Other',
            ],
        },
        targetDate: {
            type: Date,
            required: [true, 'Target date is required'],
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },
        autoContribute: {
            enabled: {
                type: Boolean,
                default: false,
            },
            amount: {
                type: Number,
                default: 0,
            },
            frequency: {
                type: String,
                enum: ['daily', 'weekly', 'biweekly', 'monthly'],
                default: 'monthly',
            },
        },
        linkedAccountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
        },
        color: {
            type: String,
            default: '#6366f1',
        },
        icon: {
            type: String,
            default: 'target',
        },
        isCompleted: {
            type: Boolean,
            default: false,
        },
        completedAt: {
            type: Date,
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
goalSchema.index({ userId: 1, isActive: 1 });
goalSchema.index({ userId: 1, category: 1 });
goalSchema.index({ userId: 1, targetDate: 1 });

// Virtual for progress percentage
goalSchema.virtual('progress').get(function () {
    if (this.targetAmount === 0) return 0;
    return Math.min(100, Math.round((this.currentAmount / this.targetAmount) * 100));
});

// Virtual for remaining amount
goalSchema.virtual('remaining').get(function () {
    return Math.max(0, this.targetAmount - this.currentAmount);
});

// Virtual for days left
goalSchema.virtual('daysLeft').get(function () {
    const now = new Date();
    const target = new Date(this.targetDate);
    const diff = target - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

// Virtual for required monthly contribution
goalSchema.virtual('monthlyRequired').get(function () {
    const remaining = this.remaining;
    const daysLeft = this.daysLeft;
    if (daysLeft <= 0) return remaining;
    const monthsLeft = daysLeft / 30;
    return Math.ceil(remaining / monthsLeft);
});

// Virtual for on-track status
goalSchema.virtual('status').get(function () {
    if (this.isCompleted) return 'completed';

    const progress = this.progress;
    const daysTotal = Math.ceil((new Date(this.targetDate) - new Date(this.createdAt)) / (1000 * 60 * 60 * 24));
    const daysPassed = daysTotal - this.daysLeft;
    const expectedProgress = daysTotal > 0 ? (daysPassed / daysTotal) * 100 : 0;

    if (progress >= expectedProgress * 0.9) return 'on-track';
    if (progress >= expectedProgress * 0.5) return 'behind';
    return 'at-risk';
});

// Static method to get active goals summary
goalSchema.statics.getGoalsSummary = async function (userId) {
    const goals = await this.find({ userId, isActive: true });

    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const completed = goals.filter((g) => g.isCompleted).length;
    const inProgress = goals.filter((g) => !g.isCompleted).length;

    return {
        totalGoals: goals.length,
        totalTarget,
        totalSaved,
        overallProgress: totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0,
        completed,
        inProgress,
    };
};

// Pre-save hook to check completion
goalSchema.pre('save', function (next) {
    if (this.currentAmount >= this.targetAmount && !this.isCompleted) {
        this.isCompleted = true;
        this.completedAt = new Date();
    }
    next();
});

const Goal = mongoose.model('Goal', goalSchema);

export default Goal;
