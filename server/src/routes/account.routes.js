import express from 'express';
import {
    getAccounts,
    createAccount,
    getAccount,
    updateAccount,
    deleteAccount,
    updateBalance,
    getAccountSummary,
} from '../controllers/account.controller.js';
import { protect, requireRole } from '../middleware/auth.js';
import { validate, accountRules, commonRules } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Account summary (must be before :id routes)
router.get('/summary', getAccountSummary);

// CRUD routes
router.route('/')
    .get(getAccounts)
    .post(validate(accountRules.create), createAccount);

router.route('/:id')
    .all(validate([commonRules.mongoId()]))
    .get(getAccount)
    .put(updateAccount)
    .delete(deleteAccount);

router.put('/:id/balance', updateBalance);

export default router;
