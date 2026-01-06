import Groq from 'groq-sdk';
import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';
import Budget from '../models/Budget.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import config from '../config/index.js';

// Initialize Groq client
const groq = new Groq({
    apiKey: config.groq?.apiKey || process.env.GROQ_API_KEY,
});

// System prompt for financial assistant
const FINANCIAL_ASSISTANT_PROMPT = `You are WealthWise AI, an expert financial assistant. You help users manage their personal finances, understand their spending patterns, and make better financial decisions.

Your capabilities:
- Analyze spending patterns and provide insights
- Answer questions about personal finance, budgeting, and investing
- Provide personalized recommendations based on user's financial data
- Help users set and achieve financial goals
- Explain complex financial concepts in simple terms

Guidelines:
- Be friendly, professional, and encouraging
- Give specific, actionable advice when possible
- Use the user's actual financial data when provided in context
- Be concise but thorough
- Never recommend specific stocks or guarantee returns
- Encourage healthy financial habits
- Format responses with markdown for better readability
- Use bullet points and headers for complex answers`;

/**
 * @desc    Chat with AI financial assistant
 * @route   POST /api/ai/chat
 * @access  Private
 */
export const chat = asyncHandler(async (req, res) => {
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string') {
        throw ApiError.badRequest('Message is required');
    }

    // Get user's financial context
    const [accounts, recentTransactions, budgets] = await Promise.all([
        Account.find({ userId: req.user.id, isActive: true }),
        Transaction.find({ userId: req.user.id })
            .sort({ date: -1 })
            .limit(20),
        Budget.find({ userId: req.user.id, isActive: true }),
    ]);

    // Calculate financial summary for context
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const monthlyIncome = recentTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    const monthlyExpenses = recentTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    // Prepare financial context
    const financialContext = `
User's Current Financial Snapshot:
- Total Balance: $${totalBalance.toLocaleString()}
- Recent Income: $${monthlyIncome.toLocaleString()}
- Recent Expenses: $${monthlyExpenses.toLocaleString()}
- Number of Accounts: ${accounts.length}
- Active Budgets: ${budgets.length}

Recent Spending Categories: ${[...new Set(recentTransactions.filter(t => t.type === 'expense').map(t => t.category))].slice(0, 5).join(', ') || 'None yet'}
`;

    // Build messages array
    const messages = [
        { role: 'system', content: FINANCIAL_ASSISTANT_PROMPT + '\n\n' + financialContext },
        ...conversationHistory.slice(-10).map(msg => ({
            role: msg.role,
            content: msg.content,
        })),
        { role: 'user', content: message },
    ];

    try {
        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages,
            temperature: 0.7,
            max_tokens: 1024,
            top_p: 1,
        });

        const assistantMessage = completion.choices[0]?.message?.content || 'I apologize, I was unable to generate a response.';

        ApiResponse.success(res, {
            message: assistantMessage,
            usage: completion.usage,
        }, 'AI response generated');
    } catch (error) {
        console.error('Groq API Error:', error);
        throw ApiError.internal('Failed to get AI response. Please try again.');
    }
});

/**
 * @desc    Get AI-generated financial insights
 * @route   GET /api/ai/insights
 * @access  Private
 */
export const getInsights = asyncHandler(async (req, res) => {
    // Get user's financial data
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [accounts, transactions, budgets] = await Promise.all([
        Account.find({ userId: req.user.id, isActive: true }),
        Transaction.find({
            userId: req.user.id,
            date: { $gte: thirtyDaysAgo },
        }).sort({ date: -1 }),
        Budget.find({ userId: req.user.id, isActive: true }),
    ]);

    // Calculate metrics
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

    // Spending by category
    const spendingByCategory = {};
    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + t.amount;
        });

    // Sort by amount
    const topCategories = Object.entries(spendingByCategory)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    // Prepare data summary for AI
    const dataSummary = `
Financial Data for the Last 30 Days:
- Total Balance: $${totalBalance.toLocaleString()}
- Total Income: $${income.toLocaleString()}
- Total Expenses: $${expenses.toLocaleString()}
- Net Savings: $${(income - expenses).toLocaleString()}
- Savings Rate: ${savingsRate.toFixed(1)}%
- Number of Transactions: ${transactions.length}

Top Spending Categories:
${topCategories.map(([cat, amt]) => `- ${cat}: $${amt.toLocaleString()}`).join('\n')}

Active Budgets: ${budgets.length}
Budget Performance: ${budgets.map(b => `${b.category}: ${b.percentUsed || 0}% used`).join(', ') || 'No budgets set'}
`;

    const prompt = `Based on this financial data, provide 3-5 personalized financial insights and recommendations. Be specific and actionable. Format with markdown headers for each insight.

${dataSummary}

Generate insights covering:
1. Spending patterns and areas to optimize
2. Budget adherence and suggestions
3. Savings opportunities
4. Overall financial health assessment`;

    try {
        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: FINANCIAL_ASSISTANT_PROMPT },
                { role: 'user', content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 1500,
        });

        const insights = completion.choices[0]?.message?.content || 'Unable to generate insights at this time.';

        ApiResponse.success(res, {
            insights,
            summary: {
                totalBalance,
                income,
                expenses,
                savingsRate: Math.round(savingsRate),
                topCategories: topCategories.map(([category, amount]) => ({ category, amount })),
            },
        }, 'Financial insights generated');
    } catch (error) {
        console.error('Groq API Error:', error);
        throw ApiError.internal('Failed to generate insights. Please try again.');
    }
});

/**
 * @desc    Get AI spending analysis
 * @route   GET /api/ai/analyze-spending
 * @access  Private
 */
export const analyzeSpending = asyncHandler(async (req, res) => {
    const { period = 30 } = req.query;
    const days = parseInt(period, 10);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const transactions = await Transaction.find({
        userId: req.user.id,
        type: 'expense',
        date: { $gte: startDate },
    }).sort({ date: -1 });

    if (transactions.length === 0) {
        return ApiResponse.success(res, {
            analysis: 'No spending data available for the selected period. Start adding transactions to get personalized analysis.',
            suggestions: [],
        }, 'No data to analyze');
    }

    // Calculate spending metrics
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const avgTransaction = totalSpent / transactions.length;

    const categoryBreakdown = {};
    transactions.forEach(t => {
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
    });

    const prompt = `Analyze this spending data and provide actionable recommendations:

Total Spent: $${totalSpent.toLocaleString()}
Period: Last ${days} days
Number of Transactions: ${transactions.length}
Average Transaction: $${avgTransaction.toFixed(2)}

Spending by Category:
${Object.entries(categoryBreakdown)
            .sort(([, a], [, b]) => b - a)
            .map(([cat, amt]) => `- ${cat}: $${amt.toLocaleString()} (${((amt / totalSpent) * 100).toFixed(1)}%)`)
            .join('\n')}

Provide:
1. A brief analysis of spending patterns
2. 3 specific areas where spending could be reduced
3. Comparison to typical benchmarks if relevant
4. One positive observation about their spending

Format with markdown.`;

    try {
        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: FINANCIAL_ASSISTANT_PROMPT },
                { role: 'user', content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 1200,
        });

        const analysis = completion.choices[0]?.message?.content || 'Unable to analyze spending.';

        ApiResponse.success(res, {
            analysis,
            metrics: {
                totalSpent,
                transactionCount: transactions.length,
                avgTransaction: Math.round(avgTransaction * 100) / 100,
                period: days,
                categoryBreakdown: Object.entries(categoryBreakdown)
                    .sort(([, a], [, b]) => b - a)
                    .map(([category, amount]) => ({
                        category,
                        amount,
                        percentage: Math.round((amount / totalSpent) * 100),
                    })),
            },
        }, 'Spending analysis generated');
    } catch (error) {
        console.error('Groq API Error:', error);
        throw ApiError.internal('Failed to analyze spending. Please try again.');
    }
});

/**
 * @desc    Auto-categorize a transaction using AI
 * @route   POST /api/ai/categorize
 * @access  Private
 */
export const categorizeTransaction = asyncHandler(async (req, res) => {
    const { description, merchant, amount } = req.body;

    if (!description && !merchant) {
        throw ApiError.badRequest('Description or merchant is required');
    }

    const prompt = `Categorize this transaction into ONE of these categories:
- Food & Dining
- Shopping
- Transportation
- Bills & Utilities
- Entertainment
- Healthcare
- Education
- Travel
- Subscriptions
- Personal Care
- Groceries
- Other

Transaction:
- Description: ${description || 'N/A'}
- Merchant: ${merchant || 'N/A'}
- Amount: $${amount || 'N/A'}

Respond with ONLY the category name, nothing else.`;

    try {
        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'user', content: prompt },
            ],
            temperature: 0.3,
            max_tokens: 50,
        });

        const category = completion.choices[0]?.message?.content?.trim() || 'Other';

        ApiResponse.success(res, { category }, 'Transaction categorized');
    } catch (error) {
        console.error('Groq API Error:', error);
        // Return default category on failure
        ApiResponse.success(res, { category: 'Other' }, 'Default category assigned');
    }
});
