import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import config from '../config/index.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
    const { email, password, profile } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw ApiError.conflict('Email already registered');
    }

    // Create user
    const user = await User.create({
        email,
        password,
        profile: profile || {},
    });

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    await user.save({ validateBeforeSave: false });

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Remove password from output
    user.password = undefined;
    user.refreshTokens = undefined;

    ApiResponse.created(res, {
        user,
        accessToken,
    }, 'Registration successful');
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw ApiError.unauthorized('Invalid email or password');
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw ApiError.unauthorized('Invalid email or password');
    }

    // Update last login
    user.lastLogin = new Date();

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    await user.save({ validateBeforeSave: false });

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Remove sensitive data from output
    user.password = undefined;
    user.refreshTokens = undefined;

    ApiResponse.success(res, {
        user,
        accessToken,
    }, 'Login successful');
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
export const refreshAccessToken = asyncHandler(async (req, res) => {
    // Get refresh token from cookie or body
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
        throw ApiError.unauthorized('No refresh token provided');
    }

    try {
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);

        // Find user
        const user = await User.findById(decoded.id);
        if (!user) {
            throw ApiError.unauthorized('User not found');
        }

        // Validate refresh token exists in user's tokens
        if (!user.validateRefreshToken(refreshToken)) {
            throw ApiError.unauthorized('Invalid refresh token');
        }

        // Generate new access token
        const accessToken = user.generateAccessToken();

        ApiResponse.success(res, { accessToken }, 'Token refreshed');
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            throw ApiError.unauthorized('Invalid or expired refresh token');
        }
        throw error;
    }
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken && req.user) {
        // Remove refresh token from user
        req.user.removeRefreshToken(refreshToken);
        await req.user.save({ validateBeforeSave: false });
    }

    // Clear cookie
    res.cookie('refreshToken', '', {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'strict',
        expires: new Date(0),
    });

    ApiResponse.success(res, null, 'Logged out successfully');
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        throw ApiError.notFound('User not found');
    }

    ApiResponse.success(res, user, 'User retrieved successfully');
});

/**
 * @desc    Logout from all devices
 * @route   POST /api/auth/logout-all
 * @access  Private
 */
export const logoutAll = asyncHandler(async (req, res) => {
    // Clear all refresh tokens
    req.user.refreshTokens = [];
    await req.user.save({ validateBeforeSave: false });

    // Clear cookie
    res.cookie('refreshToken', '', {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'strict',
        expires: new Date(0),
    });

    ApiResponse.success(res, null, 'Logged out from all devices');
});
