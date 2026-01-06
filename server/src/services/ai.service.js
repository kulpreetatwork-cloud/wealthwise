import Groq from 'groq-sdk';
import config from '../config/index.js';

// Initialize Groq client
const groq = new Groq({
  apiKey: config.groq?.apiKey || process.env.GROQ_API_KEY,
});

// System prompt for financial assistant
const FINANCIAL_ASSISTANT_PROMPT = `You are WealthWise AI, a helpful, friendly, and knowledgeable personal finance assistant for users in India.
You help users understand their finances, create budgets, track spending, and make smarter financial decisions.

CRITICAL CURRENCY RULE:
- This is an Indian finance app. ALL currency amounts MUST be in Indian Rupees (₹).
- NEVER use $ (dollar sign) or USD in any response.
- Always format amounts as ₹X,XXX (e.g., ₹1,000, ₹50,000, ₹1,00,000).
- Use the Indian numbering system (lakhs, crores) when appropriate.

Other Guidelines:
- Be concise but thorough
- Never recommend specific stocks or guarantee returns
- Encourage healthy financial habits
- Format responses with markdown for better readability
- Use bullet points and headers for complex answers`;

/**
 * Send a chat message to the AI
 * @param {string} message - User message
 * @param {Array} conversationHistory - Previous messages
 * @param {Object} userContext - User's financial context
 * @returns {Promise<string>} AI response
 */
export const sendChatMessage = async (message, conversationHistory = [], userContext = {}) => {
  const contextPrompt = `
Current User Financial Context:
- Role: ${userContext.role || 'individual'}
- Total Balance: ₹${(userContext.totalBalance || 0).toLocaleString('en-IN')}
- Recent Income: ₹${(userContext.monthlyIncome || 0).toLocaleString('en-IN')}
- Recent Expenses: ₹${(userContext.monthlyExpenses || 0).toLocaleString('en-IN')}
- Number of Accounts: ${userContext.accountCount || 0}
- Active Budgets: ${userContext.budgetCount || 0}
`;

  const messages = [
    { role: 'system', content: FINANCIAL_ASSISTANT_PROMPT },
    { role: 'system', content: contextPrompt },
    ...conversationHistory.slice(-10).map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    { role: 'user', content: message },
  ];

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages,
    temperature: 0.7,
    max_tokens: 1024,
  });

  return completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
};

/**
 * Generate financial insights based on user data
 * @param {Object} financialData - User's financial summary
 * @returns {Promise<string>} AI-generated insights
 */
export const generateInsights = async (financialData) => {
  const dataSummary = `
Financial Data for the Last 30 Days:
- Total Balance: ₹${(financialData.totalBalance || 0).toLocaleString('en-IN')}
- Total Income: ₹${(financialData.income || 0).toLocaleString('en-IN')}
- Total Expenses: ₹${(financialData.expenses || 0).toLocaleString('en-IN')}
- Net Savings: ₹${((financialData.income || 0) - (financialData.expenses || 0)).toLocaleString('en-IN')}
- Savings Rate: ${financialData.savingsRate?.toFixed(1) || 0}%
- Top Spending Categories: ${financialData.topCategories?.join(', ') || 'None'}
- Budget Utilization: ${financialData.budgetsOverLimit || 0} budgets over limit
`;

  const prompt = `Analyze this financial data and provide actionable insights:
${dataSummary}

Generate insights covering:
1. Spending patterns and areas to optimize
2. Budget adherence and suggestions
3. Savings opportunities
4. Overall financial health assessment

IMPORTANT: Use ₹ (Indian Rupees) for ALL amounts. Do not use $ or USD.
Format with markdown.`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: FINANCIAL_ASSISTANT_PROMPT },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 1024,
  });

  return completion.choices[0]?.message?.content || 'Unable to generate insights at this time.';
};

/**
 * Analyze spending patterns
 * @param {Array} transactions - Recent transactions
 * @param {number} days - Analysis period
 * @returns {Promise<Object>} Analysis results with AI commentary
 */
export const analyzeSpending = async (transactions, days = 30) => {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);

  const categoryBreakdown = {};
  expenses.forEach((t) => {
    categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
  });

  const prompt = `Analyze this spending data:

Total Spent: ₹${totalSpent.toLocaleString('en-IN')}
Period: Last ${days} days
Number of Transactions: ${transactions.length}
Average Transaction: ₹${transactions.length ? (totalSpent / expenses.length).toFixed(2) : 0}

Spending by Category:
${Object.entries(categoryBreakdown)
      .sort(([, a], [, b]) => b - a)
      .map(([cat, amt]) => `- ${cat}: ₹${amt.toLocaleString('en-IN')} (${((amt / totalSpent) * 100).toFixed(1)}%)`)
      .join('\n')}

Provide:
1. A brief analysis of spending patterns
2. 3 specific areas where spending could be reduced
3. Comparison to typical benchmarks if relevant
4. One positive observation about their spending

IMPORTANT: Use ₹ (Indian Rupees) for ALL amounts. Do not use $ or USD.
Format with markdown.`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: FINANCIAL_ASSISTANT_PROMPT },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 1024,
  });

  return {
    totalSpent,
    categoryBreakdown,
    transactionCount: expenses.length,
    averageTransaction: expenses.length ? totalSpent / expenses.length : 0,
    analysis: completion.choices[0]?.message?.content || 'Unable to analyze spending.',
  };
};

/**
 * Auto-categorize a transaction
 * @param {string} description - Transaction description
 * @param {string} merchant - Merchant name
 * @param {number} amount - Transaction amount
 * @returns {Promise<string>} Suggested category
 */
export const categorizeTransaction = async (description, merchant, amount) => {
  const categories = [
    'Food & Dining', 'Shopping', 'Transportation', 'Entertainment',
    'Bills & Utilities', 'Health & Fitness', 'Travel', 'Education',
    'Personal Care', 'Home', 'Gifts & Donations', 'Business', 'Other',
  ];

  const prompt = `Categorize this transaction into ONE of these categories: ${categories.join(', ')}

Transaction Details:
- Description: ${description || 'N/A'}
- Merchant: ${merchant || 'N/A'}
- Amount: ₹${amount || 0}

Respond with ONLY the category name, nothing else.`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 50,
    });

    const suggested = completion.choices[0]?.message?.content?.trim();
    return categories.includes(suggested) ? suggested : 'Other';
  } catch {
    return 'Other';
  }
};

export default {
  sendChatMessage,
  generateInsights,
  analyzeSpending,
  categorizeTransaction,
};
