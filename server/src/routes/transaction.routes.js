import express from 'express';
import {
    getTransactions,
    getTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionStats,
} from '../controllers/transaction.controller.js';
import { protect, requireRole } from '../middleware/auth.js';
import { validate, transactionRules, commonRules } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Stats endpoint (must be before :id route)
router.get('/stats', getTransactionStats);

// CRUD routes
router.route('/')
    .get(validate(commonRules.pagination), getTransactions)
    .post(validate(transactionRules.create), createTransaction);

router.route('/:id')
    .all(validate([commonRules.mongoId()]))
    .get(getTransaction)
    .put(updateTransaction)
    .delete(deleteTransaction);

export default router;
