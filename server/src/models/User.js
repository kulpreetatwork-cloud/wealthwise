import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config/index.js';

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false, // Don't include password in queries by default
        },
        role: {
            type: String,
            enum: ['individual', 'student', 'business'],
            default: null, // Role is selected after registration
        },
        profile: {
            firstName: {
                type: String,
                trim: true,
                maxlength: [50, 'First name cannot exceed 50 characters'],
            },
            lastName: {
                type: String,
                trim: true,
                maxlength: [50, 'Last name cannot exceed 50 characters'],
            },
            avatar: {
                type: String,
                default: null,
            },
            phone: {
                type: String,
                trim: true,
            },
            currency: {
                type: String,
                default: 'USD',
                enum: ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'],
            },
            timezone: {
                type: String,
                default: 'UTC',
            },
        },
        preferences: {
            notifications: {
                type: Boolean,
                default: true,
            },
            weeklyReport: {
                type: Boolean,
                default: true,
            },
            theme: {
                type: String,
                enum: ['dark', 'light'],
                default: 'dark',
            },
        },
        refreshTokens: [{
            token: String,
            createdAt: {
                type: Date,
                default: Date.now,
                expires: 7 * 24 * 60 * 60, // Auto-delete after 7 days
            },
        }],
        isVerified: {
            type: Boolean,
            default: false,
        },
        lastLogin: {
            type: Date,
            default: null,
        },
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual for full name
userSchema.virtual('fullName').get(function () {
    if (this.profile?.firstName && this.profile?.lastName) {
        return `${this.profile.firstName} ${this.profile.lastName}`;
    }
    return this.profile?.firstName || 'User';
});

// Index for faster queries
userSchema.index({ 'refreshTokens.token': 1 });

// Pre-save middleware - hash password
userSchema.pre('save', async function (next) {
    // Only hash password if it's modified
    if (!this.isModified('password')) return next();

    // Hash password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Pre-save middleware - update passwordChangedAt
userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    // Subtract 1 second to ensure token is created after password change
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

// Instance method - check password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method - generate access token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            id: this._id,
            email: this.email,
            role: this.role,
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expire }
    );
};

// Instance method - generate refresh token
userSchema.methods.generateRefreshToken = function () {
    const refreshToken = jwt.sign(
        { id: this._id },
        config.jwt.refreshSecret,
        { expiresIn: config.jwt.refreshExpire }
    );

    // Store hashed version
    this.refreshTokens.push({
        token: crypto.createHash('sha256').update(refreshToken).digest('hex'),
    });

    return refreshToken;
};

// Instance method - check if password changed after token was issued
userSchema.methods.changedPasswordAfter = function (tokenTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return tokenTimestamp < changedTimestamp;
    }
    return false;
};

// Instance method - generate password reset token
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

// Instance method - remove refresh token
userSchema.methods.removeRefreshToken = function (tokenToRemove) {
    const hashedToken = crypto.createHash('sha256').update(tokenToRemove).digest('hex');
    this.refreshTokens = this.refreshTokens.filter(
        (rt) => rt.token !== hashedToken
    );
};

// Instance method - validate refresh token
userSchema.methods.validateRefreshToken = function (token) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    return this.refreshTokens.some((rt) => rt.token === hashedToken);
};

// Static method - clean up expired refresh tokens
userSchema.statics.cleanupExpiredTokens = async function () {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await this.updateMany(
        {},
        {
            $pull: {
                refreshTokens: { createdAt: { $lt: sevenDaysAgo } },
            },
        }
    );
};

const User = mongoose.model('User', userSchema);

export default User;
