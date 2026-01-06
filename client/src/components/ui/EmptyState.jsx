import { motion } from 'framer-motion';
import {
    Wallet,
    PlusCircle,
    TrendingUp,
    Target,
    Receipt,
    PieChart,
    Sparkles
} from 'lucide-react';
import styles from './EmptyState.module.css';

const icons = {
    wallet: Wallet,
    add: PlusCircle,
    trend: TrendingUp,
    target: Target,
    receipt: Receipt,
    chart: PieChart,
    ai: Sparkles,
};

/**
 * EmptyState - Premium empty state component with icon, title, description, and optional CTA
 */
const EmptyState = ({
    icon = 'wallet',
    title = 'No data yet',
    description = 'Get started by adding some data',
    actionLabel,
    onAction,
    compact = false,
}) => {
    const IconComponent = icons[icon] || Wallet;

    return (
        <motion.div
            className={`${styles.emptyState} ${compact ? styles.compact : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className={styles.iconWrapper}>
                <div className={styles.iconGlow} />
                <IconComponent size={compact ? 32 : 48} className={styles.icon} />
            </div>

            <h3 className={styles.title}>{title}</h3>
            <p className={styles.description}>{description}</p>

            {actionLabel && onAction && (
                <motion.button
                    className={styles.actionBtn}
                    onClick={onAction}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <PlusCircle size={18} />
                    {actionLabel}
                </motion.button>
            )}
        </motion.div>
    );
};

// Pre-configured empty states for common scenarios
export const EmptyTransactions = ({ onAdd }) => (
    <EmptyState
        icon="receipt"
        title="No transactions yet"
        description="Start tracking your income and expenses to get insights on your spending."
        actionLabel="Add Transaction"
        onAction={onAdd}
    />
);

export const EmptyBudgets = ({ onAdd }) => (
    <EmptyState
        icon="chart"
        title="No budgets created"
        description="Create budgets to track and control your spending in different categories."
        actionLabel="Create Budget"
        onAction={onAdd}
    />
);

export const EmptyGoals = ({ onAdd }) => (
    <EmptyState
        icon="target"
        title="No savings goals"
        description="Set financial goals and track your progress towards achieving them."
        actionLabel="Create Goal"
        onAction={onAdd}
    />
);

export const EmptyAccounts = ({ onAdd }) => (
    <EmptyState
        icon="wallet"
        title="No accounts added"
        description="Add your bank accounts, credit cards, or wallets to track your finances."
        actionLabel="Add Account"
        onAction={onAdd}
    />
);

export const EmptyInvestments = ({ onAdd }) => (
    <EmptyState
        icon="trend"
        title="No investments tracked"
        description="Add your stocks, mutual funds, or other investments to monitor performance."
        actionLabel="Add Investment"
        onAction={onAdd}
    />
);

export default EmptyState;
