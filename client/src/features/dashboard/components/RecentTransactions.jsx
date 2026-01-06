import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import styles from './RecentTransactions.module.css';

const RecentTransactions = ({ transactions }) => {
    if (!transactions || transactions.length === 0) {
        return (
            <div className={styles.empty}>
                <p>No transactions yet</p>
                <span>Your recent transactions will appear here</span>
            </div>
        );
    }

    const getIcon = (type) => {
        switch (type) {
            case 'income':
                return <ArrowDownRight size={16} className={styles.incomeIcon} />;
            case 'expense':
                return <ArrowUpRight size={16} className={styles.expenseIcon} />;
            default:
                return <ArrowRight size={16} className={styles.transferIcon} />;
        }
    };

    const formatAmount = (amount, type) => {
        const formatted = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);

        return type === 'income' ? `+${formatted}` : `-${formatted}`;
    };

    return (
        <div className={styles.list}>
            {transactions.map((transaction) => (
                <div key={transaction._id} className={styles.item}>
                    <div className={styles.iconWrapper}>
                        {getIcon(transaction.type)}
                    </div>

                    <div className={styles.details}>
                        <span className={styles.description}>
                            {transaction.description || transaction.category}
                        </span>
                        <span className={styles.meta}>
                            {transaction.category} • {format(new Date(transaction.date), 'MMM d')}
                        </span>
                    </div>

                    <span className={`${styles.amount} ${styles[transaction.type]}`}>
                        {formatAmount(transaction.amount, transaction.type)}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default RecentTransactions;
