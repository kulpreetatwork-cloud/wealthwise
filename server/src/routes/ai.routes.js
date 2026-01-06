import express from 'express';
import {
    chat,
    getInsights,
    analyzeSpending,
    categorizeTransaction,
} from '../controllers/ai.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// AI Chat
router.post('/chat', chat);

// AI Insights
router.get('/insights', getInsights);

// Spending Analysis
router.get('/analyze-spending', analyzeSpending);

// Auto-categorize
router.post('/categorize', categorizeTransaction);

export default router;
