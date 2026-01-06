import express from 'express';
import {
    getGoals,
    getGoal,
    createGoal,
    updateGoal,
    contributeToGoal,
    withdrawFromGoal,
    deleteGoal,
    getGoalsSummary,
} from '../controllers/goal.controller.js';
import { protect } from '../middleware/auth.js';
import { validate, goalRules, commonRules } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Summary endpoint (must be before :id routes)
router.get('/summary', getGoalsSummary);

// CRUD routes
router.route('/')
    .get(getGoals)
    .post(validate(goalRules.create), createGoal);

router.route('/:id')
    .all(validate([commonRules.mongoId()]))
    .get(getGoal)
    .put(updateGoal)
    .delete(deleteGoal);

// Contribution routes
router.post('/:id/contribute', contributeToGoal);
router.post('/:id/withdraw', withdrawFromGoal);

export default router;
