import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Account name is required'],
            trim: true,
            maxlength: [100, 'Account name cannot exceed 100 characters'],
        },
        type: {
            type: String,
            required: [true, 'Account type is required'],
            enum: ['checking', 'savings', 'credit', 'investment', 'cash'],
        },
        balance: {
            type: Number,
            required: true,
            default: 0,
        },
        currency: {
            type: String,
            default: 'USD',
            enum: ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'],
        },
        institution: {
            type: String,
            trim: true,
            maxlength: [100, 'Institution name cannot exceed 100 characters'],
        },
        color: {
            type: String,
            default: '#6366f1', // Default to primary color
        },
        icon: {
            type: String,
            default: 'wallet',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        includeInTotal: {
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
accountSchema.index({ userId: 1, isActive: 1 });
accountSchema.index({ userId: 1, type: 1 });

// Virtual for formatted balance
accountSchema.virtual('formattedBalance').get(function () {
    const symbols = {
        USD: '$',
        EUR: '€',
        GBP: '£',
        INR: '₹',
        JPY: '¥',
        CAD: 'C$',
        AUD: 'A$',
    };
    const symbol = symbols[this.currency] || '$';
    const balance = this.balance ?? 0;
    return `${symbol}${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
});

// Static method to get total balance for user
accountSchema.statics.getTotalBalance = async function (userId) {
    const result = await this.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                isActive: true,
                includeInTotal: true,
            },
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$balance' },
                count: { $sum: 1 },
            },
        },
    ]);

    return result[0] || { total: 0, count: 0 };
};

// Static method to get balance by account type
accountSchema.statics.getBalanceByType = async function (userId) {
    const result = await this.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                isActive: true,
            },
        },
        {
            $group: {
                _id: '$type',
                total: { $sum: '$balance' },
                count: { $sum: 1 },
            },
        },
    ]);

    return result;
};

const Account = mongoose.model('Account', accountSchema);

export default Account;
