import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet,
    PiggyBank,
    CreditCard,
    TrendingUp,
    Banknote,
    MoreVertical,
    Edit2,
    Trash2,
} from 'lucide-react';
import { useCurrency } from '../../../hooks';
import styles from './AccountCard.module.css';

const iconMap = {
    checking: Wallet,
    savings: PiggyBank,
    credit: CreditCard,
    investment: TrendingUp,
    cash: Banknote,
};

const AccountCard = ({ account, onEdit, onDelete }) => {
    const Icon = iconMap[account.type] || Wallet;
    const { formatLocal } = useCurrency();
    const [showMenu, setShowMenu] = useState(false);

    const handleEdit = (e) => {
        e.stopPropagation();
        setShowMenu(false);
        onEdit?.(account);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        setShowMenu(false);
        onDelete?.(account);
    };

    return (
        <div
            className={styles.card}
            style={{ '--account-color': account.color || '#6366f1' }}
        >
            <div className={styles.iconWrapper}>
                <Icon size={18} />
            </div>

            <div className={styles.info}>
                <span className={styles.name}>{account.name}</span>
                <span className={styles.type}>{account.type}</span>
            </div>

            <span className={`${styles.balance} ${account.balance < 0 ? styles.negative : ''}`}>
                {formatLocal(account.balance)}
            </span>

            <div className={styles.actions}>
                <button
                    className={styles.menuBtn}
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                    }}
                >
                    <MoreVertical size={16} />
                </button>
                <AnimatePresence>
                    {showMenu && (
                        <motion.div
                            className={styles.menu}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <button onClick={handleEdit}>
                                <Edit2 size={14} /> Edit
                            </button>
                            <button className={styles.deleteBtn} onClick={handleDelete}>
                                <Trash2 size={14} /> Delete
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AccountCard;

