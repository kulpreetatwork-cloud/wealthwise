import express from 'express';
import {
    getBudgets,
    getBudget,
    createBudget,
    updateBudget,
    deleteBudget,
    getBudgetSummary,
} from '../controllers/budget.controller.js';
import { protect } from '../middleware/auth.js';
import { validate, budgetRules, commonRules } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Summary endpoint (must be before :id route)
router.get('/summary', getBudgetSummary);

// CRUD routes
router.route('/')
    .get(getBudgets)
    .post(validate(budgetRules.create), createBudget);

router.route('/:id')
    .all(validate([commonRules.mongoId()]))
    .get(getBudget)
    .put(updateBudget)
    .delete(deleteBudget);

export default router;
