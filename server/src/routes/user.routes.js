import express from 'express';
import {
    getProfile,
    updateProfile,
    updatePreferences,
    changePassword,
    deleteAccount,
} from '../controllers/user.controller.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import {
    updateProfileSchema,
    updatePreferencesSchema,
    changePasswordSchema,
} from '../validators/auth.validator.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', validate(updateProfileSchema), updateProfile);
router.put('/preferences', validate(updatePreferencesSchema), updatePreferences);
router.put('/change-password', validate(changePasswordSchema), changePassword);
router.delete('/account', deleteAccount);

export default router;
