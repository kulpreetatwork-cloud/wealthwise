import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        throw ApiError.notFound('User not found');
    }

    ApiResponse.success(res, user, 'Profile retrieved successfully');
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
    const { profile, role } = req.body;

    const updateData = {};

    // Update profile fields
    if (profile) {
        updateData.profile = {
            ...req.user.profile,
            ...profile,
        };
    }

    // Update role (can only be set once if not already set)
    if (role && !req.user.role) {
        updateData.role = role;
    }

    const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updateData },
        { new: true, runValidators: true }
    );

    if (!user) {
        throw ApiError.notFound('User not found');
    }

    ApiResponse.success(res, user, 'Profile updated successfully');
});

/**
 * @desc    Update user preferences
 * @route   PUT /api/users/preferences
 * @access  Private
 */
export const updatePreferences = asyncHandler(async (req, res) => {
    const { notifications, weeklyReport, theme } = req.body;

    const updateData = {
        'preferences.notifications': notifications ?? req.user.preferences.notifications,
        'preferences.weeklyReport': weeklyReport ?? req.user.preferences.weeklyReport,
        'preferences.theme': theme ?? req.user.preferences.theme,
    };

    const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updateData },
        { new: true, runValidators: true }
    );

    if (!user) {
        throw ApiError.notFound('User not found');
    }

    ApiResponse.success(res, user, 'Preferences updated successfully');
});

/**
 * @desc    Change password
 * @route   PUT /api/users/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
        throw ApiError.notFound('User not found');
    }

    // Check current password
    const isPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
        throw ApiError.badRequest('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    // Clear all refresh tokens (logout from all devices)
    user.refreshTokens = [];
    await user.save();

    // Generate new tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    await user.save({ validateBeforeSave: false });

    // Remove password from output
    user.password = undefined;
    user.refreshTokens = undefined;

    ApiResponse.success(res, {
        user,
        accessToken,
    }, 'Password changed successfully');
});

/**
 * @desc    Delete user account
 * @route   DELETE /api/users/account
 * @access  Private
 */
export const deleteAccount = asyncHandler(async (req, res) => {
    const { password } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
        throw ApiError.notFound('User not found');
    }

    // Verify password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw ApiError.badRequest('Incorrect password');
    }

    // Delete user
    await User.findByIdAndDelete(req.user.id);

    // Clear cookie
    res.cookie('refreshToken', '', {
        httpOnly: true,
        expires: new Date(0),
    });

    ApiResponse.success(res, null, 'Account deleted successfully');
});
