import express from 'express';
import {
    register,
    login,
    refreshAccessToken,
    logout,
    logoutAll,
    getMe,
} from '../controllers/auth.controller.js';
import { validate, authRules } from '../middleware/validation.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// Apply stricter rate limiting to auth routes
router.use(authLimiter);

// Public routes
router.post('/register', validate(authRules.register), register);
router.post('/login', validate(authRules.login), login);
router.post('/refresh', refreshAccessToken);

// Protected routes
router.use(protect); // All routes below this require authentication
router.get('/me', getMe);
router.post('/logout', logout);
router.post('/logout-all', logoutAll);

export default router;
