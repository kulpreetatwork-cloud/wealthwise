import express from 'express';
import { getDashboardData, getAnalytics } from '../controllers/dashboard.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/', getDashboardData);
router.get('/analytics', getAnalytics);

export default router;
