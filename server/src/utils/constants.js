// Transaction categories organized by type
export const CATEGORIES = {
    income: [
        'Salary',
        'Freelance',
        'Investments',
        'Business',
        'Rental',
        'Gifts',
        'Refunds',
        'Other Income',
    ],
    expense: [
        'Food & Dining',
        'Transportation',
        'Shopping',
        'Entertainment',
        'Bills & Utilities',
        'Health & Fitness',
        'Travel',
        'Education',
        'Personal Care',
        'Home',
        'Groceries',
        'Subscriptions',
        'Insurance',
        'Taxes',
        'Gifts & Donations',
        'Pets',
        'Kids',
        'Other Expenses',
    ],
};

// User roles
export const ROLES = {
    INDIVIDUAL: 'individual',
    STUDENT: 'student',
    BUSINESS: 'business',
};

// Account types
export const ACCOUNT_TYPES = [
    'checking',
    'savings',
    'credit',
    'investment',
    'cash',
];

// Transaction types
export const TRANSACTION_TYPES = ['income', 'expense', 'transfer'];

// Budget periods
export const BUDGET_PERIODS = ['weekly', 'monthly', 'yearly'];

// Goal categories
export const GOAL_CATEGORIES = [
    'savings',
    'investment',
    'debt',
    'purchase',
    'emergency',
];

// Investment types
export const INVESTMENT_TYPES = [
    'stock',
    'crypto',
    'etf',
    'mutual_fund',
    'bond',
];

// Notification types
export const NOTIFICATION_TYPES = [
    'budget_alert',
    'goal_milestone',
    'bill_reminder',
    'insight',
    'system',
];

// Currencies (most common)
export const CURRENCIES = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];
