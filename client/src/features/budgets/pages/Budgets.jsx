import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Wallet,
    TrendingUp,
    AlertTriangle,
    XCircle,
    Edit2,
    Trash2,
    MoreVertical,
    Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useBudgetStore } from '../../../stores/budgetStore';
import { useCurrency } from '../../../hooks';
import BudgetModal from '../components/BudgetModal';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import styles from './Budgets.module.css';

const Budgets = () => {
    const [showModal, setShowModal] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const hasFetched = useRef(false);
    const { formatLocal } = useCurrency();

    const {
        budgets,
        summary,
        isLoading,
        fetchBudgets,
        fetchSummary,
        deleteBudget,
    } = useBudgetStore();

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        fetchBudgets();
        fetchSummary();
    }, []);

    const handleAddBudget = () => {
        setEditingBudget(null);
        setShowModal(true);
    };

    const handleEditBudget = (budget) => {
        setEditingBudget(budget);
        setShowModal(true);
        setActiveMenu(null);
    };

    const handleDeleteBudget = async (id) => {
        setDeleteTarget(id);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const result = await deleteBudget(deleteTarget);
        if (result.success) {
            toast.success('Budget deleted');
            fetchSummary();
        } else {
            toast.error(result.error);
        }
        setDeleteTarget(null);
        setActiveMenu(null);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'on-track':
                return <TrendingUp size={16} className={styles.onTrackIcon} />;
            case 'warning':
                return <AlertTriangle size={16} className={styles.warningIcon} />;
            case 'exceeded':
                return <XCircle size={16} className={styles.exceededIcon} />;
            default:
                return null;
        }
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Budgets</h1>
                    <p className={styles.subtitle}>Track and manage your spending limits</p>
                </div>
                <button className={styles.addBtn} onClick={handleAddBudget}>
                    <Plus size={18} />
                    Create Budget
                </button>
            </div>

            {/* Summary Cards */}
            {summary && (
                <motion.div
                    className={styles.summaryGrid}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className={styles.summaryCard}>
                        <Wallet size={24} className={styles.summaryIcon} />
                        <div className={styles.summaryContent}>
                            <span className={styles.summaryValue}>{formatLocal(summary.totalBudgeted)}</span>
                            <span className={styles.summaryLabel}>Total Budgeted</span>
                        </div>
                    </div>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryContent}>
                            <span className={styles.summaryValue}>{formatLocal(summary.totalSpent)}</span>
                            <span className={styles.summaryLabel}>Total Spent</span>
                        </div>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{
                                    width: `${Math.min(100, summary.percentUsed)}%`,
                                    background: summary.percentUsed >= 100 ? 'var(--accent-danger)' : 'var(--accent-primary)'
                                }}
                            />
                        </div>
                    </div>
                    <div className={`${styles.summaryCard} ${styles.statusCard}`}>
                        <div className={styles.statusItem}>
                            <span className={styles.onTrack}>{summary.onTrack}</span>
                            <span>On Track</span>
                        </div>
                        <div className={styles.statusItem}>
                            <span className={styles.warning}>{summary.warning}</span>
                            <span>Warning</span>
                        </div>
                        <div className={styles.statusItem}>
                            <span className={styles.exceeded}>{summary.exceeded}</span>
                            <span>Exceeded</span>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Budgets Grid */}
            <div className={styles.budgetsContainer}>
                {isLoading ? (
                    <div className={styles.loading}>
                        <Loader2 size={32} className={styles.spinner} />
                    </div>
                ) : budgets.length === 0 ? (
                    <div className={styles.empty}>
                        <Wallet size={48} className={styles.emptyIcon} />
                        <p>No budgets yet</p>
                        <span>Create your first budget to start tracking your spending</span>
                        <button className={styles.emptyBtn} onClick={handleAddBudget}>
                            <Plus size={16} />
                            Create Budget
                        </button>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {budgets.map((budget) => (
                            <motion.div
                                key={budget._id}
                                className={styles.budgetCard}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{ '--budget-color': budget.color }}
                            >
                                <div className={styles.budgetHeader}>
                                    <div className={styles.budgetInfo}>
                                        <span className={styles.budgetCategory}>{budget.category}</span>
                                        <span className={styles.budgetName}>{budget.name}</span>
                                    </div>
                                    <div className={styles.budgetActions}>
                                        {getStatusIcon(budget.status)}
                                        <button
                                            className={styles.menuBtn}
                                            onClick={() => setActiveMenu(activeMenu === budget._id ? null : budget._id)}
                                        >
                                            <MoreVertical size={16} />
                                        </button>
                                        <AnimatePresence>
                                            {activeMenu === budget._id && (
                                                <motion.div
                                                    className={styles.menu}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                >
                                                    <button onClick={() => handleEditBudget(budget)}>
                                                        <Edit2 size={14} /> Edit
                                                    </button>
                                                    <button
                                                        className={styles.deleteBtn}
                                                        onClick={() => handleDeleteBudget(budget._id)}
                                                    >
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className={styles.budgetProgress}>
                                    <div className={styles.budgetAmounts}>
                                        <span className={styles.spent}>{formatLocal(budget.spent)}</span>
                                        <span className={styles.of}>of</span>
                                        <span className={styles.total}>{formatLocal(budget.amount)}</span>
                                    </div>
                                    <div className={styles.budgetBar}>
                                        <div
                                            className={`${styles.budgetFill} ${styles[budget.status]}`}
                                            style={{ width: `${Math.min(100, budget.percentUsed)}%` }}
                                        />
                                    </div>
                                    <div className={styles.budgetFooter}>
                                        <span className={styles.remaining}>
                                            {formatLocal(budget.remaining)} left
                                        </span>
                                        <span className={styles.percent}>{budget.percentUsed}%</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Budget Modal */}
            <BudgetModal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditingBudget(null);
                }}
                budget={editingBudget}
                onSuccess={() => {
                    fetchBudgets();
                    fetchSummary();
                }}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                title="Delete Budget"
                message="Are you sure you want to delete this budget? This action cannot be undone."
                confirmText="Delete"
                type="danger"
            />
        </div>
    );
};

export default Budgets;
