import { motion } from 'framer-motion';
import { Building2, TrendingUp, TrendingDown, Receipt, Calculator, DollarSign, BarChart3, FileText } from 'lucide-react';
import { useCurrency } from '../../../hooks';
import styles from './RoleDashboards.module.css';

const BusinessDashboard = ({ overview, transactions = [], budgets = [], onRefresh }) => {
    const { formatLocal } = useCurrency();

    // Calculate business metrics
    const revenue = overview?.monthlyIncome || 0;
    const expenses = overview?.monthlyExpense || 0;
    const profit = revenue - expenses;
    const profitMargin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;

    // Estimate quarterly tax (simplified 25% of profit)
    const estimatedTax = profit > 0 ? profit * 0.25 : 0;

    // Business expense categories
    const businessCategories = ['Office', 'Software', 'Marketing', 'Travel', 'Equipment', 'Utilities'];
    const businessExpenses = transactions
        .filter(t => t.type === 'expense' && businessCategories.some(cat =>
            t.category?.toLowerCase().includes(cat.toLowerCase())
        ))
        .slice(0, 5);

    return (
        <div className={styles.roleSection}>
            {/* Business Header */}
            <motion.div
                className={styles.businessBanner}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className={styles.bannerIcon}>
                    <Building2 size={32} />
                </div>
                <div className={styles.bannerContent}>
                    <h3>Business Dashboard</h3>
                    <p>Track revenue, manage expenses, and monitor your business health</p>
                </div>
            </motion.div>

            {/* Revenue vs Expenses */}
            <motion.div
                className={styles.revenueSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className={styles.revExpGrid}>
                    <div className={styles.revExpCard}>
                        <div className={styles.revExpIcon} style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)' }}>
                            <TrendingUp size={24} />
                        </div>
                        <div className={styles.revExpContent}>
                            <span className={styles.revExpLabel}>Revenue</span>
                            <span className={styles.revExpValue} style={{ color: '#10b981' }}>
                                {formatLocal(revenue)}
                            </span>
                        </div>
                    </div>
                    <div className={styles.revExpCard}>
                        <div className={styles.revExpIcon} style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}>
                            <TrendingDown size={24} />
                        </div>
                        <div className={styles.revExpContent}>
                            <span className={styles.revExpLabel}>Expenses</span>
                            <span className={styles.revExpValue} style={{ color: '#ef4444' }}>
                                {formatLocal(expenses)}
                            </span>
                        </div>
                    </div>
                    <div className={styles.revExpCard}>
                        <div className={styles.revExpIcon} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                            <DollarSign size={24} />
                        </div>
                        <div className={styles.revExpContent}>
                            <span className={styles.revExpLabel}>Net Profit</span>
                            <span className={styles.revExpValue} style={{ color: profit >= 0 ? '#10b981' : '#ef4444' }}>
                                {formatLocal(profit)}
                            </span>
                        </div>
                    </div>
                    <div className={styles.revExpCard}>
                        <div className={styles.revExpIcon} style={{ background: 'linear-gradient(135deg, #f59e0b, #eab308)' }}>
                            <BarChart3 size={24} />
                        </div>
                        <div className={styles.revExpContent}>
                            <span className={styles.revExpLabel}>Profit Margin</span>
                            <span className={styles.revExpValue}>{profitMargin}%</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Cash Flow Indicator */}
            <motion.div
                className={styles.cashFlowSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
            >
                <div className={styles.sectionHeader}>
                    <BarChart3 size={18} />
                    <h4>Cash Flow Status</h4>
                </div>
                <div className={styles.cashFlowBar}>
                    <div className={styles.cashFlowIncome} style={{ width: revenue > 0 ? '100%' : '0%' }}>
                        <span>Income: {formatLocal(revenue)}</span>
                    </div>
                </div>
                <div className={styles.cashFlowBar}>
                    <div
                        className={styles.cashFlowExpense}
                        style={{ width: revenue > 0 ? `${Math.min((expenses / revenue) * 100, 100)}%` : '0%' }}
                    >
                        <span>Expenses: {formatLocal(expenses)}</span>
                    </div>
                </div>
            </motion.div>

            {/* Tax Estimation */}
            <motion.div
                className={styles.taxSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className={styles.sectionHeader}>
                    <Calculator size={18} />
                    <h4>Estimated Quarterly Tax</h4>
                </div>
                <div className={styles.taxCard}>
                    <div className={styles.taxAmount}>
                        <span className={styles.taxValue}>{formatLocal(estimatedTax)}</span>
                        <span className={styles.taxLabel}>Based on 25% of net profit</span>
                    </div>
                    <div className={styles.taxNote}>
                        <FileText size={16} />
                        <span>Set aside for Q{Math.ceil((new Date().getMonth() + 1) / 3)} taxes</span>
                    </div>
                </div>
            </motion.div>

            {/* Business Expenses */}
            <motion.div
                className={styles.expensesSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
            >
                <div className={styles.sectionHeader}>
                    <Receipt size={18} />
                    <h4>Business Expenses</h4>
                </div>
                {businessExpenses.length > 0 ? (
                    <div className={styles.expensesList}>
                        {businessExpenses.map((expense) => (
                            <div key={expense._id} className={styles.expenseItem}>
                                <div className={styles.expenseInfo}>
                                    <span className={styles.expenseCategory}>{expense.category}</span>
                                    <span className={styles.expenseDesc}>{expense.description || expense.merchant}</span>
                                </div>
                                <span className={styles.expenseAmount}>-{formatLocal(expense.amount)}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className={styles.emptyText}>No business expenses recorded this month</p>
                )}
            </motion.div>

            {/* Budget Utilization */}
            {budgets.length > 0 && (
                <motion.div
                    className={styles.budgetSection}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className={styles.sectionHeader}>
                        <DollarSign size={18} />
                        <h4>Budget Utilization</h4>
                    </div>
                    <div className={styles.budgetList}>
                        {budgets.slice(0, 4).map((budget) => {
                            const utilization = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
                            const isOver = utilization > 100;
                            return (
                                <div key={budget._id} className={styles.budgetItem}>
                                    <div className={styles.budgetInfo}>
                                        <span className={styles.budgetName}>{budget.name}</span>
                                        <span className={styles.budgetAmounts}>
                                            {formatLocal(budget.spent)} / {formatLocal(budget.amount)}
                                        </span>
                                    </div>
                                    <div className={styles.budgetProgress}>
                                        <div
                                            className={`${styles.budgetBar} ${isOver ? styles.budgetOver : ''}`}
                                            style={{ width: `${Math.min(utilization, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default BusinessDashboard;
