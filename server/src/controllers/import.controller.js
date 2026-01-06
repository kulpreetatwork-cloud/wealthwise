import multer from 'multer';
import { parse } from 'csv-parse';
import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { Readable } from 'stream';

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'), false);
        }
    },
});

export const uploadMiddleware = upload.single('file');

/**
 * @desc    Import transactions from CSV
 * @route   POST /api/transactions/import
 * @access  Private
 */
export const importTransactions = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw ApiError.badRequest('No file uploaded');
    }

    const { accountId, skipFirstRow = true } = req.body;

    // Validate account exists and belongs to user
    const account = await Account.findOne({ _id: accountId, userId: req.user.id });
    if (!account) {
        throw ApiError.notFound('Account not found');
    }

    const results = [];
    const errors = [];
    let rowNumber = 0;

    // Parse CSV from buffer
    const parser = Readable.from(req.file.buffer).pipe(
        parse({
            columns: true,
            skip_empty_lines: true,
            trim: true,
        })
    );

    for await (const row of parser) {
        rowNumber++;

        if (skipFirstRow && rowNumber === 1) continue;

        try {
            // Expected columns: date, type, amount, category, description, merchant
            const transaction = {
                userId: req.user.id,
                accountId,
                date: new Date(row.date || row.Date || row.DATE),
                type: (row.type || row.Type || row.TYPE || 'expense').toLowerCase(),
                amount: Math.abs(parseFloat(row.amount || row.Amount || row.AMOUNT || 0)),
                category: row.category || row.Category || row.CATEGORY || 'Other',
                description: row.description || row.Description || row.DESCRIPTION || '',
                merchant: row.merchant || row.Merchant || row.MERCHANT || '',
            };

            // Validate required fields
            if (isNaN(transaction.date.getTime())) {
                throw new Error('Invalid date');
            }
            if (isNaN(transaction.amount) || transaction.amount <= 0) {
                throw new Error('Invalid amount');
            }
            if (!['income', 'expense', 'transfer'].includes(transaction.type)) {
                transaction.type = 'expense';
            }

            const newTransaction = await Transaction.create(transaction);
            results.push(newTransaction);

            // Update account balance
            const balanceChange = transaction.type === 'income' ? transaction.amount : -transaction.amount;
            await Account.findByIdAndUpdate(accountId, { $inc: { balance: balanceChange } });
        } catch (error) {
            errors.push({ row: rowNumber, error: error.message });
        }
    }

    ApiResponse.success(
        res,
        {
            imported: results.length,
            failed: errors.length,
            errors: errors.slice(0, 10), // Return first 10 errors
        },
        `Imported ${results.length} transactions${errors.length > 0 ? `, ${errors.length} failed` : ''}`
    );
});

/**
 * @desc    Get import template
 * @route   GET /api/transactions/import/template
 * @access  Private
 */
export const getImportTemplate = asyncHandler(async (req, res) => {
    const csv = 'date,type,amount,category,description,merchant\n2024-01-15,expense,50.00,Food & Dining,Lunch at restaurant,Restaurant ABC\n2024-01-16,income,3000.00,Salary,Monthly salary,Employer Inc';

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transaction_import_template.csv');
    res.send(csv);
});

export default {
    uploadMiddleware,
    importTransactions,
    getImportTemplate,
};
