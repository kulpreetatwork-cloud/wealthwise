import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc    Get dashboard overview data
 * @route   GET /api/dashboard
 * @access  Private
 */
export const getDashboardData = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    // Get all data in parallel
    const [
        accounts,
        totalBalance,
        currentMonthSummary,
        lastMonthSummary,
        recentTransactions,
        spendingByCategory,
        dailyTrend,
    ] = await Promise.all([
        Account.find({ userId, isActive: true }).sort({ balance: -1 }),
        Account.getTotalBalance(userId),
        Transaction.getMonthlySummary(userId, currentYear, currentMonth),
        Transaction.getMonthlySummary(userId, lastMonthYear, lastMonth),
        Transaction.getRecent(userId, 5),
        Transaction.getSpendingByCategory(
            userId,
            new Date(currentYear, currentMonth - 1, 1),
            new Date(currentYear, currentMonth, 0, 23, 59, 59)
        ),
        Transaction.getDailyTrend(userId, 30),
    ]);

    // Calculate changes from last month
    const incomeChange = lastMonthSummary.income > 0
        ? ((currentMonthSummary.income - lastMonthSummary.income) / lastMonthSummary.income * 100)
        : 0;
    const expenseChange = lastMonthSummary.expense > 0
        ? ((currentMonthSummary.expense - lastMonthSummary.expense) / lastMonthSummary.expense * 100)
        : 0;

    // Process daily trend for chart
    const trendMap = new Map();
    dailyTrend.forEach((item) => {
        const date = item._id.date;
        if (!trendMap.has(date)) {
            trendMap.set(date, { date, income: 0, expense: 0 });
        }
        trendMap.get(date)[item._id.type] = item.total;
    });
    const trendData = Array.from(trendMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    const dashboardData = {
        overview: {
            totalBalance: totalBalance.total,
            accountCount: totalBalance.count,
            monthlyIncome: currentMonthSummary.income,
            monthlyExpense: currentMonthSummary.expense,
            monthlyNet: currentMonthSummary.net,
            incomeChange: Math.round(incomeChange),
            expenseChange: Math.round(expenseChange),
        },
        accounts: accounts.slice(0, 4), // Top 4 accounts
        recentTransactions,
        spendingByCategory: spendingByCategory.slice(0, 6), // Top 6 categories
        trendData,
    };

    ApiResponse.success(res, dashboardData, 'Dashboard data retrieved successfully');
});

/**
 * @desc    Get analytics data
 * @route   GET /api/dashboard/analytics
 * @access  Private
 */
export const getAnalytics = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { period = '30' } = req.query;
    const days = parseInt(period, 10);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const [spendingByCategory, dailyTrend] = await Promise.all([
        Transaction.getSpendingByCategory(userId, startDate, new Date()),
        Transaction.getDailyTrend(userId, days),
    ]);

    // Calculate total spending
    const totalSpending = spendingByCategory.reduce((sum, cat) => sum + cat.total, 0);

    // Add percentage to each category
    const categoriesWithPercentage = spendingByCategory.map((cat) => ({
        ...cat,
        category: cat._id,
        percentage: totalSpending > 0 ? Math.round((cat.total / totalSpending) * 100) : 0,
    }));

    // Process trend data
    const trendMap = new Map();
    dailyTrend.forEach((item) => {
        const date = item._id.date;
        if (!trendMap.has(date)) {
            trendMap.set(date, { date, income: 0, expense: 0 });
        }
        trendMap.get(date)[item._id.type] = item.total;
    });
    const trendData = Array.from(trendMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    ApiResponse.success(res, {
        totalSpending,
        spendingByCategory: categoriesWithPercentage,
        trendData,
        period: days,
    }, 'Analytics data retrieved successfully');
});
