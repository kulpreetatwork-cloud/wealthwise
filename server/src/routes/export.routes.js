import express from 'express';
import {
    exportTransactionsCSV,
    exportFinancialSummary,
    exportAccountsCSV,
    exportPDF,
} from '../controllers/export.controller.js';
import { uploadMiddleware, importTransactions, getImportTemplate } from '../controllers/import.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Export routes
router.get('/transactions', exportTransactionsCSV);
router.get('/accounts', exportAccountsCSV);
router.get('/summary', exportFinancialSummary);
router.get('/pdf', exportPDF);

// Import routes
router.get('/import/template', getImportTemplate);
router.post('/import', uploadMiddleware, importTransactions);

export default router;
