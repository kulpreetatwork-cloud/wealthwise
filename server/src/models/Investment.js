import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Investment name is required'],
            trim: true,
            maxlength: [100, 'Investment name cannot exceed 100 characters'],
        },
        symbol: {
            type: String,
            trim: true,
            uppercase: true,
            maxlength: [10, 'Symbol cannot exceed 10 characters'],
        },
        type: {
            type: String,
            required: true,
            enum: ['stock', 'etf', 'mutual_fund', 'bond', 'crypto', 'real_estate', 'commodity', 'other'],
        },
        shares: {
            type: Number,
            required: true,
            min: [0, 'Shares cannot be negative'],
        },
        purchasePrice: {
            type: Number,
            required: [true, 'Purchase price is required'],
            min: [0, 'Purchase price cannot be negative'],
        },
        currentPrice: {
            type: Number,
            default: 0,
        },
        purchaseDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        linkedAccountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
        },
        notes: {
            type: String,
            maxlength: [500, 'Notes cannot exceed 500 characters'],
        },
        color: {
            type: String,
            default: '#8b5cf6',
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
investmentSchema.index({ userId: 1, isActive: 1 });
investmentSchema.index({ userId: 1, type: 1 });

// Virtual for total invested
investmentSchema.virtual('totalInvested').get(function () {
    return (this.shares ?? 0) * (this.purchasePrice ?? 0);
});

// Virtual for current value
investmentSchema.virtual('currentValue').get(function () {
    return (this.shares ?? 0) * (this.currentPrice ?? this.purchasePrice ?? 0);
});

// Virtual for gain/loss
investmentSchema.virtual('gainLoss').get(function () {
    const invested = this.totalInvested;
    const current = this.currentValue;
    return current - invested;
});

// Virtual for gain/loss percentage
investmentSchema.virtual('gainLossPercent').get(function () {
    const invested = this.totalInvested;
    if (invested === 0) return 0;
    return ((this.gainLoss / invested) * 100).toFixed(2);
});

// Static method to get portfolio summary
investmentSchema.statics.getPortfolioSummary = async function (userId) {
    const investments = await this.find({ userId, isActive: true });

    let totalInvested = 0;
    let currentValue = 0;
    const byType = {};

    investments.forEach((inv) => {
        const invested = inv.totalInvested;
        const current = inv.currentValue;
        totalInvested += invested;
        currentValue += current;

        if (!byType[inv.type]) {
            byType[inv.type] = { invested: 0, current: 0, count: 0 };
        }
        byType[inv.type].invested += invested;
        byType[inv.type].current += current;
        byType[inv.type].count += 1;
    });

    const totalGainLoss = currentValue - totalInvested;
    const totalGainLossPercent = totalInvested > 0 ? ((totalGainLoss / totalInvested) * 100).toFixed(2) : 0;

    return {
        totalInvestments: investments.length,
        totalInvested,
        currentValue,
        totalGainLoss,
        totalGainLossPercent,
        byType,
    };
};

const Investment = mongoose.model('Investment', investmentSchema);

export default Investment;
