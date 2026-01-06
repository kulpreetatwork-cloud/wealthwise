import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';
import Budget from '../models/Budget.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc    Export transactions as CSV
 * @route   GET /api/export/transactions
 * @access  Private
 */
export const exportTransactionsCSV = asyncHandler(async (req, res) => {
    const { startDate, endDate, type, accountId } = req.query;

    const filter = { userId: req.user.id };
    if (type) filter.type = type;
    if (accountId) filter.accountId = accountId;
    if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter)
        .sort({ date: -1 })
        .populate('accountId', 'name');

    // CSV header
    const headers = ['Date', 'Type', 'Amount', 'Category', 'Description', 'Merchant', 'Account', 'Notes'];

    // CSV rows
    const rows = transactions.map(t => [
        new Date(t.date).toISOString().split('T')[0],
        t.type,
        t.amount.toFixed(2),
        t.category,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        `"${(t.merchant || '').replace(/"/g, '""')}"`,
        t.accountId?.name || '',
        `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(',')),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csvContent);
});

/**
 * @desc    Export financial summary as JSON (for PDF generation on frontend)
 * @route   GET /api/export/summary
 * @access  Private
 */
export const exportFinancialSummary = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const [accounts, transactions, budgets] = await Promise.all([
        Account.find({ userId: req.user.id, isActive: true }),
        Transaction.find({
            userId: req.user.id,
            ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
        }).sort({ date: -1 }),
        Budget.find({ userId: req.user.id, isActive: true }),
    ]);

    // Calculate summaries
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    // Spending by category
    const spendingByCategory = {};
    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + t.amount;
        });

    // Account balances
    const accountBalances = accounts.map(acc => ({
        name: acc.name,
        type: acc.type,
        balance: acc.balance,
    }));

    // Budget status
    const budgetStatus = budgets.map(b => ({
        name: b.name,
        category: b.category,
        amount: b.amount,
        spent: b.spent,
        remaining: b.amount - b.spent,
        percentUsed: b.amount > 0 ? Math.round((b.spent / b.amount) * 100) : 0,
    }));

    const summary = {
        generatedAt: new Date().toISOString(),
        period: {
            start: startDate || 'All time',
            end: endDate || 'Present',
        },
        overview: {
            totalBalance,
            totalIncome: income,
            totalExpenses: expenses,
            netSavings: income - expenses,
            savingsRate: income > 0 ? Math.round(((income - expenses) / income) * 100) : 0,
        },
        accounts: accountBalances,
        spendingByCategory: Object.entries(spendingByCategory)
            .sort(([, a], [, b]) => b - a)
            .map(([category, amount]) => ({ category, amount })),
        budgets: budgetStatus,
        transactionCount: transactions.length,
    };

    ApiResponse.success(res, summary, 'Financial summary exported');
});

/**
 * @desc    Export accounts as CSV
 * @route   GET /api/export/accounts
 * @access  Private
 */
export const exportAccountsCSV = asyncHandler(async (req, res) => {
    const accounts = await Account.find({ userId: req.user.id, isActive: true });

    const headers = ['Name', 'Type', 'Balance', 'Currency', 'Institution'];

    const rows = accounts.map(acc => [
        `"${acc.name}"`,
        acc.type,
        acc.balance.toFixed(2),
        acc.currency,
        `"${acc.institution || ''}"`,
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(',')),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=accounts.csv');
    res.send(csvContent);
});

/**
 * @desc    Export financial report as PDF
 * @route   GET /api/export/pdf
 * @access  Private
 */
export const exportPDF = asyncHandler(async (req, res) => {
    const PDFDocument = (await import('pdfkit')).default;
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const [accounts, transactions, budgets] = await Promise.all([
        Account.find({ userId: req.user.id, isActive: true }),
        Transaction.find({
            userId: req.user.id,
            ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
        }).sort({ date: -1 }).limit(50),
        Budget.find({ userId: req.user.id, isActive: true }),
    ]);

    // Calculate summaries
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=financial_report.pdf');

    doc.pipe(res);

    // Header
    doc.fontSize(24).fillColor('#6366f1').text('WealthWise Financial Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).fillColor('#64748b').text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    // Overview Section
    doc.fontSize(16).fillColor('#1e293b').text('Financial Overview');
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#e2e8f0');
    doc.moveDown();

    doc.fontSize(12).fillColor('#334155');
    doc.text(`Total Balance: $${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    doc.text(`Total Income: $${income.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    doc.text(`Total Expenses: $${expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    doc.text(`Net Savings: $${(income - expenses).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    doc.moveDown(2);

    // Accounts Section
    doc.fontSize(16).fillColor('#1e293b').text('Accounts');
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#e2e8f0');
    doc.moveDown();

    doc.fontSize(10).fillColor('#334155');
    accounts.forEach(acc => {
        doc.text(`${acc.name} (${acc.type}): $${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    });
    doc.moveDown(2);

    // Budgets Section
    if (budgets.length > 0) {
        doc.fontSize(16).fillColor('#1e293b').text('Budget Status');
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#e2e8f0');
        doc.moveDown();

        doc.fontSize(10).fillColor('#334155');
        budgets.forEach(b => {
            const percentUsed = b.amount > 0 ? Math.round((b.spent / b.amount) * 100) : 0;
            const status = percentUsed > 100 ? 'OVER' : percentUsed > 80 ? 'WARNING' : 'OK';
            doc.text(`${b.name}: $${b.spent.toFixed(2)} / $${b.amount.toFixed(2)} (${percentUsed}% - ${status})`);
        });
        doc.moveDown(2);
    }

    // Recent Transactions
    doc.fontSize(16).fillColor('#1e293b').text('Recent Transactions');
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#e2e8f0');
    doc.moveDown();

    doc.fontSize(9).fillColor('#334155');
    transactions.slice(0, 15).forEach(t => {
        const sign = t.type === 'income' ? '+' : '-';
        const date = new Date(t.date).toLocaleDateString();
        doc.text(`${date} | ${t.category} | ${sign}$${t.amount.toFixed(2)} | ${t.description || t.merchant || 'N/A'}`);
    });

    // Footer
    doc.moveDown(2);
    doc.fontSize(8).fillColor('#94a3b8').text('This report was generated by WealthWise AI Finance Platform', { align: 'center' });

    doc.end();
});

